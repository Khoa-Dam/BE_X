import { Request, Response, NextFunction } from 'express';
import { FileModel } from '../../models/File';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { success } from '../../utils/response';

const sha256 = (p: string) => { const h = crypto.createHash('sha256'); h.update(fs.readFileSync(p)); return h.digest('hex'); };

export const upload = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const f = req.file!;
        const abs = path.resolve(f.path);
        const hash = sha256(abs);

        const row = await FileModel.create({
            filename: f.originalname,
            path: f.path.replace(/\\/g, '/'),
            mime: f.mimetype,
            size: f.size,
            sha256: hash
        });

        res.json(success({
            id: row._id.toString(),
            filename: row.filename,
            url: `/${row.path}`,
            mime: row.mime,
            size: row.size,
            sha256: row.sha256
        }));
    } catch (e) { next(e); }
}
