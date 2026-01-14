import { ActivityPayload, H5PPackageData } from '../types';

interface WordwallQuestion {
    type: 'multipleChoice' | 'trueFalse'
    question: string
    options?: string[]
    correctIndex?: number
    correct?: boolean
}

interface WordwallQuiz {
    questions: WordwallQuestion[]
}

/**
 * Adapter for Wordwall Quiz to H5P.QuestionSet 1.20
 * 
 * @param data - The activity data extracted from Wordwall
 * @returns H5P compatible content structure
 */
export default function quizAdapter(data: any): H5PPackageData {
    // Support both direct WordwallQuiz format and the ActivityPayload format
    const questions: WordwallQuestion[] = data.questions || data.content?.items || [];
    const title = data.title || 'Quiz';
    const language = data.metadata?.language || 'en';

    const h5pQuestions = questions.map((q, index) => {
        if (q.type === 'multipleChoice') {
            return {
                library: 'H5P.MultiChoice 1.16',
                params: {
                    question: `<p>${q.question}</p>`,
                    answers: (q.options || []).map((opt, i) => ({
                        text: `<div>${opt}</div>`,
                        correct: i === q.correctIndex
                    })),
                    behaviour: {
                        enableRetry: true,
                        enableSolutionsButton: true,
                        enableCheckButton: true,
                        type: 'auto',
                        singlePoint: false,
                        randomAnswers: true,
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
                subContentId: `${index}-mc`,
                metadata: {
                    contentType: 'Multiple Choice',
                    license: 'U',
                    title: `Question ${index + 1}`
                }
            }
        } else {
            return {
                library: 'H5P.TrueFalse 1.8',
                params: {
                    question: `<p>${q.question}</p>`,
                    correct: String(q.correct),
                    behaviour: {
                        enableRetry: true,
                        enableSolutionsButton: true,
                        enableCheckButton: true,
                        confirmCheckDialog: false,
                        confirmRetryDialog: false,
                        autoCheck: false
                    }
                },
                subContentId: `${index}-tf`,
                metadata: {
                    contentType: 'True/False',
                    license: 'U',
                    title: `Question ${index + 1}`
                }
            }
        }
    });

    return {
        h5pJson: {
            title: title,
            language: language,
            mainLibrary: 'H5P.QuestionSet',
            embedTypes: ['iframe'],
            license: 'U',
            preloadedDependencies: [
                { machineName: 'H5P.QuestionSet', majorVersion: 1, minorVersion: 20 },
                { machineName: 'H5P.MultiChoice', majorVersion: 1, minorVersion: 16 },
                { machineName: 'H5P.TrueFalse', majorVersion: 1, minorVersion: 8 },
                { machineName: 'FontAwesome', majorVersion: 4, minorVersion: 5 }
            ]
        },
        contentJson: {
            taskDescription: 'Answer the following questions',
            progressType: 'dots',
            passPercentage: 70,
            questions: h5pQuestions,
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
                    { from: 0, to: 70, feedback: 'Keep trying!' },
                    { from: 70, to: 100, feedback: 'Great job!' }
                ]
            }
        }
    };
}
