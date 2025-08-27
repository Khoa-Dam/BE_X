import { Response } from 'express';
import { env } from '../env';
export const COOKIE_ACCESS = 'access_token';
export const COOKIE_REFRESH = 'refresh_token';

export const baseCookieOpts = {
    httpOnly: true as const,
    sameSite: env.COOKIE_SAMESITE as 'lax' | 'none' | 'strict', // .env
    secure: env.COOKIE_SECURE,  // true khi HTTPS/cross-site
    path: '/',                  // nếu bạn set domain thì thêm domain ở đây
    // domain: 'your.domain.com',
};

export function setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
    accessSec: number,
    refreshSec: number
) {
    res.cookie(COOKIE_ACCESS, accessToken, { ...baseCookieOpts, maxAge: accessSec * 1000 });
    res.cookie(COOKIE_REFRESH, refreshToken, { ...baseCookieOpts, maxAge: refreshSec * 1000 });
}

export function clearAuthCookies(res: Response) {
    res.clearCookie(COOKIE_ACCESS, baseCookieOpts);
    res.clearCookie(COOKIE_REFRESH, baseCookieOpts);
}
