# Agent 26: DevOps Engineer - Vercel Analytics

**Agent Role:** @eduport/devops-engineer  
**Task ID:** DEVOPS-003  
**Batch:** 5  
**Priority:** Medium  
**Deadline:** Jan 14, 11:00 PM

---

## Context

Vercel Analytics provides Web Vitals tracking and custom event capture. We need to track conversion success/failure rates and performance metrics.

---

## Task

Enable Vercel Analytics with custom event tracking.

---

## Steps

### 1. Install Vercel Analytics

```bash
cd /home/kasm-user/workspace/dspy/eduport-poc
npm install --save @vercel/analytics
```

### 2. Add Analytics Provider

**Update `/app/layout.tsx`:**
```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 3. Create Analytics Helper

**Create `/lib/monitoring/analytics.ts`:**
```typescript
import { track } from '@vercel/analytics'

// Track successful conversion
export function trackConversionSuccess(templateType: string, latencyMs: number) {
  track('conversion_success', {
    template: templateType,
    latency_ms: latencyMs,
    timestamp: new Date().toISOString()
  })
}

// Track failed conversion
export function trackConversionFailed(templateType: string, errorMessage: string) {
  track('conversion_failed', {
    template: templateType,
    error: errorMessage.substring(0, 100), // Truncate long errors
    timestamp: new Date().toISOString()
  })
}

// Track bulk job created
export function trackBulkJobCreated(urlCount: number) {
  track('bulk_job_created', {
    url_count: urlCount,
    timestamp: new Date().toISOString()
  })
}

// Track user signup
export function trackUserSignup(provider: 'google' | 'github') {
  track('user_signup', {
    provider,
    timestamp: new Date().toISOString()
  })
}

// Track download
export function trackDownload(templateType: string) {
  track('h5p_downloaded', {
    template: templateType,
    timestamp: new Date().toISOString()
  })
}
```

### 4. Integrate with Convert API

**Update `/app/api/convert/route.ts`:**
```typescript
import { trackConversionSuccess, trackConversionFailed } from '@/lib/monitoring/analytics'

// After successful conversion:
const latency = Date.now() - startTime
trackConversionSuccess(template, latency)

// On error:
trackConversionFailed(template || 'unknown', error.message)
```

### 5. Enable in Vercel Dashboard

Document the manual step:
1. Go to Vercel Dashboard → Project Settings → Analytics
2. Click "Enable Analytics"
3. Web Vitals will automatically appear

---

## Acceptance Criteria

1. ✅ `@vercel/analytics` installed
2. ✅ Analytics component added to root layout
3. ✅ Analytics helper created with custom event functions
4. ✅ Events integrated into convert API
5. ✅ Setup documented for Vercel Dashboard

---

## Output Artifacts

1. **Code:** `/home/kasm-user/workspace/dspy/eduport-poc/lib/monitoring/analytics.ts`
2. **Modified:** `/home/kasm-user/workspace/dspy/eduport-poc/app/layout.tsx`
3. **Modified:** `/home/kasm-user/workspace/dspy/eduport-poc/app/api/convert/route.ts`
4. **Summary:** Generate a summary with Vercel Dashboard setup steps

---

## Verification

```bash
# Build and deploy to Vercel
cd /home/kasm-user/workspace/dspy/eduport-poc
npm run build

# After deployment, run a conversion
# Check Vercel Dashboard → Analytics → Custom Events
# Verify: conversion_success and conversion_failed events appear
```

---

## Custom Events Reference

| Event | Properties | Trigger |
|-------|------------|---------|
| `conversion_success` | template, latency_ms | After successful H5P generation |
| `conversion_failed` | template, error | On conversion error |
| `bulk_job_created` | url_count | When bulk job is queued |
| `user_signup` | provider | After OAuth login |
| `h5p_downloaded` | template | When user downloads file |

---

## Deadline

**Jan 14, 11:00 PM**
