import { Request, Response, NextFunction } from 'express';
import * as svc from './follow.service';
import { success } from '../../utils/response';

export const followUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        await svc.followUser(req.user!.id, userId);
        res.json(success(true));
    } catch (e) { next(e); }
};

export const unfollowUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        await svc.unfollowUser(req.user!.id, userId);
        res.json(success(true));
    } catch (e) { next(e); }
};

export const getFollowers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const followers = await svc.getFollowers(userId);
        res.json(success(followers));
    } catch (e) { next(e); }
};

export const getFollowing = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const following = await svc.getFollowing(userId);
        res.json(success(following));
    } catch (e) { next(e); }
};

export const checkFollowing = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const isFollowing = await svc.checkFollowing(req.user!.id, userId);
        res.json(success(isFollowing));
    } catch (e) { next(e); }
};
