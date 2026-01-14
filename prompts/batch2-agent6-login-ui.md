# Agent 6: Frontend Engineer - OAuth Login UI

**Agent Role:** @eduport/frontend-engineer  
**Task ID:** FE-001  
**Batch:** 2  
**Priority:** High  
**Deadline:** Jan 14, 6:00 PM

---

## Context

- Backend has created auth functions: `signInWithGoogle()`, `signInWithGitHub()` in `/lib/supabase/auth.ts`
- Users need a clean, simple login interface
- This is the first user-facing page for authentication

---

## Task

Create the OAuth login page with Google + GitHub OAuth buttons.

**Route:** `/app/login/page.tsx`

---

## UI Design

```
┌─────────────────────────────────────┐
│          🎓 EduPort Login           │
├─────────────────────────────────────┤
│                                     │
│   Convert Wordwall to H5P          │
│   in seconds.                       │
│                                     │
│   ┌─────────────────────────────┐  │
│   │ [🔵 G] Sign in with Google  │  │
│   └─────────────────────────────┘  │
│                                     │
│   ┌─────────────────────────────┐  │
│   │ [⚫ GH] Sign in with GitHub  │  │
│   └─────────────────────────────┘  │
│                                     │
│   No password required.             │
└─────────────────────────────────────┘
```

---

## Acceptance Criteria

1. ✅ Page created at `/app/login/page.tsx`
2. ✅ Buttons trigger `signInWithGoogle()` / `signInWithGitHub()` from `auth.ts`
3. ✅ Responsive design (mobile-friendly, min-width 320px)
4. ✅ Loading state while OAuth redirect happens (spinner or "Redirecting...")
5. ✅ Error message if OAuth fails (toast or inline message)
6. ✅ Redirect to `/dashboard` after successful login

---

## Implementation Guide

```typescript
// app/login/page.tsx
'use client'

import { useState } from 'react'
import { signInWithGoogle, signInWithGitHub } from '@/lib/supabase/auth'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
      // OAuth redirect happens automatically
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleGitHubSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      await signInWithGitHub()
      // OAuth redirect happens automatically
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-3xl font-bold">🎓 EduPort Login</h1>
          <p className="mt-2 text-gray-600">
            Convert Wordwall to H5P in seconds.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <span className="mr-2">🔵</span>
            Sign in with Google
          </button>

          <button
            onClick={handleGitHubSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <span className="mr-2">⚫</span>
            Sign in with GitHub
          </button>
        </div>

        {loading && (
          <p className="text-center text-sm text-gray-500">Redirecting...</p>
        )}

        {error && (
          <p className="text-center text-sm text-red-600">{error}</p>
        )}

        <p className="text-center text-sm text-gray-500">
          No password required.
        </p>
      </div>
    </div>
  )
}
```

---

## Output Artifacts (REQUIRED)

1. **Login Page:** `/home/kasm-user/workspace/dspy/eduport-poc/app/login/page.tsx`
2. **Summary:** `/home/kasm-user/.gemini/antigravity/brain/f3b200e3-a5e4-4679-b285-af2cfcd2e4cc/agent-outputs/FE-001-login-summary.md`

**Summary Template:**
```markdown
# FE-001: OAuth Login UI - Summary

## Completed
- ✅ Created login page at /app/login/page.tsx
- ✅ Integrated Google OAuth button
- ✅ Integrated GitHub OAuth button
- ✅ Added loading states
- ✅ Added error handling
- ✅ Responsive design tested

## Testing
- Manual test: http://localhost:3000/login
- Clicked Google button → OAuth redirect occurred ✅
- Clicked GitHub button → OAuth redirect occurred ✅
- Mobile responsive check (Chrome DevTools) ✅

## Issues/Notes
- [Any issues encountered]

## Next Steps
- Test with real Supabase OAuth credentials
- Add redirect to /dashboard after login
```

---

## Verification

```bash
cd /home/kasm-user/workspace/dspy/eduport-poc
npm run dev
# Visit http://localhost:3000/login
# Click "Sign in with Google" → OAuth redirect should occur
# Click "Sign in with GitHub" → OAuth redirect should occur
```

---

## Dependencies

- ✅ `/lib/supabase/auth.ts` must exist (created by Agent 5)
- ✅ Supabase project configured with OAuth providers

---

## Estimated Time

**2-3 hours**

---

## Deadline

**Jan 14, 6:00 PM**
