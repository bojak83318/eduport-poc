import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const data = await request.json()

    // In production, send email to legal team
    console.log('DMCA Notice received:', data)

    // TODO: Send email via SendGrid/Resend
    // await sendEmail({
    //   to: 'legal@eduport.app',
    //   subject: 'DMCA Takedown Notice',
    //   body: JSON.stringify(data, null, 2),
    // })

    return NextResponse.json({ success: true })
}
