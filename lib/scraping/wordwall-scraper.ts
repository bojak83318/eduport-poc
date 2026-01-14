import { createClient } from '@supabase/supabase-js';
import pino from 'pino';
import AdmZip from 'adm-zip';
import * as cheerio from 'cheerio';
import { extractActivityPayload, extractServerModel } from './patterns';
import { createHttpClient } from './http-client';
import { ActivityPayload, ExtractionError } from '../types';

const logger = pino({
    name: 'wordwall-scraper',
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});

export class WordwallScraper {
    private httpClient = createHttpClient();
    private supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    async scrape(url: string): Promise<ActivityPayload> {
        const startTime = Date.now();

        // 1. Extract activity ID from URL
        const activityId = this.extractActivityId(url);
        // Add request correlation ID or simply ensure logger has context
        logger.info({ activityId, url }, 'Starting scrape');

        // 2. Check cache first (24h TTL)
        const cached = await this.checkCache(activityId);
        if (cached) {
            logger.info({ activityId }, 'Cache hit');
            return cached;
        }

        // 3. Fetch HTML with retry policy
        logger.info({ url }, 'Fetching from Wordwall');
        const html = await this.httpClient.get(url);

        // 4. Try legacy extraction first
        let payload = extractActivityPayload(html);

        // 5. If legacy fails, try ServerModel + API
        if (!payload) {
            logger.info({ url }, 'Legacy extraction failed, trying ServerModel API approach');
            const serverModel = extractServerModel(html);

            if (serverModel && serverModel.activityGuid) {
                logger.info({ guid: serverModel.activityGuid }, 'Found ServerModel, fetching Activity Package');
                try {
                    payload = await this.fetchActivityPackage(serverModel.activityGuid, serverModel);
                } catch (err) {
                    logger.warn({ err }, 'Activity Package fetch failed');
                }
            }
        }

        if (!payload) {
            logger.error({ url, htmlLength: html.length }, 'All extraction patterns failed');
            throw new ExtractionError(
                'Unable to extract activity data. Wordwall may have changed their format or the URL is invalid.'
            );
        }

        // 6. Cache for 24 hours
        await this.saveToCache(activityId, payload);

        const latencyMs = Date.now() - startTime;
        logger.info(
            {
                activityId,
                template: payload.template,
                itemCount: payload.content.items?.length || 0,
                latencyMs,
            },
            'Extraction successful'
        );

        return payload;
    }

    private async fetchActivityPackage(guid: string, model: any): Promise<ActivityPayload> {
        if (!guid) {
            throw new Error('Activity GUID is missing');
        }

        const zipUrl = `https://user.cdn.wordwall.net/documents/${encodeURIComponent(guid)}`;
        logger.info({ zipUrl, guid }, 'Fetching Activity Package ZIP');

        try {
            // Fetch ZIP file as buffer with proper headers (required for serverless env)
            const response = await fetch(zipUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': '*/*',
                    'Accept-Language': 'en-US,en;q=0.9',
                },
            });
            if (!response.ok) {
                throw new Error(`CDN returned ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);


            // Parse ZIP
            const zip = new AdmZip(buffer);
            const templateEntry = zip.getEntry('template.xml');

            if (!templateEntry) {
                throw new Error('template.xml not found in activity package');
            }

            const xmlContent = zip.readAsText(templateEntry);
            const $ = cheerio.load(xmlContent, { xmlMode: true });

            // Parse Items (Questions)
            // Structure: <data> -> <item> (Question) -> <item> (Option)
            const items: any[] = [];

            $('data > item').each((_, qEl) => {
                const $q = $(qEl);
                let questionText = $q.children('text').text(); // e.g. <n>Question</n>
                questionText = this.cleanText(questionText);

                // Extract Image (if any)
                // Note: Image parsing logic would go here if needed, but simplistic text for now

                const options: string[] = [];
                let correctAnswer: string | undefined;

                $q.children('item').each((_, oEl) => {
                    const $o = $(oEl);
                    let optionText = $o.children('text').text();
                    optionText = this.cleanText(optionText);

                    options.push(optionText);

                    // Check if Correct: <item><text><n>True</n></text></item> nested deeper?
                    // The structure seen: <item>(Option) -> <item>(Status) -> <text>True</text>
                    const statusText = $o.children('item').children('text').text();
                    if (statusText.includes('True')) {
                        correctAnswer = optionText;
                    }
                });

                items.push({
                    question: questionText,
                    options: options,
                    answer: correctAnswer || options[0], // fallback
                    correctAnswer: correctAnswer
                });
            });

            // Normalize payload
            return {
                id: model.activityId,
                url: `https://wordwall.net/resource/${model.activityId}`,
                title: model.activityTitle || 'Untitled Activity',
                template: 'Quiz', // Hardcoded fallback or map from model.templateId
                content: {
                    items: items,
                    settings: {}
                },
                metadata: {
                    language: 'en', // Default or extract from metadata.xml
                    createdAt: new Date().toISOString()
                }
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorCause = error instanceof Error && 'cause' in error ? (error as any).cause : undefined;
            logger.error({ guid, error: errorMessage, cause: errorCause }, 'Failed to fetch/parse activity package');
            throw new Error(`Failed to fetch activity package: ${errorMessage}${errorCause ? ` (cause: ${errorCause})` : ''}`);
        }
    }

    private cleanText(text: string): string {
        // Remove <n> tags and decode entities
        return text.replace(/<\/?n>/g, '').trim();
    }

    private extractActivityId(url: string): string {
        const match = url.match(/\/resource\/(\d+)/);
        if (!match) {
            throw new ExtractionError('Invalid Wordwall URL format');
        }
        return match[1];
    }

    private async checkCache(activityId: string): Promise<ActivityPayload | null> {
        try {
            const { data, error } = await this.supabase
                .from('activity_cache')
                .select('payload')
                .eq('activity_id', activityId)
                .gt('expires_at', new Date().toISOString())
                .single();

            if (error || !data) {
                return null;
            }

            return data.payload as ActivityPayload;
        } catch (err) {
            logger.warn({ activityId, error: err }, 'Cache check failed');
            return null;
        }
    }

    private async saveToCache(activityId: string, payload: ActivityPayload): Promise<void> {
        try {
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            await this.supabase.from('activity_cache').upsert({
                activity_id: activityId,
                wordwall_url: payload.url,
                template_type: payload.template,
                payload,
                cached_at: new Date().toISOString(),
                expires_at: expiresAt.toISOString(),
            });

            logger.debug({ activityId, expiresAt }, 'Cached activity');
        } catch (err) {
            // Non-critical error - don't fail the request
            logger.warn({ activityId, error: err }, 'Cache save failed');
        }
    }
}
