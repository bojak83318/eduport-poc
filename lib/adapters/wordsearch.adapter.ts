import { H5PPackageData } from '../types';

interface WordwallWordsearch {
    words: string[]
    gridSize?: number
}

export default function wordsearchAdapter(data: any): H5PPackageData {
    const words = data.words || data.content?.items || []
    const title = data.title || 'Word Search'
    const language = data.metadata?.language || 'en'

    return {
        h5pJson: {
            title: title,
            language: language,
            mainLibrary: 'H5P.WordSearch',
            embedTypes: ['iframe'],
            preloadedDependencies: [
                { machineName: 'H5P.WordSearch', majorVersion: 1, minorVersion: 4 }
            ]
        },
        contentJson: {
            taskDescription: 'Find the hidden words in the grid',
            wordList: words.join(', '),
            behaviour: {
                enableRetry: true,
                showSolutionsButton: true
            },
            l10n: {
                found: "Words found: @found of @total",
                tryAgain: "Try again"
            }
        }
    }
}
