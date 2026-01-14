import { H5PPackageData } from '../types';

/**
 * Adapter for Wordwall RankOrder to H5P.DragText 1.10
 * 
 * @param data - The activity data extracted from Wordwall
 * @returns H5P compatible content structure
 */
export default function rankOrderAdapter(data: any): H5PPackageData {
    let items: string[] = [];

    if (Array.isArray(data.items)) {
        // Direct string array format from prompt context
        items = data.items;
    } else if (data.content?.items && Array.isArray(data.content.items)) {
        // Standard ActivityPayload structure
        items = data.content.items.map((item: any) => {
            if (typeof item === 'string') return item;
            return item.term || item.question || item.answer || item.definition || '';
        }).filter(Boolean);
    }

    // H5P.DragText uses *item* for draggable items.
    // By providing them in sequence, we define the correct order.
    const textField = items.map(item => `*${item}*`).join(' ');

    return {
        h5pJson: {
            title: data.title || 'Rank Order',
            language: data.metadata?.language || 'en',
            mainLibrary: 'H5P.DragText',
            embedTypes: ['iframe'],
            license: 'U',
            preloadedDependencies: [
                { machineName: 'H5P.DragText', majorVersion: 1, minorVersion: 10 }
            ]
        },
        contentJson: {
            taskDescription: 'Put the items in the correct order by dragging them',
            textField: textField,
            behaviour: {
                enableRetry: true,
                enableSolutionsButton: true,
                instantFeedback: false
            }
        }
    };
}
