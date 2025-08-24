import { Router } from 'express';
import * as c from './auth.controller';
import { verifyAccessToken } from '../../middlewares/auth';

const router = Router();

router.post('/register', c.register);
router.post('/login', c.login);
router.post('/refresh', c.refresh);
router.post('/logout', verifyAccessToken, c.logout);

export default router;
