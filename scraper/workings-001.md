# Walkthrough - Wordwall Scraper Fix

## Problem
The Wordwall scraper failed to find `activityModel` in the HTML because Wordwall changed their frontend architecture. The proposed API fix also failed (404 errors), necessitating a different approach.

## Solution
We discovered that activity data is available as a ZIP package on the Wordwall CDN.
1. **Extract Metadata**: We implemented regex to extract `window.ServerModel` from the page HTML to get `activityGuid`.
2. **Download Package**: We fetch the activity package from `https://user.cdn.wordwall.net/documents/{GUID}`.
3. **Parse XML**: We use `adm-zip` to extract `template.xml` and `cheerio` to parse the question/answer data.

## Verification

### 1. Unit Tests
`tests/unit/scraping/server-model.test.ts` passed, verifying correct extraction of GUID and ID from the new procedural script format.

### 2. End-to-End Verification
Ran `scripts/test-scraper.ts` against `https://wordwall.net/resource/101727466/esa/have-got-has-got-affirmative-negative`.

**Output:**
```
✅ Scrape successful!
Title:  Have got/has got - affirmative, negative
Template: Quiz
Item count: 9
First Item: {
  "question": "He ................... a dog.",
  "options": [ "have got", "has got", "haven't got" ],
  "answer": "has got",
  "correctAnswer": "has got"
}
```

## Changes
- **`lib/scraping/patterns.ts`**: Added `extractServerModel`.
- **`lib/scraping/wordwall-scraper.ts`**: Implemented `fetchActivityPackage` (ZIP/XML flow) replacing the legacy logic as a fallback.
- **Dependencies**: Added `adm-zip` (already present) and `cheerio` (already present) usage.
