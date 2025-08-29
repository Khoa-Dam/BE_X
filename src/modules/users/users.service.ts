import { Types } from 'mongoose';
import { FilesService, UploadMeta } from '../../services/files.service';
import { UserModel } from '../../models/User';
import { AppError } from '../../utils/response';

export const UsersService = {
    async getMe(userId: string) {
        const user = await UserModel.findById(userId)
            .populate('avatarId', 'secureUrl mime size')
            .select('name email role avatarId bio occupation location username joinDate backgroundAvatar')
            .lean();

        if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);
        return {
            id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
            bio: user.bio || '',
            occupation: user.occupation || '',
            location: user.location || '',
            username: user.username || '',
            joinDate: user.joinDate || new Date().getFullYear().toString(),
            backgroundAvatar: user.backgroundAvatar || '',
            avatar: user.avatarId ? {
                id: String((user as any).avatarId._id),
                url: (user as any).avatarId.secureUrl,
                mime: (user as any).avatarId.mime,
                size: (user as any).avatarId.size
            } : null
        };
    },

    async updateMe(userId: string, dto: { 
        name?: string, 
        bio?: string, 
        occupation?: string, 
        location?: string, 
        username?: string, 
        joinDate?: string,
        backgroundAvatar?: string 
    }) {
        const update: any = {};
        if (dto.name !== undefined) update.name = dto.name;
        if (dto.bio !== undefined) update.bio = dto.bio;
        if (dto.occupation !== undefined) update.occupation = dto.occupation;
        if (dto.location !== undefined) update.location = dto.location;
        if (dto.username !== undefined) update.username = dto.username;
        if (dto.joinDate !== undefined) update.joinDate = dto.joinDate;
        if (dto.backgroundAvatar !== undefined) {
            update.backgroundAvatar = dto.backgroundAvatar;
        }

        const user = await UserModel.findByIdAndUpdate(
            userId, update, { new: true, projection: 'name email role avatarId bio occupation location username joinDate backgroundAvatar' }
        ).populate('avatarId', 'secureUrl');

        if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);

        return {
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role,
            bio: user.bio,
            occupation: user.occupation,
            location: user.location,
            username: user.username,
            joinDate: user.joinDate,
            backgroundAvatar: user.backgroundAvatar,
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
