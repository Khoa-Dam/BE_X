import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env';
import { AppError } from '../utils/response';

export interface JwtUser { id: string; email: string; name: string; role: 'USER' | 'ADMIN'; }
declare global { namespace Express { interface Request { user?: JwtUser; } } }

export function verifyAccessToken(req: Request, _res: Response, next: NextFunction) {
    // Try Authorization header first (for API clients)
    let token = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null;

    // Fallback to cookies (for web browser)
    if (!token) {
        token = req.cookies?.access_token;
    }

    if (!token) {
        return next(new AppError('UNAUTHORIZED', 'Missing token', 401));
    }

    try {
        req.user = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtUser;
        next();
    } catch {
        next(new AppError('UNAUTHORIZED', 'Invalid/Expired token', 401));
    }
}
