# Agent 23: Frontend Engineer - Dashboard Page

**Agent Role:** @eduport/frontend-engineer  
**Task ID:** FE-003  
**Batch:** 5  
**Priority:** High  
**Deadline:** Jan 14, 11:30 PM

---

## Context

Users need to view their conversion history, see which conversions succeeded/failed, and download completed H5P files.

---

## Task

Build the user dashboard with conversion history.

**File:** `/app/dashboard/page.tsx`

---

## UI Mockup

```
┌────────────────────────────────────────────────────────────┐
│  EduPort Dashboard                          [User Menu ▼]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  📊 Your Conversions (23 total)                            │
│                                                            │
│  Filter: [All ▼] [Success] [Failed]                        │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ URL                    │ Status  │ Date       │ ⬇️   │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ wordwall.net/res/123   │ ✅      │ Jan 14     │ [DL] │  │
│  │ wordwall.net/res/456   │ ✅      │ Jan 14     │ [DL] │  │
│  │ wordwall.net/res/789   │ ❌      │ Jan 13     │  -   │  │
│  │ wordwall.net/res/012   │ ✅      │ Jan 13     │ [DL] │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  [← Prev] Page 1 of 3 [Next →]                             │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Implementation

```typescript
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage({
  searchParams
}: {
  searchParams: { page?: string; status?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const page = parseInt(searchParams.page || '1')
  const pageSize = 10
  const offset = (page - 1) * pageSize
  const statusFilter = searchParams.status
  
  let query = supabase
    .from('conversions')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)
  
  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }
  
  const { data: conversions, count } = await query
  
  const totalPages = Math.ceil((count || 0) / pageSize)
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Conversions</h1>
      
      {/* Filter buttons */}
      <div className="flex gap-2 mb-4">
        <FilterButton href="/dashboard?status=all" active={!statusFilter || statusFilter === 'all'}>
          All
        </FilterButton>
        <FilterButton href="/dashboard?status=success" active={statusFilter === 'success'}>
          ✅ Success
        </FilterButton>
        <FilterButton href="/dashboard?status=failed" active={statusFilter === 'failed'}>
          ❌ Failed
        </FilterButton>
      </div>
      
      {/* Conversion table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-3 text-left">Wordwall URL</th>
            <th className="border p-3 text-left">Status</th>
            <th className="border p-3 text-left">Date</th>
            <th className="border p-3 text-left">Download</th>
          </tr>
        </thead>
        <tbody>
          {conversions?.map((c) => (
            <tr key={c.id}>
              <td className="border p-3">
                <a href={c.wordwall_url} target="_blank" className="text-blue-600 hover:underline">
                  {c.wordwall_url.replace('https://wordwall.net/resource/', '')}
                </a>
              </td>
              <td className="border p-3">
                {c.status === 'success' ? '✅' : '❌'}
              </td>
              <td className="border p-3">
                {new Date(c.created_at).toLocaleDateString()}
              </td>
              <td className="border p-3">
                {c.status === 'success' && c.download_url ? (
                  <a href={c.download_url} className="text-blue-600 hover:underline">Download</a>
                ) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <a 
          href={`/dashboard?page=${Math.max(1, page - 1)}`}
          className={`px-4 py-2 border rounded ${page <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
        >
          ← Prev
        </a>
        <span>Page {page} of {totalPages || 1}</span>
        <a 
          href={`/dashboard?page=${page + 1}`}
          className={`px-4 py-2 border rounded ${page >= totalPages ? 'opacity-50 pointer-events-none' : ''}`}
        >
          Next →
        </a>
      </div>
    </div>
  )
}

function FilterButton({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <a 
      href={href}
      className={`px-4 py-2 border rounded ${active ? 'bg-blue-600 text-white' : 'bg-white'}`}
    >
      {children}
    </a>
  )
}
```

---

## Acceptance Criteria

1. ✅ Page created at `/app/dashboard/page.tsx`
2. ✅ Shows conversion history table
3. ✅ Pagination works (10 items per page)
4. ✅ Filter by status (all, success, failed)
5. ✅ Download links for successful conversions
6. ✅ Protected route (redirects to /login if not authenticated)

---

## Output Artifacts

1. **Code:** `/home/kasm-user/workspace/dspy/eduport-poc/app/dashboard/page.tsx`
2. **Summary:** Generate a summary of what was implemented

---

## Verification

```bash
cd /home/kasm-user/workspace/dspy/eduport-poc
npm run dev
# Navigate to http://localhost:3000/dashboard
# Verify: Table renders, pagination works, filters work
```

---

## Deadline

**Jan 14, 11:30 PM**
