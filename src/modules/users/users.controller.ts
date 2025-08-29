import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { success, AppError } from '../../utils/response';
import { UsersService } from './users.service';

export async function getMe(req: Request, res: Response, next: NextFunction) {
    try { res.json(success(await UsersService.getMe(req.user!.id))); }
    catch (e) { next(e); }
}

const UpdateMeDto = z.object({ 
    name: z.string().trim().min(2).max(100).optional(),
    bio: z.string().trim().max(500).optional(),
    occupation: z.string().trim().max(100).optional(),
    location: z.string().trim().max(100).optional(),
    username: z.string().trim().max(50).optional(),
    joinDate: z.string().optional(),
    backgroundAvatar: z.string().url().optional()
});
export async function updateMe(req: Request, res: Response, next: NextFunction) {
    try { res.json(success(await UsersService.updateMe(req.user!.id, UpdateMeDto.parse(req.body)))); }
    catch (e) { next(e); }
}

export async function uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.file) throw new AppError('NO_FILE', 'Missing file', 400);
        const result = await UsersService.setAvatarFromBuffer(req.user!.id, {
            buffer: req.file.buffer,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
        res.json(success({ user: { id: req.user!.id, avatarId: result.avatarId, avatarUrl: result.avatarUrl }, file: result.avatar }));
    } catch (e) { next(e); }
}

