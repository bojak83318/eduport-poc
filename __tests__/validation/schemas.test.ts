import { describe, it, expect } from 'vitest';
import { ConvertRequestSchema, BulkRequestSchema, containsXss } from '../../lib/validation/schemas';

describe('Validation Schemas', () => {
    describe('ConvertRequestSchema', () => {
        it('validates correct Wordwall URL', () => {
            const input = { url: 'https://wordwall.net/resource/12345678' };
            const result = ConvertRequestSchema.safeParse(input);
            expect(result.success).toBe(true);
        });

        it('rejects malformed URL', () => {
            const input = { url: 'not-a-url' };
            const result = ConvertRequestSchema.safeParse(input);
            expect(result.success).toBe(false);
        });

        it('rejects non-Wordwall URL', () => {
            const input = { url: 'https://google.com' };
            const result = ConvertRequestSchema.safeParse(input);
            expect(result.success).toBe(false);
        });

        it('rejects if attestOwnership is false', () => {
            const input = { url: 'https://wordwall.net/resource/123', attestOwnership: false };
            const result = ConvertRequestSchema.safeParse(input);
            expect(result.success).toBe(false);
        });

        it('validates if attestOwnership is true', () => {
            const input = { url: 'https://wordwall.net/resource/123', attestOwnership: true };
            const result = ConvertRequestSchema.safeParse(input);
            expect(result.success).toBe(true);
        });
    });

    describe('BulkRequestSchema', () => {
        it('validates list of URLs', () => {
            const input = {
                urls: ['https://wordwall.net/resource/123', 'https://wordwall.net/resource/456']
            };
            const result = BulkRequestSchema.safeParse(input);
            expect(result.success).toBe(true);
        });

        it('rejects empty list', () => {
            const input = { urls: [] };
            const result = BulkRequestSchema.safeParse(input);
            expect(result.success).toBe(false);
        });

        it('rejects invalid URL in list', () => {
            const input = {
                urls: ['https://wordwall.net/resource/123', 'invalid-url']
            };
            const result = BulkRequestSchema.safeParse(input);
            expect(result.success).toBe(false);
        });
    });

    describe('containsXss', () => {
        it('detects script tags', () => {
            expect(containsXss('<script>alert(1)</script>')).toBe(true);
        });

        it('detects javascript: protocol', () => {
            expect(containsXss('javascript:alert(1)')).toBe(true);
        });

        it('detects on[event] attributes', () => {
            expect(containsXss('<img src=x onerror=alert(1)>')).toBe(true);
        });

        it('detects valid input as safe', () => {
            expect(containsXss('https://wordwall.net/resource/123')).toBe(false);
        });
    });
});
