import { describe, test, expect } from 'vitest';
import unjumbleAdapter from '../../lib/adapters/unjumble.adapter';

describe('Unjumble Adapter', () => {
    test('1. Handles single sentence without punctuation', () => {
        const data = {
            sentences: [
                { jumbled: ['cat', 'the', 'sat'], correct: 'the cat sat' }
            ]
        };
        const result = unjumbleAdapter(data);
        expect(result.contentJson.textField).toBe('*the* *cat* *sat*');
    });

    test('2. Handles multiple sentences', () => {
        const data = {
            sentences: [
                { jumbled: ['the', 'cat'], correct: 'the cat' },
                { jumbled: ['the', 'dog'], correct: 'the dog' }
            ]
        };
        const result = unjumbleAdapter(data);
        expect(result.contentJson.textField).toBe('*the* *cat*\n\n*the* *dog*');
    });

    test('3. Preserves punctuation at the end of a sentence', () => {
        const data = {
            sentences: [
                { jumbled: ['cat', 'sat', 'the.'], correct: 'the cat sat.' }
            ]
        };
        const result = unjumbleAdapter(data);
        expect(result.contentJson.textField).toBe('*the* *cat* *sat.*');
    });

    test('4. Handles internal punctuation (commas)', () => {
        const data = {
            sentences: [
                { jumbled: ['the', 'cat,', 'and', 'dog'], correct: 'the cat, and dog' }
            ]
        };
        const result = unjumbleAdapter(data);
        expect(result.contentJson.textField).toBe('*the* *cat,* *and* *dog*');
    });

    test('5. Handles empty sentences array', () => {
        const data = { sentences: [] };
        const result = unjumbleAdapter(data);
        expect(result.contentJson.textField).toBe('');
    });

    test('6. Handles Unicode characters (Arabic)', () => {
        const data = {
            sentences: [
                { jumbled: ['القط', 'جلس'], correct: 'القط جلس' }
            ]
        };
        const result = unjumbleAdapter(data);
        expect(result.contentJson.textField).toBe('*القط* *جلس*');
    });

    test('7. Handles special characters in words', () => {
        const data = {
            sentences: [
                { jumbled: ['10%', 'off'], correct: '10% off' }
            ]
        };
        const result = unjumbleAdapter(data);
        expect(result.contentJson.textField).toBe('*10%* *off*');
    });

    test('8. Handles single word sentence', () => {
        const data = {
            sentences: [
                { jumbled: ['Hello'], correct: 'Hello' }
            ]
        };
        const result = unjumbleAdapter(data);
        expect(result.contentJson.textField).toBe('*Hello*');
    });

    test('9. Handles mixed casing', () => {
        const data = {
            sentences: [
                { jumbled: ['THE', 'cat', 'SAT'], correct: 'THE cat SAT' }
            ]
        };
        const result = unjumbleAdapter(data);
        expect(result.contentJson.textField).toBe('*THE* *cat* *SAT*');
    });

    test('10. Handles sentences with extra spaces', () => {
        const data = {
            sentences: [
                { jumbled: ['the', 'cat'], correct: '  the   cat  ' }
            ]
        };
        const result = unjumbleAdapter(data);
        expect(result.contentJson.textField).toBe('*the* *cat*');
    });
});
