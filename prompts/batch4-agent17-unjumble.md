# Agent 17: Backend Engineer - Unjumble Adapter

**Agent Role:** @eduport/backend-engineer  
**Task ID:** BE-017  
**Batch:** 4  
**Priority:** High  
**Deadline:** Jan 14, 9:30 PM

---

## Context

Unjumble has users rearrange words to form correct sentences.
Converts to H5P.SortParagraphs or H5P.DragText.

---

## Task

Create the Unjumble → H5P.DragText 1.10 adapter.

**File:** `/lib/adapters/unjumble.adapter.ts`

---

## Data Mapping

**Wordwall Unjumble Format:**
```json
{
  "template": "Unjumble",
  "sentences": [
    {
      "jumbled": ["cat", "the", "sat", "mat", "on", "the"],
      "correct": "The cat sat on the mat"
    }
  ]
}
```

**H5P.DragText Format:**
```json
{
  "taskDescription": "Arrange the words to form correct sentences",
  "textField": "*The* *cat* *sat* *on* *the* *mat*",
  "behaviour": {
    "enableRetry": true
  }
}
```

---

## Implementation

```typescript
// lib/adapters/unjumble.adapter.ts

interface WordwallUnjumble {
  sentences: Array<{
    jumbled: string[]
    correct: string
  }>
}

export default function unjumbleAdapter(data: WordwallUnjumble) {
  const sentences = data.sentences || []
  
  // Build text field with all words as draggables
  const textFields = sentences.map(s => {
    const words = s.correct.split(' ')
    return words.map(w => `*${w}*`).join(' ')
  })
  
  return {
    h5pJson: {
      title: 'Unjumble',
      mainLibrary: 'H5P.DragText',
      preloadedDependencies: [
        { machineName: 'H5P.DragText', majorVersion: 1, minorVersion: 10 }
      ]
    },
    contentJson: {
      taskDescription: 'Arrange the words to form correct sentences',
      textField: textFields.join('\n\n'),
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
2. ✅ Handles multiple sentences
3. ✅ Preserves punctuation
4. ✅ Registered in convert.ts
5. ✅ Unit tests: 10 scenarios

---

## Output Artifacts

1. **Code:** `/home/kasm-user/workspace/dspy/eduport-poc/lib/adapters/unjumble.adapter.ts`
2. **Tests:** `/home/kasm-user/workspace/dspy/eduport-poc/__tests__/adapters/unjumble.test.ts`
3. **Summary:** `/home/kasm-user/.gemini/antigravity/brain/f3b200e3-a5e4-4679-b285-af2cfcd2e4cc/agent-outputs/BE-017-unjumble-summary.md`

---

## Deadline

**Jan 14, 9:30 PM**
