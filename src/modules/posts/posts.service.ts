import { PostModel, PostStatus } from '../../models/Post';
import { UserModel } from '../../models/User';
import { FileModel } from '../../models/File';
import { AppError } from '../../utils/response';
import { Types } from 'mongoose';
import { slugify } from '../../utils/slugify';

type UpdateInput = {
    title?: string;
    content?: string;
    status?: 'DRAFT' | 'PUBLISHED';
    imageIds?: string[];
    addImageIds?: string[];
    removeImageIds?: string[];
};

type CreateInput = {
    title: string;
    content?: string;
    status?: 'DRAFT' | 'PUBLISHED';
    imageIds?: string[];
};

export const list = async (
    { search, sort = 'createdAt', order = 'desc', skip, take }:
        { search?: string; sort?: 'createdAt' | 'content'; order?: 'asc' | 'desc'; skip: number; take: number; }) => {
    const q: any = {};
    if (search) {
        const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        q.content = regex;
    }
    const cursor = PostModel.find(q)
        .populate({ path: 'authorId', select: 'name email role username bio occupation location joinDate avatarId backgroundAvatarId' })
        .populate({ path: 'imageIds', select: '_id secureUrl filename mime size' })
        .sort({ [sort]: order === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(take);

    const [items, total] = await Promise.all([cursor.exec(), PostModel.countDocuments(q)]);

    // Populate avatar cho mỗi user
    const mapped = await Promise.all(
        items.map(async (p) => {
            const user = await UserModel.findById(p.authorId).populate('avatarId');

            return {
                ...p.toObject(),
                id: p._id.toString(),
                author: user ? {
                    _id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    username: user.username,
                    bio: user.bio,
                    occupation: user.occupation,
                    location: user.location,
                    joinDate: user.joinDate,
                    avatarId: user.avatarId,
                    backgroundAvatarId: user.backgroundAvatarId
                } : null,
                images: p.imageIds,
            };
        })
    );

    return { total, items: mapped };
}

export const getById = async (id: string) => {
    const p = await PostModel.findById(id).populate('authorId', 'name email role username bio occupation location joinDate avatarId backgroundAvatarId').populate('imageIds');
    if (!p) throw new AppError('NOT_FOUND', 'Post not found', 404);

    // Populate avatar cho user
    const user = await UserModel.findById(p.authorId).populate('avatarId');

    return {
        ...p.toObject(),
        id: p._id.toString(),
        author: user ? {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            username: user.username,
            bio: user.bio,
            occupation: user.occupation,
            location: user.location,
            joinDate: user.joinDate,
            avatarId: user.avatarId,
            backgroundAvatarId: user.backgroundAvatarId
        } : null,
        imageIds: p.imageIds,
    };
}

export const create = async (authorId: string, dto: CreateInput) => {
    const user = await UserModel.findById(authorId);
    if (!user) throw new AppError('UNAUTHORIZED', 'User not found', 401);

    const base = slugify(dto.title);
    const existed = await PostModel.findOne({ slug: base });
    let imageIds: Types.ObjectId[] = [];
    if (dto.imageIds?.length) {
        const unique = Array.from(new Set(dto.imageIds));
        for (const id of unique) if (!Types.ObjectId.isValid(id)) throw new AppError('BAD_ID', `Invalid imageId: ${id}`, 400);
        const cnt = await FileModel.countDocuments({ _id: { $in: unique } });
        if (cnt !== unique.length) throw new AppError('NOT_FOUND', 'Some imageIds do not exist', 404);
        imageIds = unique.map((x) => new Types.ObjectId(x));
    }

    const post = await PostModel.create({
        authorId: user._id,
        title: dto.title,
        slug: existed ? `${base}-${Date.now()}` : base,
        content: dto.content ?? '',
        status: (dto.status ?? 'PUBLISHED') as PostStatus,
        imageIds
    });
    return { ...post.toObject(), id: post._id.toString() };
}

export const update = async (
    id: string,
    userId: string,
    dto: Partial<UpdateInput>
) => {
    const post = await PostModel.findById(id);
    if (!post) throw new AppError('NOT_FOUND', 'Post not found', 404);
    if (post.authorId.toString() !== userId) throw new AppError('FORBIDDEN', 'Not your post', 403);

    // Đổi title -> cập nhật slug (tránh trùng)
    if (dto.title && dto.title !== post.title) {
        const base = slugify(dto.title);
        const existed = await PostModel.findOne({ slug: base });
        post.title = dto.title;
        post.slug = existed && existed._id.toString() !== id ? `${base}-${Date.now()}` : base;
    }

    if (dto.content !== undefined) post.content = dto.content;
    if (dto.status) post.status = dto.status as PostStatus;

    // Helper validate nhiều FileId
    const validateMany = async (ids: string[]) => {
        const unique = Array.from(new Set(ids));
        for (const x of unique) {
            if (!Types.ObjectId.isValid(x)) throw new AppError('BAD_ID', `Invalid imageId: ${x}`, 400);
        }
        const count = await FileModel.countDocuments({ _id: { $in: unique } });
        if (count !== unique.length) throw new AppError('NOT_FOUND', 'Some imageIds do not exist', 404);
        return unique.map((x) => new Types.ObjectId(x));
    };

    // 1) Nếu truyền imageIds -> thay thế toàn bộ (kể cả rỗng)
    if (dto.imageIds !== undefined) {
        post.imageIds = await validateMany(dto.imageIds);
    } else {
        // 2) Nếu không truyền imageIds, cho phép add/remove từng phần
        if (dto.addImageIds?.length) {
            const toAdd = await validateMany(dto.addImageIds);
            const set = new Map(post.imageIds.map((x) => [x.toString(), x]));
            for (const x of toAdd) set.set(x.toString(), x);
            post.imageIds = Array.from(set.values());
        }
        if (dto.removeImageIds?.length) {
            const removeSet = new Set(dto.removeImageIds);
            post.imageIds = post.imageIds.filter((x) => !removeSet.has(x.toString()));
        }
    }

    await post.save();
    return { ...post.toObject(), id: post._id.toString() };
};

export const remove = async (id: string, userId: string) => {
    const post = await PostModel.findById(id);
    if (!post) throw new AppError('NOT_FOUND', 'Post not found', 404);
    if (post.authorId.toString() !== userId) throw new AppError('FORBIDDEN', 'Not your post', 403);
    await PostModel.deleteOne({ _id: post._id });
    return true;
}
