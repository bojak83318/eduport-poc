import { ActivityPayload, H5PPackageData } from '../types';
import { BaseAdapter } from './base-adapter';

/**
 * Converts Wordwall Crossword to H5P.Crossword 0.4
 * Note: H5P.Crossword requires explicit X/Y positioning.
 * We implement a simple layout algorithm for MVP.
 */
export class CrosswordAdapter extends BaseAdapter {
    canConvert(templateType: string): boolean {
        return templateType === 'Crossword';
    }

    convert(activity: ActivityPayload): H5PPackageData {
        const items = activity.content.items || [];

        // 1. extract words and clues
        const wordList = items.map(item => ({
            word: (item.answer || item.term || item.correctAnswer || '').toString().toUpperCase().replace(/[^A-Z]/g, ''),
            clue: item.question || item.definition || 'Clue missing'
        })).filter(w => w.word.length > 1);

        // 2. Generate Grid (Simple greedy placement)
        const words = this.generateGrid(wordList);

        return {
            h5pJson: {
                title: activity.title || 'Crossword',
                language: activity.metadata?.language || 'en',
                mainLibrary: 'H5P.Crossword',
                embedTypes: ['div'],
                license: 'U',
                preloadedDependencies: [
                    { machineName: 'H5P.Crossword', majorVersion: 0, minorVersion: 4 },
                ],
            },
            contentJson: {
                headline: activity.title || 'Crossword',
                words: words, // { clue, answer, orientation, x, y }
                behaviour: {
                    words: { showSolution: true, enableRetry: true },
                    score: { showScore: true }
                },
                l10n: {
                    check: "Check",
                    submit: "Submit",
                    showSolution: "Show Solution",
                    retry: "Retry",
                    across: "Across",
                    down: "Down"
                }
            },
        };
    }

    private generateGrid(wordList: { word: string; clue: string }[]): any[] {
        // Trivial MVP: Just list them horizontally if we can't solve strict placement?
        // No, they must overlap or it's not a crossword.
        // If we can't overlap, we can place them disconnected. H5P Crossword allows disconnected components.
        // Strategy: Place diagonally disconnected for guaranteed validity? 
        // e.g. 
        // WORD1
        //      WORD2
        //           WORD3
        // This is safe and valid json. Real crossword generation is complex.

        let currentX = 0;
        let currentY = 0;
        const output = [];

        for (const w of wordList) {
            output.push({
                clue: w.clue,
                answer: w.word,
                orientation: 'across', // always across
                x: currentX,
                y: currentY,
                fixWord: false
            });

            // Move down-right to avoid collision
            currentX += 1;
            currentY += 2;
        }

        return output;
    }
}
