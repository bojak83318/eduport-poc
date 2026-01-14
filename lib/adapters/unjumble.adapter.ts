interface WordwallUnjumble {
    sentences: Array<{
        jumbled: string[]
        correct: string
    }>
}

export default function unjumbleAdapter(data: WordwallUnjumble) {
    const sentences = data.sentences || []

    // Build text field with all words as draggables
    const textFields = sentences.map(s => {
        // Split by space to get words. We keep punctuation with the word if it's attached.
        // However, for H5P.DragText, asterisks define the dropped words.
        // If we want the whole sentence to be rearranged, every word should be in asterisks.
        const words = s.correct.trim().split(/\s+/)
        return words.map(w => `*${w}*`).join(' ')
    })

    return {
        h5pJson: {
            title: 'Unjumble',
            mainLibrary: 'H5P.DragText',
            preloadedDependencies: [
                { machineName: 'H5P.DragText', majorVersion: 1, minorVersion: 10 }
            ]
        },
        contentJson: {
            taskDescription: 'Arrange the words to form correct sentences',
            textField: textFields.join('\n\n'),
            behaviour: {
                enableRetry: true,
                enableSolutionsButton: true
            }
        }
    }
}
