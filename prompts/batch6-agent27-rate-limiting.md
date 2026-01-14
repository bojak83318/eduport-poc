# Agent 27: Security Engineer - Rate Limiting

**Agent Role:** @eduport/security-engineer  
**Task ID:** SEC-001  
**Batch:** 6  
**Priority:** CRITICAL 🔴  
**Deadline:** Jan 14, 11:30 PM

---

## Context

Rate limiting prevents abuse and enforces tier-based quotas. We use Upstash Redis for serverless-friendly rate limiting.

---

## Task

Implement tier-based rate limiting with Upstash Redis.

---

## Rate Limit Tiers

| Tier | Requests | Period |
|------|----------|--------|
| Anonymous | 10 | per minute per IP |
| Free | 5 conversions | per month |
| Pro | 10 requests | per second |
| Enterprise | 100 requests | per second |

---

## Implementation

### 1. Install Dependencies

```bash
npm install --save @upstash/ratelimit @upstash/redis
```

### 2. Create Rate Limiter

**File:** `/lib/ratelimit/index.ts`

```typescript
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

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

export async function checkRateLimit(identifier: string, tier: 'anon' | 'pro' | 'enterprise') {
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
```

### 3. Apply to Convert API

**Update:** `/app/api/convert/route.ts`

```typescript
import { checkRateLimit } from '@/lib/ratelimit'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  // Get identifier (user ID or IP)
  const headersList = headers()
  const ip = headersList.get('x-forwarded-for') || 'unknown'
  const user = await getUser() // from supabase auth
  
  const tier = user?.tier || 'anon'
  const identifier = user?.id || ip
  
  const rateLimit = await checkRateLimit(identifier, tier)
  
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Upgrade to Pro for higher limits.' },
      { status: 429, headers: rateLimit.headers }
    )
  }
  
  // Continue with conversion...
}
```

### 4. Monthly Quota Check (Free Tier)

```typescript
async function checkMonthlyQuota(userId: string): Promise<boolean> {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const { count } = await supabase
    .from('conversions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString())
  
  return (count || 0) < 5 // 5 free conversions/month
}
```

---

## Environment Variables

Add to `.env.local`:
```
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

---

## Acceptance Criteria

1. ✅ `@upstash/ratelimit` installed
2. ✅ Rate limiter module created at `/lib/ratelimit/index.ts`
3. ✅ Tier-based limits enforced (anon/pro/enterprise)
4. ✅ 429 response with proper headers when limit exceeded
5. ✅ Monthly quota check for free tier users

---

## Verification

```bash
# Test rate limiting (send 11 requests in 1 minute)
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/convert \
    -H "Content-Type: application/json" \
    -d '{"url":"https://wordwall.net/resource/123"}'
  echo ""
done
# 11th request should return 429
```

---

## Deadline

**Jan 14, 11:30 PM**
