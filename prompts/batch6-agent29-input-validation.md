# Agent 29: Security Engineer - Input Validation

**Agent Role:** @eduport/security-engineer  
**Task ID:** SEC-003  
**Batch:** 6  
**Priority:** High  
**Deadline:** Jan 14, 11:30 PM

---

## Context

All user input must be validated to prevent injection attacks, XSS, and malformed data. We use Zod for type-safe schema validation.

---

## Task

Add Zod input validation to all API endpoints.

---

## Validation Schemas

**File:** `/lib/validation/schemas.ts`

```typescript
import { z } from 'zod'

// Wordwall URL pattern
const wordwallUrlPattern = /^https:\/\/wordwall\.net\/resource\/\d+$/

export const WordwallUrlSchema = z.string()
  .url('Must be a valid URL')
  .regex(wordwallUrlPattern, 'Must be a valid Wordwall resource URL (https://wordwall.net/resource/[id])')

export const ConvertRequestSchema = z.object({
  url: WordwallUrlSchema,
  attestOwnership: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm ownership of the content' })
  }).optional(),
})

export const BulkRequestSchema = z.object({
  urls: z.array(WordwallUrlSchema)
    .min(1, 'At least one URL required')
    .max(1000, 'Maximum 1000 URLs per request'),
  webhookUrl: z.string().url().optional(),
})

export const ApiKeyRequestSchema = z.object({
  name: z.string()
    .min(1, 'Key name required')
    .max(50, 'Key name too long')
    .regex(/^[a-zA-Z0-9\-_]+$/, 'Key name can only contain letters, numbers, hyphens, and underscores'),
})

// Sanitization helper
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// XSS detection
export function containsXss(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:/gi,
  ]
  return xssPatterns.some(pattern => pattern.test(input))
}
```

### 2. Apply to Convert API

**Update:** `/app/api/convert/route.ts`

```typescript
import { ConvertRequestSchema, containsXss } from '@/lib/validation/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const parsed = ConvertRequestSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request',
          details: parsed.error.issues.map(i => ({
            path: i.path.join('.'),
            message: i.message
          }))
        },
        { status: 400 }
      )
    }
    
    // Check for XSS in URL (paranoid check)
    if (containsXss(parsed.data.url)) {
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      )
    }
    
    // Continue with validated data
    const { url } = parsed.data
    // ...
  } catch (error) {
    // Handle JSON parse errors
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }
}
```

### 3. Apply to Bulk API

**Update:** `/app/api/bulk/route.ts`

```typescript
import { BulkRequestSchema, containsXss } from '@/lib/validation/schemas'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = BulkRequestSchema.safeParse(body)
  
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.issues },
      { status: 400 }
    )
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
  
  // Continue with validated data
}
```

---

## Test Cases

```typescript
// Test malformed URL
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"url":"not-a-url"}'
// Expected: 400 with Zod error

// Test non-Wordwall URL  
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"url":"https://google.com"}'
// Expected: 400 with pattern mismatch

// Test XSS attempt
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"url":"<script>alert(1)</script>"}'
// Expected: 400 invalid input

// Test valid request
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"url":"https://wordwall.net/resource/12345678"}'
// Expected: Success
```

---

## Acceptance Criteria

1. ✅ Zod schemas created at `/lib/validation/schemas.ts`
2. ✅ All API endpoints validate input with Zod
3. ✅ 400 response with detailed error messages for invalid input
4. ✅ XSS detection rejects malicious input
5. ✅ Valid Wordwall URLs continue to work

---

## Verification

```bash
# Run test suite for validation
npm test -- __tests__/validation/

# Manual test with malformed input
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"url":"https://evil.com/<script>alert(1)</script>"}'
# Expected: 400 error
```

---

## Deadline

**Jan 14, 11:30 PM**
