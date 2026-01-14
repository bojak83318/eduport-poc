/**
 * MatchUp to H5P.MemoryGame 1.3 adapter
 */

interface H5PCard {
    image: { path: string } | null
    text: string
    matchAlt: string
}

interface H5PMemoryGame {
    cards: Array<H5PCard>
    behaviour: {
        allowRetry: boolean
        useGrid: boolean
        cardsToUse: string
    }
}

/**
 * Converts Wordwall MatchUp data to H5P.MemoryGame 1.3 format
 * Handles both the specific 'pairs' format and the standard 'ActivityPayload' structure.
 */
export default function matchupAdapter(data: any): H5PMemoryGame {
    let pairs: any[] = [];

    if (data.pairs && Array.isArray(data.pairs)) {
        // Direct 'pairs' format from prompt example
        pairs = data.pairs;
    } else if (data.content?.items && Array.isArray(data.content.items)) {
        // Standard ActivityPayload structure
        pairs = data.content.items.map((item: any) => ({
            left: item.term || item.question || '',
            right: item.definition || item.answer || '',
            leftImage: item.image || undefined
        }));
    }

    return {
        cards: pairs.map(pair => ({
            image: pair.leftImage ? { path: pair.leftImage } : (pair.image ? { path: pair.image } : null),
            text: pair.left || '',
            matchAlt: pair.right || ''
        })),
        behaviour: {
            allowRetry: true,
            useGrid: true,
            cardsToUse: 'all'
        }
    };
}
