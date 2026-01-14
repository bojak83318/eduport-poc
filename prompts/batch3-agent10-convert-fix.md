# Agent 10: Backend Engineer - Fix Conversion Pipeline

**Agent Role:** @eduport/backend-engineer  
**Task ID:** BE-010  
**Batch:** 3  
**Priority:** CRITICAL 🔴  
**Deadline:** Jan 14, 8:00 PM

---

## Problem

Integration tests show **0% success rate** - all 50 URLs fail to convert.

From the test logs:
```
✅ Success: 0/50 (0%)
❌ Failed: 50/50
```

The wordwall-scraper IS fetching URLs (logs show "Starting scrape" for all 50), but no H5P packages are being returned.

---

## Root Cause Analysis

Likely issues:
1. `/lib/convert.ts` may not be wiring adapters correctly
2. Adapter router may not be selecting the right adapter for each template
3. H5P packaging step may be failing silently
4. Error handling may be swallowing errors

---

## Task

Debug and fix the core conversion pipeline to achieve at least 10% success rate.

---

## Diagnosis Steps

1. **Check convert.ts exists and exports correctly:**
   ```bash
   ls -la /home/kasm-user/workspace/dspy/eduport-poc/lib/convert.ts
   ```

2. **Verify adapters are imported:**
   ```typescript
   // Expected in convert.ts:
   import groupSortAdapter from './adapters/group-sort.adapter'
   import missingWordAdapter from './adapters/missing-word.adapter'
   import crosswordAdapter from './adapters/crossword.adapter'
   ```

3. **Check adapter router logic:**
   ```typescript
   function getAdapter(template: string) {
     switch(template) {
       case 'GroupSort': return groupSortAdapter
       case 'MissingWord': return missingWordAdapter
       case 'Crossword': return crosswordAdapter
       default: throw new Error(`Unsupported template: ${template}`)
     }
   }
   ```

4. **Add debug logging:**
   ```typescript
   export async function convertActivity(url: string) {
     console.log(`[convert] Starting conversion for: ${url}`)
     try {
       const scraped = await scrapeWordwall(url)
       console.log(`[convert] Scraped template: ${scraped.template}`)
       
       const adapter = getAdapter(scraped.template)
       console.log(`[convert] Using adapter: ${adapter.name}`)
       
       const h5p = adapter(scraped.data)
       console.log(`[convert] H5P generated: ${JSON.stringify(h5p).substring(0, 100)}...`)
       
       return h5p
     } catch (error) {
       console.error(`[convert] FAILED: ${url}`, error)
       throw error
     }
   }
   ```

---

## Acceptance Criteria

1. ✅ Debug logging added to identify failure point
2. ✅ Adapter router correctly maps templates to adapters
3. ✅ At least ONE successful conversion (proof of concept)
4. ✅ Integration test shows >0% success rate

---

## Output Artifacts (REQUIRED)

1. **Fixed Code:** `/home/kasm-user/workspace/dspy/eduport-poc/lib/convert.ts`
2. **Summary:** `/home/kasm-user/.gemini/antigravity/brain/f3b200e3-a5e4-4679-b285-af2cfcd2e4cc/agent-outputs/BE-010-convert-fix-summary.md`

**Summary should include:**
- Root cause identified
- Fix applied
- Before/after success rate
- Remaining issues (if any)

---

## Verification

```bash
cd /home/kasm-user/workspace/dspy/eduport-poc
npm run test:integration 2>&1 | head -100
# Look for: Success: X/50 (X%)
# Target: At least 5/50 (10%) passing
```

---

## Deadline

**Jan 14, 8:00 PM** (CRITICAL - blocks all other adapters)
