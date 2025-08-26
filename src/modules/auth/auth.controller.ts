import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as svc from './auth.service';
import { success } from '../../utils/response';

const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .regex(/^\S+$/, 'Password must not contain any spaces');

const RegisterDto = z.object({
    name: z.string().min(2),
    email: z.string().email().transform((e) => e.trim().toLowerCase()),
    password: passwordSchema
});
const LoginDto = z.object({
    email: z.string().email().transform((e) => e.trim().toLowerCase()),
    password: z.string().min(1)
});
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