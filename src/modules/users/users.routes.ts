import { Router } from 'express';
import multer from 'multer';
import { verifyAccessToken } from '../../middlewares/auth';
import * as ctrl from './users.controller';

const router = Router();

// Multer dùng memory storage (không ghi đĩa), giới hạn 20MB
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 },
});

// Lấy thông tin user hiện tại
router.get('/me', verifyAccessToken, ctrl.me);

// Cập nhật thông tin cơ bản (name, bio, occupation, location, username, avatarId/backgroundAvatar = null để xoá link)
router.patch('/me', verifyAccessToken, ctrl.updateMe);

// Upload avatar: upload -> gán avatarId
router.post('/me/avatar', verifyAccessToken, upload.single('file'), ctrl.uploadAvatar);

// Upload background: upload -> gán backgroundAvatar
router.post('/me/background', verifyAccessToken, upload.single('file'), ctrl.uploadBackground);

export default router;
