# Walkthrough: Vercel Fetch & Middleware Fix (BUG-003)

## Changes Implemented

### 1. Replaced `p-retry` with Native Loop
Modified `lib/scraping/http-client.ts` to remove the `p-retry` dependency, which was causing issues in the Vercel serverless environment. Implemented a robust `for` loop with:
- `AbortController` for per-request timeouts
- Exponential backoff
- Explicit status code handling

### 2. URL Encoding Fix
Updated `lib/scraping/wordwall-scraper.ts` to encode the Activity GUID when constructing the CDN URL:
```typescript
const zipUrl = `https://user.cdn.wordwall.net/documents/${encodeURIComponent(guid)}`;
```

### 3. Middleware Adjustment for Testing
Modified `middleware.ts` to explicitly allow requests to `/api/*` even if the `Origin` header is missing, enabling cURL and script-based testing.

## Verification Results

### Scraper Logic
Ran `scripts/test-scraper.ts` with the target URL:
```
https://wordwall.net/resource/101727466/esa/have-got-has-got-affirmative-negative
```
**Result:** ✅ Success
- Items extracted: 9
- Latency: ~2s
- Template: Quiz

### Middleware / API Access
Tested via cURL against local dev server:
```bash
curl -X POST http://localhost:3000/api/convert ...
```
**Result:** ✅ Success (Bypass)
- Received HTTP 500 (due to malformed test body) instead of HTTP 403.
- Confirms middleware no longer blocks requests without Origin header for API routes.

## Next Steps
- Deploy to Vercel.
- Verify production endpoint with the Browser Test.
