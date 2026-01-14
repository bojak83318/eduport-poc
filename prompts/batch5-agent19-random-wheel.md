# Agent 19: Backend Engineer - Random Wheel Adapter

**Agent Role:** @eduport/backend-engineer  
**Task ID:** BE-008  
**Batch:** 5  
**Priority:** High  
**Deadline:** Jan 14, 11:00 PM

---

## Context

Random Wheel is a spinner-style activity. Since H5P doesn't have a native spinner, we convert to H5P.DragText as a list of options that users can interact with.

---

## Task

Create the Random Wheel → H5P.DragText 1.10 adapter.

**File:** `/lib/adapters/random-wheel.adapter.ts`

---

## Data Mapping

**Wordwall Random Wheel Format:**
```json
{
  "template": "Random wheel",
  "segments": [
    { "text": "Option A" },
    { "text": "Option B" },
    { "text": "Option C" }
  ]
}
```

**H5P.DragText Format:**
```json
{
  "taskDescription": "The wheel landed on one of these options:",
  "textField": "*Option A*\n*Option B*\n*Option C*"
}
```

---

## Implementation

```typescript
// lib/adapters/random-wheel.adapter.ts

interface RandomWheelData {
  segments: Array<{ text: string }>
}

export default function randomWheelAdapter(data: RandomWheelData) {
  const segments = data.segments || []
  const textField = segments.map(s => `*${s.text}*`).join('\n')
  
  return {
    h5pJson: {
      title: 'Random Wheel Options',
      mainLibrary: 'H5P.DragText',
      preloadedDependencies: [
        { machineName: 'H5P.DragText', majorVersion: 1, minorVersion: 10 }
      ]
    },
    contentJson: {
      taskDescription: 'The wheel includes these options:',
      textField
    }
  }
}
```

---

## Acceptance Criteria

1. ✅ Adapter file created at `/lib/adapters/random-wheel.adapter.ts`
2. ✅ Handles segment extraction correctly
3. ✅ Registered in `convert.ts` adapter router
4. ✅ Unit tests: 10 scenarios in `/__tests__/adapters/random-wheel.test.ts`
5. ✅ `npm test -- random-wheel.test.ts` passes 100%

---

## Output Artifacts

1. **Code:** `/home/kasm-user/workspace/dspy/eduport-poc/lib/adapters/random-wheel.adapter.ts`
2. **Tests:** `/home/kasm-user/workspace/dspy/eduport-poc/__tests__/adapters/random-wheel.test.ts`
3. **Summary:** Generate a summary of what was implemented

---

## Verification

```bash
cd /home/kasm-user/workspace/dspy/eduport-poc
npm test -- __tests__/adapters/random-wheel.test.ts
# Expected: 10/10 passing
```

---

## Deadline

**Jan 14, 11:00 PM**
