# Agent 28: Security Engineer - CSRF Protection

**Agent Role:** @eduport/security-engineer  
**Task ID:** SEC-002  
**Batch:** 6  
**Priority:** High  
**Deadline:** Jan 14, 11:30 PM

---

## Context

Cross-Site Request Forgery (CSRF) attacks trick users into submitting malicious requests. We protect all POST endpoints by validating the Origin header.

---

## Task

Add CSRF protection to all POST endpoints via middleware.

---

## Implementation

### 1. Update Middleware

**File:** `/middleware.ts`

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function verifyRequestOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  
  // Allow requests without origin (same-origin, curl, etc.)
  if (!origin) {
    // For API routes, require origin header in production
    if (process.env.NODE_ENV === 'production' && request.nextUrl.pathname.startsWith('/api/')) {
      // Allow server-to-server requests (webhooks, cron)
      const userAgent = request.headers.get('user-agent') || ''
      if (userAgent.includes('vercel-cron') || userAgent.includes('internal')) {
        return true
      }
      // Require origin for browser requests
      return false
    }
    return true
  }
  
  // Extract hostname from origin
  try {
    const originUrl = new URL(origin)
    const originHost = originUrl.host
    
    // Allow same-origin requests
    if (originHost === host) {
      return true
    }
    
    // Allow localhost in development
    if (process.env.NODE_ENV === 'development') {
      if (originHost.includes('localhost') || originHost.includes('127.0.0.1')) {
        return true
      }
    }
    
    // Whitelist production domains
    const allowedOrigins = [
      'eduport.app',
      'www.eduport.app',
      process.env.NEXT_PUBLIC_VERCEL_URL,
    ].filter(Boolean)
    
    return allowedOrigins.some(allowed => originHost === allowed || originHost.endsWith(`.${allowed}`))
  } catch {
    return false
  }
}

export function middleware(request: NextRequest) {
  // Only check CSRF for state-changing methods
  const unsafeMethods = ['POST', 'PUT', 'PATCH', 'DELETE']
  
  if (unsafeMethods.includes(request.method)) {
    if (!verifyRequestOrigin(request)) {
      return NextResponse.json(
        { error: 'CSRF validation failed. Request origin not allowed.' },
        { status: 403 }
      )
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}
```

---

## Test Cases

```typescript
// Manual testing scenarios:

// 1. Same-origin request (should pass)
// curl -X POST http://localhost:3000/api/convert \
//   -H "Origin: http://localhost:3000" \
//   -H "Content-Type: application/json" \
//   -d '{"url":"..."}'

// 2. Cross-origin request (should fail with 403)
// curl -X POST http://localhost:3000/api/convert \
//   -H "Origin: https://evil.com" \
//   -H "Content-Type: application/json" \
//   -d '{"url":"..."}'

// 3. No origin header (development: pass, production: might fail)
// curl -X POST http://localhost:3000/api/convert \
//   -H "Content-Type: application/json" \
//   -d '{"url":"..."}'
```

---

## Acceptance Criteria

1. ✅ CSRF validation added to middleware
2. ✅ All POST/PUT/PATCH/DELETE requests validated
3. ✅ 403 response for cross-origin requests from untrusted domains
4. ✅ Same-origin requests continue to work
5. ✅ Localhost allowed in development mode

---

## Verification

```bash
# Test CSRF protection
# Should return 403:
curl -X POST http://localhost:3000/api/convert \
  -H "Origin: https://evil-site.com" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://wordwall.net/resource/123"}'

# Should work:
curl -X POST http://localhost:3000/api/convert \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://wordwall.net/resource/123"}'
```

---

## Deadline

**Jan 14, 11:30 PM**
