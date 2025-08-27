import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as svc from './auth.service';
import { success } from '../../utils/response';
import { clearAuthCookies, baseCookieOpts, COOKIE_REFRESH, setAuthCookies } from '../../utils/cookies';
import { env } from '../../env';
import { refreshRotate } from './auth.service';

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
        const { name, email, password } = RegisterDto.parse(req.body);
        const { user, accessToken, refreshToken } = await svc.register(name, email, password);

        setAuthCookies(res, accessToken, refreshToken, env.JWT_ACCESS_EXPIRES, env.JWT_REFRESH_EXPIRES);
        console.log('✅ [REGISTER] Success for user:', email);
        return res.json(success(user));
    } catch (e) {
        console.error('❌ [REGISTER] Lỗi:', e instanceof Error ? e.message : 'Unknown error');
        next(e);
    }
}


export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = LoginDto.parse(req.body);
        const { user, accessToken, refreshToken } = await svc.login(email, password);

        setAuthCookies(res, accessToken, refreshToken, env.JWT_ACCESS_EXPIRES, env.JWT_REFRESH_EXPIRES);
        console.log('✅ [LOGIN] Success for user:', email);
        return res.json(success(user));
    } catch (e) {
        console.error('❌ [LOGIN] Lỗi:', e instanceof Error ? e.message : 'Unknown error');
        next(e);
    }
}


export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const fromCookie = req.cookies?.[COOKIE_REFRESH] as string | undefined;
        const fromBody = req.body?.refreshToken as string | undefined;
        const token = fromCookie ?? fromBody;

        if (!token) {
            console.log('❌ [REFRESH] No refresh token found');
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: 'NO_REFRESH',
                    message: 'Missing refresh token'
                }
            });
        }

        const out = await refreshRotate(token);
        setAuthCookies(res, out.accessToken, out.refreshToken, env.JWT_ACCESS_EXPIRES, env.JWT_REFRESH_EXPIRES);
        console.log('✅ [REFRESH] Success for user:', out.user.email);
        return res.json(success(out.user));
    } catch (e) {
        console.error('❌ [REFRESH] Lỗi:', e instanceof Error ? e.message : 'Unknown error');
        next(e);
    }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rtFromBody = req.body?.refreshToken as string | undefined;
        const rtFromCookie = req.cookies?.[COOKIE_REFRESH] as string | undefined;
        const refreshToken = rtFromBody ?? rtFromCookie;

        if (req.user?.id && refreshToken) {
            await svc.logout(req.user.id, refreshToken);
        }

        clearAuthCookies(res);
        res.clearCookie('g_oauth_state', { ...baseCookieOpts });

        console.log('✅ [LOGOUT] Success ');
        return res.json(success(true));
    } catch (e) {
        console.error('❌ [LOGOUT] Lỗi:', e instanceof Error ? e.message : 'Unknown error');
        next(e);
    }
}
