import { Router } from 'express';
import { verifyAccessToken } from '../../middlewares/auth';
import * as ctrl from './users.controller';
const router = Router();

router.get('/me', verifyAccessToken, ctrl.getMe);
router.patch('/me', verifyAccessToken, ctrl.updateMe);
export default router;
