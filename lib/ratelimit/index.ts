import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { createClient } from '@/lib/supabase/server'

// Gracefully handle missing or placeholder Redis configuration
const getRedis = (): Redis | null => {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    // Check for missing values
    if (!url || !token) {
        console.warn('[RateLimit] UPSTASH_REDIS_REST_URL or TOKEN not configured - rate limiting disabled');
        return null;
    }

    // Check for placeholder values (xxx, YOUR_URL, placeholder, etc.)
    const isPlaceholder = (val: string) =>
        /^https?:\/\/(xxx|your|placeholder|example|localhost)[\.\-]/i.test(val) ||
        val.includes('xxx') ||
        val.includes('your_') ||
        val.includes('YOUR_') ||
        val === 'xxx';

    if (isPlaceholder(url) || isPlaceholder(token)) {
        console.warn('[RateLimit] UPSTASH_REDIS contains placeholder values - rate limiting disabled');
        return null;
    }

    try {
        return new Redis({ url, token });
    } catch (error) {
        console.error('[RateLimit] Failed to initialize Redis:', error);
        return null;
    }
};

const redis = getRedis();

// Create limiters only if Redis is available
const createLimiter = (options: { prefix: string; window: number; requests: number }) => {
    if (!redis) return null;
    return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(options.requests, `${options.window} s`),
        analytics: true,
        prefix: options.prefix,
    });
};

// Anonymous rate limiter (by IP)
export const anonymousLimiter = createLimiter({ prefix: "@eduport/anon", window: 60, requests: 10 });

// Pro rate limiter (by user ID)
export const proLimiter = createLimiter({ prefix: "@eduport/pro", window: 1, requests: 10 });

// Enterprise rate limiter
export const enterpriseLimiter = createLimiter({ prefix: "@eduport/enterprise", window: 1, requests: 100 });

export async function checkRateLimit(identifier: string, tier: 'anon' | 'free' | 'pro' | 'enterprise') {
    const limiter = tier === 'enterprise' ? enterpriseLimiter
        : tier === 'pro' ? proLimiter
            : anonymousLimiter;

    // If Redis is not configured, allow all requests (bypass rate limiting)
    if (!limiter) {
        return {
            success: true,
            limit: 0,
            remaining: 0,
            reset: 0,
            headers: {
                'X-RateLimit-Limit': 'unlimited',
                'X-RateLimit-Remaining': 'unlimited',
                'X-RateLimit-Reset': '0',
            }
        };
    }

    const { success, limit, remaining, reset } = await limiter.limit(identifier)

    return {
        success,
        limit,
        remaining,
        reset,
        headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
        }
    }
}

export async function checkMonthlyQuota(userId: string): Promise<boolean> {
    const supabase = await createClient()
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count } = await supabase
        .from('conversions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString())

    // 5 free conversions/month
    return (count || 0) < 5
}
