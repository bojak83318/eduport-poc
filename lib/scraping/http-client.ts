import pRetry from 'p-retry';
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
        maxTimeout = 5000,
    } = options;

    return {
        async get(url: string): Promise<string> {
            return pRetry(
                async () => {
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

                        return response.text();
                    } catch (err) {
                        clearTimeout(timeoutId);
                        throw err;
                    }
                },
                {
                    retries,
                    minTimeout,
                    maxTimeout,
                    onFailedAttempt: (error) => {
                        console.warn(
                            `Attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`
                        );
                        console.warn(`Error: ${error.message}`);
                    },
                }
            );
        },
    };
}
