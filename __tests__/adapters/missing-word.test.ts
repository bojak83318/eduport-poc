import { describe, it, expect } from 'vitest';
import missingWordAdapter from '../../lib/adapters/missing-word.adapter';
import { ActivityPayload } from '../../lib/types';

describe('missingWordAdapter', () => {
    const createPayload = (items: any[]): ActivityPayload => ({
        id: 'test-id',
        url: 'https://wordwall.net/resource/123/test',
        title: 'Test Activity',
        template: 'MissingWord',
        content: { items },
        metadata: { language: 'en' }
    });

    it('Scenario 1: Handles a simple single blank', () => {
        const payload = createPayload([{ question: 'The capital of France is ___.', answer: 'Paris' }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>The capital of France is *Paris*.</p>');
    });

    it('Scenario 2: Handles multiple blanks in one sentence', () => {
        const payload = createPayload([{ question: '___ is the capital of ___.', options: ['Paris', 'France'] }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>*Paris* is the capital of *France*.</p>');
    });

    it('Scenario 3: Unicode support - Arabic blanks', () => {
        const payload = createPayload([{ question: 'عاصمة فرنسا هي ___.', answer: 'باريس' }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>عاصمة فرنسا هي *باريس*.</p>');
    });

    it('Scenario 4: Unicode support - Chinese blanks', () => {
        const payload = createPayload([{ question: '法国的首都是___。', answer: '巴黎' }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>法国的首都是*巴黎*。</p>');
    });

    it('Scenario 5: Special characters in answers - Ca$h', () => {
        const payload = createPayload([{ question: 'Money is often called ___.', answer: 'Ca$h' }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>Money is often called *Ca$h*.</p>');
    });

    it('Scenario 6: Special characters in answers - C++', () => {
        const payload = createPayload([{ question: 'A popular programming language is ___.', answer: 'C++' }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>A popular programming language is *C++*.</p>');
    });

    it('Scenario 7: Special characters in answers - #Hashtag', () => {
        const payload = createPayload([{ question: 'Social media uses ___.', answer: '#Hashtag' }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>Social media uses *#Hashtag*.</p>');
    });

    it('Scenario 8: Leading blank', () => {
        const payload = createPayload([{ question: '___ is the red planet.', answer: 'Mars' }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>*Mars* is the red planet.</p>');
    });

    it('Scenario 9: Trailing blank', () => {
        const payload = createPayload([{ question: 'The largest ocean is the ___', answer: 'Pacific' }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>The largest ocean is the *Pacific*</p>');
    });

    it('Scenario 10: Adjacent blanks', () => {
        const payload = createPayload([{ question: '___ ___ are best friends.', options: ['Tom', 'Jerry'] }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>*Tom* *Jerry* are best friends.</p>');
    });

    it('Scenario 11: Blank with special characters around it', () => {
        const payload = createPayload([{ question: 'Is (___) the answer?', answer: 'Yes' }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>Is (*Yes*) the answer?</p>');
    });

    it('Scenario 12: Multiple items', () => {
        const payload = createPayload([
            { question: '1 + 1 = ___', answer: '2' },
            { question: '2 + 2 = ___', answer: '4' }
        ]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions).toHaveLength(2);
        expect(result.contentJson.questions[0]).toBe('<p>1 + 1 = *2*</p>');
        expect(result.contentJson.questions[1]).toBe('<p>2 + 2 = *4*</p>');
    });

    it('Scenario 13: Answers with spaces', () => {
        const payload = createPayload([{ question: 'The capital of UK is ___.', answer: 'London City' }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>The capital of UK is *London City*.</p>');
    });

    it('Scenario 14: Blanks with different number of underscores (not ___ but still should work if pattern matched)', () => {
        // Note: The specification explicitly says /___/g, so ____ should become _*match*
        const payload = createPayload([{ question: 'The ____ is blue.', answer: 'sky' }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>The *sky*_ is blue.</p>');
    });

    it('Scenario 15: No blanks in question', () => {
        const payload = createPayload([{ question: 'The sky is blue.', answer: 'sky' }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>The sky is blue.</p>');
    });

    it('Scenario 16: Empty question', () => {
        const payload = createPayload([{ question: '', answer: 'empty' }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p></p>');
    });

    it('Scenario 17: Answer in "term" and "definition" fields', () => {
        const payload = createPayload([{ term: 'The cat ___.', definition: 'meows' }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>The cat *meows*.</p>');
    });

    it('Scenario 18: Answer in "correctAnswer" field', () => {
        const payload = createPayload([{ question: '2 * 2 = ___', correctAnswer: '4' }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>2 * 2 = *4*</p>');
    });

    it('Scenario 19: Many blanks in one sentence', () => {
        const payload = createPayload([{ question: '___ + ___ = ___', options: ['1', '2', '3'] }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>*1* + *2* = *3*</p>');
    });

    it('Scenario 20: Answers with punctuation', () => {
        const payload = createPayload([{ question: 'He said ___.', answer: '"Hello!"' }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>He said *"Hello!"*.</p>');
    });

    it('Scenario 21: Unicode Arabic with mixed punctuation', () => {
        const payload = createPayload([{ question: 'هل ___ هي العاصمة؟', answer: 'الرياض' }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>هل *الرياض* هي العاصمة؟</p>');
    });

    it('Scenario 22: Answers with math symbols', () => {
        const payload = createPayload([{ question: 'Solve: ___', answer: 'x > 5' }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>Solve: *x > 5*</p>');
    });

    it('Scenario 23: Blank at both ends', () => {
        const payload = createPayload([{ question: '___ and ___', options: ['Black', 'White'] }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>*Black* and *White*</p>');
    });

    it('Scenario 24: Sentence with only a blank', () => {
        const payload = createPayload([{ question: '___', answer: 'Everything' }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>*Everything*</p>');
    });

    it('Scenario 25: Escaping HTML-like characters (though specify said wrap in p, we should check if & is handled if we added escaping)', () => {
        // Currently we don't escape, but checking what it does
        const payload = createPayload([{ question: 'A < B is ___', answer: 'True' }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>A < B is *True*</p>');
    });

    it('Scenario 26: Multiple sentences in one item (H5P handling)', () => {
        const payload = createPayload([{ question: 'Blue is ___. Red is ___.', options: ['cool', 'hot'] }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>Blue is *cool*. Red is *hot*.</p>');
    });

    it('Scenario 27: Extra answers provided', () => {
        const payload = createPayload([{ question: 'One blank ___', options: ['Ans1', 'Ans2'] }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>One blank *Ans1*</p>');
    });

    it('Scenario 28: Missing answers (undefined in index)', () => {
        const payload = createPayload([{ question: 'Two blanks ___ ___', options: ['OnlyOne'] }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>Two blanks *OnlyOne* *undefined*</p>');
    });

    it('Scenario 29: Blank with underscore and other text', () => {
        const payload = createPayload([{ question: 'Select ___ (Choice)', answer: 'Option A' }]);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions[0]).toBe('<p>Select *Option A* (Choice)</p>');
    });

    it('Scenario 30: Large number of items', () => {
        const items = Array.from({ length: 15 }, (_, i) => ({ question: `Q${i} ___`, answer: `A${i}` }));
        const payload = createPayload(items);
        const result = missingWordAdapter(payload);
        expect(result.contentJson.questions).toHaveLength(15);
        expect(result.contentJson.questions[14]).toBe('<p>Q14 *A14*</p>');
    });
});
