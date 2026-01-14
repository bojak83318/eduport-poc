// lib/adapters/anagram.adapter.ts

interface WordwallAnagram {
    words: Array<{
        scrambled: string
        answer: string
    }>
}

/**
 * Adapter for Wordwall Anagram template to H5P.DragWords 1.11.
 * H5P.DragWords uses asterisks to define droppable words: *word*
 */
export default function anagramAdapter(data: WordwallAnagram) {
    const words = data.words || []

    // Map each answer to the *answer* format required by H5P.DragWords
    // We join them with newlines as each word in an anagram is typically a separate task.
    const textField = words.map(w => `*${w.answer}*`).join('\n')

    return {
        h5pJson: {
            title: 'Anagram',
            mainLibrary: 'H5P.DragWords',
            preloadedDependencies: [
                { machineName: 'H5P.DragWords', majorVersion: 1, minorVersion: 11 }
            ]
        },
        contentJson: {
            taskDescription: 'Unscramble the letters to form words',
            textField: textField,
            behaviour: {
                enableRetry: true,
                enableSolutionsButton: true
            }
        }
    }
}
