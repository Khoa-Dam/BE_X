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
    const user = await UserModel.findOne({ email }).select('+passwordHash');
    if (!user) throw new AppError('INVALID_CREDENTIALS', 'Email or password is incorrect', 401);
    if (user.provider === AuthProvider.GOOGLE || !user.passwordHash)
        throw new AppError('INVALID_CREDENTIALS', 'This account uses Google Sign-In. Use /auth/google.', 400);

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


export async function refreshRotate(oldRefresh: string) {
    // 1) Xác thực chữ ký JWT refresh
    let decoded: { id: string; exp: number };
    try {
        decoded = jwt.verify(oldRefresh, env.JWT_REFRESH_SECRET) as any;
    } catch {
        throw new AppError('UNAUTHORIZED', 'Invalid refresh token', 401);
    }

    // 2) Kiểm tra DB: token còn hiệu lực & chưa revoke?
    const row = await RefreshTokenModel.findOne({
        userId: new Types.ObjectId(decoded.id),
        tokenHash: hashToken(oldRefresh),
        revoked: false
    });
    if (!row) throw new AppError('UNAUTHORIZED', 'Refresh token revoked/unknown', 401);
    if (dayjs(row.expiresAt).isBefore(dayjs()))
        throw new AppError('UNAUTHORIZED', 'Refresh token expired', 401);

    // 3) Lấy user
    const u = await UserModel.findById(decoded.id);
    if (!u) throw new AppError('UNAUTHORIZED', 'User not found', 401);

    // 4) Phát token mới (access + refresh), revoke cái cũ
    const payload: JwtPayload = { id: String(u._id), email: u.email, name: u.name, role: u.role };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh({ id: String(u._id) });

    // revoke cũ + lưu mới (hash)
    row.revoked = true;
    await row.save();
    await RefreshTokenModel.create({
        userId: u._id,
        tokenHash: hashToken(refreshToken),
        revoked: false,
        expiresAt: dayjs().add(env.JWT_REFRESH_EXPIRES, 'second').toDate()
    });

    // 5) Trả dữ liệu
    const user = { id: String(u._id), email: u.email, name: u.name, role: u.role };
    return { user, accessToken, refreshToken };
}

export async function logout(userId: string, oldRefresh?: string) {
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