# Agent 15: Backend Engineer - Anagram Adapter

**Agent Role:** @eduport/backend-engineer  
**Task ID:** BE-015  
**Batch:** 4  
**Priority:** High  
**Deadline:** Jan 14, 9:30 PM

---

## Context

Anagram puzzles where users rearrange letters to form words.
Converts to H5P.DragWords 1.11.

---

## Task

Create the Anagram → H5P.DragWords 1.11 adapter.

**File:** `/lib/adapters/anagram.adapter.ts`

---

## Data Mapping

**Wordwall Anagram Format:**
```json
{
  "template": "Anagram",
  "words": [
    { "scrambled": "ELPPA", "answer": "APPLE" },
    { "scrambled": "NANAAB", "answer": "BANANA" }
  ]
}
```

**H5P.DragWords Format:**
```json
{
  "taskDescription": "Drag the letters to form the correct word",
  "textField": "*APPLE*\n*BANANA*",
  "behaviour": {
    "enableRetry": true,
    "enableSolutionsButton": true
  }
}
```

---

## Implementation

```typescript
// lib/adapters/anagram.adapter.ts

interface WordwallAnagram {
  words: Array<{
    scrambled: string
    answer: string
  }>
}

export default function anagramAdapter(data: WordwallAnagram) {
  const words = data.words || []
  
  // H5P.DragWords uses *word* syntax for droppable words
  const textField = words.map(w => `*${w.answer}*`).join('\n')
  
  return {
    h5pJson: {
      title: 'Anagram',
      mainLibrary: 'H5P.DragWords',
      preloadedDependencies: [
        { machineName: 'H5P.DragWords', majorVersion: 1, minorVersion: 11 }
      ]
    },
    contentJson: {
      taskDescription: 'Unscramble the letters to form words',
      textField: textField,
      behaviour: {
        enableRetry: true,
        enableSolutionsButton: true
      }
    }
  }
}
```

---

## Acceptance Criteria

1. ✅ Adapter file created
2. ✅ Handles Unicode words
3. ✅ Registered in convert.ts
4. ✅ Unit tests: 10 scenarios

---

## Output Artifacts

1. **Code:** `/home/kasm-user/workspace/dspy/eduport-poc/lib/adapters/anagram.adapter.ts`
2. **Tests:** `/home/kasm-user/workspace/dspy/eduport-poc/__tests__/adapters/anagram.test.ts`
3. **Summary:** `/home/kasm-user/.gemini/antigravity/brain/f3b200e3-a5e4-4679-b285-af2cfcd2e4cc/agent-outputs/BE-015-anagram-summary.md`

---

## Deadline

**Jan 14, 9:30 PM**
