import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function verifyRequestOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    // Allow requests without origin (same-origin, curl, etc.)
    if (!origin) {
        // For API routes, allow requests without origin (cURL, scripts, etc.)
        // This is necessary for testing and strictly required by the BUG-003 task.
        if (request.nextUrl.pathname.startsWith('/api/')) {
            return true;
        }

        // For other routes in production, we might want to be strict, but for now let's be lenient 
        // to avoid blocking legitimate headless usage if any.
        // However, keeping the original logic for non-API routes for safety if desired:
        if (process.env.NODE_ENV === 'production' && !request.nextUrl.pathname.startsWith('/api/')) {
            // Allow server-to-server requests (webhooks, cron)
            const userAgent = request.headers.get('user-agent') || '';
            if (userAgent.includes('vercel-cron') || userAgent.includes('internal')) {
                return true;
            }
            // Require origin for browser requests to non-API routes? 
            // Actually, usually browsers always send Origin for POST. 
            // Getting here means no Origin header. 
            // If it's a browser navigation (GET), it's fine (middleware usually runs on page load too?)
            // But verifyRequestOrigin is called only for POST/PUT/PATCH/DELETE below.
            // So this is a state-changing request without Origin.
            // Blocking it is safer for browsers, allowing it for API.
            return false;
        }
        return true;
    }

    // Extract hostname from origin
    try {
        const originUrl = new URL(origin);
        const originHost = originUrl.host;

        // Allow same-origin requests
        if (originHost === host) {
            return true;
        }

        // Allow localhost in development
        if (process.env.NODE_ENV === 'development') {
            if (originHost.includes('localhost') || originHost.includes('127.0.0.1')) {
                return true;
            }
        }

        // Whitelist production domains
        const allowedOrigins = [
            'eduport.app',
            'www.eduport.app',
            process.env.NEXT_PUBLIC_VERCEL_URL,
        ].filter(Boolean);

        return allowedOrigins.some((allowed) => originHost === allowed || (typeof allowed === 'string' && originHost.endsWith(`.${allowed}`)));
    } catch {
        return false;
    }
}

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    // CSRF Protection
    const unsafeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

    if (unsafeMethods.includes(req.method)) {
        if (!verifyRequestOrigin(req)) {
            return NextResponse.json(
                { error: 'CSRF validation failed. Request origin not allowed.' },
                { status: 403 }
            );
        }
    }

    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Protected routes
    if (req.nextUrl.pathname.startsWith('/dashboard') ||
        req.nextUrl.pathname.startsWith('/settings') ||
        req.nextUrl.pathname.startsWith('/profile') ||
        req.nextUrl.pathname.startsWith('/api/bulk') ||
        req.nextUrl.pathname.startsWith('/api/pro')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    // Redirect to dashboard if logged in and visiting login
    if (req.nextUrl.pathname === '/login' && session) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return res;
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/settings/:path*',
        '/profile/:path*',
        '/api/:path*',
        '/login'
    ],
};
