import { Types } from 'mongoose';
import { UserModel } from '../../models/User';
import { FileModel } from '../../models/File';
import { AppError } from '../../utils/response';
import { FilesService } from '../../services/files.service';

// Helper chuẩn hoá URL từ tài liệu File (hỗ trợ cả secureUrl và url)
const pickFileUrl = (f: any): string | null => {
    if (!f) return null;
    return f.secureUrl ?? f.url ?? null;
};

// Chuẩn hoá shape trả về của user + bổ sung avatarUrl/backgroundUrl
const toPublicUser = (doc: any) => {
    const o = doc.toObject ? doc.toObject() : doc;
    const avatarUrl = pickFileUrl(o.avatarId);
    const backgroundUrl = pickFileUrl(o.backgroundAvatar);

    return {
        ...o,
        id: o._id?.toString?.() ?? String(o._id),
        // vẫn trả id của file để client dùng khi cần
        avatarId: o.avatarId?._id ?? o.avatarId ?? null,
        backgroundAvatar: o.backgroundAvatar?._id ?? o.backgroundAvatar ?? null,
        // URL thống nhất
        avatarUrl,
        backgroundUrl,
    };
};

export const me = async (userId: string) => {
    const user = await UserModel.findById(userId)
        .populate({ path: 'avatarId', select: '_id secureUrl url filename mime size' })
        .populate({ path: 'backgroundAvatarId', select: '_id secureUrl url filename mime size' });
    if (!user) throw new AppError('UNAUTHORIZED', 'User not found', 401);
    return toPublicUser(user);
};

type UpdateProfileInput = {
    name?: string;
    bio?: string;
    occupation?: string;
    location?: string;
    username?: string;
    avatarId?: string | null;
    backgroundAvatar?: string | null;
};

export const updateProfile = async (userId: string, dto: UpdateProfileInput) => {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError('UNAUTHORIZED', 'User not found', 401);

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.bio !== undefined) user.bio = dto.bio;
    if (dto.occupation !== undefined) user.occupation = dto.occupation;
    if (dto.location !== undefined) user.location = dto.location;

    if (dto.username !== undefined && dto.username !== user.username) {
        const dup = await UserModel.findOne({ username: dto.username });
        if (dup && dup._id.toString() !== userId) {
            throw new AppError('USERNAME_TAKEN', 'Username is already in use', 409);
        }
        user.username = dto.username;
    }

    // avatarId liên kết trực tiếp (set/null)
    if (dto.avatarId !== undefined) {
        if (dto.avatarId === null) {
            user.avatarId = null;
        } else {
            if (!Types.ObjectId.isValid(dto.avatarId)) throw new AppError('BAD_ID', 'Invalid avatarId', 400);
            const f = await FileModel.findById(dto.avatarId);
            if (!f) throw new AppError('NOT_FOUND', 'Avatar file not found', 404);
            user.avatarId = f._id;
        }
    }

    // backgroundAvatar liên kết trực tiếp (set/null)
    if (dto.backgroundAvatar !== undefined) {
        if (dto.backgroundAvatar === null) {
            user.backgroundAvatar = null;
        } else {
            if (!Types.ObjectId.isValid(dto.backgroundAvatar)) throw new AppError('BAD_ID', 'Invalid backgroundAvatar', 400);
            const f = await FileModel.findById(dto.backgroundAvatar);
            if (!f) throw new AppError('NOT_FOUND', 'Background file not found', 404);
            user.backgroundAvatar = f._id;
        }
    }

    await user.save();

    // Lấy lại với populate để trả URL thống nhất
    const fresh = await UserModel.findById(user._id)
        .populate({ path: 'avatarId', select: '_id secureUrl url filename mime size' })
        .populate({ path: 'backgroundAvatar', select: '_id secureUrl url filename mime size' });

    return toPublicUser(fresh!);
};

// Upload từ buffer -> tạo File -> gán avatarId
export const setAvatarFromBuffer = async (userId: string, file: Express.Multer.File) => {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError('UNAUTHORIZED', 'User not found', 401);

    const { dto } = await FilesService.uploadBufferAndCreate({
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
    });

    user.avatarId = new Types.ObjectId(dto.id);
    await user.save();

    const fresh = await UserModel.findById(user._id)
        .populate({ path: 'avatarId', select: '_id secureUrl url filename mime size' })
        .populate({ path: 'backgroundAvatar', select: '_id secureUrl url filename mime size' });

    return toPublicUser(fresh!);
};

// Upload từ buffer -> tạo File -> gán backgroundAvatar
export const setBackgroundFromBuffer = async (userId: string, file: Express.Multer.File) => {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError('UNAUTHORIZED', 'User not found', 401);

    const { dto } = await FilesService.uploadBufferAndCreate({
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
    });

    user.backgroundAvatar = new Types.ObjectId(dto.id);
    await user.save();

    const fresh = await UserModel.findById(user._id)
        .populate({ path: 'avatarId', select: '_id secureUrl url filename mime size' })
        .populate({ path: 'backgroundAvatar', select: '_id secureUrl url filename mime size' });

    return toPublicUser(fresh!);
};
