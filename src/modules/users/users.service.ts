import { Types } from 'mongoose';
import { FilesService, UploadMeta } from '../../services/files.service';
import { UserModel } from '../../models/User';
import { AppError } from '../../utils/response';

export const UsersService = {
    async getMe(userId: string) {
        const user = await UserModel.findById(userId)
            .populate('avatarId', 'secureUrl mime size')
            .select('name email role avatarId')
            .lean();

        if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);
        return {
            id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatarId ? {
                id: String((user as any).avatarId._id),
                url: (user as any).avatarId.secureUrl,
                mime: (user as any).avatarId.mime,
                size: (user as any).avatarId.size
            } : null
        };
    },

    async updateMe(userId: string, dto: { name?: string }) {
        const update: any = {};
        if (dto.name !== undefined) update.name = dto.name;

        const user = await UserModel.findByIdAndUpdate(
            userId, update, { new: true, projection: 'name email role avatarId' }
        ).populate('avatarId', 'secureUrl');

        if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);

        return {
            id: user.id, name: user.name, email: user.email, role: user.role,
            avatar: user.avatarId ? { id: String((user as any).avatarId._id), url: (user as any).avatarId.secureUrl } : null
        };
    },

    /** Upload avatar mới → set avatarId → xoá avatar cũ (nếu có) */
    async setAvatarFromBuffer(userId: string, meta: UploadMeta) {
        if (!/^image\//.test(meta.mimetype)) throw new AppError('BAD_FILE', 'Only image/* allowed', 415);

        const { doc: newFile, dto } = await FilesService.uploadBufferAndCreate(meta, 'uploads/avatars');

        const me = await UserModel.findById(userId).select('avatarId').lean();
        if (!me) {
            await FilesService.deleteById(String(newFile._id)); // rollback cả file
            throw new AppError('NOT_FOUND', 'User not found', 404);
        }
        const oldAvatarId: Types.ObjectId | null = (me as any).avatarId ?? null;

        await UserModel.updateOne({ _id: userId }, { $set: { avatarId: newFile._id } });

        if (oldAvatarId) await FilesService.deleteById(String(oldAvatarId));

        return { avatar: dto, avatarId: dto.id, avatarUrl: dto.url };
    },


};
