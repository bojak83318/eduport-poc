import { NextResponse } from 'next/server';

export async function GET() {
    const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '0.1.0',
        services: {
            database: 'connected', // TODO: Add actual Supabase health check
            scraper: 'operational',
            packager: 'operational',
        },
    };

    return NextResponse.json(healthStatus, { status: 200 });
}
