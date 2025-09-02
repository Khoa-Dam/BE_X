import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { success } from '../../utils/response';
import * as svc from './users.service';

export const me = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const out = await svc.me(String(req.user!.id));
        res.json(success(out));
    } catch (e) { next(e); }
};

const usernameRegex = /^[a-z0-9_]+$/i;

const UpdateMeDto = z.object({
    name: z.string().min(1).max(100).optional(),
    bio: z.string().max(500).optional(),
    occupation: z.string().max(100).optional(),
    location: z.string().max(120).optional(),
    username: z.string().min(3).max(30).regex(usernameRegex).toLowerCase().trim().optional(),
    // Cho phép gỡ liên kết ảnh qua PATCH /me
    avatarId: z.string().regex(/^[a-fA-F0-9]{24}$/).nullable().optional(),
    backgroundAvatarId: z.string().regex(/^[a-fA-F0-9]{24}$/).nullable().optional()
});

export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto = UpdateMeDto.parse(req.body);
        const out = await svc.updateProfile(String(req.user!.id), dto);
        res.json(success(out));
    } catch (e) { next(e); }
};

export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) throw new Error('Missing file');
        const out = await svc.setAvatarFromBuffer(String(req.user!.id), req.file);
        res.json(success(out));
    } catch (e) { next(e); }
};

export const uploadBackground = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) throw new Error('Missing file');
        const out = await svc.setBackgroundFromBuffer(String(req.user!.id), req.file);
        res.json(success(out));
    } catch (e) { next(e); }
};
