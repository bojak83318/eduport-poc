# Agent 14: Backend Engineer - Wordsearch Adapter

**Agent Role:** @eduport/backend-engineer  
**Task ID:** BE-014  
**Batch:** 4  
**Priority:** High  
**Deadline:** Jan 14, 9:30 PM

---

## Context

Wordsearch is in the test corpus. Converts to H5P.WordSearch 1.4.
Creates a grid of letters where users find hidden words.

---

## Task

Create the Wordsearch → H5P.WordSearch 1.4 adapter.

**File:** `/lib/adapters/wordsearch.adapter.ts`

---

## Data Mapping

**Wordwall Wordsearch Format:**
```json
{
  "template": "Wordsearch",
  "words": ["APPLE", "BANANA", "CHERRY", "DATE"],
  "gridSize": 10
}
```

**H5P.WordSearch Format:**
```json
{
  "taskDescription": "Find the hidden words",
  "wordList": "APPLE, BANANA, CHERRY, DATE",
  "behaviour": {
    "enableRetry": true,
    "showSolutionsButton": true
  },
  "l10n": {
    "found": "Words found: @found of @total",
    "tryAgain": "Try again"
  }
}
```

---

## Implementation

```typescript
// lib/adapters/wordsearch.adapter.ts

interface WordwallWordsearch {
  words: string[]
  gridSize?: number
}

export default function wordsearchAdapter(data: WordwallWordsearch) {
  const words = data.words || []
  
  return {
    h5pJson: {
      title: 'Word Search',
      mainLibrary: 'H5P.WordSearch',
      preloadedDependencies: [
        { machineName: 'H5P.WordSearch', majorVersion: 1, minorVersion: 4 }
      ]
    },
    contentJson: {
      taskDescription: 'Find the hidden words in the grid',
      wordList: words.join(', '),
      behaviour: {
        enableRetry: true,
        showSolutionsButton: true
      }
    }
  }
}
```

---

## Acceptance Criteria

1. ✅ Adapter file created
2. ✅ Handles word list extraction
3. ✅ Registered in convert.ts adapter router
4. ✅ Unit tests: 10 scenarios

---

## Output Artifacts

1. **Code:** `/home/kasm-user/workspace/dspy/eduport-poc/lib/adapters/wordsearch.adapter.ts`
2. **Tests:** `/home/kasm-user/workspace/dspy/eduport-poc/__tests__/adapters/wordsearch.test.ts`
3. **Summary:** `/home/kasm-user/.gemini/antigravity/brain/f3b200e3-a5e4-4679-b285-af2cfcd2e4cc/agent-outputs/BE-014-wordsearch-summary.md`

---

## Verification

```bash
npm test -- __tests__/adapters/wordsearch.test.ts
```

---

## Deadline

**Jan 14, 9:30 PM**
