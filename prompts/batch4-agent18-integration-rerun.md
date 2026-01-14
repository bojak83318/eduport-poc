# Agent 18: QA Engineer - Re-run Integration Tests & Add test:integration Script

**Agent Role:** @eduport/qa-engineer  
**Task ID:** QA-003  
**Batch:** 4  
**Priority:** CRITICAL 🔴  
**Deadline:** Jan 14, 9:30 PM

---

## Problem

The `npm run test:integration` script is missing from package.json.
Need to add it and re-run integration tests with all new adapters.

Current adapters available (6):
- group-sort.adapter.ts
- missing-word.adapter.ts
- crossword.adapter.ts
- flashcard.adapter.ts
- matchup.adapter.ts
- quiz.adapter.ts

---

## Task

1. Add `test:integration` script to package.json
2. Re-run integration tests
3. Document current success rate
4. Identify which templates are still failing

---

## Implementation

### Step 1: Add script to package.json

```json
{
  "scripts": {
    "test:integration": "vitest run tests/integration/"
  }
}
```

### Step 2: Verify test file exists

Check `/tests/integration/corpus.test.ts` is present and correct.

### Step 3: Run integration tests

```bash
npm run test:integration
```

### Step 4: Document results

Create summary with:
- Overall success rate (X/50)
- Success rate by template
- List of failing URLs with error messages

---

## Acceptance Criteria

1. ✅ `test:integration` script added to package.json
2. ✅ Integration tests run successfully
3. ✅ Success rate documented (target: ≥50% with current adapters)
4. ✅ Summary identifies gaps

---

## Output Artifacts

1. **Modified:** `/home/kasm-user/workspace/dspy/eduport-poc/package.json`
2. **Test Results:** `/home/kasm-user/.gemini/antigravity/brain/f3b200e3-a5e4-4679-b285-af2cfcd2e4cc/agent-outputs/QA-003-integration-results.txt`
3. **Summary:** `/home/kasm-user/.gemini/antigravity/brain/f3b200e3-a5e4-4679-b285-af2cfcd2e4cc/agent-outputs/QA-003-integration-summary.md`

**Summary should include:**
```markdown
# QA-003: Integration Test Results

## Overall Results
- Success: X/50 (X%)
- Failed: Y/50 (Y%)
- Target: ≥85%

## By Template
| Template | Passed | Failed | Rate |
|----------|--------|--------|------|
| MatchUp  | 8/10   | 2/10   | 80%  |
| Quiz     | 7/10   | 3/10   | 70%  |
...

## Top Failing Errors
1. "Template not registered" - X occurrences
2. "Scrape failed" - Y occurrences
...

## Recommendations
- Need adapters for: Wordsearch, Anagram, RankOrder, Unjumble
- Fix scraper for: [specific URLs]
```

---

## Verification

```bash
npm run test:integration 2>&1 | tee integration-output.txt
```

---

## Deadline

**Jan 14, 9:30 PM**
