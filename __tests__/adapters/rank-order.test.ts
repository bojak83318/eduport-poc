import { describe, it, expect } from 'vitest';
import rankOrderAdapter from '../../lib/adapters/rank-order.adapter';

describe('rankOrderAdapter', () => {
    it('Scenario 1: Handles simple string array', () => {
        const data = {
            items: ['First', 'Second', 'Third']
        };
        const result = rankOrderAdapter(data);
        expect(result.contentJson.textField).toBe('*First* *Second* *Third*');
        expect(result.h5pJson.mainLibrary).toBe('H5P.DragText');
    });

    it('Scenario 2: Handles ActivityPayload structure', () => {
        const data = {
            title: 'My Custom Rank',
            content: {
                items: [
                    { term: 'A' },
                    { term: 'B' },
                    { term: 'C' }
                ]
            }
        };
        const result = rankOrderAdapter(data);
        expect(result.contentJson.textField).toBe('*A* *B* *C*');
        expect(result.h5pJson.title).toBe('My Custom Rank');
    });

    it('Scenario 3: Handles mix of fields in items', () => {
        const data = {
            content: {
                items: [
                    { question: 'Step 1' },
                    { answer: 'Step 2' },
                    { definition: 'Step 3' }
                ]
            }
        };
        const result = rankOrderAdapter(data);
        expect(result.contentJson.textField).toBe('*Step 1* *Step 2* *Step 3*');
    });

    it('Scenario 4: Handles missing data gracefully', () => {
        const result = rankOrderAdapter({});
        expect(result.contentJson.textField).toBe('');
    });

    it('Scenario 5: Handles empty items array', () => {
        const data = { items: [] };
        const result = rankOrderAdapter(data);
        expect(result.contentJson.textField).toBe('');
    });

    it('Scenario 6: Handles Unicode/Arabic content', () => {
        const data = {
            items: ['الأول', 'الثاني', 'الثالث']
        };
        const result = rankOrderAdapter(data);
        expect(result.contentJson.textField).toBe('*الأول* *الثاني* *الثالث*');
    });

    it('Scenario 7: Handles special characters in items', () => {
        const data = {
            items: ['Step 1: Start!', 'Step 2: $ave', 'Step 3: Finish #1']
        };
        const result = rankOrderAdapter(data);
        expect(result.contentJson.textField).toBe('*Step 1: Start!* *Step 2: $ave* *Step 3: Finish #1*');
    });

    it('Scenario 8: Filters out empty items', () => {
        const data = {
            content: {
                items: [
                    { term: 'A' },
                    { term: '' },
                    { term: 'C' }
                ]
            }
        };
        const result = rankOrderAdapter(data);
        expect(result.contentJson.textField).toBe('*A* *C*');
    });

    it('Scenario 9: Large item list', () => {
        const data = {
            items: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
        };
        const result = rankOrderAdapter(data);
        expect(result.contentJson.textField).toBe('*1* *2* *3* *4* *5* *6* *7* *8* *9* *10*');
    });

    it('Scenario 10: Preserves language from metadata', () => {
        const data = {
            items: ['A', 'B'],
            metadata: { language: 'fr' }
        };
        const result = rankOrderAdapter(data);
        expect(result.h5pJson.language).toBe('fr');
    });
});
