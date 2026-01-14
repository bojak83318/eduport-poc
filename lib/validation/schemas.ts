import { z } from 'zod'

// Wordwall URL pattern
const wordwallUrlPattern = /^https:\/\/wordwall\.net\/resource\/\d+$/

export const WordwallUrlSchema = z.string()
    .url('Must be a valid URL')
    // We allow some flexibility but basic strictness on structure
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
