# Agent 9: QA Engineer - Integration Test Runner

**Agent Role:** @eduport/qa-engineer  
**Task ID:** QA-002  
**Batch:** 2  
**Priority:** High  
**Deadline:** Jan 14, 6:00 PM

---

## Context

- Test corpus created with 50 URLs in `/tests/integration/corpus/test-corpus.json`
- Need automated test to run all 50 URLs and calculate success rate
- **Target:** ≥85% success rate for Gate Review (Jan 20)
- **Current Status:** Not all adapters implemented yet, so initial success rate may be low

---

## Task

Create integration test runner that processes all 50 URLs from the test corpus and calculates success rate.

**File:** `/tests/integration/corpus.test.ts`

---

## Implementation Guide

```typescript
// tests/integration/corpus.test.ts
import { describe, it, expect } from 'vitest'
import corpus from './corpus/test-corpus.json'
import { convertActivity } from '@/lib/convert'

describe('Test Corpus Integration', () => {
  const allUrls = corpus.corpus.map(item => item.url)
  
  it('should process all 50 URLs from test corpus', async () => {
    console.log(`\n📊 Running integration test on ${allUrls.length} URLs...\n`)
    
    const results = await Promise.allSettled(
      allUrls.map(url => convertActivity(url))
    )
    
    const successCount = results.filter(r => r.status === 'fulfilled').length
    const failCount = results.filter(r => r.status === 'rejected').length
    const successRate = successCount / allUrls.length
    
    console.log(`\n✅ Success: ${successCount}/${allUrls.length} (${Math.round(successRate * 100)}%)`)
    console.log(`❌ Failed: ${failCount}/${allUrls.length}\n`)
    
    // Log failures for debugging
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        const item = corpus.corpus[i]
        console.error(`❌ FAILED [${item.id}]: ${item.url}`)
        console.error(`   Template: ${item.template}`)
        console.error(`   Error: ${r.reason.message}`)
        console.error(`   Description: ${item.description}\n`)
      }
    })
    
    // Log successes by template
    const successesByTemplate: Record<string, number> = {}
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        const template = corpus.corpus[i].template
        successesByTemplate[template] = (successesByTemplate[template] || 0) + 1
      }
    })
    
    console.log('\n📈 Success rate by template:')
    Object.entries(successesByTemplate).forEach(([template, count]) => {
      const total = corpus.corpus.filter(item => item.template === template).length
      console.log(`   ${template}: ${count}/${total} (${Math.round(count/total * 100)}%)`)
    })
    
    // NOTE: Test may not pass yet (adapters not all implemented)
    // For now, just document the current success rate
    console.log(`\n🎯 Target: ≥85% (42/50 URLs)`)
    console.log(`📊 Current: ${Math.round(successRate * 100)}%`)
    
    if (successRate >= 0.85) {
      console.log(`✅ GATE REVIEW READY: Success rate ≥85%\n`)
    } else {
      console.log(`⏳ WORK REMAINING: Need ${Math.ceil(42 - successCount)} more passing URLs\n`)
    }
    
    // Don't fail the test yet - just document results
    // expect(successRate).toBeGreaterThanOrEqual(0.85)
  }, 300000) // 5-minute timeout for all 50 URLs
})

describe('Test Corpus Validation', () => {
  it('should have exactly 50 URLs', () => {
    expect(corpus.corpus).toHaveLength(50)
  })
  
  it('should have valid URL format for all entries', () => {
    corpus.corpus.forEach(item => {
      expect(item.url).toMatch(/^https:\/\/wordwall\.net\/resource\/\d+\//)
    })
  })
  
  it('should have required fields for all entries', () => {
    corpus.corpus.forEach(item => {
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('url')
      expect(item).toHaveProperty('template')
      expect(item).toHaveProperty('description')
    })
  })
})
```

---

## Acceptance Criteria

1. ✅ Test file created at `/tests/integration/corpus.test.ts`
2. ✅ Runs all 50 URLs from test corpus
3. ✅ Calculates success rate (%)
4. ✅ Logs failures with URL + error message + template
5. ✅ Logs success rate by template type
6. ✅ Test passes (or documents current status if <85%)

---

## Output Artifacts (REQUIRED)

1. **Test File:** `/home/kasm-user/workspace/dspy/eduport-poc/tests/integration/corpus.test.ts`
2. **Test Results:** `/home/kasm-user/.gemini/antigravity/brain/f3b200e3-a5e4-4679-b285-af2cfcd2e4cc/agent-outputs/QA-002-integration-results.txt`
3. **Summary:** `/home/kasm-user/.gemini/antigravity/brain/f3b200e3-a5e4-4679-b285-af2cfcd2e4cc/agent-outputs/QA-002-integration-summary.md`

**Test Results Format (QA-002-integration-results.txt):**
```
📊 EduPort Integration Test Results
Date: Jan 14, 2026 6:00 PM

Overall Results:
✅ Success: 12/50 (24%)
❌ Failed: 38/50 (76%)
🎯 Target: 42/50 (≥85%)

Success by Template:
  MatchUp: 8/10 (80%)
  Quiz: 4/10 (40%)
  Flashcard: 0/10 (0%)
  GroupSort: 0/10 (0%)
  MissingWord: 0/10 (0%)
  Crossword: 0/10 (0%)

Failed URLs:
1. matchup-03 - https://wordwall.net/resource/9012/matchup-colors
   Error: Adapter not implemented
   
2. quiz-02 - https://wordwall.net/resource/4444/quiz-science
   Error: Template not supported
   
... (list all failures)

Next Steps:
- Implement remaining adapters (Flashcard, GroupSort, MissingWord)
- Fix failing MatchUp and Quiz conversions
- Re-run tests to achieve ≥85% target
```

**Summary Template (QA-002-integration-summary.md):**
```markdown
# QA-002: Integration Test Runner - Summary

## Completed
- ✅ Created integration test at /tests/integration/corpus.test.ts
- ✅ Test runs all 50 URLs from corpus
- ✅ Logs detailed failure information
- ✅ Calculates success rate by template

## Test Results
```bash
npm run test:integration
```

**Current Success Rate:** 12/50 (24%)
**Target:** 42/50 (≥85%)

## Breakdown by Template
- MatchUp: 8/10 (80%) ✅
- Quiz: 4/10 (40%) ⚠️
- Flashcard: 0/10 (0%) ❌ NOT IMPLEMENTED
- GroupSort: 0/10 (0%) ❌ AGENT 1 IN PROGRESS
- MissingWord: 0/10 (0%) ❌ AGENT 2 STATUS UNKNOWN
- Crossword: 0/10 (0%) ❌ AGENT 8 IN PROGRESS

## Issues/Notes
- Not all adapters implemented yet (expected)
- Current results establish baseline
- Need 30 more passing URLs to reach 85% target

## Next Steps
- Wait for Batch 1 & 2 adapters to complete
- Re-run tests daily to track progress
- Update Gate Review report with latest results
```

---

## Verification

```bash
cd /home/kasm-user/workspace/dspy/eduport-poc
npm run test:integration

# Expected output:
# 📊 Running integration test on 50 URLs...
# ✅ Success: X/50 (X%)
# ❌ Failed: Y/50
# ... (detailed failure logs)
# 🎯 Target: ≥85% (42/50 URLs)
```

**Save output to results file:**
```bash
npm run test:integration > /home/kasm-user/.gemini/antigravity/brain/f3b200e3-a5e4-4679-b285-af2cfcd2e4cc/agent-outputs/QA-002-integration-results.txt 2>&1
```

---

## Dependencies

- ✅ Test corpus at `/tests/integration/corpus/test-corpus.json` (created by Agent 3)
- ⏳ Conversion function at `/lib/convert.ts` (assumes this exists or needs to be created)
- ⏳ Adapters (various states: some complete, some in progress)

---

## Important Notes

1. **Test may not pass yet** - Not all adapters are implemented. That's OK!
2. **Purpose:** Establish baseline and track progress toward 85% target
3. **Daily re-runs:** Run this test daily to see improvement as adapters are completed
4. **Gate Review (Jan 20):** This test MUST pass ≥85% by then

---

## Estimated Time

**1-2 hours**

---

## Deadline

**Jan 14, 6:00 PM**
