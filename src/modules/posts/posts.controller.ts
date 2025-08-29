import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as svc from './posts.service';
import { parsePagination, buildMeta } from '../../utils/pagination';
import { success } from '../../utils/response';

const CreateDto = z.object({
    content: z.string().min(1).max(1000),
    status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    coverId: z.string().regex(/^[a-fA-F0-9]{24}$/).optional().nullable()
});
const UpdateDto = CreateDto.partial();

export const list = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip, take } = parsePagination(req.query);
        const search = req.query.search as string | undefined;
        const sort = (req.query.sort as 'createdAt' | 'content' | undefined) ?? 'createdAt';
        const order = (req.query.order as 'asc' | 'desc' | undefined) ?? 'desc';
        const { total, items } = await svc.list({ search, sort, order, skip, take });
        res.json(success(items, buildMeta(total, page, limit)));
    } catch (e) { next(e); }
}
export const detail = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(success(await svc.getById(String(req.params.id)))); }
    catch (e) { next(e); }
}
export const create = async (req: Request, res: Response, next: NextFunction) => {
    try { const dto = CreateDto.parse(req.body); res.json(success(await svc.create(String(req.user!.id), dto))); }
    catch (e) { next(e); }
}
export const update = async (req: Request, res: Response, next: NextFunction) => {
    try { const dto = UpdateDto.parse(req.body); res.json(success(await svc.update(String(req.params.id), String(req.user!.id), dto))); }
    catch (e) { next(e); }
}
export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try { await svc.remove(String(req.params.id), String(req.user!.id)); res.json(success(true)); }
    catch (e) { next(e); }
}
