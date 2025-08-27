import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { success, AppError } from '../../utils/response';
import { FilesService } from '../../services/files.service';
import { FileModel } from '../../models/File';

export async function uploadMultipart(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.file) throw new AppError('NO_FILE', 'Missing file', 400);
        const { dto } = await FilesService.uploadBufferAndCreate({
            buffer: req.file.buffer,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
        res.json(success(dto));
    } catch (e) { next(e); }
}

export async function getFileMeta(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        if (!Types.ObjectId.isValid(id)) throw new AppError('BAD_ID', 'Invalid id', 400);
        const row = await FileModel.findById(id).lean();
        if (!row) throw new AppError('NOT_FOUND', 'File not found', 404);
        res.json(success({
            id: String(row._id),
            filename: row.filename,
            url: row.secureUrl,
            mime: row.mime,
            size: row.size,
            provider: row.provider,
            publicId: row.publicId,
            width: row.width,
            height: row.height,
            createdAt: row.createdAt
        }));
    } catch (e) { next(e); }
}

export async function deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        if (!Types.ObjectId.isValid(id)) throw new AppError('BAD_ID', 'Invalid id', 400);
        const ok = await FilesService.deleteById(id);
        if (!ok) throw new AppError('NOT_FOUND', 'File not found', 404);
        res.json(success(true));
    } catch (e) { next(e); }
}
