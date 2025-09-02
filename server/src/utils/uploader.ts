import { Readable } from 'stream';
import cloudinary from '../lib/cloudinary';
import { env } from '../env';

export function bufferToStream(buffer: Buffer): Readable {
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    return readable;
}

export function uploadBufferToCloudinary(
    buffer: Buffer,
    folder: string = env.CLOUDINARY_FOLDER,
    resource: 'image' | 'video' | 'raw' | 'auto' = 'auto'
) {
    return new Promise<any>((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
            { folder, resource_type: resource },
            (error, result) => (error ? reject(error) : resolve(result))
        );
        bufferToStream(buffer).pipe(upload);
    });
}

export async function destroyOnCloudinary(publicId: string, resourceType?: string) {
    const rt = (resourceType as any) || 'image';
    try { await cloudinary.uploader.destroy(publicId, { resource_type: rt }); } catch { /* ignore */ }
}
