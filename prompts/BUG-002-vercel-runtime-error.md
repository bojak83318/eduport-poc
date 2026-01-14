# BUG: Vercel Runtime Error - Failed to parse URL from /pipeline

**Task ID:** BUG-002  
**Priority:** P0 - Critical (Production Blocked)  
**Assigned Role:** @eduport/backend-engineer  
**Created:** 2026-01-14  

---

## Problem Summary

After deploying the scraper fix (ZIP/XML approach), conversion fails on Vercel with:

```json
{"error": "Failed to parse URL from /pipeline", "latencyMs": 4294}
```

**Note:** Local testing (`npm run dev` + `scripts/test-scraper.ts`) works correctly - 9 quiz items extracted.

---

## Environment

| Context | Status |
|---------|--------|
| Local dev | ✅ Works (9 items extracted) |
| Vercel production | ❌ 500 error |

**Deploy URL:** https://eduport-poc.vercel.app/  
**Test URL:** `https://wordwall.net/resource/101727466/esa/have-got-has-got-affirmative-negative`

---

## Stack Trace (from browser)

```
POST /api/convert → 500 Internal Server Error
Response: {"error": "Failed to parse URL from /pipeline", "latencyMs": 4294}
```

The "pipeline" string doesn't appear in our codebase - likely from:
- `p-retry` library internals
- Node.js `fetch` in edge runtime
- Vercel serverless function runtime

---

## Hypothesis

### 1. Edge Runtime Incompatibility
The `fetch` in Vercel edge/serverless may handle URLs differently:
```typescript
// lib/scraping/wordwall-scraper.ts:82
const zipUrl = `https://user.cdn.wordwall.net/documents/${guid}`;
const response = await fetch(zipUrl);
```

### 2. Missing Environment Variable
Check if Supabase keys are set on Vercel:
```bash
npx vercel env ls
```

### 3. Buffer Handling in Serverless
```typescript
// Line 91 - Buffer may not work the same in edge runtime
const buffer = Buffer.from(arrayBuffer);
```

---

## Investigation Steps

1. **Check Vercel Logs**
   ```bash
   npx vercel logs --follow
   ```

2. **Add Debug Logging**
   ```typescript
   // In wordwall-scraper.ts fetchActivityPackage
   console.log('[DEBUG] Fetching ZIP from:', zipUrl);
   try {
       const response = await fetch(zipUrl);
       console.log('[DEBUG] Response status:', response.status);
   } catch (err) {
       console.log('[DEBUG] Fetch error:', err);
   }
   ```

3. **Test Edge Runtime Compatibility**
   ```typescript
   // Add to route.ts
   export const runtime = 'nodejs'; // Force Node.js instead of edge
   ```

4. **Verify Buffer polyfill**
   Vercel edge may need buffer polyfill for `adm-zip`:
   ```bash
   npm install buffer
   ```

---

## Files to Investigate

| File | Focus Area |
|------|------------|
| `lib/scraping/wordwall-scraper.ts` | `fetchActivityPackage()` - ZIP fetch |
| `app/api/convert/route.ts` | Add `runtime = 'nodejs'` |
| `vercel.json` | Check function config |
| `package.json` | Verify `adm-zip` compatibility |

---

## Acceptance Criteria

1. ✅ Identify root cause of "Failed to parse URL from /pipeline"
2. ✅ Fix fetch/Buffer handling for Vercel serverless
3. ✅ Conversion succeeds on production for test URL
4. ✅ Download link appears in UI

---

## Related

- **BUG-001:** Scraper fix (completed - uses CDN ZIP)
- **Workings:** `scraper/workings-001.md` (local fix verified)
