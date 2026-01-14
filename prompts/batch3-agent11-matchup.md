# Agent 11: Backend Engineer - MatchUp Adapter

**Agent Role:** @eduport/backend-engineer  
**Task ID:** BE-011  
**Batch:** 3  
**Priority:** High  
**Deadline:** Jan 14, 8:00 PM

---

## Context

MatchUp is the most common template in the test corpus (10/50 URLs).
Converts to H5P.MemoryGame 1.3 - a card matching game.

---

## Task

Create the MatchUp → H5P.MemoryGame 1.3 adapter.

**File:** `/lib/adapters/matchup.adapter.ts`

---

## Data Mapping

**Wordwall MatchUp Format:**
```json
{
  "template": "MatchUp",
  "pairs": [
    { "left": "Dog", "right": "Canine" },
    { "left": "Cat", "right": "Feline" }
  ]
}
```

**H5P.MemoryGame Format:**
```json
{
  "cards": [
    { "image": null, "text": "Dog", "matchAlt": "Canine" },
    { "image": null, "text": "Cat", "matchAlt": "Feline" }
  ],
  "behaviour": {
    "allowRetry": true,
    "useGrid": true,
    "cardsToUse": "all"
  }
}
```

---

## Implementation Guide

```typescript
// lib/adapters/matchup.adapter.ts

interface WordwallMatchUp {
  pairs: Array<{
    left: string
    right: string
    leftImage?: string
    rightImage?: string
  }>
}

interface H5PMemoryGame {
  cards: Array<{
    image: { path: string } | null
    text: string
    matchAlt: string
  }>
  behaviour: {
    allowRetry: boolean
    useGrid: boolean
    cardsToUse: string
  }
}

export default function matchupAdapter(data: WordwallMatchUp): H5PMemoryGame {
  return {
    cards: data.pairs.map(pair => ({
      image: pair.leftImage ? { path: pair.leftImage } : null,
      text: pair.left,
      matchAlt: pair.right
    })),
    behaviour: {
      allowRetry: true,
      useGrid: true,
      cardsToUse: 'all'
    }
  }
}
```

---

## Acceptance Criteria

1. ✅ Adapter file created at `/lib/adapters/matchup.adapter.ts`
2. ✅ Handles text-only pairs
3. ✅ Handles pairs with images (optional)
4. ✅ Unit tests: 20 scenarios
5. ✅ Registered in adapter router (`/lib/convert.ts`)

---

## Output Artifacts (REQUIRED)

1. **Code:** `/home/kasm-user/workspace/dspy/eduport-poc/lib/adapters/matchup.adapter.ts`
2. **Tests:** `/home/kasm-user/workspace/dspy/eduport-poc/__tests__/adapters/matchup.test.ts`
3. **Summary:** `/home/kasm-user/.gemini/antigravity/brain/f3b200e3-a5e4-4679-b285-af2cfcd2e4cc/agent-outputs/BE-011-matchup-summary.md`

---

## Verification

```bash
npm test -- __tests__/adapters/matchup.test.ts
# Expected: 20/20 tests passing
```

---

## Deadline

**Jan 14, 8:00 PM**
