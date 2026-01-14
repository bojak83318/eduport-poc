import { describe, it, expect } from 'vitest';
import anagramAdapter from '../../lib/adapters/anagram.adapter';

describe('anagramAdapter', () => {
    it('should convert a single word correctly', () => {
        const data = {
            words: [{ scrambled: 'ELPPA', answer: 'APPLE' }]
        };
        const result = anagramAdapter(data);
        expect(result.contentJson.textField).toBe('*APPLE*');
        expect(result.h5pJson.mainLibrary).toBe('H5P.DragWords');
    });

    it('should convert multiple words correctly', () => {
        const data = {
            words: [
                { scrambled: 'ELPPA', answer: 'APPLE' },
                { scrambled: 'NANAAB', answer: 'BANANA' }
            ]
        };
        const result = anagramAdapter(data);
        expect(result.contentJson.textField).toBe('*APPLE*\n*BANANA*');
    });

    it('should handle Unicode words (Spanish)', () => {
        const data = {
            words: [{ scrambled: 'NCIÓANC', answer: 'CANCIÓN' }]
        };
        const result = anagramAdapter(data);
        expect(result.contentJson.textField).toBe('*CANCIÓN*');
    });

    it('should handle Unicode words (Arabic)', () => {
        const data = {
            words: [{ scrambled: 'ب ا ت ك', answer: 'كتاب' }]
        };
        const result = anagramAdapter(data);
        expect(result.contentJson.textField).toBe('*كتاب*');
    });

    it('should handle words with spaces', () => {
        const data = {
            words: [{ scrambled: 'OT HO TGP', answer: 'HOT DOG' }]
        };
        const result = anagramAdapter(data);
        expect(result.contentJson.textField).toBe('*HOT DOG*');
    });

    it('should handle empty word list', () => {
        const data = { words: [] };
        const result = anagramAdapter(data);
        expect(result.contentJson.textField).toBe('');
    });

    it('should handle undefined words', () => {
        const data = {} as any;
        const result = anagramAdapter(data);
        expect(result.contentJson.textField).toBe('');
    });

    it('should set correct H5P metadata', () => {
        const data = { words: [{ scrambled: 'A', answer: 'A' }] };
        const result = anagramAdapter(data);
        expect(result.h5pJson.title).toBe('Anagram');
        expect(result.h5pJson.preloadedDependencies[0].machineName).toBe('H5P.DragWords');
        expect(result.h5pJson.preloadedDependencies[0].majorVersion).toBe(1);
        expect(result.h5pJson.preloadedDependencies[0].minorVersion).toBe(11);
    });

    it('should set correct behaviour settings', () => {
        const data = { words: [{ scrambled: 'A', answer: 'A' }] };
        const result = anagramAdapter(data);
        expect(result.contentJson.behaviour.enableRetry).toBe(true);
        expect(result.contentJson.behaviour.enableSolutionsButton).toBe(true);
    });

    it('should handle multiple words with different lengths', () => {
        const data = {
            words: [
                { scrambled: 'A', answer: 'A' },
                { scrambled: 'ABC', answer: 'ABC' },
                { scrambled: 'ABCDE', answer: 'ABCDE' }
            ]
        };
        const result = anagramAdapter(data);
        expect(result.contentJson.textField).toBe('*A*\n*ABC*\n*ABCDE*');
    });
});
