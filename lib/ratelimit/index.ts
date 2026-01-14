import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { createClient } from '@/lib/supabase/server'

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Anonymous rate limiter (by IP)
export const anonymousLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
    prefix: "@eduport/anon",
})

// Pro rate limiter (by user ID)
export const proLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 s"),
    analytics: true,
    prefix: "@eduport/pro",
})

// Enterprise rate limiter
export const enterpriseLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 s"),
    analytics: true,
    prefix: "@eduport/enterprise",
})

export async function checkRateLimit(identifier: string, tier: 'anon' | 'free' | 'pro' | 'enterprise') {
    // Map 'free' tier to 'anon' limiter for now, or maybe it should have its own?
    // The table in the task says:
    // Anonymous: 10/min (IP)
    // Free: 5 conversions/month. But doesn't specify a rate limit per second/minute?
    // It implies Free users are authenticated. They should probably fall under a stricter rate limit than pro but maybe similar to anon for frequency?
    // Task says: "Tier-based rate limiting".
    // The code snippet maps:
    // const limiter = tier === 'enterprise' ? enterpriseLimiter : tier === 'pro' ? proLimiter : anonymousLimiter
    // If tier is 'free', it falls to anonymousLimiter?

    // Let's refine the logic based on provided code in prompt step 2:
    // const limiter = tier === 'enterprise' ? enterpriseLimiter 
    //              : tier === 'pro' ? proLimiter 
    //              : anonymousLimiter

    // Wait, if tier is 'free', it uses anonymousLimiter (10/min). This seems acceptable.

    const limiter = tier === 'enterprise' ? enterpriseLimiter
        : tier === 'pro' ? proLimiter
            : anonymousLimiter

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
