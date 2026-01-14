import { H5PPackageData } from '../types';

interface TrueFalseData {
    statements: Array<{ text: string; answer: boolean }>;
    title?: string;
    metadata?: {
        language?: string;
    };
}

/**
 * Adapter for Wordwall "True false" to H5P.QuestionSet 1.20
 * Maps statements to H5P.MultiChoice questions with True/False options.
 * 
 * @param data - The activity data extracted from Wordwall
 * @returns H5P compatible content structure
 */
export default function trueFalseAdapter(data: TrueFalseData): H5PPackageData {
    const statements = data.statements || [];
    const title = data.title || 'True or False Quiz';
    const language = data.metadata?.language || 'en';

    const questions = statements.map((s, index) => ({
        library: 'H5P.MultiChoice 1.16',
        params: {
            question: `<p>${s.text}</p>`,
            answers: [
                { text: 'True', correct: s.answer === true },
                { text: 'False', correct: s.answer === false }
            ],
            behaviour: {
                singleAnswer: true,
                enableRetry: true,
                enableSolutionsButton: true,
                enableCheckButton: true,
                randomAnswers: false, // Keep True first then False
                showSolutionsRequiresInput: true,
                confirmCheckDialog: false,
                confirmRetryDialog: false,
                autoCheck: false,
                passPercentage: 100
            },
            UI: {
                checkAnswerButton: 'Check',
                showSolutionButton: 'Show solution',
                tryAgainButton: 'Retry',
                tipsLabel: 'Show tip',
                scoreBarLabel: 'Score',
                tipAvailable: 'Tip available',
                feedbackAvailable: 'Feedback available',
                readFeedback: 'Read feedback',
                wrongAnswer: 'Wrong answer',
                correctAnswer: 'Correct answer',
                shouldCheck: 'Should have been checked',
                shouldNotCheck: 'Should not have been checked'
            }
        },
        subContentId: `${index}-tf-mc`,
        metadata: {
            contentType: 'Multiple Choice',
            license: 'U',
            title: `Statement ${index + 1}`
        }
    }));

    return {
        h5pJson: {
            title: title,
            language: language,
            mainLibrary: 'H5P.QuestionSet',
            preloadedDependencies: [
                { machineName: 'H5P.QuestionSet', majorVersion: 1, minorVersion: 20 },
                { machineName: 'H5P.MultiChoice', majorVersion: 1, minorVersion: 16 }
            ],
            embedTypes: ['iframe'],
            license: 'U'
        },
        contentJson: {
            questions,
            progressType: 'dots',
            passPercentage: 50,
            taskDescription: 'Decide if each statement is True or False',
            introPage: {
                showIntroPage: false
            },
            endGame: {
                showResultPage: true,
                showSolutionButton: true,
                showRetryButton: true,
                noResultMessage: 'Finished',
                message: 'Your result:',
                overallFeedback: [
                    { from: 0, to: 50, feedback: 'Keep trying!' },
                    { from: 50, to: 100, feedback: 'Great job!' }
                ]
            }
        }
    };
}
