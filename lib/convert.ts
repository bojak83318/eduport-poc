import { WordwallScraper } from './scraping/wordwall-scraper';
import groupSortAdapter from './adapters/group-sort.adapter';
import missingWordAdapter from './adapters/missing-word.adapter';
import crosswordAdapter from './adapters/crossword.adapter';
import matchupAdapter from './adapters/matchup.adapter';
import flashcardAdapter from './adapters/flashcard.adapter';
import rankOrderAdapter from './adapters/rank-order.adapter';

import quizAdapter from './adapters/quiz.adapter';
import wordsearchAdapter from './adapters/wordsearch.adapter';
import unjumbleAdapter from './adapters/unjumble.adapter';
import anagramAdapter from './adapters/anagram.adapter';
import trueFalseAdapter from './adapters/true-false.adapter';

import randomWheelAdapter from './adapters/random-wheel.adapter';

// We can define or import these types if they exist in types.ts, 
// but for now keeping it simple to match what adapters accept.
// import { ActivityPayload, H5PPackage } from './types'; 

const scraper = new WordwallScraper();

export async function convertActivity(url: string) {
    console.log(`[convert] Starting conversion for: ${url}`);
    try {
        const data = await scraper.scrape(url);
        const templateOriginal = data.template;
        console.log(`[convert] Scraped template: ${templateOriginal}`);

        // Normalize template name: remove spaces and lowercase
        const templateNorm = templateOriginal.replace(/\s+/g, '').toLowerCase();

        switch (templateNorm) {
            case 'groupsort':
                console.log(`[convert] Using adapter: GroupSort`);
                const h5pGS = groupSortAdapter(data);
                console.log(`[convert] H5P generated: ${JSON.stringify(h5pGS).substring(0, 100)}...`);
                return h5pGS;

            case 'missingword':
                console.log(`[convert] Using adapter: MissingWord`);
                const h5pMW = missingWordAdapter(data);
                console.log(`[convert] H5P generated: ${JSON.stringify(h5pMW).substring(0, 100)}...`);
                return h5pMW;

            case 'crossword':
                console.log(`[convert] Using adapter: Crossword`);
                const h5pCW = crosswordAdapter(data);
                console.log(`[convert] H5P generated: ${JSON.stringify(h5pCW).substring(0, 100)}...`);
                return h5pCW;

            case 'matchup': // Normalized 'Match Up' or 'MatchUp'
                console.log(`[convert] Using adapter: MatchUp`);
                const h5pMU = matchupAdapter(data);
                console.log(`[convert] H5P generated: ${JSON.stringify(h5pMU).substring(0, 100)}...`);
                return h5pMU;

            // Known but unimplemented
            case 'quiz':
                console.log(`[convert] Using adapter: Quiz`);
                const h5pQuiz = quizAdapter(data);
                console.log(`[convert] H5P generated: ${JSON.stringify(h5pQuiz).substring(0, 100)}...`);
                return h5pQuiz;

            case 'flashcard':
            case 'flashcards':
                console.log(`[convert] Using adapter: Flashcard`);
                const h5pFC = flashcardAdapter(data);
                console.log(`[convert] H5P generated: ${JSON.stringify(h5pFC).substring(0, 100)}...`);
                return h5pFC;

            case 'rankorder':
                console.log(`[convert] Using adapter: RankOrder`);
                const h5pRO = rankOrderAdapter(data);
                console.log(`[convert] H5P generated: ${JSON.stringify(h5pRO).substring(0, 100)}...`);
                return h5pRO;

            case 'wordsearch':
                console.log(`[convert] Using adapter: Wordsearch`);
                const h5pWS = wordsearchAdapter(data);
                console.log(`[convert] H5P generated: ${JSON.stringify(h5pWS).substring(0, 100)}...`);
                return h5pWS;

            case 'unjumble':
                console.log(`[convert] Using adapter: Unjumble`);
                const h5pUJ = unjumbleAdapter(data as any);
                console.log(`[convert] H5P generated: ${JSON.stringify(h5pUJ).substring(0, 100)}...`);
                return h5pUJ;

            case 'anagram':
                console.log(`[convert] Using adapter: Anagram`);
                const h5pAnagram = anagramAdapter(data as any);
                console.log(`[convert] H5P generated: ${JSON.stringify(h5pAnagram).substring(0, 100)}...`);
                return h5pAnagram;

            case 'truefalse':
            case 'trueorfals': // Common misspelling or normalization
                console.log(`[convert] Using adapter: True/False`);
                const h5pTF = trueFalseAdapter(data as any);
                console.log(`[convert] H5P generated: ${JSON.stringify(h5pTF).substring(0, 100)}...`);
                return h5pTF;

            case 'randomwheel':
                console.log(`[convert] Using adapter: RandomWheel`);
                const h5pRW = randomWheelAdapter(data as any);
                console.log(`[convert] H5P generated: ${JSON.stringify(h5pRW).substring(0, 100)}...`);
                return h5pRW;

            case 'openthebox':
                console.warn(`[convert] Adapter not implemented for: ${templateOriginal}`);
                throw new Error('Adapter not implemented');

            default:
                console.error(`[convert] Template not supported: ${templateOriginal} (normalized: ${templateNorm})`);
                throw new Error(`Template not supported: ${templateOriginal}`);
        }
    } catch (error: any) {
        console.error(`[convert] FAILED: ${url}`, error);
        throw error;
    }
}
