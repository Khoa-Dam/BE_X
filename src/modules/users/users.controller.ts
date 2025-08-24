import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as svc from './users.service';
import { success } from '../../utils/response';

const UpdateMeDto = z.object({
    name: z.string().min(2).optional(),
    avatarId: z.string().regex(/^[a-fA-F0-9]{24}$/).nullable().optional()
});

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(success(await svc.getMe(String(req.user!.id)))); } catch (e) { next(e); }
}
export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
    try { const dto = UpdateMeDto.parse(req.body); res.json(success(await svc.updateMe(String(req.user!.id), dto))); }
    catch (e) { next(e); }
}
