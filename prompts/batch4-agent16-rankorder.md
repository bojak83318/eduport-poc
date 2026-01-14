# Agent 16: Backend Engineer - Rank Order Adapter

**Agent Role:** @eduport/backend-engineer  
**Task ID:** BE-016  
**Batch:** 4  
**Priority:** High  
**Deadline:** Jan 14, 9:30 PM

---

## Context

Rank Order has users put items in correct sequence.
Converts to H5P.DragText 1.10 with ordering semantics.

---

## Task

Create the RankOrder → H5P.DragText 1.10 adapter.

**File:** `/lib/adapters/rank-order.adapter.ts`

---

## Data Mapping

**Wordwall RankOrder Format:**
```json
{
  "template": "RankOrder",
  "items": ["First", "Second", "Third", "Fourth"],
  "correctOrder": [0, 1, 2, 3]
}
```

**H5P.DragText Format:**
```json
{
  "taskDescription": "Put the items in the correct order",
  "textField": "*First* *Second* *Third* *Fourth*",
  "behaviour": {
    "enableRetry": true,
    "instantFeedback": false
  }
}
```

---

## Implementation

```typescript
// lib/adapters/rank-order.adapter.ts

interface WordwallRankOrder {
  items: string[]
  correctOrder?: number[]
}

export default function rankOrderAdapter(data: WordwallRankOrder) {
  const items = data.items || []
  
  // H5P.DragText uses *item* for draggable items
  const textField = items.map(item => `*${item}*`).join(' ')
  
  return {
    h5pJson: {
      title: 'Rank Order',
      mainLibrary: 'H5P.DragText',
      preloadedDependencies: [
        { machineName: 'H5P.DragText', majorVersion: 1, minorVersion: 10 }
      ]
    },
    contentJson: {
      taskDescription: 'Put the items in the correct order by dragging them',
      textField: textField,
      behaviour: {
        enableRetry: true,
        enableSolutionsButton: true,
        instantFeedback: false
      }
    }
  }
}
```

---

## Acceptance Criteria

1. ✅ Adapter file created
2. ✅ Preserves correct order from Wordwall data
3. ✅ Registered in convert.ts
4. ✅ Unit tests: 10 scenarios

---

## Output Artifacts

1. **Code:** `/home/kasm-user/workspace/dspy/eduport-poc/lib/adapters/rank-order.adapter.ts`
2. **Tests:** `/home/kasm-user/workspace/dspy/eduport-poc/__tests__/adapters/rank-order.test.ts`
3. **Summary:** `/home/kasm-user/.gemini/antigravity/brain/f3b200e3-a5e4-4679-b285-af2cfcd2e4cc/agent-outputs/BE-016-rankorder-summary.md`

---

## Deadline

**Jan 14, 9:30 PM**
