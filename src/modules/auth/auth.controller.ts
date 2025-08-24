import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as svc from './auth.service';
import { success } from '../../utils/response';

const RegisterDto = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6) });
const LoginDto = z.object({ email: z.string().email(), password: z.string().min(6) });
const RefreshDto = z.object({ refreshToken: z.string().min(10) });

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto = RegisterDto.parse(req.body);
        res.json(success(await svc.register(dto.name, dto.email, dto.password)));
    }
    catch (e) { next(e); }
}


export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto = LoginDto.parse(req.body);
        res.json(success(await svc.login(dto.email, dto.password)));
    }
    catch (e) { next(e); }
}


export async function refresh(req: Request, res: Response, next: NextFunction) {
    try {
        const { refreshToken } = RefreshDto.parse(req.body);
        res.json(success(await svc.refresh(refreshToken)));
    }
    catch (e) { next(e); }
}
export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        const rt = (req.body?.refreshToken as string | undefined);
        await svc.logout(req.user!.id, rt); res.json(success(true));
    }
    catch (e) { next(e); }
}