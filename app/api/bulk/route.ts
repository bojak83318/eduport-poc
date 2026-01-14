import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'
import { BulkRequestSchema, containsXss } from '@/lib/validation/schemas'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const parsed = BulkRequestSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 })
        }

        // Check each URL for XSS attempts
        for (const url of parsed.data.urls) {
            if (containsXss(url)) {
                return NextResponse.json(
                    { error: 'Invalid URL detected' },
                    { status: 400 }
                )
            }
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

    const supabase = await createClient()
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
