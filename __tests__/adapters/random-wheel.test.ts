import { describe, it, expect } from 'vitest';
import randomWheelAdapter from '../../lib/adapters/random-wheel.adapter';

describe('randomWheelAdapter', () => {
    it('1. should convert basic segments with multiple options', () => {
        const data = {
            segments: [{ text: 'Option A' }, { text: 'Option B' }, { text: 'Option C' }],
        };
        const result = randomWheelAdapter(data);
        expect(result.h5pJson.mainLibrary).toBe('H5P.DragText');
        expect(result.contentJson.textField).toBe('*Option A*\n*Option B*\n*Option C*');
    });

    it('2. should handle a single segment', () => {
        const data = {
            segments: [{ text: 'Single Option' }],
        };
        const result = randomWheelAdapter(data);
        expect(result.contentJson.textField).toBe('*Single Option*');
    });

    it('3. should handle an empty segments array', () => {
        const data = { segments: [] };
        const result = randomWheelAdapter(data);
        expect(result.contentJson.textField).toBe('');
    });

    it('4. should handle missing segments property', () => {
        const data = {} as any;
        const result = randomWheelAdapter(data);
        expect(result.contentJson.textField).toBe('');
    });

    it('5. should handle special characters in segment text', () => {
        const data = {
            segments: [{ text: 'Option & < >' }, { text: 'Option "quoted"' }],
        };
        const result = randomWheelAdapter(data);
        expect(result.contentJson.textField).toBe('*Option & < >*\n*Option "quoted"*');
    });

    it('6. should handle Unicode and Emojis in segment text', () => {
        const data = {
            segments: [{ text: '🍎 Apple' }, { text: 'العربية' }],
        };
        const result = randomWheelAdapter(data);
        expect(result.contentJson.textField).toBe('*🍎 Apple*\n*العربية*');
    });

    it('7. should handle very long segment text', () => {
        const longText = 'A'.repeat(500);
        const data = {
            segments: [{ text: longText }],
        };
        const result = randomWheelAdapter(data);
        expect(result.contentJson.textField).toBe(`*${longText}*`);
    });

    it('8. should handle numeric segment text', () => {
        const data = {
            segments: [{ text: 123 as any }, { text: 45.67 as any }],
        };
        const result = randomWheelAdapter(data);
        expect(result.contentJson.textField).toBe('*123*\n*45.67*');
    });

    it('9. should handle whitespace in segment text', () => {
        const data = {
            segments: [{ text: '  Leading Space' }, { text: 'Trailing Space  ' }],
        };
        const result = randomWheelAdapter(data);
        expect(result.contentJson.textField).toBe('*  Leading Space*\n*Trailing Space  *');
    });

    it('10. should handle null/undefined data/segments gracefully', () => {
        expect(randomWheelAdapter(null as any).contentJson.textField).toBe('');
        expect(randomWheelAdapter({ segments: null } as any).contentJson.textField).toBe('');
        expect(randomWheelAdapter({ segments: [null, undefined] } as any).contentJson.textField).toBe('**\n**');
    });
});
