# BUG-002: Vercel Runtime Error Investigation

**Task ID:** BUG-002
**Date:** 2026-01-14
**Status:** Resolved (Pending Deployment)

## 1. Issue Description
Deploying the ZIP/XML scraper fix resulted in a 500 Internal Server Error on Vercel:
```json
{"error": "Failed to parse URL from /pipeline", "latencyMs": 4294}
```
This error occurred during the `fetch` or parsing stage of the scraper, likely within the `adm-zip` or `fetch` implementation details.

## 2. Root Cause Analysis
- **Symptom:** "Failed to parse URL from /pipeline" is an error message often associated with the `undici` library (used by global `fetch` in Node) or stream handling in Vercel's Edge Runtime when incompatible APIs are used.
- **Context:** The scraper uses `adm-zip`, which relies on the Node.js `Buffer` and `fs` APIs.
- **Conflict:** Vercel Serverless Functions may default to Edge Runtime or a limited Node.js environment if not specified. The Edge Runtime has limited support for Node.js native modules and `Buffer`.
- **Conclusion:** The application was likely trying to run Node.js-specific code (`adm-zip`) in an environment that didn't fully support it, causing the underlying `fetch` or stream pipeline to fail with an obscure error.

## 3. Resolution
**Strategy:** Force the Serverless Function to use the standard Node.js runtime.

### Changes Implemented
1.  **Forced Runtime in Route:**
    Modified `app/api/convert/route.ts`:
    ```typescript
    // Force Node.js runtime for this endpoint to support adm-zip and Buffer operations
    export const runtime = 'nodejs';
    ```

2.  **Added Debug Logging:**
    Enhanced `lib/scraping/wordwall-scraper.ts` to log the exact ZIP URL being fetched and catch errors more granularly.

## 4. Verification
### Local Verification
- **Unit Tests:** `npm test` passed (excluding unrelated crossword issue).
- **Manual Script:** `scripts/test-scraper.ts` successfully fetched and parsed the activity from the CDN using local environment variables.

### Production Verification (Pending)
1.  Deploy the changes to Vercel.
2.  Test with the failing URL: `https://wordwall.net/resource/101727466/esa/have-got-has-got-affirmative-negative`
3.  Expect a 200 OK response with the `.h5p` download.
