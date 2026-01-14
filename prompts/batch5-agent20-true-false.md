# Agent 20: Backend Engineer - True/False Adapter

**Agent Role:** @eduport/backend-engineer  
**Task ID:** BE-011  
**Batch:** 5  
**Priority:** High  
**Deadline:** Jan 14, 11:00 PM

---

## Context

True/False activities present statements where users mark each as true or false. We convert to H5P.QuestionSet with each statement as a multiple choice question with 2 options (True/False).

---

## Task

Create the True/False → H5P.QuestionSet 1.20 adapter.

**File:** `/lib/adapters/true-false.adapter.ts`

---

## Data Mapping

**Wordwall True/False Format:**
```json
{
  "template": "True false",
  "statements": [
    { "text": "The sky is blue", "answer": true },
    { "text": "Fish can fly", "answer": false }
  ]
}
```

**H5P.QuestionSet Format:**
```json
{
  "questions": [
    {
      "library": "H5P.MultiChoice 1.16",
      "params": {
        "question": "The sky is blue",
        "answers": [
          { "text": "True", "correct": true },
          { "text": "False", "correct": false }
        ]
      }
    }
  ]
}
```

---

## Implementation

```typescript
// lib/adapters/true-false.adapter.ts

interface TrueFalseData {
  statements: Array<{ text: string; answer: boolean }>
}

export default function trueFalseAdapter(data: TrueFalseData) {
  const statements = data.statements || []
  
  const questions = statements.map((s, index) => ({
    library: 'H5P.MultiChoice 1.16',
    params: {
      question: s.text,
      answers: [
        { text: 'True', correct: s.answer === true },
        { text: 'False', correct: s.answer === false }
      ],
      behaviour: {
        singleAnswer: true,
        enableRetry: true
      }
    }
  }))
  
  return {
    h5pJson: {
      title: 'True or False Quiz',
      mainLibrary: 'H5P.QuestionSet',
      preloadedDependencies: [
        { machineName: 'H5P.QuestionSet', majorVersion: 1, minorVersion: 20 },
        { machineName: 'H5P.MultiChoice', majorVersion: 1, minorVersion: 16 }
      ]
    },
    contentJson: {
      questions,
      progressType: 'dots',
      passPercentage: 50
    }
  }
}
```

---

## Acceptance Criteria

1. ✅ Adapter file created at `/lib/adapters/true-false.adapter.ts`
2. ✅ Converts statements to MultiChoice questions with True/False options
3. ✅ Correct answer marked based on original answer boolean
4. ✅ Registered in `convert.ts` adapter router
5. ✅ Unit tests: 10 scenarios in `/__tests__/adapters/true-false.test.ts`
6. ✅ `npm test -- true-false.test.ts` passes 100%

---

## Output Artifacts

1. **Code:** `/home/kasm-user/workspace/dspy/eduport-poc/lib/adapters/true-false.adapter.ts`
2. **Tests:** `/home/kasm-user/workspace/dspy/eduport-poc/__tests__/adapters/true-false.test.ts`
3. **Summary:** Generate a summary of what was implemented

---

## Verification

```bash
cd /home/kasm-user/workspace/dspy/eduport-poc
npm test -- __tests__/adapters/true-false.test.ts
# Expected: 10/10 passing
```

---

## Deadline

**Jan 14, 11:00 PM**
