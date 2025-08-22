import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env';
import { AppError } from '../utils/response';

export interface JwtUser { id: number; email: string; name: string; role: 'USER' | 'ADMIN'; }
declare global { namespace Express { interface Request { user?: JwtUser; } } }

export function verifyAccessToken(req: Request, _res: Response, next: NextFunction) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer '))
        return next(new AppError('UNAUTHORIZED', 'Missing Bearer token', 401));
    try {
        req.user = jwt.verify(auth.slice(7), env.JWT_ACCESS_SECRET) as JwtUser;
        next();
    } catch {
        next(new AppError('UNAUTHORIZED', 'Invalid/Expired token', 401));
    }
}
