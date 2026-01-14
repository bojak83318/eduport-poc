# BUG: Wordwall Scraper Fails - activityModel Not Found

**Task ID:** BUG-001  
**Priority:** P0 - Critical (POC Blocked)  
**Assigned Role:** @eduport/backend-engineer  
**Created:** 2026-01-14  

---

## Problem Summary

EduPort POC is blocked - conversion fails with:
```json
{"error": "Could not find activityModel in HTML"}
```

All 4 extraction patterns in `/lib/scraping/patterns.ts` fail because Wordwall changed their frontend.

---

## Root Cause Analysis

### Current Patterns (OBSOLETE)
| Pattern | Status |
|---------|--------|
| `window.activityModel` | ❌ Not found |
| `window.__NEXT_DATA__` | ❌ Not found |
| `<script id="__ACTIVITY_DATA__">` | ❌ Not found |
| `data-activity-json` attribute | ❌ Not found |

### New Wordwall Architecture
- **Metadata available:** `window.ServerModel` contains:
  - `activityId`: `101727466`
  - `activityGuid`: `cdaa6c77afac49a59f03a72c647de7e4`
  - `templateId`: `5` (Quiz)
- **Data loaded dynamically:** Activity JSON is fetched via XHR after page load
- **API Endpoint:** `https://wordwall.net/api/activity/data?activityGuid={GUID}`

---

## Proposed Fix

### Step 1: Extract GUID from ServerModel
```typescript
// New pattern in patterns.ts
{
    name: 'window.ServerModel',
    regex: /window\.ServerModel\s*=\s*(\{.*?\});/s,
    parse: (match: string) => {
        const serverModel = JSON.parse(match);
        return {
            activityId: serverModel.activityId,
            activityGuid: serverModel.activityGuid,
            templateId: serverModel.templateId,
        };
    },
}
```

### Step 2: Fetch Activity Data via API
```typescript
// wordwall-scraper.ts
async function fetchActivityData(guid: string): Promise<ActivityPayload> {
    const response = await fetch(`https://wordwall.net/api/activity/data?activityGuid=${guid}`);
    const data = await response.json();
    return data;
}
```

### Step 3: Alternative - Use Embed URL
The embed page at `https://wordwall.net/embed/{GUID}` may have simpler data loading.

---

## Files to Modify

| File | Change |
|------|--------|
| `lib/scraping/patterns.ts` | Add `window.ServerModel` pattern |
| `lib/scraping/wordwall-scraper.ts` | Add API fetch for activity data |
| `lib/types.ts` | Update `ActivityPayload` if needed |

---

## Acceptance Criteria

1. ✅ Extract `activityGuid` from `window.ServerModel`
2. ✅ Fetch activity data from Wordwall API endpoint
3. ✅ Conversion succeeds for test URL: `https://wordwall.net/resource/101727466/esa/have-got-has-got-affirmative-negative`
4. ✅ Unit tests pass for new pattern

---

## Test URLs

- Quiz: `https://wordwall.net/resource/101727466/esa/have-got-has-got-affirmative-negative`
- GUID: `cdaa6c77afac49a59f03a72c647de7e4`
- API: `https://wordwall.net/api/activity/data?activityGuid=cdaa6c77afac49a59f03a72c647de7e4`
