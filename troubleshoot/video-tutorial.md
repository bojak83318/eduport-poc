# Video Tutorial Troubleshooting Analysis

## Task: QA-007 Video Tutorial
**Date:** January 14, 2026  
**Agent:** QA Engineer  
**Status:** 🔴 BLOCKED

---

## Problem Statement

The video tutorial task requires demonstrating a complete EduPort conversion workflow. However, the local development environment cannot perform actual conversions due to database dependency issues.

---

## Root Cause Analysis

### Issue: Supabase Dependency in `/api/convert`

The convert API endpoint (`/app/api/convert/route.ts`) requires Supabase for:
1. **Authentication** - `createClient()` to get user session
2. **Rate Limiting** - User-based rate limit checks
3. **Quota Tracking** - Recording conversions to `conversions` table

```typescript
// /app/api/convert/route.ts:16-18
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
```

### Local vs Production Environments

| Aspect | Production (Vercel) | Local Development |
|--------|---------------------|-------------------|
| Database | Supabase Cloud | Requires `.env.local` |
| Env Vars | Vercel Secrets | Gitignored `.env.local` |
| Health Endpoint | ✅ Works | ✅ Works |
| Convert Endpoint | ✅ Works | ⚠️ Requires Supabase creds |
| Integration Tests | N/A | ✅ Uses mocked scrapers |

### Evidence from Codebase

1. **`.env.example`** requires:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **`/lib/supabase/server.ts`** uses these env vars directly:
   ```typescript
   process.env.NEXT_PUBLIC_SUPABASE_URL!,
   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
   ```

3. **Integration tests** bypass this via mocking:
   ```typescript
   vi.mock('../../lib/scraping/wordwall-scraper', () => {...})
   ```

---

## Solution Options

### Option A: Record Against Production URL ✅ Recommended

**Pros:**
- No local setup required
- Shows real user experience
- Production environment is stable

**Cons:**
- Requires Vercel deployment to be working
- Any production issues affect recording

**Implementation:**
1. Verify `https://eduport.vercel.app` is deployed
2. Test manual conversion on production
3. Record browser session against production URL

### Option B: Setup Local Supabase

**Pros:**
- Full control over environment
- Can demo offline (after setup)

**Cons:**
- Requires `npx supabase start` (Docker)
- Running Supabase processes already detected (may conflict)
- Additional 15-30 min setup time

**Implementation:**
```bash
# Check if Supabase CLI is working
npx supabase --version

# Start local Supabase (requires Docker)
npx supabase start

# Apply migrations
npx supabase db push

# Update .env.local with local credentials from output
```

### Option C: Mock Mode for Demo

**Pros:**
- No external dependencies
- Fast, predictable demo

**Cons:**
- Requires code changes
- Not showing real functionality

**Implementation:**
1. Add `DEMO_MODE=true` environment variable
2. Modify `/api/convert` to return mock H5P in demo mode
3. Would need to be clearly labeled as "demo footage"

---

## Observed Running Processes

From terminal metadata:
- `npx supabase --version` - Running 2h50m (possibly hung)
- `npx supabase db push --dry-run` - Running 2h48m (possibly hung)
- `npm run dev` - Running 1h16m (dev server active)

### Action Required
Terminate hung Supabase processes before proceeding:
```bash
# Kill hung processes
pkill -f "supabase"

# Verify dev server is still responding
curl http://localhost:3000/api/health
```

---

## Recommendation

**Use Option A: Production URL**

1. **Immediate:** Verify production deployment at `https://eduport.vercel.app`
2. **Test:** Manually convert one Wordwall activity on production
3. **Record:** Use browser recording tools against production URL
4. **Fallback:** If production is down, document script and mark "Ready for PM to record"

---

## E2E Testing Dependency

The user mentioned E2E tests need to run before the video tutorial. However:

1. **Integration tests** (`tests/integration/corpus.test.ts`) use mocked scrapers - these work without Supabase
2. **Load tests** (`tests/load/basic-load.k6.js`) test against running server - these work
3. **True E2E tests** against `/api/convert` require either:
   - Production URL
   - Local Supabase with migrations applied

### Test Commands Available

```bash
# Unit/Integration tests (mocked, no Supabase needed)
npm test

# Load tests (requires dev server running)
./k6-v0.48.0-linux-amd64/k6 run tests/load/basic-load.k6.js

# E2E against production (recommended)
# Manually test: curl https://eduport.vercel.app/api/health
```

---

## Files Referenced

| File | Purpose |
|------|---------|
| `/app/api/convert/route.ts` | Convert endpoint requiring Supabase |
| `/lib/supabase/server.ts` | Supabase client factory |
| `/tests/integration/corpus.test.ts` | Mocked integration tests |
| `/troubleshoot/load-testing.md` | Previous load test analysis |
| `.env.example` | Required environment variables |
