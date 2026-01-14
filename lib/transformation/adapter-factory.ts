import { IH5PAdapter } from './base-adapter';
import { MatchUpAdapter } from './matchup-adapter';
import { QuizAdapter } from './quiz-adapter';
import { FlashcardAdapter } from './flashcard-adapter';
import { GroupSortAdapter } from './group-sort-adapter';
import { MissingWordAdapter } from './missing-word-adapter';
import { CrosswordAdapter } from './crossword-adapter';

const adapters: IH5PAdapter[] = [
    new MatchUpAdapter(),
    new QuizAdapter(),
    new FlashcardAdapter(),
    new GroupSortAdapter(),
    new MissingWordAdapter(),
    new CrosswordAdapter(),
];

export function getAdapter(templateType: string): IH5PAdapter {
    const adapter = adapters.find(a => a.canConvert(templateType));

    if (!adapter) {
        throw new Error(
            `Unsupported template type: "${templateType}". ` +
            `Supported templates: Match-Up, Quiz, Flashcard, True/False`
        );
    }

    return adapter;
}

export function getSupportedTemplates(): string[] {
    return [
        'MatchUp',
        'Match',
        'Pairs',
        'Quiz',
        'MultipleChoice',
        'TrueFalse',
        'Flashcard',
        'Flashcards',
        'Cards',
        'GroupSort',
        'Unjumble',
        'RankOrder',
        'MissingWord',
        'Cloze',
        'Crossword',
    ];
}
