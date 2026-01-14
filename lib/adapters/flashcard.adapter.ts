/**
 * Flashcard to H5P.Flashcards 1.5 adapter
 */

interface WordwallFlashcard {
    template?: string
    cards?: Array<{
        front?: string
        back?: string
        image?: string
        term?: string
        definition?: string
        question?: string
        answer?: string
    }>
    content?: {
        items?: Array<{
            front?: string
            back?: string
            image?: string
            term?: string
            definition?: string
            question?: string
            answer?: string
        }>
    }
}


interface H5PFlashcards {
    title: string
    description: string
    cards: Array<{
        text: string
        answer: string
        image: { path: string } | null
        tip: string
    }>
    behaviour: {
        enableRetry: boolean
        randomCards: boolean
    }
}

/**
 * Converts Wordwall Flashcard data to H5P.Flashcards 1.5 format
 */
export default function flashcardAdapter(data: any): H5PFlashcards {
    const rawCards = data?.cards || data?.content?.items || [];

    if (!Array.isArray(rawCards)) {
        return {
            title: 'Flashcards',
            description: 'Learn these terms',
            cards: [],
            behaviour: {
                enableRetry: true,
                randomCards: true
            }
        };
    }

    return {
        title: 'Flashcards',
        description: 'Learn these terms',
        cards: rawCards.map((card: any) => ({
            text: card.front || card.term || card.question || '',
            answer: card.back || card.definition || card.answer || '',
            image: card.image ? { path: card.image } : null,
            tip: ''
        })),
        behaviour: {
            enableRetry: true,
            randomCards: true
        }
    };
}

