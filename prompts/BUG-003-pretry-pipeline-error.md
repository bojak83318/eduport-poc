# BUG: Vercel Fetch/p-retry Pipeline Error Persists

**Task ID:** BUG-003  
**Priority:** P0 - Critical (Production Blocked)  
**Assigned Role:** @eduport/backend-engineer  
**Created:** 2026-01-14  
**Depends On:** BUG-002 (runtime fix deployed but insufficient)

---

## Problem Summary

After deploying BUG-002 fix (`runtime = 'nodejs'`), conversion still fails:

```json
{"error": "Failed to parse URL from /pipeline", "latencyMs": ~4000}
```

The Node.js runtime fix was necessary but not sufficient.

---

## Context

### What's Been Tried
| Fix | Status |
|-----|--------|
| BUG-001: CDN ZIP approach | ✅ Works locally |
| BUG-002: `runtime = 'nodejs'` | ✅ Deployed but error persists |

### Test Results
| Environment | Outcome |
|-------------|---------|
| Local (`npm run dev`) | ✅ 9 items extracted |
| Local (`test-scraper.ts`) | ✅ Works |
| Vercel Production | ❌ 500 "pipeline" error |
| cURL to Production | ❌ 403 (CSRF blocks) |

---

## Root Cause Hypothesis

### 1. p-retry Library Issue
The `p-retry` library may use internal fetch patterns incompatible with Vercel:
```typescript
// lib/scraping/http-client.ts
import pRetry from 'p-retry';
```

**Solution:** Replace with native retry loop

### 2. AbortController Handling
```typescript
// http-client.ts:26-27
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), timeout);
```

Vercel may handle AbortController differently.

### 3. Fetch URL Encoding
The CDN URL may need explicit encoding:
```typescript
const zipUrl = `https://user.cdn.wordwall.net/documents/${encodeURIComponent(guid)}`;
```

---

## Proposed Fixes

### Option A: Remove p-retry (Recommended)
Replace p-retry with native implementation:

```typescript
async get(url: string): Promise<string> {
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const response = await fetch(url, { headers: {...} });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
        } catch (err) {
            if (attempt === 3) throw err;
            await new Promise(r => setTimeout(r, 1000 * attempt));
        }
    }
    throw new Error('Max retries exceeded');
}
```

### Option B: Use node-fetch explicitly
```bash
npm install node-fetch
```
```typescript
import fetch from 'node-fetch';
```

### Option C: Disable CSRF for API testing
Temporarily comment out origin check in `middleware.ts` to test with curl.

---

## Files to Modify

| File | Change |
|------|--------|
| `lib/scraping/http-client.ts` | Replace p-retry |
| `lib/scraping/wordwall-scraper.ts` | Add more error handling |
| `middleware.ts` | (Optional) Exempt /api/convert from CSRF |

---

## Acceptance Criteria

1. ✅ Conversion succeeds on Vercel production
2. ✅ "Failed to parse URL from /pipeline" error resolved
3. ✅ Download link appears in browser
4. ✅ cURL test works (after CSRF adjustment)

---

## Test URL

```bash
# Browser test
https://eduport-poc.vercel.app/

# Input URL
https://wordwall.net/resource/101727466/esa/have-got-has-got-affirmative-negative
```

---

## Related

- **BUG-001:** [activityModel extraction](prompts/BUG-001-wordwall-scraper.md) ✅
- **BUG-002:** [Node.js runtime](prompts/BUG-002-vercel-runtime-error.md) ✅ (deployed)
- **Workings:** [workings-001](scraper/workings-001.md), [workings-002](scraper/workings-002.md)
