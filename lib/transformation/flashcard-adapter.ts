import { ActivityPayload, H5PPackageData } from '../types';
import { BaseAdapter } from './base-adapter';

/**
 * Converts Wordwall Flashcard template to H5P.Flashcards 1.5
 */
export class FlashcardAdapter extends BaseAdapter {
    canConvert(templateType: string): boolean {
        return templateType === 'Flashcard' ||
            templateType === 'Flashcards' ||
            templateType === 'Cards';
    }

    convert(activity: ActivityPayload): H5PPackageData {
        const items = activity.content.items || [];

        const cards = items.map((item, index) => {
            const question = item.question || item.term || '';
            const answer = item.answer || item.definition || '';

            return {
                text: `\u003cp\u003e${this.escapeHtml(this.cleanText(question))}\u003c/p\u003e`,
                answer: `\u003cp\u003e${this.escapeHtml(this.cleanText(answer))}\u003c/p\u003e`,
                tip: '',
                image: undefined,
            };
        });

        return {
            h5pJson: {
                title: activity.title || 'Flashcards',
                language: activity.metadata?.language || 'en',
                mainLibrary: 'H5P.Flashcards',
                embedTypes: ['div'],
                license: 'U',
                preloadedDependencies: [
                    { machineName: 'H5P.Flashcards', majorVersion: 1, minorVersion: 5 },
                    { machineName: 'H5P.Text', majorVersion: 1, minorVersion: 1 },
                    { machineName: 'FontAwesome', majorVersion: 4, minorVersion: 5 },
                    { machineName: 'H5P.Image', majorVersion: 1, minorVersion: 1 },
                ],
            },
            contentJson: {
                description: activity.title || 'Study these flashcards',
                progressText: 'Card @card of @total',
                next: 'Next',
                previous: 'Previous',
                checkAnswer: 'Check',
                showSolution: 'Show solution',
                retry: 'Retry',
                cards,
            },
        };
    }
}
