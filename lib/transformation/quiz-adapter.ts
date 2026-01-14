import { ActivityPayload, H5PPackageData } from '../types';
import { BaseAdapter } from './base-adapter';

/**
 * Converts Wordwall Quiz template to H5P.QuestionSet 1.20
 * 
 * Supports:
 * - Multiple choice questions
 * - True/False questions
 * - Fill in the blank (text input)
 */
export class QuizAdapter extends BaseAdapter {
    canConvert(templateType: string): boolean {
        return templateType === 'Quiz' ||
            templateType === 'MultipleChoice' ||
            templateType === 'TrueFalse';
    }

    convert(activity: ActivityPayload): H5PPackageData {
        const items = activity.content.items || [];

        const questions = items.map((item, index) => {
            const isMultipleChoice = (item.options?.length || 0) > 0;
            const correctAnswer = item.correctAnswer || item.answer || '';

            if (isMultipleChoice) {
                return this.createMultipleChoiceQuestion(item, index);
            } else {
                return this.createTextInputQuestion(item, index);
            }
        });

        return {
            h5pJson: {
                title: activity.title || 'Quiz',
                language: activity.metadata?.language || 'en',
                mainLibrary: 'H5P.QuestionSet',
                embedTypes: ['iframe'],
                license: 'U',
                preloadedDependencies: [
                    { machineName: 'H5P.QuestionSet', majorVersion: 1, minorVersion: 20 },
                    { machineName: 'H5P.MultiChoice', majorVersion: 1, minorVersion: 16 },
                    { machineName: 'H5P.Text', majorVersion: 1, minorVersion: 1 },
                    { machineName: 'FontAwesome', majorVersion: 4, minorVersion: 5 },
                ],
            },
            contentJson: {
                introPage: {
                    showIntroPage: false,
                },
                progressType: 'dots',
                passPercentage: 70,
                questions,
                texts: {
                    prevButton: 'Previous',
                    nextButton: 'Next',
                    finishButton: 'Finish',
                    textualProgress: 'Question: @current of @total',
                    questionLabel: 'Question',
                    readSpeakerProgress: 'Question @current of @total',
                    unansweredText: 'Unanswered',
                    answeredText: 'Answered',
                    currentQuestionText: 'Current question',
                },
                endGame: {
                    showResultPage: true,
                    showSolutionButton: true,
                    showRetryButton: true,
                    noResultMessage: 'Finished',
                    message: 'Your result:',
                    overallFeedback: [
                        {
                            from: 0,
                            to: 70,
                            feedback: 'Keep trying!',
                        },
                        {
                            from: 70,
                            to: 100,
                            feedback: 'Great job!',
                        },
                    ],
                },
            },
        };
    }

    private createMultipleChoiceQuestion(item: any, index: number) {
        const options = (item.options || []).map((option: string, optIdx: number) => {
            const isCorrect =
                option === item.correctAnswer ||
                optIdx === item.correctAnswer ||
                option === item.answer;

            return {
                text: `\u003cp\u003e${this.escapeHtml(this.cleanText(option))}\u003c/p\u003e`,
                correct: isCorrect,
                tipsAndFeedback: {
                    tip: '',
                    chosenFeedback: isCorrect ? 'Correct!' : 'Incorrect',
                    notChosenFeedback: '',
                },
            };
        });

        return {
            library: 'H5P.MultiChoice 1.16',
            params: {
                media: {
                    disableImageZooming: false,
                },
                answers: options,
                overallFeedback: [
                    { from: 0, to: 100, feedback: '' },
                ],
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
                    passPercentage: 100,
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
                    shouldNotCheck: 'Should not have been checked',
                },
                question: `\u003cp\u003e${this.escapeHtml(this.cleanText(item.question || ''))}\u003c/p\u003e`,
            },
            subContentId: `${index}-mc`,
            metadata: {
                contentType: 'Multiple Choice',
                license: 'U',
                title: `Question ${index + 1}`,
            },
        };
    }

    private createTextInputQuestion(item: any, index: number) {
        return {
            library: 'H5P.Blanks 1.14',
            params: {
                text: `\u003cp\u003e${this.escapeHtml(this.cleanText(item.question || ''))}\u003c/p\u003e`,
                questions: [this.cleanText(item.correctAnswer || item.answer || '')],
                overallFeedback: [
                    { from: 0, to: 100, feedback: '' },
                ],
                behaviour: {
                    enableRetry: true,
                    enableSolutionsButton: true,
                    caseSensitive: false,
                    showSolutionsRequiresInput: true,
                    autoCheck: false,
                    acceptSpellingErrors: false,
                },
                checkAnswerButton: 'Check',
                tryAgainButton: 'Retry',
                showSolutionButton: 'Show solution',
            },
            subContentId: `${index}-blanks`,
            metadata: {
                contentType: 'Fill in the Blanks',
                license: 'U',
                title: `Question ${index + 1}`,
            },
        };
    }
}
