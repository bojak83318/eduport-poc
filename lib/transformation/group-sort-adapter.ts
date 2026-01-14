import { ActivityPayload, H5PPackageData } from '../types';
import { BaseAdapter } from './base-adapter';

/**
 * Converts Wordwall Group Sort to H5P.DragText 1.10
 */
export class GroupSortAdapter extends BaseAdapter {
    canConvert(templateType: string): boolean {
        return templateType === 'GroupSort' ||
            templateType === 'Unjumble' || // Sometimes mapped here if simple
            templateType === 'RankOrder';   // Can also be drag text
    }

    convert(activity: ActivityPayload): H5PPackageData {
        const items = activity.content.items || [];
        const groups: Record<string, string[]> = {};

        // Normalize data
        items.forEach(item => {
            if (item.options && item.options.length > 0) {
                // Type A: Question is Group, Options are Items
                const groupName = item.question || item.term || 'Untitled Group';
                groups[groupName] = item.options;
            } else if (item.answer) {
                // Type B: Question is Item, Answer is Group
                const groupName = item.answer;
                const itemName = item.question || item.term || 'Untitled Item';
                if (!groups[groupName]) groups[groupName] = [];
                groups[groupName].push(itemName);
            }
        });

        // Build HTML text field for H5P.DragText
        // Format: GroupName: *Item1* *Item2* <br> ...
        let textFieldHtml = '';

        Object.entries(groups).forEach(([groupName, groupItems]) => {
            textFieldHtml += `<strong>${this.escapeHtml(groupName)}</strong>: `;
            const draggables = groupItems
                .map(item => `*${this.escapeHtml(item)}*`)
                .join(' ');
            textFieldHtml += `${draggables}<br/><br/>`;
        });

        if (!textFieldHtml) {
            textFieldHtml = 'No groups found. Please check source activity.';
        }

        return {
            h5pJson: {
                title: activity.title || 'Group Sort',
                language: activity.metadata?.language || 'en',
                mainLibrary: 'H5P.DragText',
                embedTypes: ['div'],
                license: 'U',
                preloadedDependencies: [
                    { machineName: 'H5P.DragText', majorVersion: 1, minorVersion: 10 },
                ],
            },
            contentJson: {
                taskDescription: 'Drag the items to their correct groups.',
                textField: textFieldHtml,
                score: 'Range:0-1',
                behaviour: {
                    enableRetry: true,
                    enableSolutionsButton: true,
                    instantFeedback: false
                },
                l10n: {
                    checkAnswer: 'Check',
                    tryAgain: 'Retry',
                    showSolution: 'Show Solution',
                    scoreBarLabel: 'You got :num out of :total points'
                }
            },
        };
    }
}
