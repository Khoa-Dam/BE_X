import { Router } from 'express';
import { verifyAccessToken } from '../../middlewares/auth';
import * as ctrl from './follow.controller';

const router = Router();

// Tất cả routes cần authentication
router.use(verifyAccessToken);

// Follow/unfollow user
router.post('/users/:userId/follow', ctrl.followUser);
router.delete('/users/:userId/follow', ctrl.unfollowUser);

// Get followers/following
router.get('/users/:userId/followers', ctrl.getFollowers);
router.get('/users/:userId/following', ctrl.getFollowing);

// Check if following
router.get('/users/:userId/is-following', ctrl.checkFollowing);

export default router;
