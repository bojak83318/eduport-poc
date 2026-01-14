# Agent 21: Backend Engineer - Bulk API Endpoint

**Agent Role:** @eduport/backend-engineer  
**Task ID:** BE-012  
**Batch:** 5  
**Priority:** High  
**Deadline:** Jan 14, 11:30 PM

---

## Context

Pro and Enterprise users need to convert multiple Wordwall URLs in a single request. The Bulk API accepts an array of URLs, validates tier limits, creates a job in the queue, and returns a job ID for status polling.

---

## Task

Implement the `POST /api/bulk` endpoint.

**File:** `/app/api/bulk/route.ts`

---

## API Contract

**Request:**
```json
POST /api/bulk
{
  "urls": [
    "https://wordwall.net/resource/12345678",
    "https://wordwall.net/resource/87654321"
  ],
  "webhookUrl": "https://myapp.com/webhook" // optional
}
```

**Response:**
```json
{
  "jobId": "uuid-v4-job-id",
  "status": "queued",
  "urlCount": 2,
  "estimatedSeconds": 20
}
```

---

## Implementation

```typescript
// app/api/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

const BulkRequestSchema = z.object({
  urls: z.array(z.string().url().regex(/^https:\/\/wordwall\.net\/resource\/\d+/)).min(1).max(1000),
  webhookUrl: z.string().url().optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const parsed = BulkRequestSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 })
    }
    
    const { urls, webhookUrl } = parsed.data
    
    // TODO: Check user tier for URL limits (50 Pro, 1000 Enterprise)
    const maxUrls = 50 // Default Pro limit
    if (urls.length > maxUrls) {
      return NextResponse.json({ 
        error: `URL limit exceeded. Max ${maxUrls} URLs per job.` 
      }, { status: 400 })
    }
    
    const jobId = uuidv4()
    
    // Insert job into job_queue table
    const { error: insertError } = await supabase
      .from('job_queue')
      .insert({
        id: jobId,
        user_id: user.id,
        urls: urls,
        status: 'queued',
        webhook_url: webhookUrl || null,
        results: null,
        created_at: new Date().toISOString()
      })
    
    if (insertError) {
      console.error('Failed to create job:', insertError)
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
    }
    
    return NextResponse.json({
      jobId,
      status: 'queued',
      urlCount: urls.length,
      estimatedSeconds: urls.length * 10 // ~10s per URL estimate
    })
    
  } catch (error: any) {
    console.error('Bulk API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/bulk?jobId=xxx - Check job status
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const jobId = searchParams.get('jobId')
  
  if (!jobId) {
    return NextResponse.json({ error: 'jobId required' }, { status: 400 })
  }
  
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { data: job, error } = await supabase
    .from('job_queue')
    .select('*')
    .eq('id', jobId)
    .eq('user_id', user.id)
    .single()
  
  if (error || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }
  
  return NextResponse.json({
    jobId: job.id,
    status: job.status,
    urls: job.urls,
    results: job.results,
    createdAt: job.created_at
  })
}
```

---

## Acceptance Criteria

1. ✅ Endpoint created at `/app/api/bulk/route.ts`
2. ✅ Validates Wordwall URL format with Zod
3. ✅ Enforces tier-based URL limits
4. ✅ Creates job in `job_queue` table with status='queued'
5. ✅ Returns job ID for status polling
6. ✅ GET endpoint for job status check

---

## Output Artifacts

1. **Code:** `/home/kasm-user/workspace/dspy/eduport-poc/app/api/bulk/route.ts`
2. **Summary:** Generate a summary of what was implemented

---

## Verification

```bash
# Start dev server
cd /home/kasm-user/workspace/dspy/eduport-poc
npm run dev

# Test endpoint (requires auth token)
curl -X POST http://localhost:3000/api/bulk \
  -H "Content-Type: application/json" \
  -d '{"urls":["https://wordwall.net/resource/12345678"]}'
```

---

## Deadline

**Jan 14, 11:30 PM**
