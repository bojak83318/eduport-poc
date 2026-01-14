# Agent 22: Backend Engineer - Background Worker

**Agent Role:** @eduport/backend-engineer  
**Task ID:** BE-013  
**Batch:** 5  
**Priority:** High  
**Deadline:** Jan 15, 12:00 AM

---

## Context

The background worker polls the `job_queue` table and processes bulk conversion jobs. It converts URLs in parallel, updates job status, and fires webhooks when complete.

---

## Task

Implement the background worker for bulk processing.

**File:** `/lib/workers/bulk-processor.ts`

---

## Implementation

```typescript
// lib/workers/bulk-processor.ts
import { createClient } from '@supabase/supabase-js'
import { convertActivity } from '../convert'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface JobResult {
  url: string
  status: 'success' | 'failed'
  downloadUrl?: string
  error?: string
}

export async function processQueuedJobs() {
  console.log('[worker] Checking for queued jobs...')
  
  // Fetch queued jobs
  const { data: jobs, error } = await supabase
    .from('job_queue')
    .select('*')
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(5)
  
  if (error) {
    console.error('[worker] Failed to fetch jobs:', error)
    return
  }
  
  if (!jobs || jobs.length === 0) {
    console.log('[worker] No queued jobs found')
    return
  }
  
  for (const job of jobs) {
    await processJob(job)
  }
}

async function processJob(job: any) {
  console.log(`[worker] Processing job: ${job.id}`)
  
  // Update status to 'processing'
  await supabase
    .from('job_queue')
    .update({ status: 'processing' })
    .eq('id', job.id)
  
  const results: JobResult[] = []
  
  // Process URLs in parallel (batches of 5)
  const urls = job.urls as string[]
  const batchSize = 5
  
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize)
    
    const batchResults = await Promise.allSettled(
      batch.map(async (url) => {
        try {
          const h5p = await convertActivity(url)
          return {
            url,
            status: 'success' as const,
            downloadUrl: `https://eduport.app/downloads/${job.id}/${encodeURIComponent(url)}`
          }
        } catch (error: any) {
          return {
            url,
            status: 'failed' as const,
            error: error.message
          }
        }
      })
    )
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value)
      }
    }
  }
  
  // Calculate success rate
  const successCount = results.filter(r => r.status === 'success').length
  const status = successCount === urls.length ? 'completed' : 'completed_with_errors'
  
  // Update job with results
  await supabase
    .from('job_queue')
    .update({ 
      status, 
      results: results,
      completed_at: new Date().toISOString()
    })
    .eq('id', job.id)
  
  console.log(`[worker] Job ${job.id} completed: ${successCount}/${urls.length} succeeded`)
  
  // Fire webhook if provided
  if (job.webhook_url) {
    try {
      await fetch(job.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          status,
          results,
          successRate: successCount / urls.length
        })
      })
      console.log(`[worker] Webhook fired for job ${job.id}`)
    } catch (error) {
      console.error(`[worker] Webhook failed for job ${job.id}:`, error)
    }
  }
}

// Export for Vercel Cron
export async function GET() {
  await processQueuedJobs()
  return new Response('OK', { status: 200 })
}
```

---

## Vercel Cron Configuration

Create `/vercel.json` or update existing:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-jobs",
      "schedule": "* * * * *"
    }
  ]
}
```

Create `/app/api/cron/process-jobs/route.ts`:

```typescript
import { processQueuedJobs } from '@/lib/workers/bulk-processor'
import { NextResponse } from 'next/server'

export async function GET() {
  // Verify cron secret
  // if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // }
  
  await processQueuedJobs()
  return NextResponse.json({ status: 'ok' })
}
```

---

## Acceptance Criteria

1. ✅ Worker file created at `/lib/workers/bulk-processor.ts`
2. ✅ Polls `job_queue` table for queued jobs
3. ✅ Processes URLs in parallel (batches of 5)
4. ✅ Updates job status and stores results
5. ✅ Fires webhook on completion (if provided)
6. ✅ Cron route created at `/app/api/cron/process-jobs/route.ts`

---

## Output Artifacts

1. **Worker:** `/home/kasm-user/workspace/dspy/eduport-poc/lib/workers/bulk-processor.ts`
2. **Cron Route:** `/home/kasm-user/workspace/dspy/eduport-poc/app/api/cron/process-jobs/route.ts`
3. **Summary:** Generate a summary of what was implemented

---

## Verification

```bash
# Create a test job manually in Supabase, then:
cd /home/kasm-user/workspace/dspy/eduport-poc
npx ts-node -e "import { processQueuedJobs } from './lib/workers/bulk-processor'; processQueuedJobs()"
```

---

## Deadline

**Jan 15, 12:00 AM**

---

## Dependency

Requires `BE-012` (Bulk API) to be complete for end-to-end testing.
