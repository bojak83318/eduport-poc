import { ActivityPayload } from '../types';

export interface ExtractionPattern {
    name: string;
    regex: RegExp;
    parse: (match: string) => any;
}

export const EXTRACTION_PATTERNS: ExtractionPattern[] = [
    {
        name: 'window.activityModel',
        regex: /window\.activityModel\s*=\s*(\{.*?\});/s,
        parse: (match: string) => {
            try {
                return JSON.parse(match);
            } catch (err) {
                console.warn('Failed to parse window.activityModel:', err);
                return null;
            }
        },
    },
    {
        name: 'window.__NEXT_DATA__',
        regex: /window\.__NEXT_DATA__\s*=\s*JSON\.parse\('(.+?)'\)/s,
        parse: (match: string) => {
            try {
                const unescaped = match
                    .replace(/\\'/g, "'")
                    .replace(/\\"/g, '"')
                    .replace(/\\\\/g, '\\');
                const nextData = JSON.parse(unescaped);
                return nextData.props?.pageProps?.activity || nextData.props?.activity;
            } catch (err) {
                console.warn('Failed to parse __NEXT_DATA__:', err);
                return null;
            }
        },
    },
    {
        name: '<script id="__ACTIVITY_DATA__">',
        regex: /<script\s+id="__ACTIVITY_DATA__"\s*>(.+?)<\/script>/s,
        parse: (match: string) => {
            try {
                return JSON.parse(match);
            } catch (err) {
                console.warn('Failed to parse __ACTIVITY_DATA__:', err);
                return null;
            }
        },
    },
    {
        name: 'data-activity-json attribute',
        regex: /data-activity-json='(.+?)'/s,
        parse: (match: string) => {
            try {
                const unescaped = match
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>');
                return JSON.parse(unescaped);
            } catch (err) {
                console.warn('Failed to parse data-activity-json:', err);
                return null;
            }
        },
    },
];

export function extractActivityPayload(html: string): ActivityPayload | null {
    for (const pattern of EXTRACTION_PATTERNS) {
        try {
            const match = html.match(pattern.regex);
            if (match && match[1]) {
                const payload = pattern.parse(match[1]);

                // Validate payload has required fields
                if (payload && payload.id && payload.template) {
                    console.log(`✅ Extraction successful using pattern: ${pattern.name}`);

                    // Normalize payload structure
                    return {
                        id: payload.id || payload.activityId || '',
                        url: payload.url || '',
                        title: payload.title || payload.name || 'Untitled Activity',
                        template: payload.template || payload.type || '',
                        content: payload.content || payload.data || { items: [] },
                        metadata: payload.metadata || {},
                    };
                }
            }
        } catch (error) {
            console.warn(`Pattern "${pattern.name}" failed:`, error instanceof Error ? error.message : String(error));
            continue; // Try next pattern
        }
    }

    console.error('❌ All extraction patterns failed');
    return null; // All patterns failed
}

export interface ServerModel {
    activityId: string;
    activityGuid: string;
    templateId: string;
    activityTitle?: string;
}

export function extractServerModel(html: string): ServerModel | null {
    // Regex for procedural assignment: s.activityGuid="VALUE"
    const guidMatch = html.match(/s\.activityGuid\s*=\s*(["'])(.+?)\1/);
    const idMatch = html.match(/s\.activityId\s*=\s*Number\((\d+)\)/);
    // Template ID might be strictly a number or string
    const templateIdMatch = html.match(/s\.templateId\s*=\s*Number\((\d+)\)/);
    const titleMatch = html.match(/s\.activityTitle\s*=\s*(["'])(.+?)\1/);

    if (guidMatch && idMatch) {
        return {
            activityGuid: guidMatch[2],
            activityId: idMatch[1],
            templateId: templateIdMatch ? templateIdMatch[1] : '0',
            activityTitle: titleMatch ? titleMatch[2] : undefined
        };
    }

    return null;
}
