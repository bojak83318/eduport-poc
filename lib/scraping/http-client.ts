import { ExtractionError } from '../types';

const USER_AGENT =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export interface HttpClientOptions {
    timeout?: number;
    retries?: number;
    minTimeout?: number;
    maxTimeout?: number;
}

export function createHttpClient(options: HttpClientOptions = {}) {
    const {
        timeout = 10000,
        retries = 3,
        minTimeout = 1000,
        // maxTimeout not strictly used in simple backoff but kept for interface compatibility
    } = options;

    return {
        async get(url: string): Promise<string> {
            let lastError: any;

            for (let attempt = 1; attempt <= retries + 1; attempt++) {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                try {
                    const response = await fetch(url, {
                        headers: {
                            'User-Agent': USER_AGENT,
                            Accept: 'text/html,application/xhtml+xml',
                            'Accept-Language': 'en-US,en;q=0.9',
                            'Cache-Control': 'no-cache',
                        },
                        signal: controller.signal,
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        throw new ExtractionError(
                            `HTTP ${response.status}: ${response.statusText}`
                        );
                    }

                    return await response.text();
                } catch (err: any) {
                    clearTimeout(timeoutId);
                    lastError = err;

                    // Don't retry on 4xx errors (except maybe 429, but let's keep it simple)
                    if (err instanceof ExtractionError && err.message.startsWith('HTTP 4')) {
                        throw err;
                    }

                    // If we have retries left, wait and retry
                    if (attempt <= retries) {
                        // Exponential backoff or simple linear? Plan said simple wait. 
                        // Let's do a simple exponential backoff: minTimeout * 2^(attempt-1)
                        const delay = minTimeout * Math.pow(2, attempt - 1);
                        console.warn(`Attempt ${attempt} failed: ${err.message}. Retrying in ${delay}ms...`);
                        await new Promise((resolve) => setTimeout(resolve, delay));
                        continue;
                    }
                }
            }

            throw lastError || new Error(`Failed to fetch ${url} after ${retries + 1} attempts`);
        },
    };
}
