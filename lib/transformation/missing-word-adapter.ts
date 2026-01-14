import { ActivityPayload, H5PPackageData } from '../types';
import { BaseAdapter } from './base-adapter';

/**
 * Converts Wordwall Missing Word to H5P.Blanks 1.14
 */
export class MissingWordAdapter extends BaseAdapter {
    canConvert(templateType: string): boolean {
        return templateType === 'MissingWord' ||
            templateType === 'Cloze';
    }

    convert(activity: ActivityPayload): H5PPackageData {
        const items = activity.content.items || [];

        // Build questions array for H5P.Blanks
        // H5P expects: "The capital of France is *Paris*"
        const questions = items.map(item => {
            const questionText = item.question || item.term || '';
            const answer = item.answer || item.definition || item.correctAnswer || '';

            // Heuristic: If question has '...', replace it.
            // Else, append the answer.
            let finalText = '';

            if (questionText.includes('...')) {
                finalText = questionText.replace('...', `*${answer}*`);
            } else if (questionText.includes('_')) {
                finalText = questionText.replace(/_+/g, `*${answer}*`);
            } else {
                // If checking types, sometimes answer is in options
                // For now append at end if no placeholder
                finalText = `${questionText} *${answer}*`;
            }

            return `\u003cp\u003e${this.escapeHtml(finalText)}\u003c/p\u003e`;
        });

        if (questions.length === 0) {
            questions.push('<p>No questions found</p>');
        }

        return {
            h5pJson: {
                title: activity.title || 'Fill in the Blanks',
                language: activity.metadata?.language || 'en',
                mainLibrary: 'H5P.Blanks',
                embedTypes: ['div'],
                license: 'U',
                preloadedDependencies: [
                    { machineName: 'H5P.Blanks', majorVersion: 1, minorVersion: 14 },
                ],
            },
            contentJson: {
                text: 'Fill in the missing words',
                questions: questions,
                score: 'Range:0-1',
                behaviour: {
                    enableRetry: true,
                    enableSolutionsButton: true,
                    caseSensitive: false,
                    showSolutionsRequiresInput: true,
                    autoCheck: false,
                    separateLines: false
                },
                l10n: {
                    checkAnswer: "Check",
                    tryAgain: "Retry",
                    showSolution: "Show Solution",
                    notFilledOut: "Please fill in all blanks"
                }
            },
        };
    }
}
