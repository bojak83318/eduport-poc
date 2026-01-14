import { describe, test, expect } from 'vitest';
import matchupAdapter from '../../lib/adapters/matchup.adapter';

describe('MatchUp Adapter', () => {
    test('1. Handles empty pairs list', () => {
        const data = { pairs: [] };
        const result = matchupAdapter(data);
        expect(result.cards).toHaveLength(0);
        expect(result.behaviour.allowRetry).toBe(true);
    });

    test('2. Handles single text-only pair', () => {
        const data = {
            pairs: [{ left: 'Dog', right: 'Canine' }]
        };
        const result = matchupAdapter(data);
        expect(result.cards).toHaveLength(1);
        expect(result.cards[0]).toEqual({
            image: null,
            text: 'Dog',
            matchAlt: 'Canine'
        });
    });

    test('3. Handles multiple text-only pairs', () => {
        const data = {
            pairs: [
                { left: 'Dog', right: 'Canine' },
                { left: 'Cat', right: 'Feline' },
                { left: 'Bird', right: 'Avian' }
            ]
        };
        const result = matchupAdapter(data);
        expect(result.cards).toHaveLength(3);
        expect(result.cards[1].text).toBe('Cat');
        expect(result.cards[1].matchAlt).toBe('Feline');
    });

    test('4. Handles single pair with image', () => {
        const data = {
            pairs: [{ left: 'Apple', right: 'Fruit', leftImage: 'apple.png' }]
        };
        const result = matchupAdapter(data);
        expect(result.cards[0].image).toEqual({ path: 'apple.png' });
        expect(result.cards[0].text).toBe('Apple');
    });

    test('5. Handles multiple pairs with images', () => {
        const data = {
            pairs: [
                { left: 'A', right: 'a', leftImage: 'a.png' },
                { left: 'B', right: 'b', leftImage: 'b.png' }
            ]
        };
        const result = matchupAdapter(data);
        expect(result.cards[0].image?.path).toBe('a.png');
        expect(result.cards[1].image?.path).toBe('b.png');
    });

    test('6. Handles mixed text and images', () => {
        const data = {
            pairs: [
                { left: 'Text Only', right: 'Definition' },
                { left: 'Image Pair', right: 'Desc', leftImage: 'img.png' }
            ]
        };
        const result = matchupAdapter(data);
        expect(result.cards[0].image).toBeNull();
        expect(result.cards[1].image?.path).toBe('img.png');
    });

    test('7. Handles empty strings in text', () => {
        const data = {
            pairs: [{ left: '', right: '' }]
        };
        const result = matchupAdapter(data);
        expect(result.cards[0].text).toBe('');
        expect(result.cards[0].matchAlt).toBe('');
    });

    test('8. Handles special characters in text', () => {
        const data = {
            pairs: [{ left: '10% & 20%', right: 'Symbol @ # !' }]
        };
        const result = matchupAdapter(data);
        expect(result.cards[0].text).toBe('10% & 20%');
        expect(result.cards[0].matchAlt).toBe('Symbol @ # !');
    });

    test('9. Handles large strings in text', () => {
        const longText = 'a'.repeat(1000);
        const data = {
            pairs: [{ left: longText, right: 'Long' }]
        };
        const result = matchupAdapter(data);
        expect(result.cards[0].text).toBe(longText);
    });

    test('10. Handles Unicode characters (emojis)', () => {
        const data = {
            pairs: [{ left: '🐶', right: 'Dog' }]
        };
        const result = matchupAdapter(data);
        expect(result.cards[0].text).toBe('🐶');
    });

    test('11. Handles missing optional fields gracefully', () => {
        // @ts-ignore
        const data = { pairs: [{ left: 'Only Left' }] };
        const result = matchupAdapter(data);
        expect(result.cards[0].text).toBe('Only Left');
        expect(result.cards[0].matchAlt).toBe('');
    });

    test('12. Handles null in images (simulated)', () => {
        const data = {
            pairs: [{ left: 'Test', right: 'Test', leftImage: undefined }]
        };
        const result = matchupAdapter(data);
        expect(result.cards[0].image).toBeNull();
    });

    test('13. Handles duplicate pairs', () => {
        const data = {
            pairs: [
                { left: 'Same', right: 'Match' },
                { left: 'Same', right: 'Match' }
            ]
        };
        const result = matchupAdapter(data);
        expect(result.cards).toHaveLength(2);
        expect(result.cards[0]).toEqual(result.cards[1]);
    });

    test('14. Handles a large number of pairs (e.g., 20)', () => {
        const pairs = Array.from({ length: 20 }, (_, i) => ({
            left: `L${i}`,
            right: `R${i}`
        }));
        const data = { pairs };
        const result = matchupAdapter(data);
        expect(result.cards).toHaveLength(20);
        expect(result.cards[19].text).toBe('L19');
    });

    test('15. Handles pair with only image (empty text)', () => {
        const data = {
            pairs: [{ left: '', right: 'Img Only', leftImage: 'only.png' }]
        };
        const result = matchupAdapter(data);
        expect(result.cards[0].image?.path).toBe('only.png');
        expect(result.cards[0].text).toBe('');
    });

    test('16. Handles pair with only right text (empty left text)', () => {
        const data = {
            pairs: [{ left: '', right: 'Right Only' }]
        };
        const result = matchupAdapter(data);
        expect(result.cards[0].text).toBe('');
        expect(result.cards[0].matchAlt).toBe('Right Only');
    });

    test('17. Handles both image and text accurately', () => {
        const data = {
            pairs: [{ left: 'Both', right: 'Yes', leftImage: 'both.png' }]
        };
        const result = matchupAdapter(data);
        expect(result.cards[0].text).toBe('Both');
        expect(result.cards[0].image?.path).toBe('both.png');
        expect(result.cards[0].matchAlt).toBe('Yes');
    });

    test('18. Image path is preserved correctly', () => {
        const complexPath = 'https://example.com/images/path/to/img.jpg?v=1';
        const data = {
            pairs: [{ left: 'Complex', right: 'Path', leftImage: complexPath }]
        };
        const result = matchupAdapter(data);
        expect(result.cards[0].image?.path).toBe(complexPath);
    });

    test('19. Default behaviour flags are set correctly', () => {
        const data = { pairs: [] };
        const result = matchupAdapter(data);
        expect(result.behaviour).toEqual({
            allowRetry: true,
            useGrid: true,
            cardsToUse: 'all'
        });
    });

    test('20. Complete valid activity mapping', () => {
        const data = {
            pairs: [
                { left: "Paris", right: "France", leftImage: "paris.jpg" },
                { left: "Berlin", right: "Germany", leftImage: "berlin.jpg" },
                { left: "London", right: "UK", leftImage: "london.jpg" }
            ]
        };
        const result = matchupAdapter(data);
        expect(result.cards).toHaveLength(3);
        expect(result.cards[0].text).toBe("Paris");
        expect(result.cards[0].matchAlt).toBe("France");
        expect(result.cards[0].image?.path).toBe("paris.jpg");
    });

    test('21. Handles standard ActivityPayload structure', () => {
        const data = {
            content: {
                items: [
                    { term: 'Dog', definition: 'Canine', image: 'dog.jpg' },
                    { question: 'Cat', answer: 'Feline' }
                ]
            }
        };
        const result = matchupAdapter(data);
        expect(result.cards).toHaveLength(2);
        expect(result.cards[0].text).toBe('Dog');
        expect(result.cards[0].matchAlt).toBe('Canine');
        expect(result.cards[0].image?.path).toBe('dog.jpg');
        expect(result.cards[1].text).toBe('Cat');
        expect(result.cards[1].matchAlt).toBe('Feline');
    });
});
