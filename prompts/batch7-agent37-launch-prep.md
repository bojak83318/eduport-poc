# Agent 37: Product Manager - Launch Preparation

**Agent Role:** @eduport/product-manager  
**Task ID:** PM-001  
**Batch:** 7  
**Priority:** CRITICAL 🔴  
**Deadline:** Jan 15, 12:00 AM

---

## Context

EduPort is ready for launch! Prepare all marketing materials for ProductHunt, Hacker News, Reddit, and email campaigns.

---

## Task

Create all launch materials and document the launch checklist.

---

## Deliverables

### 1. ProductHunt Listing

**File:** `/docs/launch/producthunt.md`

```markdown
# ProductHunt Listing

## Tagline
Convert Wordwall to H5P in seconds. Own your content.

## Description
EduPort is a free tool that converts Wordwall activities into H5P format - 
the open standard for interactive content. Teachers can finally move their 
quizzes, flashcards, and games off proprietary platforms and into their LMS.

**Why EduPort?**
- 🚀 Convert in under 30 seconds
- 📚 Works with Moodle, Canvas, Blackboard
- 🔓 Open H5P format - no vendor lock-in
- 🎓 100% free for educators

## Topics
- Education
- E-Learning  
- Open Source
- Productivity

## Gallery Images
1. Homepage screenshot
2. Conversion in progress
3. H5P file in Moodle
4. Before/After comparison

## Launch Date
February 4, 2026 - 12:01 AM PST
```

### 2. Hacker News Post

**File:** `/docs/launch/hackernews.md`

```markdown
# Hacker News Post

## Title (80 chars max)
Show HN: EduPort – Free Wordwall to H5P converter for teachers

## Post Body
Hi HN,

I built EduPort to help teachers break free from proprietary educational platforms.

The problem: Millions of teachers use Wordwall to create interactive quizzes and games. But the content is locked in - you can't export it, can't customize it, can't use it offline.

The solution: EduPort converts Wordwall activities to H5P, the open standard supported by Moodle, Canvas, and most LMS platforms. Paste a URL, click convert, download your file.

Technical details:
- Built with Next.js 14, Supabase, deployed on Vercel
- 12 template adapters (Quiz, Flashcard, Crossword, etc.)
- Full TypeScript with Zod validation
- Open source: github.com/eduport/eduport-poc

Try it free at eduport.app

Looking for feedback on:
1. Template coverage - which Wordwall templates should we add next?
2. LMS compatibility - which platforms should we test more?
3. API design - any suggestions for the bulk conversion API?

Thanks!
```

### 3. Reddit Posts

**File:** `/docs/launch/reddit.md`

```markdown
# Reddit Posts

## r/OpenSource
**Title:** [FOSS] EduPort: Convert Wordwall activities to open H5P format

Sharing a project I built for teachers frustrated with platform lock-in.
EduPort converts interactive quizzes from Wordwall (a popular edu-tech platform) 
to H5P format that works in any LMS.

GitHub: [link]
Live demo: eduport.app
License: MIT

---

## r/Education
**Title:** Free tool to convert your Wordwall quizzes to Moodle/Canvas

Teachers! Know how frustrating it is when you create content on one 
platform and can't use it anywhere else?

I built EduPort - paste your Wordwall URL, get an H5P file that works 
in Moodle, Canvas, Blackboard, or any H5P-compatible LMS.

Free at eduport.app

---

## r/Moodle
**Title:** Convert Wordwall activities to H5P for Moodle

Built a tool specifically for migrating Wordwall content to Moodle H5P.
Supports Quiz, Flashcard, Crossword, and 9 other templates.

Free: eduport.app

---

## r/Teachers
**Title:** Finally! A way to convert Wordwall games to your LMS

Sharing a free tool I created:
1. Copy your Wordwall URL
2. Paste into eduport.app
3. Download H5P file
4. Upload to Moodle/Canvas

No more redoing your quizzes! Try it: eduport.app
```

### 4. Email Campaign

**File:** `/docs/launch/email-campaign.md`

```markdown
# Email Campaign

## Subject Line A/B Test
A: "Convert Wordwall to H5P - Free Tool for Teachers"
B: "Break free from Wordwall: Open-source converter launched"

## Email Body
Dear [Name],

We're excited to announce EduPort - a free tool that converts 
Wordwall activities to H5P format.

**What is it?**
EduPort lets you take your Wordwall quizzes, flashcards, and games 
and convert them to H5P - the open standard that works in Moodle, 
Canvas, Blackboard, and more.

**Why it matters:**
- Keep your content when you change LMS platforms
- Customize H5P activities further
- Work offline with H5P files
- Own your educational content

**Try it now:** [Button: Convert Free]

Feedback welcome at support@eduport.app

Best,
The EduPort Team

---
[Unsubscribe]
```

### 5. Launch Checklist

**File:** `/docs/launch/checklist.md`

```markdown
# EduPort Launch Checklist

## Pre-Launch (Feb 3)
- [ ] All adapters tested (12/12)
- [ ] Integration tests passing (≥92%)
- [ ] Legal pages live (/legal/terms, /privacy, /dmca)
- [ ] API docs accessible (/docs/api)
- [ ] User guide complete (/GUIDE.md)
- [ ] SSL certificate valid
- [ ] Error monitoring (Sentry) active
- [ ] Analytics (Vercel) active

## Launch Day (Feb 4)
- [ ] ProductHunt: Publish at 12:01 AM PST
- [ ] Hacker News: Post at 8:00 AM PST
- [ ] Reddit: Post to 4 subreddits (stagger by 1 hour)
- [ ] Email: Send to 5,000 subscribers at 6:00 AM PST
- [ ] Twitter: Announce
- [ ] Monitor Sentry for errors
- [ ] Team on standby for support

## Post-Launch (Feb 4-5)
- [ ] Respond to ProductHunt comments
- [ ] Respond to HN comments
- [ ] Track signups (target: 400+ in 48h)
- [ ] Document user feedback
- [ ] Hot-fix any critical bugs
```

---

## Acceptance Criteria

1. ✅ ProductHunt listing draft at `/docs/launch/producthunt.md`
2. ✅ Hacker News post draft at `/docs/launch/hackernews.md`
3. ✅ Reddit posts (4) at `/docs/launch/reddit.md`
4. ✅ Email campaign draft at `/docs/launch/email-campaign.md`
5. ✅ Launch checklist at `/docs/launch/checklist.md`

---

## Verification

```bash
ls -la docs/launch/
# Should show: producthunt.md, hackernews.md, reddit.md, email-campaign.md, checklist.md
```

---

## Deadline

**Jan 15, 12:00 AM**
