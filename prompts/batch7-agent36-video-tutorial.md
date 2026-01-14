# Agent 36: QA Engineer - Video Tutorial

**Agent Role:** @eduport/qa-engineer  
**Task ID:** QA-007  
**Batch:** 7  
**Priority:** Medium  
**Deadline:** Jan 14, 11:30 PM

---

## Context

A video tutorial helps new users understand the conversion process. Create a 3-minute walkthrough using Loom or screen recording.

---

## Task

Create a 3-minute video tutorial demonstrating EduPort usage.

---

## Video Script

### Scene 1: Intro (0:00-0:15)
```
"Hi, I'm going to show you how to convert Wordwall activities to H5P 
format using EduPort. It takes less than 30 seconds."
```

### Scene 2: Find Wordwall URL (0:15-0:30)
```
"First, go to Wordwall and find an activity you want to convert.
Copy the URL from your browser - it should look like 
wordwall.net/resource/12345678"
```

### Scene 3: Use EduPort (0:30-1:00)
```
"Now go to eduport.app. Paste your URL here.
Check the box confirming you have permission to use the content.
Click Convert."
```

### Scene 4: Download (1:00-1:15)
```
"The conversion takes just a few seconds.
Click Download to get your H5P file."
```

### Scene 5: Upload to Moodle (1:15-2:30)
```
"Now let's upload to Moodle.
1. Go to your course
2. Turn editing on
3. Add an activity - choose H5P
4. Upload the file you just downloaded
5. Save and return to course"
```

### Scene 6: Test the Activity (2:30-2:50)
```
"Click on the activity to test it.
As you can see, the quiz works just like it did on Wordwall,
but now it's embedded in your Moodle course."
```

### Scene 7: Outro (2:50-3:00)
```
"That's it! Convert any Wordwall activity to H5P in seconds.
Visit eduport.app to try it free."
```

---

## Recording Instructions

### Option 1: Loom (Recommended)
1. Install Loom browser extension
2. Click Loom icon → Start Recording
3. Select "Screen + Cam" or "Screen Only"
4. Follow the script above
5. Click Stop when done
6. Copy share link

### Option 2: Manual Screen Recording

**macOS:**
```bash
# QuickTime Player > File > New Screen Recording
```

**Linux:**
```bash
# Install SimpleScreenRecorder
sudo apt install simplescreenrecorder
simplescreenrecorder
```

**Windows:**
```
# Win + G to open Game Bar
# Click Record button
```

---

## Output Requirements

1. **Duration:** 2:30 - 3:30 minutes
2. **Resolution:** 1080p minimum
3. **Audio:** Clear narration, no background noise
4. **Format:** MP4 or Loom link

---

## Acceptance Criteria

1. ✅ Video recorded following the script
2. ✅ Demonstrates complete workflow (Wordwall → EduPort → Moodle)
3. ✅ Quality: 1080p, clear audio
4. ✅ Duration: 2:30-3:30 minutes
5. ✅ Link/file ready for homepage embed

---

## Deliverables

1. **Loom Link** or **Video File:** Share link to uploaded video
2. **Embed Code:** For homepage integration

```html
<!-- Loom embed example -->
<div style="position: relative; padding-bottom: 56.25%; height: 0;">
  <iframe 
    src="https://www.loom.com/embed/VIDEO_ID" 
    frameborder="0" 
    allowfullscreen 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
  </iframe>
</div>
```

---

## Note

This task may require manual execution. If browser automation isn't possible for recording:
1. Document the script in `/docs/video-tutorial-script.md`
2. Provide recording instructions
3. Mark as "Ready for PM to record"

---

## Deadline

**Jan 14, 11:30 PM**
