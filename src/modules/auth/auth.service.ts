
import { env } from '../../env';
import { AppDataSource } from '../../db';
import { AppError } from '../../utils/response';
import { RefreshToken } from '../../entities/RefreshToken';
import { AuthProvider, Role, User } from "../../entities/User";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dayjs from 'dayjs';

type JwtPayload = { id: number, email: string, name: string, role: Role };

const signAccess = (payload: JwtPayload) =>
    jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES });

const signRefresh = (payload: { id: number }) =>
    jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES });

const hashToken = (t: string) => crypto.createHash('sha256').update(t).digest('hex');


export const register = async (name: string, email: string, password: string) => {
    const userRepo = AppDataSource.getRepository(User);
    if (await userRepo.findOne({ where: { email } })) {
        throw new AppError('EMAIL_TAKEN', 'Email already registered', 409);
    }

    const user = userRepo.create({
        name,
        email,
        passwordHash: await bcrypt.hash(password, 10),
        role: Role.USER,
        provider: AuthProvider.LOCAL
    })

    await userRepo.save(user);

    const payload: JwtPayload = { id: user.id, email: user.email, name: user.name, role: user.role };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh({ id: user.id });

    await AppDataSource.getRepository(RefreshToken).save({
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: dayjs().add(env.JWT_REFRESH_EXPIRES, 'second').toDate()
    })

    return { user: payload, accessToken, refreshToken };

}


export const login = async (email: string, password: string) => {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });

    if (!user) throw new AppError('INVALID_CREDENTIALS', 'Email or password is incorrect', 401);

    if (user.provider === AuthProvider.GOOGLE || !user.passwordHash)
        throw new AppError('LOGIN_WITH_GOOGLE', 'This account uses Google Sign-In. Use /auth/google.', 400);

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new AppError('INVALID_CREDENTIALS', 'Email or password is incorrect', 401);

    const payload: JwtPayload = { id: user.id, email: user.email, name: user.name, role: user.role };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh({ id: user.id });

    await AppDataSource.getRepository(RefreshToken).save({
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: dayjs().add(env.JWT_REFRESH_EXPIRES, 'second').toDate()
    })

    return { user: payload, accessToken, refreshToken };
}


export const me = async (userId: number) => {
    const user = await AppDataSource.getRepository(User).findOne({
        where: { id: userId },
        select: ['id', 'email', 'name', 'role', 'avatarId', 'createdAt'],
    });
    return user;
}

export const refresh = async (oldRefresh: string) => {
    try {
        const payload = jwt.verify(oldRefresh, env.JWT_REFRESH_SECRET) as { id: number; exp: number };
        const row = await AppDataSource.getRepository(RefreshToken).findOne({
            where: { userId: payload.id, tokenHash: hashToken(oldRefresh), revoked: false },
        });
        if (!row) throw new AppError('UNAUTHORIZED', 'Refresh token revoked/unknown', 401);
        if (dayjs(row.expiresAt).isBefore(dayjs()))
            throw new AppError('UNAUTHORIZED', 'Refresh token expired', 401);

        const u = await AppDataSource.getRepository(User).findOne({ where: { id: payload.id } });
        if (!u) throw new AppError('UNAUTHORIZED', 'User not found', 401);

        const accessToken = signAccess({ id: u.id, email: u.email, name: u.name, role: u.role });
        return { accessToken };
    } catch {
        throw new AppError('UNAUTHORIZED', 'Invalid refresh token', 401);
    }
}

export async function logout(userId: number, oldRefresh?: string) {
    if (!oldRefresh) return true;
    await AppDataSource.getRepository(RefreshToken)
        .createQueryBuilder()
        .update(RefreshToken).set({ revoked: true })
        .where('user_id = :userId AND token_hash = :hash AND revoked = false',
            { userId, hash: hashToken(oldRefresh) })
        .execute();
    return true;
}