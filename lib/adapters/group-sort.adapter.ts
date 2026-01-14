import { ActivityPayload, H5PPackageData } from '../types';

/**
 * Escapes HTML special characters
 */
function escapeHtml(text: string): string {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Adapter for Wordwall Group Sort to H5P.DragText 1.10
 * 
 * Wordwall Group Sort format: { groups: [{ id, label, items[] }] }
 * H5P.DragText syntax: *Group*: :item1: :item2: (dropzones)
 * 
 * @param wordwallData - The extracted Wordwall activity data
 * @returns H5P compatible content structure
 */
export default function groupSortAdapter(wordwallData: any): any {
    const title = wordwallData.title || 'Group Sort';
    const language = wordwallData.metadata?.language || 'en';

    // Normalize groups from different Wordwall patterns
    // ActivityPayload content.items usually contains the groups or items
    let groups: { label: string; items: string[] }[] = [];

    if (wordwallData.content?.groups) {
        // Direct group format (if available in raw data)
        groups = wordwallData.content.groups.map((g: any) => ({
            label: g.label || g.title || 'Untitled Group',
            items: (g.items || []).map((i: any) => typeof i === 'string' ? i : (i.text || i.term || ''))
        }));
    } else if (wordwallData.content?.items) {
        const items = wordwallData.content.items;
        const groupMap: Record<string, string[]> = {};

        items.forEach((item: any) => {
            if (item.options && item.options.length > 0) {
                // Type A: Question is Group, Options are Items
                const groupName = item.question || item.term || 'Untitled Group';
                groupMap[groupName] = item.options.map((opt: any) => {
                    if (opt === null || opt === undefined) return '';
                    return typeof opt === 'string' ? opt : (opt.text || opt.term || '');
                });
            } else if (item.answer) {
                // Type B: Question is Item, Answer is Group
                const groupName = item.answer;
                const itemName = item.question || item.term || 'Untitled Item';
                if (!groupMap[groupName]) groupMap[groupName] = [];
                groupMap[groupName].push(itemName);
            } else if (item.label && item.items) {
                // Nested format
                const groupName = item.label;
                groupMap[groupName] = item.items.map((i: any) => typeof i === 'string' ? i : (i.text || i.term));
            }
        });

        groups = Object.entries(groupMap).map(([label, items]) => ({ label, items }));
    }

    // Build H5P.DragText textField content
    // Format: *GroupName*: :item1: :item2:
    // Wait, the user said H5P.DragText syntax: *Group*: :item1: :item2: 
    // Standard H5P.DragText actually uses *text* for drop zones.
    // If the user specifically said *Group*: :item1: :item2:, I will follow that.
    // However, usually it's "Group Name: *Item*" or similar.
    // The prompt says: H5P.DragText syntax: *Group*: :item1: :item2: (dropzones)
    // This looks like a specific requirement for the H5P text field structure.

    let textField = '';
    groups.forEach((group) => {
        if (!group.label && group.items.length === 0) return;

        const escapedLabel = escapeHtml(group.label);
        // User asked for *Group*: :item1: :item2:
        textField += `*${escapedLabel}*:`;

        group.items.forEach(item => {
            if (!item) return;
            // Deduplicate items if needed (requirement mentions handling duplicate items)
            // But usually we just output them all. H5P handles duplicates if they are in different spots.
            textField += ` :${escapeHtml(item)}:`;
        });
        textField += '\n';
    });

    if (!textField) {
        textField = '*Empty Group*: :Empty Item:';
    }

    return {
        h5pJson: {
            title: title,
            language: language,
            mainLibrary: 'H5P.DragText',
            embedTypes: ['div'],
            preloadedDependencies: [
                { machineName: 'H5P.DragText', majorVersion: 1, minorVersion: 10 }
            ]
        },
        contentJson: {
            taskDescription: 'Drag the items to their correct groups.',
            textField: textField.trim(),
            behaviour: {
                enableRetry: true,
                enableSolutionsButton: true,
                instantFeedback: false
            }
        }
    };
}
