import { NextRequest, NextResponse } from 'next/server';
import { WordwallScraper } from '@/lib/scraping/wordwall-scraper';
import { H5PPackager } from '@/lib/packaging/h5p-packager';
import { getAdapter } from '@/lib/transformation/adapter-factory';
import pino from 'pino';
import { checkRateLimit, checkMonthlyQuota } from '@/lib/ratelimit';
import { createClient } from '@/lib/supabase/server';

// Force Node.js runtime for this endpoint to support adm-zip and Buffer operations
export const runtime = 'nodejs';

const logger = pino({ name: 'convert-api' });

export async function POST(req: NextRequest) {
    const startTime = Date.now();
    let supabaseUser = null;

    try {
        // 0. Rate Limiting & Quota Check
        console.log('[CONVERT] Step 0: Creating Supabase client...');
        const supabase = await createClient();
        console.log('[CONVERT] Step 0: Supabase client created');
        const { data: { user } } = await supabase.auth.getUser();
        console.log('[CONVERT] Step 0: Got user:', user?.id || 'anonymous');
        supabaseUser = user;

        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const identifier = user ? user.id : ip;

        // Determine tier. Default to 'free' if logged in, 'anon' otherwise.
        const tier = (user?.app_metadata?.tier || user?.user_metadata?.tier || (user ? 'free' : 'anon')) as 'anon' | 'free' | 'pro' | 'enterprise';

        // 1. Check Rate Limit (Frequency)
        console.log('[CONVERT] Step 1: Checking rate limit for:', identifier, 'tier:', tier);
        const rateLimit = await checkRateLimit(identifier, tier);
        console.log('[CONVERT] Step 1: Rate limit result:', rateLimit.success);

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Upgrade to Pro for higher limits.' },
                { status: 429, headers: rateLimit.headers as any }
            );
        }

        // 2. Check Monthly Quota (Free Tier only)
        if (tier === 'free' && user) {
            const withinQuota = await checkMonthlyQuota(user.id);
            if (!withinQuota) {
                return NextResponse.json(
                    { error: 'Monthly limit exceeded. Upgrade to Pro for unlimited conversions.' },
                    { status: 429 }
                );
            }
        }

        // 3. Parse request
        const { wordwallUrl, attestOwnership, userId } = await req.json();

        // Validate attestation
        if (!attestOwnership) {
            return NextResponse.json(
                { error: 'You must attest that you own the rights to this content' },
                { status: 400 }
            );
        }

        // 4. Scrape Wordwall activity
        console.log('[CONVERT] Step 4: Starting scraper for:', wordwallUrl);
        logger.info({ wordwallUrl, userId: user?.id || userId || 'anon' }, 'Starting conversion');
        const scraper = new WordwallScraper();
        console.log('[CONVERT] Step 4: Scraper created, calling scrape()...');
        const activity = await scraper.scrape(wordwallUrl);
        console.log('[CONVERT] Step 4: Scrape complete, items:', activity.content.items?.length);

        // 5. Transform to H5P
        const adapter = getAdapter(activity.template);
        const h5pData = adapter.convert(activity);

        // 6. Package as .h5p file
        const packager = new H5PPackager();
        const { buffer, packageUrl } = await packager.createPackage(
            h5pData,
            activity.id,
            user?.id || userId || 'anon'
        );

        // Record conversion for quota tracking
        if (user) {
            const { error: insertError } = await supabase
                .from('conversions')
                .insert({
                    user_id: user.id,
                    source_url: wordwallUrl,
                    template_type: activity.template,
                    status: 'success', // Using simple status
                });

            if (insertError) {
                logger.error({ error: insertError }, 'Failed to record conversion');
            }
        }

        const latencyMs = Date.now() - startTime;
        logger.info(
            {
                wordwallUrl,
                template: activity.template,
                latencyMs,
                sizeKB: Math.round(buffer.length / 1024),
            },
            'Conversion successful'
        );

        // 7. Return .h5p file as downloadable response
        const responseBuffer = new Uint8Array(buffer);

        return new NextResponse(responseBuffer, {
            headers: {
                'Content-Type': 'application/h5p',
                'Content-Disposition': `attachment; filename="wordwall-${activity.id}.h5p"`,
                'X-Conversion-Time-Ms': latencyMs.toString(),
                'X-Template-Type': activity.template,
            },
        });
    } catch (error) {
        const latencyMs = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        const errorCause = error instanceof Error && 'cause' in error ? (error as any).cause : undefined;

        console.error('[CONVERT] ERROR:', errorMessage);
        console.error('[CONVERT] STACK:', errorStack);
        console.error('[CONVERT] CAUSE:', errorCause);
        logger.error({ error: errorMessage, stack: errorStack, cause: errorCause, latencyMs }, 'Conversion failed');

        const statusCode = errorMessage.includes('Unsupported template') ? 422 : 500;

        return NextResponse.json(
            {
                error: errorMessage,
                latencyMs,
                // Include stack trace for debugging
                debug: {
                    stack: errorStack?.split('\n').slice(0, 5),
                    cause: errorCause ? String(errorCause) : undefined,
                }
            },
            { status: statusCode }
        );
    }
}
