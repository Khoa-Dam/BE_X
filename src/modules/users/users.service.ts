import { UserModel } from '../../models/User';
import { FileModel } from '../../models/File';
import { AppError } from '../../utils/response';

export const getMe = async (userId: string) => {
    const u = await UserModel.findById(userId).populate('avatarId');
    if (!u) throw new AppError('NOT_FOUND', 'User not found', 404);

    const avatar = u.avatarId
        ? { id: (u.avatarId as any)._id.toString(), url: `/${(u.avatarId as any).path}`, mime: (u.avatarId as any).mime, size: (u.avatarId as any).size }
        : null;

    return { id: u._id.toString(), name: u.name, email: u.email, role: u.role, createdAt: u.createdAt, avatar };
}

export const updateMe = async (userId: string, dto: { name?: string; avatarId?: string | null }) => {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);

    if (dto.name !== undefined) user.name = dto.name;

    if (dto.avatarId !== undefined) {
        if (dto.avatarId === null) {
            user.avatarId = null;
        } else {
            const file = await FileModel.findById(dto.avatarId);
            if (!file) throw new AppError('NOT_FOUND', 'Avatar file not found', 404);
            user.avatarId = file._id;
        }
    }

    await user.save();
    return getMe(user._id.toString());
}
