import { ActivityPayload, H5PPackageData } from '../types';
import { BaseAdapter } from './base-adapter';

/**
 * Converts Wordwall Match-Up template to H5P.MemoryGame 1.3
 * 
 * Wordwall Schema:
 * - items[].question (or .term) → Match card
 * - items[].answer (or .definition) → Matching pair
 * 
 * H5P Schema:
 * - cards[].match → Question text
 * - cards[].matchAlt → Answer text
 */
export class MatchUpAdapter extends BaseAdapter {
    canConvert(templateType: string): boolean {
        return templateType === 'MatchUp' ||
            templateType === 'Match' ||
            templateType === 'Pairs';
    }

    convert(activity: ActivityPayload): H5PPackageData {
        const items = activity.content.items || [];

        const cards = items.map((item, index) => {
            const question = item.question || item.term || '';
            const answer = item.answer || item.definition || '';

            return {
                image: undefined, // MVP: No image support
                imageAlt: '',
                match: {
                    library: 'H5P.Text 1.1',
                    params: {
                        text: `\u003cp\u003e${this.escapeHtml(this.cleanText(question))}\u003c/p\u003e`,
                    },
                    subContentId: `${index}-question`,
                    metadata: {
                        contentType: 'Text',
                        license: 'U',
                        title: 'Question',
                    },
                },
                matchAlt: {
                    library: 'H5P.Text 1.1',
                    params: {
                        text: `\u003cp\u003e${this.escapeHtml(this.cleanText(answer))}\u003c/p\u003e`,
                    },
                    subContentId: `${index}-answer`,
                    metadata: {
                        contentType: 'Text',
                        license: 'U',
                        title: 'Answer',
                    },
                },
            };
        });

        return {
            h5pJson: {
                title: activity.title || 'Memory Game',
                language: activity.metadata?.language || 'en',
                mainLibrary: 'H5P.MemoryGame',
                embedTypes: ['div'],
                license: 'U',
                preloadedDependencies: [
                    { machineName: 'H5P.MemoryGame', majorVersion: 1, minorVersion: 3 },
                    { machineName: 'H5P.Text', majorVersion: 1, minorVersion: 1 },
                    { machineName: 'FontAwesome', majorVersion: 4, minorVersion: 5 },
                    { machineName: 'H5P.JoubelUI', majorVersion: 1, minorVersion: 3 },
                ],
            },
            contentJson: {
                cards,
                behaviour: {
                    useGrid: true,
                    numCardsToUse: cards.length,
                    allowRetry: true,
                },
                l10n: {
                    cardTurns: 'Card turns',
                    timeSpent: 'Time spent',
                    feedback: 'Good work!',
                    tryAgain: 'Try again?',
                    closeLabel: 'Close',
                    label: 'Memory Game. Find the matching cards.',
                },
            },
        };
    }
}
