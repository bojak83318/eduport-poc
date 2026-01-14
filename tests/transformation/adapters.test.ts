import { describe, it, expect } from 'vitest';
import { GroupSortAdapter } from '../../lib/transformation/group-sort-adapter';
import { MissingWordAdapter } from '../../lib/transformation/missing-word-adapter';
import { CrosswordAdapter } from '../../lib/transformation/crossword-adapter';
import { ActivityPayload } from '../../lib/types';

describe('GroupSortAdapter', () => {
    const adapter = new GroupSortAdapter();

    it('should be able to convert GroupSort templates', () => {
        expect(adapter.canConvert('GroupSort')).toBe(true);
        expect(adapter.canConvert('Unjumble')).toBe(true);
        expect(adapter.canConvert('Quiz')).toBe(false);
    });

    it('should convert GroupSort payload to H5P.DragText', () => {
        const payload: ActivityPayload = {
            id: '123',
            url: 'http://test.com',
            title: 'Test Group Sort',
            template: 'GroupSort',
            content: {
                items: [
                    { question: 'Fruits', options: ['Apple', 'Banana'] },
                    { question: 'Vegetables', options: ['Carrot'] }
                ]
            }
        };

        const result = adapter.convert(payload);
        expect(result.h5pJson.mainLibrary).toBe('H5P.DragText');
        expect(result.contentJson.textField).toContain('<strong>Fruits</strong>: *Apple* *Banana*');
        expect(result.contentJson.textField).toContain('<strong>Vegetables</strong>: *Carrot*');
    });

    it('should handle alternative data structure (Item -> Group)', () => {
        const payload: ActivityPayload = {
            id: '124',
            url: 'http://test.com',
            title: 'Test Group Sort B',
            template: 'GroupSort',
            content: {
                items: [
                    { question: 'Apple', answer: 'Fruits' },
                    { question: 'Banana', answer: 'Fruits' },
                    { question: 'Carrot', answer: 'Vegetables' }
                ]
            }
        };

        const result = adapter.convert(payload);
        expect(result.contentJson.textField).toContain('<strong>Fruits</strong>: *Apple* *Banana*');
        expect(result.contentJson.textField).toContain('<strong>Vegetables</strong>: *Carrot*');
    });
});

describe('MissingWordAdapter', () => {
    const adapter = new MissingWordAdapter();

    it('should be able to convert MissingWord templates', () => {
        expect(adapter.canConvert('MissingWord')).toBe(true);
        expect(adapter.canConvert('Cloze')).toBe(true);
    });

    it('should convert MissingWord payload to H5P.Blanks', () => {
        const payload: ActivityPayload = {
            id: '223',
            url: 'http://test.com',
            title: 'Test Missing Word',
            template: 'MissingWord',
            content: {
                items: [
                    { question: 'The capital of France is ...', answer: 'Paris' },
                    { question: '2 + 2 = _', answer: '4' },
                    { question: 'Sun is hot', answer: 'very' } // heuristic append
                ]
            }
        };

        const result = adapter.convert(payload);
        expect(result.h5pJson.mainLibrary).toBe('H5P.Blanks');
        const questions = result.contentJson.questions;
        expect(questions[0]).toContain('The capital of France is *Paris*');
        expect(questions[1]).toContain('2 + 2 = *4*');
        expect(questions[2]).toContain('Sun is hot *very*');
    });
});

describe('CrosswordAdapter', () => {
    const adapter = new CrosswordAdapter();

    it('should be able to convert Crossword templates', () => {
        expect(adapter.canConvert('Crossword')).toBe(true);
    });

    it('should convert Crossword payload to H5P.Crossword', () => {
        const payload: ActivityPayload = {
            id: '323',
            url: 'http://test.com',
            title: 'Test Crossword',
            template: 'Crossword',
            content: {
                items: [
                    { question: 'Fruit', answer: 'APPLE' },
                    { question: 'Color', answer: 'RED' }
                ]
            }
        };

        const result = adapter.convert(payload);
        expect(result.h5pJson.mainLibrary).toBe('H5P.Crossword');
        const words = result.contentJson.words;
        expect(words).toHaveLength(2);
        expect(words[0].answer).toBe('APPLE');
        expect(words[0].clue).toBe('Fruit');
        // Check diagonal placement strategy
        expect(words[1].x).toBe(words[0].x + 1);
        expect(words[1].y).toBe(words[0].y + 2);
    });
});
