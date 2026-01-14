import { describe, test, expect } from 'vitest';
import flashcardAdapter from '../../lib/adapters/flashcard.adapter';

describe('Flashcard Adapter', () => {
    test('1. Handles empty cards list', () => {
        const data = { cards: [] };
        const result = flashcardAdapter(data);
        expect(result.cards).toHaveLength(0);
        expect(result.behaviour.enableRetry).toBe(true);
        expect(result.behaviour.randomCards).toBe(true);
    });

    test('2. Handles single text-only card', () => {
        const data = {
            cards: [{ front: 'Bonjour', back: 'Hello' }]
        };
        const result = flashcardAdapter(data);
        expect(result.cards).toHaveLength(1);
        expect(result.cards[0]).toEqual({
            text: 'Bonjour',
            answer: 'Hello',
            image: null,
            tip: ''
        });
    });

    test('3. Handles multiple text-only cards', () => {
        const data = {
            cards: [
                { front: 'Bonjour', back: 'Hello' },
                { front: 'Merci', back: 'Thank you' },
                { front: 'Au revoir', back: 'Goodbye' }
            ]
        };
        const result = flashcardAdapter(data);
        expect(result.cards).toHaveLength(3);
        expect(result.cards[1].text).toBe('Merci');
        expect(result.cards[1].answer).toBe('Thank you');
    });

    test('4. Handles card with image', () => {
        const data = {
            cards: [{ front: 'Apple', back: 'Fruit', image: 'apple.png' }]
        };
        const result = flashcardAdapter(data);
        expect(result.cards[0].image).toEqual({ path: 'apple.png' });
        expect(result.cards[0].text).toBe('Apple');
        expect(result.cards[0].answer).toBe('Fruit');
    });

    test('5. Handles multiple cards with images', () => {
        const data = {
            cards: [
                { front: 'A', back: 'a', image: 'a.png' },
                { front: 'B', back: 'b', image: 'b.png' }
            ]
        };
        const result = flashcardAdapter(data);
        expect(result.cards[0].image?.path).toBe('a.png');
        expect(result.cards[1].image?.path).toBe('b.png');
    });

    test('6. Handles mixed text and images', () => {
        const data = {
            cards: [
                { front: 'Text Only', back: 'Definition' },
                { front: 'Image Card', back: 'Desc', image: 'img.png' }
            ]
        };
        const result = flashcardAdapter(data);
        expect(result.cards[0].image).toBeNull();
        expect(result.cards[1].image?.path).toBe('img.png');
    });

    test('7. Handles empty strings in front/back', () => {
        const data = {
            cards: [{ front: '', back: '' }]
        };
        const result = flashcardAdapter(data);
        expect(result.cards[0].text).toBe('');
        expect(result.cards[0].answer).toBe('');
    });

    test('8. Handles special characters', () => {
        const data = {
            cards: [{ front: '10% & 20%', back: 'Symbol @ # !' }]
        };
        const result = flashcardAdapter(data);
        expect(result.cards[0].text).toBe('10% & 20%');
        expect(result.cards[0].answer).toBe('Symbol @ # !');
    });

    test('9. Handles long strings', () => {
        const longText = 'a'.repeat(1000);
        const data = {
            cards: [{ front: longText, back: 'Long' }]
        };
        const result = flashcardAdapter(data);
        expect(result.cards[0].text).toBe(longText);
    });

    test('10. Handles Unicode characters', () => {
        const data = {
            cards: [{ front: '🐶', back: 'Dog' }]
        };
        const result = flashcardAdapter(data);
        expect(result.cards[0].text).toBe('🐶');
    });

    test('11. Handles missing optional fields gracefully', () => {
        // @ts-ignore
        const data = { cards: [{ front: 'Only Front' }] };
        const result = flashcardAdapter(data);
        expect(result.cards[0].text).toBe('Only Front');
        expect(result.cards[0].answer).toBe('');
    });

    test('12. Handles missing card fields gracefully', () => {
        // @ts-ignore
        const data = { cards: [{}] };
        const result = flashcardAdapter(data);
        expect(result.cards[0].text).toBe('');
        expect(result.cards[0].answer).toBe('');
    });

    test('13. Handles duplicate cards', () => {
        const data = {
            cards: [
                { front: 'Same', back: 'Same' },
                { front: 'Same', back: 'Same' }
            ]
        };
        const result = flashcardAdapter(data);
        expect(result.cards).toHaveLength(2);
        expect(result.cards[0]).toEqual(result.cards[1]);
    });

    test('14. Handles a large number of cards', () => {
        const cards = Array.from({ length: 50 }, (_, i) => ({
            front: `F${i}`,
            back: `B${i}`
        }));
        const data = { cards };
        const result = flashcardAdapter(data);
        expect(result.cards).toHaveLength(50);
        expect(result.cards[49].text).toBe('F49');
    });

    test('15. Handles null/undefined data gracefully', () => {
        // @ts-ignore
        expect(flashcardAdapter(null).cards).toHaveLength(0);
        // @ts-ignore
        expect(flashcardAdapter({}).cards).toHaveLength(0);
    });
});
