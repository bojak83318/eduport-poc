import { describe, it, expect } from 'vitest';
import trueFalseAdapter from '../../lib/adapters/true-false.adapter';

describe('trueFalseAdapter', () => {
    it('should convert basic 2 statements', () => {
        const data = {
            statements: [
                { text: 'The sky is blue', answer: true },
                { text: 'Fish can fly', answer: false }
            ]
        };
        const result = trueFalseAdapter(data as any);

        expect(result.h5pJson.mainLibrary).toBe('H5P.QuestionSet');
        expect(result.contentJson.questions).toHaveLength(2);

        // Check first question
        const q1 = result.contentJson.questions[0];
        expect(q1.library).toBe('H5P.MultiChoice 1.16');
        expect(q1.params.question).toContain('The sky is blue');
        expect(q1.params.answers[0]).toEqual({ text: 'True', correct: true });
        expect(q1.params.answers[1]).toEqual({ text: 'False', correct: false });

        // Check second question
        const q2 = result.contentJson.questions[1];
        expect(q2.params.question).toContain('Fish can fly');
        expect(q2.params.answers[0]).toEqual({ text: 'True', correct: false });
        expect(q2.params.answers[1]).toEqual({ text: 'False', correct: true });
    });

    it('should handle single statement', () => {
        const data = {
            statements: [{ text: '1+1=2', answer: true }]
        };
        const result = trueFalseAdapter(data as any);
        expect(result.contentJson.questions).toHaveLength(1);
        expect(result.contentJson.questions[0].params.answers[0].correct).toBe(true);
    });

    it('should handle multiple statements (5+)', () => {
        const data = {
            statements: [
                { text: 'Q1', answer: true },
                { text: 'Q2', answer: false },
                { text: 'Q3', answer: true },
                { text: 'Q4', answer: false },
                { text: 'Q5', answer: true }
            ]
        };
        const result = trueFalseAdapter(data as any);
        expect(result.contentJson.questions).toHaveLength(5);
    });

    it('should handle all True answers', () => {
        const data = {
            statements: [
                { text: 'T1', answer: true },
                { text: 'T2', answer: true }
            ]
        };
        const result = trueFalseAdapter(data as any);
        expect(result.contentJson.questions[0].params.answers[0].correct).toBe(true);
        expect(result.contentJson.questions[1].params.answers[0].correct).toBe(true);
    });

    it('should handle all False answers', () => {
        const data = {
            statements: [
                { text: 'F1', answer: false },
                { text: 'F2', answer: false }
            ]
        };
        const result = trueFalseAdapter(data as any);
        expect(result.contentJson.questions[0].params.answers[1].correct).toBe(true);
        expect(result.contentJson.questions[1].params.answers[1].correct).toBe(true);
    });

    it('should handle special characters in text', () => {
        const data = {
            statements: [{ text: 'Is 5 > 3 & 2 < 4?', answer: true }]
        };
        const result = trueFalseAdapter(data as any);
        expect(result.contentJson.questions[0].params.question).toContain('Is 5 > 3 & 2 < 4?');
    });

    it('should handle empty text gracefully', () => {
        const data = {
            statements: [{ text: '', answer: true }]
        };
        const result = trueFalseAdapter(data as any);
        expect(result.contentJson.questions[0].params.question).toBe('<p></p>');
    });

    it('should handle null/missing statements gracefully', () => {
        const data = {};
        const result = trueFalseAdapter(data as any);
        expect(result.contentJson.questions).toEqual([]);
    });

    it('should have correct metadata and dependencies', () => {
        const data = { title: 'Test TF', metadata: { language: 'fr' }, statements: [] };
        const result = trueFalseAdapter(data as any);

        expect(result.h5pJson.title).toBe('Test TF');
        expect(result.h5pJson.language).toBe('fr');
        expect(result.h5pJson.preloadedDependencies).toContainEqual({
            machineName: 'H5P.MultiChoice', majorVersion: 1, minorVersion: 16
        });
    });

    it('should have correct pass percentage and progress type', () => {
        const data = { statements: [] };
        const result = trueFalseAdapter(data as any);
        expect(result.contentJson.passPercentage).toBe(50);
        expect(result.contentJson.progressType).toBe('dots');
    });
});
