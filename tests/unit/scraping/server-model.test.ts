
import { describe, it, expect } from 'vitest';
import { extractServerModel } from '../../../lib/scraping/patterns';

describe('ServerModel Extraction', () => {
    it('should extract activity details from ServerModel script', () => {
        const mockHtml = `
            <!DOCTYPE html>
            <html>
            <body>
            <script>
                var s=window.ServerModel={};
                s.userId=Number(0);
                s.activityId=Number(101727466);
                s.activityTitle=" Have got/has got - affirmative, negative";
                s.activityGuid="cdaa6c77afac49a59f03a72c647de7e4";
                s.templateId=Number(5);
            </script>
            </body>
            </html>
        `;

        const model = extractServerModel(mockHtml);

        expect(model).not.toBeNull();
        expect(model?.activityId).toBe('101727466');
        expect(model?.activityGuid).toBe('cdaa6c77afac49a59f03a72c647de7e4');
        expect(model?.templateId).toBe('5');
        expect(model?.activityTitle).toBe(' Have got/has got - affirmative, negative');
    });

    it('should return null if ServerModel is missing', () => {
        const mockHtml = '<html><body>No model here</body></html>';
        const model = extractServerModel(mockHtml);
        expect(model).toBeNull();
    });
});
