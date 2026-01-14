Orchestrator Plan A: Week 2-4 Implementation (Start Immediately)
Plan Type: Implementation-First Approach
Timeline: January 14 - February 3, 2026 (3 weeks)
Orchestrator: Product Manager / Engineering Director
Agents: @eduport/backend-engineer, @eduport/frontend-engineer, @eduport/qa-engineer, @eduport/devops-engineer, @eduport/security-engineer

Executive Summary
This orchestrator plan follows Option A: Start Week 2 Implementation by immediately delegating tasks to specialized agents. The approach is to work in parallel across all workstreams (backend, frontend, QA, DevOps, security) with daily sync checkpoints.

Key Principle: "Build, Test, Deploy in Parallel" - No waterfall dependencies.

Agent Roster & Responsibilities
Agent	Primary Owner	Backup	Workstreams
@eduport/backend-engineer	H5P Adapters, Auth, Bulk API	-	Week 2-3: Core features
@eduport/frontend-engineer	UI, Dashboard, Auth Flow	-	Week 2-4: User experience
@eduport/qa-engineer	Test Corpus, Integration Tests, Load Tests	-	Week 2-4: Quality assurance
@eduport/devops-engineer	Infrastructure, Monitoring, CI/CD	-	Week 2-4: Production readiness
@eduport/security-engineer	Rate Limiting, CSRF, Input Validation	-	Week 4: Hardening
Week 2: Template Expansion & Authentication (Jan 14-20)
Day 1-2 (Jan 14-15): Kickoff & Foundation
Task 1.1: Backend - Remaining H5P Adapters (Priority 1)
Agent: @eduport/backend-engineer
Story File: /eduport/stories/week2/BE-001-group-sort-adapter.story.md

Dispatch Prompt:

As backend-engineer, implement the Group Sort → H5P.DragText 1.10 adapter.
**Context:**
- Wordwall Group Sort format: `{ groups: [{ id, label, items[] }] }`
- H5P.DragText syntax: `*Group*: :item1: :item2:` (dropzones)
**Acceptance Criteria:**
1. Adapter file created at `/lib/adapters/group-sort.adapter.ts`
2. Schema mapping handles 2-5 groups correctly
3. Edge cases: empty groups, duplicate items, special chars (`, ", <, >`)
4. Unit tests: 50 scenarios in `/__tests__/adapters/group-sort.test.ts`
5. Success: `npm test -- group-sort.test.ts` passes 100%
**Golden Example:** See `/eduport/golden-examples/backend/adapter-pattern.example.md`
**Verification:**
```bash
cd /home/kasm-user/workspace/dspy/eduport-poc
npm test -- __tests__/adapters/group-sort.test.ts
# Expected: 50/50 tests passing
Deliverable: Pull request with adapter + tests Deadline: Jan 15, 5:00 PM

**Dependencies:** None (can start immediately)
---
#### Task 1.2: Backend - Missing Word Adapter (Priority 1)
**Agent:** @eduport/backend-engineer  
**Story File:** `/eduport/stories/week2/BE-002-missing-word-adapter.story.md`
**Dispatch Prompt:**
```markdown
As backend-engineer, implement Missing Word (Cloze) → H5P.ClozeQuestion adapter.
**Blank Detection Algorithm:**
```typescript
function detectBlanks(sentence: string, answers: string[]): string {
  return sentence.replace(/___/g, (match, offset) => {
    const answerIndex = /* compute from offset */
    return `*${answers[answerIndex]}*`
  })
}
Acceptance Criteria:

Adapter handles multiple blanks per sentence
Unicode support (Arabic, Chinese blanks)
Special characters in answers (e.g., "Ca$h", "C++")
Unit tests: 30 scenarios
Success: npm test -- missing-word.test.ts passes 100%
Deliverable: Pull request Deadline: Jan 16, 5:00 PM

---
#### Task 1.3: Backend - Crossword Adapter (Priority 2)
**Agent:** @eduport/backend-engineer  
**Story File:** `/eduport/stories/week2/BE-003-crossword-adapter.story.md`
**Dispatch Prompt:**
```markdown
As backend-engineer, implement Crossword → H5P.Crossword 0.4 adapter.
**Challenge:** Wordwall provides clues + answers but NOT grid positions. We must compute layout.
**Simple Algorithm (MVP):**
1. Sort clues by answer length (longest first)
2. Place first clue at (0, 0) horizontally
3. For each subsequent clue, find intersection with existing clues
4. If no intersection, skip clue (log warning)
**Acceptance Criteria:**
1. Grid layout algorithm handles 5-10 clues
2. Clues with no intersections gracefully skipped (not errors)
3. Unit tests: 15 scenarios
4. Rendering validation: Upload sample .h5p to Moodle 4.3 Docker
5. Success: Grid renders without JavaScript errors
**Deliverable:** Pull request + Moodle screenshot
**Deadline:** Jan 17, 5:00 PM
Risk: Complex algorithm. Fallback: Descope to Week 3 if blocked.

Task 1.4: Backend - Supabase Auth Integration (Priority 1)
Agent: @eduport/backend-engineer
Story File: /eduport/stories/week2/BE-004-supabase-auth.story.md

Dispatch Prompt:

As backend-engineer, integrate Supabase Auth with Google + GitHub OAuth.
**Steps:**
1. Create `/lib/supabase/auth.ts` with Supabase client setup
2. Configure OAuth providers in Supabase Dashboard:
   - Google: Client ID/Secret from Google Cloud Console
   - GitHub: Client ID/Secret from GitHub Settings
   - Callback URL: `https://eduport.app/auth/callback`
3. Implement OAuth sign-in functions: `signInWithGoogle()`, `signInWithGitHub()`
4. Create callback route: `/app/auth/callback/route.ts`
5. Test: Click "Sign in with Google" → redirects to dashboard
**Acceptance Criteria:**
1. OAuth flow completes without errors
2. User session persists across page refreshes
3. `/dashboard` requires authentication (middleware check)
4. Manual test: Sign in → verify session in browser DevTools
**Deliverable:** Pull request + demo video (Loom)
**Deadline:** Jan 16, 8:00 PM
Task 1.5: Frontend - OAuth Login UI (Priority 1)
Agent: @eduport/frontend-engineer
Story File: /eduport/stories/week2/FE-001-login-page.story.md

Dispatch Prompt:

As frontend-engineer, build the OAuth login page.
**Route:** `/login`
**UI Mockup:**
┌─────────────────────────────────────┐ │ EduPort Login │ ├─────────────────────────────────────┤ │ │ │ [Sign in with Google] [🔵 G] │ │ [Sign in with GitHub] [⚫ GH] │ │ │ │ No password required. │ └─────────────────────────────────────┘

**Acceptance Criteria:**
1. Page created at `/app/login/page.tsx`
2. Buttons trigger `signInWithGoogle()` / `signInWithGitHub()`
3. Responsive design (mobile-friendly)
4. Success: Click button → OAuth redirect works
**Deliverable:** Pull request + screenshot
**Deadline:** Jan 16, 5:00 PM
Dependency: Task 1.4 (requires signInWithGoogle() function)

Task 1.6: Frontend - User Profile Page (Priority 2)
Agent: @eduport/frontend-engineer
Story File: /eduport/stories/week2/FE-002-profile-page.story.md

Dispatch Prompt:

As frontend-engineer, build the user profile page.
**Route:** `/profile`
**Features:**
- Display user email, OAuth provider
- Show monthly conversion count / quota (5 free, unlimited pro)
- "Upgrade to Pro" button if quota exceeded
**Acceptance Criteria:**
1. Page created at `/app/profile/page.tsx`
2. Fetches user data from `supabase.auth.getUser()`
3. Fetches conversion stats from `conversions` table
4. Success: Manual test shows correct email + quota
**Deliverable:** Pull request
**Deadline:** Jan 17, 5:00 PM
Task 1.7: QA - Test Corpus Creation (Priority 1)
Agent: @eduport/qa-engineer
Story File: /eduport/stories/week2/QA-001-test-corpus.story.md

Dispatch Prompt:

As qa-engineer, create the 50-URL test corpus for integration testing.
**Requirements:**
- 10 MatchUp URLs (diverse: images, text-only, mixed)
- 10 Quiz URLs (multiple choice, true/false, fill-in-blank)
- 10 Flashcard URLs
- 10 GroupSort URLs (2-5 groups each)
- 10 Mixed (edge cases: Unicode, special chars, large images >5MB)
**Output:** JSON file at `/tests/corpus/urls.json`
**Format:**
```json
{
  "matchup": ["https://wordwall.net/resource/12345678", ...],
  "quiz": [...],
  ...
}
Acceptance Criteria:

All 50 URLs are valid Wordwall activity links
Edge cases documented in /tests/corpus/EDGE_CASES.md
URLs span different templates, languages, content types
Deliverable: Pull request with urls.json + documentation Deadline: Jan 15, 8:00 PM

**Dependency:** None (can start immediately)
---
#### Task 1.8: QA - Integration Test Runner (Priority 1)
**Agent:** @eduport/qa-engineer  
**Story File:** `/eduport/stories/week2/QA-002-integration-tests.story.md`
**Dispatch Prompt:**
```markdown
As qa-engineer, create integration test runner for test corpus.
**File:** `/tests/integration/corpus.test.ts`
**Logic:**
```typescript
import corpus from './corpus/urls.json'
describe('Test Corpus Integration', () => {
  const allUrls = [...corpus.matchup, ...corpus.quiz, ...]
  
  it('should achieve ≥85% success rate', async () => {
    const results = await Promise.allSettled(
      allUrls.map(url => convertActivity(url))
    )
    const successRate = results.filter(r => r.status === 'fulfilled').length / allUrls.length
    expect(successRate).toBeGreaterThanOrEqual(0.85)
  })
})
Acceptance Criteria:

Test runs all 50 URLs from corpus
Calculates success rate (%)
Logs failures with URL + error message
Success: npm run test:integration outputs "42/50 passed (84%)"
Deliverable: Pull request Deadline: Jan 17, 5:00 PM

**Dependency:** Task 1.7 (requires `urls.json`)
---
#### Task 1.9: DevOps - Supabase Database Schema (Priority 1)
**Agent:** @eduport/devops-engineer  
**Story File:** `/eduport/stories/week2/DEVOPS-001-database-schema.story.md`
**Dispatch Prompt:**
```markdown
As devops-engineer, create Supabase database schema for conversions + users.
**Tables:**
1. `conversions` (id, user_id, wordwall_url, status, download_url, created_at)
2. `job_queue` (id, user_id, urls[], status, webhook_url, results, created_at)
3. `api_keys` (id, user_id, key, created_at)
**Migration:** `/supabase/migrations/20260114_initial_schema.sql`
**Acceptance Criteria:**
1. Migration runs successfully: `supabase db push`
2. Tables created in Supabase dashboard
3. Indexes added for performance: `user_id`, `created_at`, `status`
4. Success: Query test returns empty result (table exists)
**Verification:**
```bash
supabase db push
supabase db query "SELECT * FROM conversions LIMIT 1"
# Expected: 0 rows (table exists but empty)
Deliverable: Pull request with migration SQL Deadline: Jan 15, 5:00 PM

---
### Day 3-4 (Jan 16-17): Integration & Testing
#### Task 2.1: QA - H5P LMS Validation (Priority 1)
**Agent:** @eduport/qa-engineer  
**Story File:** `/eduport/stories/week2/QA-003-lms-validation.story.md`
**Dispatch Prompt:**
```markdown
As qa-engineer, validate H5P packages render correctly in Moodle 4.3 + Canvas.
**Setup:**
1. Run Moodle locally: `docker run -p 8080:80 moodlehq/moodle-php-apache:4.3`
2. Login as admin (credentials in Docker logs)
3. Create test course
4. Upload 5 sample .h5p files (MatchUp, Quiz, Flashcard, GroupSort, Crossword)
5. Verify each activity renders without errors
6. Submit test answers → verify grading works
**Repeat for Canvas:**
1. Sign up for Canvas free trial: https://canvas.instructure.com
2. Upload same 5 .h5p files
3. Verify rendering + grading
**Acceptance Criteria:**
1. 100% of uploaded activities render correctly (no JS errors)
2. Students can submit answers
3. Grades appear in gradebook
4. Screenshots captured for documentation
**Deliverable:** Pull request with validation report + screenshots
**Deadline:** Jan 17, 8:00 PM
Dependency: Task 1.1, 1.2, 1.3 (requires adapters to generate .h5p files)

Day 5 (Jan 18-20): Gate Review Preparation
Task 3.1: QA - Run Integration Tests (Priority 1)
Agent: @eduport/qa-engineer
Story File: /eduport/stories/week2/QA-004-gate-review.story.md

Dispatch Prompt:

As qa-engineer, run integration tests and prepare gate review report.
**Steps:**
1. Run integration test: `npm run test:integration`
2. Calculate success rate
3. Document failures (URL, error message, root cause)
4. Create report: `/docs/gate-review-jan20.md`
**Report Format:**
```markdown
# Gate Review Report - January 20, 2026
## Success Rate: 42/50 (84%)
## Passing Tests:
- MatchUp: 9/10 (90%)
- Quiz: 8/10 (80%)
- Flashcard: 10/10 (100%)
- GroupSort: 7/10 (70%)
- Mixed: 8/10 (80%)
## Failing Tests:
1. URL: https://wordwall.net/resource/XXX
   Error: "Unsupported template: Arcade Airplane"
   Root Cause: Out of scope for MVP
Acceptance Criteria:

Report shows ≥85% success rate (PASS) or <85% (FAIL)
Failures categorized by root cause
Recommendations for Week 3 improvements
Deliverable: Pull request with gate review report Deadline: Jan 20, 12:00 PM (noon)

**Dependency:** Task 1.8 (requires integration test runner)
---
#### Task 3.2: Backend - Performance Measurement (Priority 2)
**Agent:** @eduport/backend-engineer  
**Story File:** `/eduport/stories/week2/BE-005-performance.story.md`
**Dispatch Prompt:**
```markdown
As backend-engineer, measure P95 latency for conversions.
**Method:**
1. Add timing instrumentation to `/lib/convert.ts`:
   ```typescript
   const startTime = Date.now()
   // ... conversion logic
   const latency = Date.now() - startTime
   console.log(`Conversion latency: ${latency}ms`)
Run 20 test conversions
Calculate P95 (95th percentile)
Acceptance Criteria:

P95 latency documented in gate review report
Target: <8s (acceptable), <5s (ideal)
If >8s, identify bottleneck (network, parsing, H5P packaging)
Deliverable: Performance data added to gate review report Deadline: Jan 20, 12:00 PM

---
### Gate Review (Jan 20, 2:00 PM)
**Facilitator:** Product Manager / Engineering Director
**Agenda:**
1. QA presents integration test results (10 min)
2. Backend presents performance data (5 min)
3. Legal confirms DMCA process approval (5 min)
4. Go/No-Go decision (10 min)
**Pass Criteria:**
1. ✅ Success rate ≥85%
2. ✅ H5P validates in Moodle + Canvas (100% render correctly)
3. ✅ Legal sign-off received
4. ✅ P95 latency <8s
**If PASS:** Proceed to Week 3  
**If FAIL:** Extend Week 2 by 3 days, address gaps
---
## Week 3: Feature Completion (Jan 21-27)
### Day 1-2 (Jan 21-22): Additional Templates
#### Task 4.1: Backend - 6 Additional Adapters (Priority 1)
**Agent:** @eduport/backend-engineer  
**Story Files:**
- `/eduport/stories/week3/BE-006-wordsearch-adapter.story.md`
- `/eduport/stories/week3/BE-007-anagram-adapter.story.md`
- `/eduport/stories/week3/BE-008-random-wheel-adapter.story.md`
- `/eduport/stories/week3/BE-009-rank-order-adapter.story.md`
- `/eduport/stories/week3/BE-010-unjumble-adapter.story.md`
- `/eduport/stories/week3/BE-011-true-false-adapter.story.md`
**Dispatch Prompt:**
```markdown
As backend-engineer, implement the remaining 6 H5P adapters.
**Templates:**
1. Wordsearch → H5P.WordSearch 1.4
2. Anagram → H5P.DragWords 1.11
3. Random Wheel → H5P.DragText (custom)
4. Rank Order → H5P.DragText 1.10
5. Unjumble → H5P.Unjumble 0.1
6. True/False → H5P.QuestionSet 1.20
**Acceptance Criteria (per adapter):**
1. Adapter file created in `/lib/adapters/`
2. Unit tests (minimum 10 scenarios per adapter)
3. Success: `npm test -- adapters/` passes 100%
**Deliverable:** 6 pull requests (1 per adapter)
**Deadline:** Jan 22, 8:00 PM
Day 3-4 (Jan 23-24): Bulk Processing
Task 5.1: Backend - Bulk API Endpoint (Priority 1)
Agent: @eduport/backend-engineer
Story File: /eduport/stories/week3/BE-012-bulk-api.story.md

Dispatch Prompt:

As backend-engineer, implement the POST /api/bulk endpoint.
**Functionality:**
1. Accept array of Wordwall URLs
2. Validate tier limits (50 URLs for Pro, 1000 for Enterprise)
3. Create job in `job_queue` table
4. Return job ID + status
**Acceptance Criteria:**
1. Endpoint created at `/app/api/bulk/route.ts`
2. Rate limiting enforced (tier-based)
3. Manual test: `curl -X POST https://eduport.app/api/bulk -d '{"urls":[...]}'` returns job ID
**Deliverable:** Pull request
**Deadline:** Jan 24, 5:00 PM
Task 5.2: Backend - Background Worker (Priority 1)
Agent: @eduport/backend-engineer
Story File: /eduport/stories/week3/BE-013-bulk-worker.story.md

Dispatch Prompt:

As backend-engineer, implement background worker for bulk processing.
**File:** `/lib/workers/bulk-processor.ts`
**Logic:**
1. Poll `job_queue` table every 5 seconds
2. Process jobs with status='queued'
3. For each job, convert all URLs in parallel
4. Update job status to 'completed' + store results
5. Fire webhook if provided
**Deployment:** Run as Vercel Cron Job (1 invocation/minute)
**Acceptance Criteria:**
1. Worker processes jobs successfully
2. Results stored in `job_queue.results` (JSONB column)
3. Webhook fires with job status
4. Manual test: Create job → verify completion within 5 minutes
**Deliverable:** Pull request + cron job configuration
**Deadline:** Jan 24, 8:00 PM
Day 5-7 (Jan 25-27): Dashboard & Monitoring
Task 6.1: Frontend - Dashboard Page (Priority 1)
Agent: @eduport/frontend-engineer
Story File: /eduport/stories/week3/FE-003-dashboard.story.md

Dispatch Prompt:

As frontend-engineer, build the user dashboard.
**Route:** `/dashboard`
**Features:**
- Conversion history table (URL, status, date, download link)
- Pagination (10 per page)
- Filter by status (success, failed)
**Acceptance Criteria:**
1. Page created at `/app/dashboard/page.tsx`
2. Fetches data from `conversions` table
3. Manual test: View dashboard shows recent conversions
**Deliverable:** Pull request
**Deadline:** Jan 26, 5:00 PM
Task 6.2: Frontend - API Key Management (Priority 2)
Agent: @eduport/frontend-engineer
Story File: /eduport/stories/week3/FE-004-api-keys.story.md

Dispatch Prompt:

As frontend-engineer, build API key management page (Pro tier only).
**Route:** `/settings/api-keys`
**Features:**
- Generate API key (UUID v4)
- Revoke API key
- Copy to clipboard
**Acceptance Criteria:**
1. Page created at `/app/settings/api-keys/page.tsx`
2. Only accessible to Pro users (tier check)
3. Manual test: Generate key → copy → use in Postman
**Deliverable:** Pull request
**Deadline:** Jan 27, 5:00 PM
Task 6.3: DevOps - Sentry Integration (Priority 1)
Agent: @eduport/devops-engineer
Story File: /eduport/stories/week3/DEVOPS-002-sentry.story.md

Dispatch Prompt:

As devops-engineer, integrate Sentry for error tracking.
**Steps:**
1. Create Sentry project (free tier)
2. Install `@sentry/nextjs`: `npm install --save @sentry/nextjs`
3. Configure in `next.config.js`
4. Add Sentry DSN to `.env.local`
5. Test: Trigger error → verify in Sentry dashboard
**Acceptance Criteria:**
1. Sentry configured in `next.config.js`
2. Errors captured in Sentry dashboard
3. Source maps uploaded for debugging
**Deliverable:** Pull request + Sentry dashboard screenshot
**Deadline:** Jan 26, 8:00 PM
Task 6.4: DevOps - Vercel Analytics (Priority 2)
Agent: @eduport/devops-engineer
Story File: /eduport/stories/week3/DEVOPS-003-analytics.story.md

Dispatch Prompt:

As devops-engineer, enable Vercel Analytics.
**Steps:**
1. Vercel Dashboard → Analytics → Enable
2. Add custom events: `conversion_success`, `conversion_failed`
3. Track events in `/lib/monitoring/analytics.ts`
**Acceptance Criteria:**
1. Web Vitals dashboard shows data
2. Custom events appear in Vercel Analytics
3. Manual test: Complete conversion → verify event in dashboard
**Deliverable:** Pull request
**Deadline:** Jan 27, 5:00 PM
Week 4: Production Hardening & Launch (Jan 28-Feb 3)
Day 1-2 (Jan 28-29): Security Hardening
Task 7.1: Security - Rate Limiting (Priority 1)
Agent: @eduport/security-engineer
Story File: /eduport/stories/week4/SEC-001-rate-limiting.story.md

Dispatch Prompt:

As security-engineer, implement rate limiting with Upstash Redis.
**Tiers:**
- Anonymous: 10 requests/minute/IP
- Free: 5 conversions/month
- Pro: 10 requests/second (unlimited conversions)
**Setup:**
1. Sign up for Upstash Redis (free tier)
2. Install `@upstash/ratelimit`: `npm install --save @upstash/ratelimit`
3. Create `/lib/ratelimit/index.ts` with tier-based limiters
4. Add middleware to `/app/api/convert/route.ts`
**Acceptance Criteria:**
1. Rate limiting enforces tier limits
2. Manual test: Send 11 requests in 1 min → 11th returns 429
3. Error message: "Rate limit exceeded. Upgrade to Pro."
**Deliverable:** Pull request
**Deadline:** Jan 29, 5:00 PM
Task 7.2: Security - CSRF Protection (Priority 1)
Agent: @eduport/security-engineer
Story File: /eduport/stories/week4/SEC-002-csrf.story.md

Dispatch Prompt:

As security-engineer, add CSRF protection to all POST endpoints.
**Implementation:**
1. Add `verifyRequestOrigin()` check to middleware
2. Validate Origin header matches Host header
3. Return 403 if mismatch
**Acceptance Criteria:**
1. CSRF middleware in `/middleware.ts`
2. Manual test: Send POST without Origin header → 403
3. Legitimate requests still work
**Deliverable:** Pull request
**Deadline:** Jan 29, 8:00 PM
Task 7.3: Security - Input Validation (Priority 1)
Agent: @eduport/security-engineer
Story File: /eduport/stories/week4/SEC-003-input-validation.story.md

Dispatch Prompt:

As security-engineer, add Zod input validation to all API endpoints.
**Validation Rules:**
- `wordwallUrl`: Must match `^https://wordwall\.net/resource/\d+$`
- `attestOwnership`: Must be `true` (boolean)
- `urls` (bulk): Array of valid Wordwall URLs
**Acceptance Criteria:**
1. Zod schema in `/lib/validation/schemas.ts`
2. All API endpoints validate input
3. Manual test: Send malformed URL → 400 with Zod error
4. XSS attempts rejected: `<script>alert('XSS')</script>`
**Deliverable:** Pull request
**Deadline:** Jan 30, 5:00 PM
Day 3-4 (Jan 30-31): Performance & Legal
Task 8.1: QA - Load Testing (Priority 1)
Agent: @eduport/qa-engineer
Story File: /eduport/stories/week4/QA-005-load-testing.story.md

Dispatch Prompt:

As qa-engineer, run k6 load tests with 500 concurrent users.
**Test Script:** `/tests/load/single-conversion.k6.js`
**Scenario:**
- 500 virtual users (VUs)
- 5-minute duration
- Each VU: POST /api/convert → wait 1s → repeat
**Thresholds:**
- P95 latency <5s
- Error rate <1%
**Acceptance Criteria:**
1. k6 script created
2. Load test runs successfully: `k6 run tests/load/single-conversion.k6.js`
3. Results documented in `/docs/load-test-results.md`
4. If thresholds fail, identify bottleneck (DB, network, H5P packaging)
**Deliverable:** Pull request with test script + results
**Deadline:** Jan 31, 5:00 PM
Task 8.2: DevOps - Database Optimization (Priority 2)
Agent: @eduport/devops-engineer
Story File: /eduport/stories/week4/DEVOPS-004-db-optimization.story.md

Dispatch Prompt:

As devops-engineer, optimize database queries for performance.
**Actions:**
1. Add indexes: `user_id`, `created_at`, `status`
2. Run EXPLAIN ANALYZE on slow queries
3. Configure connection pooling (Supavisor)
**Acceptance Criteria:**
1. Migration created: `/supabase/migrations/20260130_indexes.sql`
2. Query performance improved ≥50%
3. EXPLAIN ANALYZE output shows index usage
**Deliverable:** Pull request with migration
**Deadline:** Jan 31, 8:00 PM
Task 8.3: Frontend - Legal Pages (Priority 2)
Agent: @eduport/frontend-engineer
Story File: /eduport/stories/week4/FE-005-legal-pages.story.md

Dispatch Prompt:

As frontend-engineer, create legal compliance pages.
**Pages:**
1. `/legal/terms` - Terms of Service
2. `/legal/privacy` - Privacy Policy
3. `/legal/dmca` - DMCA Takedown Form
**Content:**
- ToS: Boilerplate from General Counsel
- Privacy: GDPR + CCPA compliance
- DMCA: Intake form (content URL, claim, contact email)
**Acceptance Criteria:**
1. All 3 pages created
2. DMCA form submits to `/api/dmca` endpoint
3. Manual test: Submit DMCA form → email sent to legal team
**Deliverable:** Pull request
**Deadline:** Feb 1, 5:00 PM
Day 5-7 (Feb 1-3): Documentation & Launch
Task 9.1: Frontend - API Documentation (Priority 1)
Agent: @eduport/frontend-engineer
Story File: /eduport/stories/week4/FE-006-api-docs.story.md

Dispatch Prompt:

As frontend-engineer, create API documentation with Swagger UI.
**File:** `/app/docs/api/page.mdx`
**Content:**
- OpenAPI 3.0 spec
- Endpoints: POST /api/convert, POST /api/bulk
- Code examples: curl, Python, Node.js
**Acceptance Criteria:**
1. Swagger UI renders at `/docs/api`
2. Interactive "Try it out" button works
3. Examples are copy-paste ready
**Deliverable:** Pull request
**Deadline:** Feb 2, 5:00 PM
Task 9.2: QA - User Guide (Priority 2)
Agent: @eduport/qa-engineer
Story File: /eduport/stories/week4/QA-006-user-guide.story.md

Dispatch Prompt:

As qa-engineer, create user guide with FAQ.
**File:** `/GUIDE.md`
**Sections:**
1. Getting Started (5 steps)
2. Uploading to Moodle
3. FAQ (10 common questions)
4. Troubleshooting
**Acceptance Criteria:**
1. Guide written in Markdown
2. Screenshots included for Moodle upload steps
3. FAQ addresses common errors (template not supported, Wordwall rate-limited)
**Deliverable:** Pull request
**Deadline:** Feb 2, 8:00 PM
Task 9.3: QA - Video Tutorial (Priority 2)
Agent: @eduport/qa-engineer (with PM support)
Story File: /eduport/stories/week4/QA-007-video-tutorial.story.md

Dispatch Prompt:

As qa-engineer, record 3-minute Loom tutorial.
**Script:**
1. Go to https://eduport.app
2. Paste Wordwall URL: https://wordwall.net/resource/12345678
3. Click "I own the rights" checkbox
4. Click "Convert"
5. Download .h5p file
6. Upload to Moodle course
7. View embedded quiz in student view
**Acceptance Criteria:**
1. Video uploaded to Loom
2. Embedded on homepage: `<iframe src="..."></iframe>`
3. Quality: 1080p, clear audio, no background noise
**Deliverable:** Loom link + homepage update PR
**Deadline:** Feb 3, 12:00 PM
Task 9.4: Product Manager - Launch Preparation (Priority 1)
Owner: Product Manager (Sarah Chen)
Story File: /eduport/stories/week4/PM-001-launch.story.md

Tasks:

ProductHunt: Create listing (Feb 3, 8:00 PM)

Tagline: "Convert Wordwall to H5P in seconds. Own your content."
Screenshots: Homepage, Moodle upload, dashboard
Demo video: 30-second walkthrough
Schedule launch: Feb 4, 12:01 AM PST
Hacker News: Draft post (Feb 3, 9:00 PM)

Title: "Show HN: EduPort – Free Wordwall to H5P converter"
Post time: Feb 4, 8:00 AM PST
Reddit: Draft posts for 4 subreddits (Feb 3, 9:30 PM)

r/OpenSource, r/Education, r/OnlineTeaching, r/Moodle
Email Campaign: Send via SendGrid (Feb 4, 6:00 AM PST)

Subject A/B test
Segment: EdTech newsletter (5,000 emails)
Deliverable: All launch materials ready by Feb 3, 11:00 PM

Success Metrics
Metric	Week 2 Target	Week 3 Target	Week 4 Target
Adapters Implemented	9/12 (75%)	12/12 (100%)	12/12 (100%)
Test Corpus Success Rate	≥85%	≥90%	≥92%
P95 Latency	<8s	<6s	<5s
Unit Test Coverage	70%	80%	85%
LMS Validation	Moodle only	+ Canvas	+ Blackboard
Launch Signups (48h)	-	-	400+
Handoff Protocols
Daily Standups (9:00 AM)
Format: Async Slack updates

What I completed yesterday
What I'm working on today
Any blockers
Weekly Syncs (Fridays, 3:00 PM)
Agenda:

Demo completed features
Risk review
Next week planning
Escalation Path
Technical blocker: Escalate to Engineering Director within 4 hours
Product decision: Escalate to Product Manager within 2 hours
Security concern: Escalate to Security Engineer + Legal immediately
Risk Mitigation
Risk	Owner	Mitigation
Gate Review Failure (Week 2)	QA Engineer	Daily integration test runs; early warning if success rate drops below 80%
Adapter Complexity (Crossword)	Backend Engineer	Fallback: Descope to Week 3; alternative simple layout algorithm
OAuth Provider Issues	DevOps Engineer	Test OAuth flow in staging before production deployment
Load Test Failure	QA + DevOps	Identify bottleneck early (Day 1 of Week 4); optimize DB/network
Launch Delay	Product Manager	Buffer: Complete all tasks by Feb 3, 6:00 PM (30-hour buffer before launch)
Appendix: Story File Template
All story files follow this format:

---
id: "BE-001-group-sort-adapter"
difficulty: "medium"
tags: ["backend", "h5p", "adapter", "wordwall"]
tech_stack: "TypeScript, H5P-Nodejs-library, Vitest"
---
# User Story
As a backend-engineer, I want to implement the Group Sort → H5P.DragText adapter, so teachers can convert Wordwall Group Sort activities to H5P.
# Context & Constraints
**Wordwall Format:**
```json
{
  "type": "groupSort",
  "groups": [
    { "id": "g1", "label": "Mammals", "items": ["dog", "cat"] }
  ]
}
H5P.DragText Syntax:

*Mammals*: :dog: :cat:
Acceptance Criteria
Adapter file created at /lib/adapters/group-sort.adapter.ts
Schema mapping handles 2-5 groups
Edge cases: empty groups, duplicates, special chars
Unit tests: 50 scenarios pass
Golden Example
See /eduport/golden-examples/backend/adapter-pattern.example.md

Verification
npm test -- __tests__/adapters/group-sort.test.ts
# Expected: 50/50 passing
---
**END OF ORCHESTRATOR PLAN A**
