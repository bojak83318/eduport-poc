
import { ActivityPayload, H5PPackageData } from '../types';

interface WordwallCrossword {
    clues: Array<{
        clue: string
        answer: string
        direction?: 'across' | 'down'
    }>
}

interface H5PCrossword {
    taskDescription: string
    words: Array<{
        clue: string
        answer: string
        row: number
        col: number
        orientation: 'across' | 'down'
        clueId: number
    }>
}

interface CrosswordClue {
    number: number
    direction: 'across' | 'down'
    clue: string
    answer: string
    x: number  // Grid position (column)
    y: number  // Grid position (row)
}

function findIntersection(
    placed: CrosswordClue,
    newAnswer: string
): { x: number; y: number; direction: 'across' | 'down' } | null {
    // Find common letters between placed word and new word
    for (let i = 0; i < placed.answer.length; i++) {
        for (let j = 0; j < newAnswer.length; j++) {
            if (placed.answer[i].toLowerCase() === newAnswer[j].toLowerCase()) {
                // Found intersection!

                // Calculate potential position
                let newX: number;
                let newY: number;
                let newDirection: 'across' | 'down';

                if (placed.direction === 'across') {
                    // New word should be down
                    newX = placed.x + i;
                    newY = placed.y - j;
                    newDirection = 'down';
                } else {
                    // New word should be across
                    newX = placed.x - j;
                    newY = placed.y + i;
                    newDirection = 'across';
                }

                return {
                    x: newX,
                    y: newY,
                    direction: newDirection
                };
            }
        }
    }
    return null
}

function hasCollisions(
    candidate: { x: number, y: number, direction: 'across' | 'down', answer: string },
    placedWords: CrosswordClue[]
): boolean {
    for (let i = 0; i < candidate.answer.length; i++) {
        const charX = candidate.direction === 'across' ? candidate.x + i : candidate.x;
        const charY = candidate.direction === 'down' ? candidate.y + i : candidate.y;
        const char = candidate.answer[i].toLowerCase();

        for (const existing of placedWords) {
            let isOccupied = false;
            let existingChar = '';

            if (existing.direction === 'across') {
                if (charY === existing.y && charX >= existing.x && charX < existing.x + existing.answer.length) {
                    isOccupied = true;
                    existingChar = existing.answer[charX - existing.x].toLowerCase();
                }
            } else { // down
                if (charX === existing.x && charY >= existing.y && charY < existing.y + existing.answer.length) {
                    isOccupied = true;
                    existingChar = existing.answer[charY - existing.y].toLowerCase();
                }
            }

            if (isOccupied) {
                if (existingChar !== char) {
                    return true;
                }
            }
        }
    }
    return false;
}

export default function crosswordAdapter(activity: ActivityPayload): H5PCrossword {
    // Extract clues from ActivityPayload content
    const items = activity.content?.items || [];
    const clues = items.map((item: any) => ({
        clue: item.clue || item.question || item.term || '',
        answer: item.answer || item.definition || item.correctAnswer || '',
    })).filter((c: any) => c.clue && c.answer);

    // Sort clues by answer length (longest first)
    const sortedClues = clues
        .sort((a: any, b: any) => b.answer.length - a.answer.length);

    const placedWords: CrosswordClue[] = []

    // Place first word at (0, 0) horizontally
    if (sortedClues.length > 0) {
        placedWords.push({
            number: 1,
            direction: 'across',
            clue: sortedClues[0].clue,
            answer: sortedClues[0].answer,
            x: 0,
            y: 0
        })
    }

    // Try to place remaining words
    // We need to keep indices from original sorted array but assign IDs based on placed
    for (let i = 1; i < sortedClues.length; i++) {
        const currentClue = sortedClues[i]
        let placed = false

        // Try to find intersection with each placed word
        // We iterate through placed words to find an anchor
        for (const placedWord of placedWords) {
            const intersection = findIntersection(placedWord, currentClue.answer)

            if (intersection) {
                // Validate collision
                const candidate = {
                    x: intersection.x,
                    y: intersection.y,
                    direction: intersection.direction,
                    answer: currentClue.answer
                };

                if (!hasCollisions(candidate, placedWords)) {
                    placedWords.push({
                        number: placedWords.length + 1, // Sequential ID for placed words
                        direction: intersection.direction,
                        clue: currentClue.clue,
                        answer: currentClue.answer,
                        x: intersection.x,
                        y: intersection.y
                    })
                    placed = true
                    break
                }
            }
        }

        if (!placed) {
            console.warn(`Could not place clue: "${currentClue.clue}" (skipping)`)
        }
    }

    // Normalize coordinates to be positive (H5P requires positive row/col)
    // Find min x and y
    let minX = 0;
    let minY = 0;

    if (placedWords.length > 0) {
        minX = Math.min(...placedWords.map(w => w.x));
        minY = Math.min(...placedWords.map(w => w.y));
    }

    const offsetX = minX < 0 ? Math.abs(minX) : 0;
    const offsetY = minY < 0 ? Math.abs(minY) : 0;

    // Convert to H5P format
    return {
        taskDescription: 'Complete the crossword puzzle',
        words: placedWords.map((word, index) => ({
            clue: word.clue,
            answer: word.answer,
            row: word.y + offsetY,
            col: word.x + offsetX,
            orientation: word.direction,
            clueId: index + 1
        }))
    }
}
