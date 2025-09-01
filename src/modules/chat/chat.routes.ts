import { Router } from 'express';
import { verifyAccessToken } from '../../middlewares/auth';
import * as ctrl from './chat.controller';

const router = Router();

// Tất cả routes cần authentication
router.use(verifyAccessToken);

// Lấy danh sách chat
router.get('/', ctrl.getChats);

// Lấy/tạo chat với user
router.get('/with/:userId', ctrl.getOrCreateChat);

router.get('/:chatId/messages', ctrl.getMessages);


// Gửi tin nhắn trong chat
router.post('/:chatId/messages', ctrl.sendMessage);

// Đánh dấu đã đọc
router.post('/:chatId/read', ctrl.markAsRead);

export default router;
