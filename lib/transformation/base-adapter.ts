import { ActivityPayload, H5PPackageData } from '../types';

export interface IH5PAdapter {
    /**
     * Check if this adapter can convert the given Wordwall template type
     */
    canConvert(templateType: string): boolean;

    /**
     * Convert Wordwall activity payload to H5P package data
     */
    convert(activity: ActivityPayload): H5PPackageData;
}

export abstract class BaseAdapter implements IH5PAdapter {
    abstract canConvert(templateType: string): boolean;
    abstract convert(activity: ActivityPayload): H5PPackageData;

    protected escapeHtml(text: string): string {
        if (!text) return '';

        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    protected cleanText(text: string): string {
        if (!text) return '';

        // Remove excessive whitespace and normalize
        return text
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, '\n');
    }
}
