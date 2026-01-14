import { describe, test, expect } from 'vitest';
import wordsearchAdapter from '../../lib/adapters/wordsearch.adapter';

describe('Wordsearch Adapter', () => {
    test('handles basic word list conversion', () => {
        const data = {
            words: ['APPLE', 'BANANA', 'CHERRY']
        };
        const result = wordsearchAdapter(data);
        expect(result.h5pJson.mainLibrary).toBe('H5P.WordSearch');
        expect(result.contentJson.wordList).toBe('APPLE, BANANA, CHERRY');
        expect(result.contentJson.taskDescription).toBe('Find the hidden words in the grid');
    });

    test('handles empty word list', () => {
        const data = { words: [] };
        const result = wordsearchAdapter(data);
        expect(result.contentJson.wordList).toBe('');
    });

    test('handles large word list', () => {
        const words = Array.from({ length: 50 }, (_, i) => `WORD${i}`);
        const data = { words };
        const result = wordsearchAdapter(data);
        expect(result.contentJson.wordList.split(', ').length).toBe(50);
    });

    test('handles words with special characters and spaces', () => {
        const data = {
            words: ['HOT DOG', 'ICE-CREAM', 'P&J']
        };
        const result = wordsearchAdapter(data);
        expect(result.contentJson.wordList).toBe('HOT DOG, ICE-CREAM, P&J');
    });

    test('uses activity title from data', () => {
        const data = {
            title: 'Fruit Search',
            words: ['APPLE']
        };
        const result = wordsearchAdapter(data);
        expect(result.h5pJson.title).toBe('Fruit Search');
    });

    test('uses language from metadata', () => {
        const data = {
            metadata: { language: 'fr' },
            words: ['POMME']
        };
        const result = wordsearchAdapter(data);
        expect(result.h5pJson.language).toBe('fr');
    });

    test('includes required H5P properties', () => {
        const data = { words: ['TEST'] };
        const result = wordsearchAdapter(data);
        expect(result.h5pJson.embedTypes).toEqual(['iframe']);
        expect(result.h5pJson.preloadedDependencies).toContainEqual(
            { machineName: 'H5P.WordSearch', majorVersion: 1, minorVersion: 4 }
        );
    });

    test('correctly maps ActivityPayload content.items format', () => {
        const data = {
            content: {
                items: ['CAT', 'DOG', 'BIRD']
            }
        };
        const result = wordsearchAdapter(data);
        expect(result.contentJson.wordList).toBe('CAT, DOG, BIRD');
    });

    test('sets default behaviour correctly', () => {
        const data = { words: ['TEST'] };
        const result = wordsearchAdapter(data);
        expect(result.contentJson.behaviour.enableRetry).toBe(true);
        expect(result.contentJson.behaviour.showSolutionsButton).toBe(true);
    });

    test('includes localization strings', () => {
        const data = { words: ['TEST'] };
        const result = wordsearchAdapter(data);
        expect(result.contentJson.l10n.found).toBeDefined();
        expect(result.contentJson.l10n.tryAgain).toBeDefined();
    });
});
