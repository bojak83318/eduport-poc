# EduPort User Guide

Convert your Wordwall activities to H5P format in seconds.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Converting Activities](#converting-activities)
3. [Uploading to Moodle](#uploading-to-moodle)
4. [Uploading to Canvas](#uploading-to-canvas)
5. [Bulk Conversions](#bulk-conversions)
6. [FAQ](#faq)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Step 1: Sign In
1. Go to [eduport.app](https://eduport.app)
2. Click "Sign in with Google" or "Sign in with GitHub"
3. Authorize EduPort to access your account

### Step 2: Find Your Wordwall Activity
1. Go to [wordwall.net](https://wordwall.net)
2. Open the activity you want to convert
3. Copy the URL from your browser (e.g., `https://wordwall.net/resource/12345678`)

### Step 3: Convert
1. Paste the URL into EduPort
2. Check "I own/have permission to use this content"
3. Click "Convert"
4. Download your .h5p file

---

## Converting Activities

### Supported Templates
EduPort supports these Wordwall templates:

| Template | H5P Output |
|----------|------------|
| Match Up | Memory Game |
| Quiz | Question Set |
| Flashcards | Flashcards |
| Group Sort | Drag Text |
| Missing Word | Fill in the Blanks |
| Crossword | Crossword |
| Wordsearch | Word Search |
| Anagram | Drag Words |
| Rank Order | Drag Text |
| Unjumble | Drag Text |
| Random Wheel | Drag Text |
| True/False | Question Set |

### Not Supported (Yet)
- Arcade games (Airplane, Whack-a-mole)
- Maze Chase
- Open the Box
- Random Cards

---

## Uploading to Moodle

### Step 1: Enable H5P Plugin
1. Go to Site Administration → Plugins → Activity Modules
2. Enable "H5P"

### Step 2: Add H5P Activity
1. Turn editing on in your course
2. Click "Add an activity or resource"
3. Select "H5P"
4. Upload your .h5p file
5. Save and return to course

### Step 3: Test the Activity
1. Click the activity as a student
2. Complete the quiz/game
3. Check the gradebook for scores

---

## Uploading to Canvas

### Step 1: Access H5P.com Content Bank
1. Go to Canvas → H5P settings
2. Connect to H5P.com (free account)

### Step 2: Upload H5P File
1. Go to H5P.com
2. Click "Create new content" → "Upload"
3. Select your .h5p file
4. Click "Use"

### Step 3: Embed in Canvas
1. Copy the embed code
2. Edit your Canvas page
3. Switch to HTML view
4. Paste the embed code

---

## Bulk Conversions

Available for Pro users:

1. Get your API key from Settings → API Keys
2. Use the Bulk API:

```bash
curl -X POST https://eduport.app/api/bulk \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://wordwall.net/resource/111",
      "https://wordwall.net/resource/222",
      "https://wordwall.net/resource/333"
    ]
  }'
```

3. Poll for results:

```bash
curl "https://eduport.app/api/bulk?jobId=YOUR_JOB_ID" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## FAQ

### Q: Is EduPort free?
A: Yes! Free users get 5 conversions per month. Pro users get unlimited conversions.

### Q: Do I need a Wordwall account?
A: No. As long as the activity is public, you can convert it.

### Q: Can I convert my own private Wordwall activities?
A: Currently, only public activities can be converted. Make your activity public temporarily, convert it, then make it private again.

### Q: Why does my crossword look different?
A: EduPort generates a new grid layout. The clues and answers are the same, but positions may differ.

### Q: Can I edit the H5P after conversion?
A: Yes! Upload to H5P.com or Lumi Education to edit.

### Q: How long are downloads available?
A: Download links expire after 24 hours. Re-convert if needed.

### Q: Is my content private?
A: We don't store your H5P files. Downloads are generated on-demand and deleted after 24 hours.

### Q: What about copyright?
A: You must own or have permission to convert the content. Don't convert others' copyrighted materials.

### Q: Can I use EduPort for commercial purposes?
A: Yes, if you have commercial rights to the original content.

### Q: How do I get help?
A: Email support@eduport.app or create an issue on GitHub.

---

## Troubleshooting

### "Template not supported"
The Wordwall template (e.g., Airplane) isn't currently supported. See [Supported Templates](#supported-templates).

### "Rate limit exceeded"
Free users: Wait 1 minute or upgrade to Pro.
Try again later if you've exceeded monthly quota.

### "Failed to fetch activity"
- Check the URL is correct
- Ensure the activity is public
- Try refreshing the Wordwall page

### "H5P validation failed"
The generated H5P couldn't be validated. Please report this to support@eduport.app with the Wordwall URL.

### Moodle: "Invalid H5P file"
1. Check your Moodle H5P plugin is up to date
2. Try uploading to H5P.com first to validate

### Canvas: "Content not loading"
1. Check your browser's ad blocker
2. Ensure the H5P.com embed is allowed in Canvas

---

## Get Help

- **Email:** support@eduport.app
- **GitHub:** github.com/eduport/eduport-poc/issues
- **Twitter:** @EduPortApp

---

Made with ❤️ for teachers everywhere.
