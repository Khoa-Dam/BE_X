import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import { env } from '../../env';
import { verifyAccessToken } from '../../middlewares/auth';
import * as c from './uploads.controller';

const router = Router();

if (!fs.existsSync(env.UPLOAD_DIR)) fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, env.UPLOAD_DIR),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
});

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

router.post('/', verifyAccessToken, upload.single('file'), c.upload);
export default router;
