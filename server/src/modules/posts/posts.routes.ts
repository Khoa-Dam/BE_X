import { Router } from 'express';
import * as c from './posts.controller';
import { verifyAccessToken } from '../../middlewares/auth';

const router = Router();
router.get('/', c.list);
router.get('/:id', c.detail);
router.post('/', verifyAccessToken, c.create);
router.patch('/:id', verifyAccessToken, c.update);
router.delete('/:id', verifyAccessToken, c.remove);
export default router;
