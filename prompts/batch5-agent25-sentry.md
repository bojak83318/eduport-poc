# Agent 25: DevOps Engineer - Sentry Integration

**Agent Role:** @eduport/devops-engineer  
**Task ID:** DEVOPS-002  
**Batch:** 5  
**Priority:** High  
**Deadline:** Jan 14, 11:00 PM

---

## Context

Production error tracking is critical for identifying and fixing issues. Sentry provides error capture, stack traces, and alerting.

---

## Task

Integrate Sentry for error tracking in the Next.js application.

---

## Steps

### 1. Install Sentry SDK

```bash
cd /home/kasm-user/workspace/dspy/eduport-poc
npm install --save @sentry/nextjs
```

### 2. Initialize Sentry

Run the Sentry wizard (or manually configure):

```bash
npx @sentry/wizard@latest -i nextjs
```

### 3. Manual Configuration (if wizard doesn't work)

**Create `/sentry.client.config.ts`:**
```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1
})
```

**Create `/sentry.server.config.ts`:**
```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false
})
```

**Create `/sentry.edge.config.ts`:**
```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false
})
```

### 4. Update next.config.js

```javascript
const { withSentryConfig } = require("@sentry/nextjs")

const nextConfig = {
  // Your existing config
}

module.exports = withSentryConfig(nextConfig, {
  org: "eduport",
  project: "eduport-web",
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true
})
```

### 5. Create Global Error Handler

**Create `/app/global-error.tsx`:**
```typescript
'use client'

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}
```

### 6. Add Environment Variables

Add to `.env.local`:
```
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_ORG=eduport
SENTRY_PROJECT=eduport-web
SENTRY_AUTH_TOKEN=sntrys_xxxxx
```

### 7. Test Error Capture

Create a test API route `/app/api/test-error/route.ts`:
```typescript
export async function GET() {
  throw new Error("Test Sentry error - please ignore")
}
```

---

## Acceptance Criteria

1. ✅ `@sentry/nextjs` installed
2. ✅ Sentry config files created (client, server, edge)
3. ✅ `next.config.js` wrapped with `withSentryConfig`
4. ✅ Global error boundary created
5. ✅ Environment variables documented
6. ✅ Test error appears in Sentry dashboard

---

## Output Artifacts

1. **Code:** `/home/kasm-user/workspace/dspy/eduport-poc/sentry.client.config.ts`
2. **Code:** `/home/kasm-user/workspace/dspy/eduport-poc/sentry.server.config.ts`
3. **Code:** `/home/kasm-user/workspace/dspy/eduport-poc/app/global-error.tsx`
4. **Modified:** `/home/kasm-user/workspace/dspy/eduport-poc/next.config.js`
5. **Summary:** Generate a summary of what was implemented

---

## Verification

```bash
# Build to ensure Sentry integration works
npm run build

# Start dev server and trigger error
npm run dev
curl http://localhost:3000/api/test-error

# Check Sentry dashboard for captured error
```

---

## Note

You'll need to create a free Sentry account at https://sentry.io and create a new project to get the DSN. For now, create the config files with placeholder DSN and document the setup steps.

---

## Deadline

**Jan 14, 11:00 PM**
