import { Router } from 'express';
import multer from 'multer';
import { verifyAccessToken } from '../../middlewares/auth';
import * as c from './uploads.controller';

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }
});

// Upload chung
router.post('/', verifyAccessToken, upload.single('file'), c.uploadMultipart);

// Metadata
router.get('/:id', c.getFileMeta);

// Delete
router.delete('/:id', verifyAccessToken, c.deleteFile);

export default router;
