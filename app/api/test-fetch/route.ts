import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    const testUrl = new URL(req.url).searchParams.get('url') || 'https://wordwall.net/resource/101727466/esa/have-got-has-got-affirmative-negative';

    const results: any = {
        testUrl,
        steps: []
    };

    try {
        // Test 1: Fetch HTML from Wordwall
        results.steps.push({ name: 'Fetching HTML', started: Date.now() });
        const htmlResponse = await fetch(testUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml',
            }
        });
        results.steps.push({
            name: 'HTML fetch result',
            status: htmlResponse.status,
            ok: htmlResponse.ok,
            contentLength: htmlResponse.headers.get('content-length')
        });

        const html = await htmlResponse.text();
        results.steps.push({ name: 'HTML received', chars: html.length });

        // Test 2: Extract GUID
        const guidMatch = html.match(/s\.activityGuid\s*=\s*["'](.+?)["']/);
        const guid = guidMatch ? guidMatch[1] : null;
        results.steps.push({ name: 'GUID extracted', guid });

        if (guid) {
            // Test 3: Fetch ZIP from CDN
            const cdnUrl = `https://user.cdn.wordwall.net/documents/${encodeURIComponent(guid)}`;
            results.steps.push({ name: 'Fetching ZIP', cdnUrl, started: Date.now() });

            const zipResponse = await fetch(cdnUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                    'Accept': '*/*',
                }
            });
            results.steps.push({
                name: 'ZIP fetch result',
                status: zipResponse.status,
                ok: zipResponse.ok,
                contentLength: zipResponse.headers.get('content-length')
            });

            const buffer = await zipResponse.arrayBuffer();
            results.steps.push({ name: 'ZIP received', bytes: buffer.byteLength });
        }

        results.success = true;

    } catch (error: any) {
        results.error = error.message;
        results.cause = error.cause;
        results.stack = error.stack;
        results.success = false;
    }

    return NextResponse.json(results, { status: results.success ? 200 : 500 });
}
