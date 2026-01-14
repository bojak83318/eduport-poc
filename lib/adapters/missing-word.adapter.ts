import { ActivityPayload, H5PPackageData } from '../types';

/**
 * Detects blanks in a sentence and replaces '___' with '*answer*' for H5P.Blanks format.
 */
function detectBlanks(sentence: string, answers: string[]): string {
    let answerIndex = 0;
    return sentence.replace(/___/g, () => `*${answers[answerIndex++]}*`);
}

/**
 * Converts Wordwall Missing Word (Cloze) activity to H5P.Blanks 1.14
 */
export default function missingWordAdapter(activity: ActivityPayload): H5PPackageData {
    const items = activity.content.items || [];

    // Build questions array for H5P.Blanks
    const questions = items.map(item => {
        const questionText = item.question || item.term || '';
        const answers = item.options || [item.answer || item.definition || item.correctAnswer || ''];

        // Use the detectBlanks logic as specified
        const finalText = detectBlanks(questionText, answers as string[]);

        // Wrap in paragraph tag for H5P.Blanks HTML requirements
        return `<p>${finalText}</p>`;
    });

    if (questions.length === 0) {
        questions.push('<p>No questions found</p>');
    }

    return {
        h5pJson: {
            title: activity.title || 'Missing Word',
            language: activity.metadata?.language || 'en',
            mainLibrary: 'H5P.Blanks',
            embedTypes: ['div'],
            license: 'U',
            preloadedDependencies: [
                { machineName: 'H5P.Blanks', majorVersion: 1, minorVersion: 14 },
                { machineName: 'FontAwesome', majorVersion: 4, minorVersion: 5 },
                { machineName: 'H5P.FontIcon', majorVersion: 1, minorVersion: 0 },
                { machineName: 'H5P.JoubelUI', majorVersion: 1, minorVersion: 3 },
                { machineName: 'H5P.Question', majorVersion: 1, minorVersion: 5 },
                { machineName: 'H5P.Transition', majorVersion: 1, minorVersion: 0 },
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
                notFilledOut: "Please fill in all blanks",
                answerIsCorrect: "Correct!",
                answerIsWrong: "Incorrect!",
                answeredCorrectly: "Answered correctly",
                answeredIncorrectly: "Answered incorrectly",
                solutionLabel: "Solution",
                inputLabel: "Fill in the blank"
            }
        },
    };
}
