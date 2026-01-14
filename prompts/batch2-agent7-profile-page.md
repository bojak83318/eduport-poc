# Agent 7: Frontend Engineer - User Profile Page

**Agent Role:** @eduport/frontend-engineer  
**Task ID:** FE-002  
**Batch:** 2  
**Priority:** Medium  
**Deadline:** Jan 14, 6:00 PM

---

## Context

- Users need to see their email, OAuth provider, and conversion quota
- Free tier: 5 conversions/month
- Pro tier: Unlimited conversions
- This page requires authentication (protected route)

---

## Task

Create the profile page showing user info and usage stats.

**Route:** `/app/profile/page.tsx`

---

## UI Design

```
┌─────────────────────────────────────────┐
│  Profile                    [Logout]    │
├─────────────────────────────────────────┤
│                                         │
│  📧 Email: user@example.com             │
│  🔑 Provider: Google                    │
│  📊 Tier: Free                          │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Conversions this month: 3 / 5          │
│  [████████░░] 60%                       │
│                                         │
│  ⚠️ 2 conversions remaining             │
│  [Upgrade to Pro] for unlimited         │
│                                         │
└─────────────────────────────────────────┘
```

---

## Acceptance Criteria

1. ✅ Page created at `/app/profile/page.tsx`
2. ✅ Fetches user from `supabase.auth.getUser()`
3. ✅ Fetches conversion count from `conversions` table (where user_id = current user)
4. ✅ Shows progress bar for quota usage
5. ✅ "Upgrade to Pro" button if quota ≥80% (4/5 or more)
6. ✅ Protected route (requires authentication via middleware)
7. ✅ Logout button that calls `supabase.auth.signOut()`

---

## Implementation Guide

```typescript
// app/profile/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/auth'

interface UserStats {
  email: string
  provider: string
  tier: 'free' | 'pro'
  conversions: number
  quota: number
}

export default function ProfilePage() {
  const router = useRouter()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      try {
        // Get current user
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          router.push('/login')
          return
        }

        // Get conversion count for this month
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { data: conversions, error: convError } = await supabase
          .from('conversions')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth.toISOString())

        const tier = user.app_metadata?.tier || 'free'
        const quota = tier === 'pro' ? Infinity : 5

        setStats({
          email: user.email || '',
          provider: user.app_metadata?.provider || 'unknown',
          tier,
          conversions: conversions?.length || 0,
          quota,
        })
      } catch (err) {
        console.error('Failed to load profile:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!stats) {
    return <div className="p-8">Failed to load profile</div>
  }

  const usagePercent = Math.round((stats.conversions / stats.quota) * 100)
  const remaining = stats.quota - stats.conversions

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Profile</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
          >
            Logout
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-lg">📧 {stats.email}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Provider</p>
            <p className="text-lg">🔑 {stats.provider}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Tier</p>
            <p className="text-lg">📊 {stats.tier === 'pro' ? 'Pro' : 'Free'}</p>
          </div>

          <hr className="my-6" />

          <div>
            <p className="text-sm text-gray-600 mb-2">
              Conversions this month: {stats.conversions} / {stats.tier === 'pro' ? '∞' : stats.quota}
            </p>
            
            {stats.tier === 'free' && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className="bg-blue-600 h-4 rounded-full"
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  />
                </div>

                <p className="text-sm text-gray-600">
                  {remaining > 0 ? (
                    <>⚠️ {remaining} conversions remaining</>
                  ) : (
                    <>🚫 Quota exceeded</>
                  )}
                </p>

                {usagePercent >= 80 && (
                  <a
                    href="/pricing"
                    className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Upgrade to Pro for unlimited
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## Output Artifacts (REQUIRED)

1. **Profile Page:** `/home/kasm-user/workspace/dspy/eduport-poc/app/profile/page.tsx`
2. **Summary:** `/home/kasm-user/.gemini/antigravity/brain/f3b200e3-a5e4-4679-b285-af2cfcd2e4cc/agent-outputs/FE-002-profile-summary.md`

**Summary Template:**
```markdown
# FE-002: User Profile Page - Summary

## Completed
- ✅ Created profile page at /app/profile/page.tsx
- ✅ Integrated user data from Supabase Auth
- ✅ Fetched conversion count from database
- ✅ Implemented quota progress bar
- ✅ Added "Upgrade to Pro" button
- ✅ Added logout functionality

## Testing
- Manual test: http://localhost:3000/profile
- Redirect to /login if not authenticated ✅
- User email displayed correctly ✅
- Conversion count accurate ✅
- Progress bar reflects usage ✅

## Issues/Notes
- [Any issues encountered]

## Next Steps
- Add account deletion flow (GDPR compliance)
- Add usage history chart
```

---

## Verification

```bash
cd /home/kasm-user/workspace/dspy/eduport-poc
npm run dev

# Test 1: Unauthenticated access
# Visit http://localhost:3000/profile
# Expected: Redirect to /login

# Test 2: Authenticated access
# 1. Login via /login
# 2. Visit /profile
# Expected: Shows user email, provider, quota

# Test 3: Logout
# Click "Logout" button
# Expected: Redirect to /login, session cleared
```

---

## Dependencies

- ✅ `/lib/supabase/auth.ts` (created by Agent 5)
- ✅ Database table `conversions` (created by Agent 4)
- ✅ Middleware for protected routes

---

## Estimated Time

**2-3 hours**

---

## Deadline

**Jan 14, 6:00 PM**
