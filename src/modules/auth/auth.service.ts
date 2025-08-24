import { UserModel, Role, AuthProvider } from '../../models/User';
import { RefreshTokenModel } from '../../models/RefreshToken';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dayjs from 'dayjs';
import crypto from 'crypto';
import { env } from '../../env';
import { AppError } from '../../utils/response';
import { Types } from 'mongoose';

type JwtPayload = { id: string; email: string; name: string; role: Role };

const signAccess = (payload: JwtPayload) =>
    jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES });

const signRefresh = (payload: { id: string }) =>
    jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES });

const hashToken = (t: string) => crypto.createHash('sha256').update(t).digest('hex');


export const register = async (name: string, email: string, password: string) => {
    const existed = await UserModel.findOne({ email });
    if (existed) throw new AppError('EMAIL_TAKEN', 'Email already registered', 409);

    const user = await UserModel.create({
        name,
        email,
        passwordHash: await bcrypt.hash(password, 10),
        role: Role.USER,
        provider: AuthProvider.LOCAL
    });

    const payload: JwtPayload = { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh({ id: user._id.toString() });

    await RefreshTokenModel.create({
        userId: user._id,
        tokenHash: hashToken(refreshToken),
        expiresAt: dayjs().add(env.JWT_REFRESH_EXPIRES, 'second').toDate()
    });

    return { user: payload, accessToken, refreshToken };

}


export const login = async (email: string, password: string) => {
    const user = await UserModel.findOne({ email });
    if (!user) throw new AppError('INVALID_CREDENTIALS', 'Email or password is incorrect', 401);
    if (user.provider === AuthProvider.GOOGLE || !user.passwordHash)
        throw new AppError('LOGIN_WITH_GOOGLE', 'This account uses Google Sign-In. Use /auth/google.', 400);

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new AppError('INVALID_CREDENTIALS', 'Email or password is incorrect', 401);

    const payload: JwtPayload = { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh({ id: user._id.toString() });

    await RefreshTokenModel.create({
        userId: user._id,
        tokenHash: hashToken(refreshToken),
        expiresAt: dayjs().add(env.JWT_REFRESH_EXPIRES, 'second').toDate()
    });

    return { user: payload, accessToken, refreshToken };
}


export const refresh = async (oldRefresh: string) => {
    try {
        const payload = jwt.verify(oldRefresh, env.JWT_REFRESH_SECRET) as { id: string; exp: number };
        const row = await RefreshTokenModel.findOne({
            userId: new Types.ObjectId(payload.id),
            tokenHash: hashToken(oldRefresh),
            revoked: false
        });
        if (!row) throw new AppError('UNAUTHORIZED', 'Refresh token revoked/unknown', 401);
        if (dayjs(row.expiresAt).isBefore(dayjs())) throw new AppError('UNAUTHORIZED', 'Refresh token expired', 401);

        const u = await UserModel.findById(payload.id);
        if (!u) throw new AppError('UNAUTHORIZED', 'User not found', 401);

        const accessToken = signAccess({ id: u._id.toString(), email: u.email, name: u.name, role: u.role });
        return { accessToken };
    } catch {
        throw new AppError('UNAUTHORIZED', 'Invalid refresh token', 401);
    }
}

export async function logout(userId: number, oldRefresh?: string) {
    if (!oldRefresh) return true;
    await RefreshTokenModel.updateOne(
        { userId: new Types.ObjectId(userId), tokenHash: hashToken(oldRefresh), revoked: false },
        { $set: { revoked: true } }
    );
    return true;
}

/** Phát JWT (access/refresh) cho một userId — dùng trong Google callback */
export async function issueTokensForUserId(userId: string) {
    const u = await UserModel.findById(userId);
    if (!u) throw new AppError('NOT_FOUND', 'User not found', 404);

    const payload: JwtPayload = { id: u._id.toString(), email: u.email, name: u.name, role: u.role };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh({ id: u._id.toString() });

    await RefreshTokenModel.create({
        userId: u._id,
        tokenHash: hashToken(refreshToken),
        expiresAt: dayjs().add(env.JWT_REFRESH_EXPIRES, 'second').toDate()
    });

    return { user: payload, accessToken, refreshToken };
}