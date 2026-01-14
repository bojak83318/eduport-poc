# Agent 12: Backend Engineer - Quiz Adapter

**Agent Role:** @eduport/backend-engineer  
**Task ID:** BE-012  
**Batch:** 3  
**Priority:** High  
**Deadline:** Jan 14, 8:00 PM

---

## Context

Quiz template covers 10/50 URLs in test corpus.
Includes MultipleChoice, TrueFalse question types.
Converts to H5P.QuestionSet 1.20.

---

## Task

Create the Quiz → H5P.QuestionSet 1.20 adapter.

**File:** `/lib/adapters/quiz.adapter.ts`

---

## Data Mapping

**Wordwall Quiz Format:**
```json
{
  "template": "Quiz",
  "questions": [
    {
      "type": "multipleChoice",
      "question": "What is the capital of France?",
      "options": ["London", "Paris", "Berlin", "Madrid"],
      "correctIndex": 1
    },
    {
      "type": "trueFalse",
      "question": "The sun rises in the west.",
      "correct": false
    }
  ]
}
```

**H5P.QuestionSet Format:**
```json
{
  "taskDescription": "Answer the following questions",
  "questions": [
    {
      "library": "H5P.MultiChoice 1.16",
      "params": {
        "question": "What is the capital of France?",
        "answers": [
          { "text": "London", "correct": false },
          { "text": "Paris", "correct": true },
          { "text": "Berlin", "correct": false },
          { "text": "Madrid", "correct": false }
        ]
      }
    },
    {
      "library": "H5P.TrueFalse 1.8",
      "params": {
        "question": "The sun rises in the west.",
        "correct": "false"
      }
    }
  ]
}
```

---

## Implementation Guide

```typescript
// lib/adapters/quiz.adapter.ts

interface WordwallQuestion {
  type: 'multipleChoice' | 'trueFalse'
  question: string
  options?: string[]
  correctIndex?: number
  correct?: boolean
}

interface WordwallQuiz {
  questions: WordwallQuestion[]
}

export default function quizAdapter(data: WordwallQuiz) {
  return {
    taskDescription: 'Answer the following questions',
    questions: data.questions.map(q => {
      if (q.type === 'multipleChoice') {
        return {
          library: 'H5P.MultiChoice 1.16',
          params: {
            question: q.question,
            answers: q.options!.map((opt, i) => ({
              text: opt,
              correct: i === q.correctIndex
            }))
          }
        }
      } else {
        return {
          library: 'H5P.TrueFalse 1.8',
          params: {
            question: q.question,
            correct: String(q.correct)
          }
        }
      }
    })
  }
}
```

---

## Acceptance Criteria

1. ✅ Adapter handles multipleChoice questions
2. ✅ Adapter handles trueFalse questions
3. ✅ Mixed question types in single quiz
4. ✅ Unit tests: 25 scenarios
5. ✅ Registered in adapter router

---

## Output Artifacts (REQUIRED)

1. **Code:** `/home/kasm-user/workspace/dspy/eduport-poc/lib/adapters/quiz.adapter.ts`
2. **Tests:** `/home/kasm-user/workspace/dspy/eduport-poc/__tests__/adapters/quiz.test.ts`
3. **Summary:** `/home/kasm-user/.gemini/antigravity/brain/f3b200e3-a5e4-4679-b285-af2cfcd2e4cc/agent-outputs/BE-012-quiz-summary.md`

---

## Verification

```bash
npm test -- __tests__/adapters/quiz.test.ts
# Expected: 25/25 tests passing
```

---

## Deadline

**Jan 14, 8:00 PM**
