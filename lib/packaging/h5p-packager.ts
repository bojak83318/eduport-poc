import { createClient } from '@supabase/supabase-js';
import { H5PPackageData, PackagingError } from '../types';
import pino from 'pino';
import AdmZip from 'adm-zip';

const logger = pino({
    name: 'h5p-packager',
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});

/**
 * H5P Packager service using Supabase for storage
 * 
 * NOTE: This is a simplified implementation for MVP.
 * In production, use @lumieducation/h5p-nodejs-library for full spec compliance.
 */
export class H5PPackager {
    private supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    /**
     * Create H5P package from transformed data
     * Returns URL to download the .h5p file from Supabase Storage
     */
    async createPackage(
        data: H5PPackageData,
        activityId: string,
        userId?: string
    ): Promise<{ packageUrl: string; buffer: Buffer }> {
        try {
            logger.info({ activityId, userId }, 'Creating H5P package');

            // 1. Create ZIP archive
            const zip = new AdmZip();

            // 2. Add h5p.json (package metadata)
            const h5pJson = {
                ...data.h5pJson,
                // Add required H5P metadata
                coreApi: { majorVersion: 1, minorVersion: 24 },
                author: userId || 'EduPort',
                contentType: 'H5P.Package 1.0',
            };

            zip.addFile('h5p.json', Buffer.from(JSON.stringify(h5pJson, null, 2)));

            // 3. Add content/content.json (activity data)
            zip.addFile(
                'content/content.json',
                Buffer.from(JSON.stringify(data.contentJson, null, 2))
            );

            // 4. Generate buffer
            const buffer = zip.toBuffer();

            logger.info(
                { activityId, sizeKB: Math.round(buffer.length / 1024) },
                'Package created'
            );

            // 5. Upload to Supabase Storage (optional - API returns buffer directly)
            let packageUrl = '';
            try {
                const fileName = `${userId || 'anonymous'}/${activityId}-${Date.now()}.h5p`;
                const { data: uploadData, error } = await this.supabase.storage
                    .from('h5p-packages')
                    .upload(fileName, buffer, {
                        contentType: 'application/h5p',
                        cacheControl: '3600',
                        upsert: true,
                    });

                if (error) {
                    // Log but don't fail - storage is optional since API returns buffer directly
                    logger.warn({ error: error.message }, 'Storage upload failed (optional, continuing)');
                } else {
                    // 6. Get public URL (24h signed URL)
                    const { data: urlData } = await this.supabase.storage
                        .from('h5p-packages')
                        .createSignedUrl(fileName, 86400); // 24 hours

                    if (urlData?.signedUrl) {
                        packageUrl = urlData.signedUrl;
                        logger.info({ activityId, packageUrl }, 'Package uploaded to storage');
                    }
                }
            } catch (uploadError) {
                // Storage upload is optional - API returns buffer directly
                logger.warn({ error: (uploadError as Error).message }, 'Storage upload failed (optional)');
            }

            return {
                packageUrl,
                buffer,
            };
        } catch (error) {
            logger.error({ activityId, error }, 'Package creation failed');
            throw error instanceof PackagingError
                ? error
                : new PackagingError(`Package creation failed: ${(error as Error).message}`);
        }
    }

    /**
     * Delete old packages for cleanup (called by cron job)
     */
    async cleanupOldPackages(olderThanDays: number = 30): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

            const { data: files, error } = await this.supabase.storage
                .from('h5p-packages')
                .list(undefined, {
                    limit: 1000,
                    sortBy: { column: 'created_at', order: 'asc' },
                });

            if (error) {
                throw error;
            }

            const oldFiles = (files || []).filter(
                f => new Date(f.created_at) < cutoffDate
            );

            if (oldFiles.length === 0) {
                logger.info('No old packages to delete');
                return 0;
            }

            const { error: deleteError } = await this.supabase.storage
                .from('h5p-packages')
                .remove(oldFiles.map(f => f.name));

            if (deleteError) {
                throw deleteError;
            }

            logger.info({ deletedCount: oldFiles.length }, 'Cleaned up old packages');
            return oldFiles.length;
        } catch (error) {
            logger.error({ error }, 'Cleanup failed');
            throw error;
        }
    }
}
