# Agent 13: Backend Engineer - Flashcard Adapter

**Agent Role:** @eduport/backend-engineer  
**Task ID:** BE-013  
**Batch:** 3  
**Priority:** High  
**Deadline:** Jan 14, 8:00 PM

---

## Context

Flashcard is a simple template (10/50 URLs in test corpus).
Front/back card pairs - straightforward mapping.
Converts to H5P.Flashcards 1.5.

---

## Task

Create the Flashcard → H5P.Flashcards 1.5 adapter.

**File:** `/lib/adapters/flashcard.adapter.ts`

---

## Data Mapping

**Wordwall Flashcard Format:**
```json
{
  "template": "Flashcard",
  "cards": [
    { "front": "Bonjour", "back": "Hello" },
    { "front": "Merci", "back": "Thank you" },
    { "front": "Au revoir", "back": "Goodbye" }
  ]
}
```

**H5P.Flashcards Format:**
```json
{
  "title": "Flashcards",
  "description": "Learn these terms",
  "cards": [
    {
      "text": "Bonjour",
      "answer": "Hello",
      "image": null,
      "tip": ""
    },
    {
      "text": "Merci",
      "answer": "Thank you",
      "image": null,
      "tip": ""
    }
  ],
  "behaviour": {
    "enableRetry": true,
    "randomCards": true
  }
}
```

---

## Implementation Guide

```typescript
// lib/adapters/flashcard.adapter.ts

interface WordwallFlashcard {
  cards: Array<{
    front: string
    back: string
    image?: string
  }>
}

interface H5PFlashcards {
  title: string
  description: string
  cards: Array<{
    text: string
    answer: string
    image: { path: string } | null
    tip: string
  }>
  behaviour: {
    enableRetry: boolean
    randomCards: boolean
  }
}

export default function flashcardAdapter(data: WordwallFlashcard): H5PFlashcards {
  return {
    title: 'Flashcards',
    description: 'Learn these terms',
    cards: data.cards.map(card => ({
      text: card.front,
      answer: card.back,
      image: card.image ? { path: card.image } : null,
      tip: ''
    })),
    behaviour: {
      enableRetry: true,
      randomCards: true
    }
  }
}
```

---

## Acceptance Criteria

1. ✅ Adapter handles text-only flashcards
2. ✅ Adapter handles flashcards with images (optional)
3. ✅ Handles empty/missing fields gracefully
4. ✅ Unit tests: 15 scenarios
5. ✅ Registered in adapter router

---

## Output Artifacts (REQUIRED)

1. **Code:** `/home/kasm-user/workspace/dspy/eduport-poc/lib/adapters/flashcard.adapter.ts`
2. **Tests:** `/home/kasm-user/workspace/dspy/eduport-poc/__tests__/adapters/flashcard.test.ts`
3. **Summary:** `/home/kasm-user/.gemini/antigravity/brain/f3b200e3-a5e4-4679-b285-af2cfcd2e4cc/agent-outputs/BE-013-flashcard-summary.md`

---

## Verification

```bash
npm test -- __tests__/adapters/flashcard.test.ts
# Expected: 15/15 tests passing
```

---

## Deadline

**Jan 14, 8:00 PM**
