import crypto from 'crypto';
import { env } from '../env';
import { FileModel } from '../models/File';
import { uploadBufferToCloudinary, destroyOnCloudinary } from '../utils/uploader';
import { asFileDTO } from '../types/file.dto';

export type UploadMeta = {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
};

export const FilesService = {
    async uploadBufferAndCreate(meta: UploadMeta, folder = env.CLOUDINARY_FOLDER) {
        const sha256 = crypto.createHash('sha256').update(meta.buffer).digest('hex');
        const cld = await uploadBufferToCloudinary(meta.buffer, folder, 'auto');

        let row: any = null;
        try {
            row = await FileModel.create({
                filename: meta.originalname,
                mime: meta.mimetype,
                size: meta.size,
                sha256,
                provider: 'cloudinary',
                publicId: cld.public_id,
                secureUrl: cld.secure_url,
                resourceType: cld.resource_type,
                format: cld.format,
                width: cld.width,
                height: cld.height,
                bytes: cld.bytes
            });
        } catch (e) {
            await destroyOnCloudinary(cld.public_id, cld.resource_type);
            throw e;
        }

        return { doc: row, dto: asFileDTO(row) };
    },

    async deleteById(fileId: string) {
        const row = await FileModel.findById(fileId);
        if (!row) return false;
        await destroyOnCloudinary(row.publicId, row.resourceType);
        await row.deleteOne();
        return true;
    }
};
