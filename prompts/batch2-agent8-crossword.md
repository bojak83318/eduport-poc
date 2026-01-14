# Agent 8: Backend Engineer - Crossword Adapter

**Agent Role:** @eduport/backend-engineer  
**Task ID:** BE-003  
**Batch:** 2  
**Priority:** Medium (Complex, may descope to Week 3)  
**Deadline:** Jan 14, 6:00 PM (or escalate if blocked)

---

## Context

- Wordwall provides crossword clues + answers but NOT grid positions
- We must compute grid layout ourselves using constraint solving
- This is the most complex adapter in MVP
- **FALLBACK:** If too complex, descope to Week 3 and focus on simpler adapters first

---

## Task

Create the Crossword → H5P.Crossword 0.4 adapter with basic grid layout algorithm.

**File:** `/lib/adapters/crossword.adapter.ts`

---

## SIMPLE Algorithm (MVP)

Since full constraint solving is complex, use this simplified approach:

1. **Sort clues by answer length** (longest first)
2. **Place first clue** at (0, 0) horizontally
3. **For each subsequent clue:**
   - Try to find intersection with existing clues
   - If intersection found, place clue at intersection
   - If no intersection possible, **skip clue** (log warning, don't error)
4. **Return grid** with placed clues

**Key Principle:** It's OK to skip clues that don't fit. Better to have partial crossword than crash.

---

## Data Structures

```typescript
interface CrosswordClue {
  number: number
  direction: 'across' | 'down'
  clue: string
  answer: string
  x: number  // Grid position (column)
  y: number  // Grid position (row)
}

interface Grid {
  width: number
  height: number
  cells: string[][]  // 2D array of letters
  clues: CrosswordClue[]
}
```

---

## Implementation Guide

```typescript
// lib/adapters/crossword.adapter.ts

interface WordwallCrossword {
  clues: Array<{
    clue: string
    answer: string
    direction?: 'across' | 'down'
  }>
}

interface H5PCrossword {
  taskDescription: string
  words: Array<{
    clue: string
    answer: string
    row: number
    col: number
    orientation: 'across' | 'down'
    clueId: number
  }>
}

function findIntersection(
  placed: CrosswordClue,
  newAnswer: string
): { x: number; y: number; direction: 'across' | 'down' } | null {
  // Find common letters between placed word and new word
  for (let i = 0; i < placed.answer.length; i++) {
    for (let j = 0; j < newAnswer.length; j++) {
      if (placed.answer[i].toLowerCase() === newAnswer[j].toLowerCase()) {
        // Found intersection!
        if (placed.direction === 'across') {
          // New word should be down
          return {
            x: placed.x + i,
            y: placed.y - j,
            direction: 'down'
          }
        } else {
          // New word should be across
          return {
            x: placed.x - j,
            y: placed.y + i,
            direction: 'across'
          }
        }
      }
    }
  }
  return null
}

export default function crosswordAdapter(wordwallData: WordwallCrossword): H5PCrossword {
  // Sort clues by answer length (longest first)
  const sortedClues = [...wordwallData.clues].sort(
    (a, b) => b.answer.length - a.answer.length
  )

  const placedWords: CrosswordClue[] = []

  // Place first word at (0, 0) horizontally
  if (sortedClues.length > 0) {
    placedWords.push({
      number: 1,
      direction: 'across',
      clue: sortedClues[0].clue,
      answer: sortedClues[0].answer,
      x: 0,
      y: 0
    })
  }

  // Try to place remaining words
  for (let i = 1; i < sortedClues.length; i++) {
    const currentClue = sortedClues[i]
    let placed = false

    // Try to find intersection with each placed word
    for (const placedWord of placedWords) {
      const intersection = findIntersection(placedWord, currentClue.answer)
      
      if (intersection) {
        placedWords.push({
          number: i + 1,
          direction: intersection.direction,
          clue: currentClue.clue,
          answer: currentClue.answer,
          x: intersection.x,
          y: intersection.y
        })
        placed = true
        break
      }
    }

    if (!placed) {
      console.warn(`Could not place clue: "${currentClue.clue}" (skipping)`)
    }
  }

  // Convert to H5P format
  return {
    taskDescription: 'Complete the crossword puzzle',
    words: placedWords.map((word, index) => ({
      clue: word.clue,
      answer: word.answer,
      row: word.y,
      col: word.x,
      orientation: word.direction,
      clueId: index + 1
    }))
  }
}
```

---

## Acceptance Criteria

1. ✅ Adapter file created at `/lib/adapters/crossword.adapter.ts`
2. ✅ Grid layout handles 5-10 clues
3. ✅ Clues with no intersections are gracefully skipped (logged as warnings, not errors)
4. ✅ Unit tests: 15 scenarios in `/__tests__/adapters/crossword.test.ts`
5. ✅ Export default function matching signature: `(wordwallData: any) => H5PCrossword`

---

## Unit Test Examples

```typescript
// __tests__/adapters/crossword.test.ts
import { describe, it, expect } from 'vitest'
import crosswordAdapter from '@/lib/adapters/crossword.adapter'

describe('Crossword Adapter', () => {
  it('should place first word at (0, 0) horizontally', () => {
    const input = {
      clues: [
        { clue: 'Opposite of good', answer: 'BAD' }
      ]
    }

    const output = crosswordAdapter(input)

    expect(output.words).toHaveLength(1)
    expect(output.words[0].row).toBe(0)
    expect(output.words[0].col).toBe(0)
    expect(output.words[0].orientation).toBe('across')
  })

  it('should find intersection between two words', () => {
    const input = {
      clues: [
        { clue: 'Feline pet', answer: 'CAT' },
        { clue: 'Winged creature', answer: 'BAT' }
      ]
    }

    const output = crosswordAdapter(input)

    // CAT at (0,0) across
    // BAT should intersect at 'A' -> (1, -1) down
    expect(output.words).toHaveLength(2)
  })

  it('should skip clues with no intersection', () => {
    const input = {
      clues: [
        { clue: 'First', answer: 'AAA' },
        { clue: 'Second', answer: 'BBB' }  // No common letters
      ]
    }

    const output = crosswordAdapter(input)

    // Only first word should be placed
    expect(output.words).toHaveLength(1)
  })
})
```

---

## Output Artifacts (REQUIRED)

1. **Adapter Code:** `/home/kasm-user/workspace/dspy/eduport-poc/lib/adapters/crossword.adapter.ts`
2. **Unit Tests:** `/home/kasm-user/workspace/dspy/eduport-poc/__tests__/adapters/crossword.test.ts`
3. **Summary:** `/home/kasm-user/.gemini/antigravity/brain/f3b200e3-a5e4-4679-b285-af2cfcd2e4cc/agent-outputs/BE-003-crossword-summary.md`

**Summary Template:**
```markdown
# BE-003: Crossword Adapter - Summary

## Completed
- ✅ Created adapter at /lib/adapters/crossword.adapter.ts
- ✅ Implemented simple grid layout algorithm
- ✅ Added intersection finding logic
- ✅ Created 15 unit tests

## Algorithm Performance
- Successfully places: X/10 clues on average
- Skipped clues: Y/10 on average
- Edge cases handled: [list]

## Testing
```bash
npm test -- __tests__/adapters/crossword.test.ts
# Result: 15/15 tests passing
```

## Issues/Notes
- [If too complex, recommend descoping to Week 3]
- [Any algorithm limitations]

## Next Steps
- Manual Moodle test (upload .h5p and verify rendering)
```

---

## Verification

```bash
cd /home/kasm-user/workspace/dspy/eduport-poc
npm test -- __tests__/adapters/crossword.test.ts
# Expected: 15/15 tests passing
```

**Optional (if time permits):**
```bash
# Manual Moodle test
docker run -p 8080:80 moodlehq/moodle-php-apache:4.3
# 1. Login to Moodle at localhost:8080
# 2. Upload generated .h5p file
# 3. Verify grid renders without JavaScript errors
```

---

## Dependencies

- None (standalone adapter)

---

## Risk Assessment

**Complexity:** HIGH ⚠️  
**Fallback:** If grid layout proves too complex or time-consuming, escalate to orchestrator to descope to Week 3.

**Alternative Approach:** Use external crossword generation library (e.g., `crossword-layout-generator`)

---

## Estimated Time

**3-5 hours** (complex algorithm)

---

## Deadline

**Jan 14, 6:00 PM** (or escalate if blocked by 4:00 PM)
