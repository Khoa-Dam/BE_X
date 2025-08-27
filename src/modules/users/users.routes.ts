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
router.get('/me', verifyAccessToken, ctrl.getMe);

// Cập nhật thông tin cơ bản (ví dụ: name)
router.patch('/me', verifyAccessToken, ctrl.updateMe);

// Upload avatar: upload -> gán avatarId -> xoá avatar cũ (nếu có)
router.post('/me/avatar', verifyAccessToken, upload.single('file'), ctrl.uploadAvatar);



export default router;
