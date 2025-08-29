import { PostModel, PostStatus } from '../../models/Post';
import { UserModel } from '../../models/User';
import { FileModel } from '../../models/File';
import { AppError } from '../../utils/response';
import { slugify } from '../../utils/slugify';
import { Types } from 'mongoose';

export const list = async (
    { search, sort = 'createdAt', order = 'desc', skip, take }:
        { search?: string; sort?: 'createdAt' | 'title'; order?: 'asc' | 'desc'; skip: number; take: number; }) => {
    const q: any = {};
    if (search) {
        const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        q.$or = [{ title: regex }, { content: regex }];
    }
    const cursor = PostModel.find(q)
        .populate('authorId', 'name email role')
        .populate('coverId')
        .sort({ [sort]: order === 'asc' ? 1 : -1 })
        .skip(skip).limit(take);

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
                    avatarId: user.avatarId
                } : null,
                cover: p.coverId,
            };
        })
    );
    
    return { total, items: mapped };
}

export const getById = async (id: string) => {
    const p = await PostModel.findById(id).populate('authorId', 'name email role').populate('coverId');
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
            avatarId: user.avatarId
        } : null,
        cover: p.coverId 
    };
}

export const create = async (authorId: string, dto: { title: string; content?: string; status?: 'DRAFT' | 'PUBLISHED'; coverId?: string | null }) => {
    const user = await UserModel.findById(authorId);
    if (!user) throw new AppError('UNAUTHORIZED', 'User not found', 401);

    const base = slugify(dto.title);
    const existed = await PostModel.findOne({ slug: base });
    const coverId = dto.coverId ? new Types.ObjectId(dto.coverId) : null;
    if (coverId) {
        const f = await FileModel.findById(coverId);
        if (!f) throw new AppError('NOT_FOUND', 'Cover file not found', 404);
    }

    const post = await PostModel.create({
        authorId: user._id,
        title: dto.title,
        slug: existed ? `${base}-${Date.now()}` : base,
        content: dto.content ?? '',
        status: (dto.status ?? 'PUBLISHED') as PostStatus,
        coverId
    });
    return { ...post.toObject(), id: post._id.toString() };
}

export const update = async (id: string, userId: string, dto: Partial<{ title: string; content: string; status: 'DRAFT' | 'PUBLISHED'; coverId: string | null }>) => {
    const post = await PostModel.findById(id);
    if (!post) throw new AppError('NOT_FOUND', 'Post not found', 404);
    if (post.authorId.toString() !== userId) throw new AppError('FORBIDDEN', 'Not your post', 403);

    if (dto.title && dto.title !== post.title) {
        const base = slugify(dto.title);
        const existed = await PostModel.findOne({ slug: base });
        post.title = dto.title;
        post.slug = (existed && existed._id.toString() !== id) ? `${base}-${Date.now()}` : base;
    }
    if (dto.content !== undefined) post.content = dto.content;
    if (dto.status) post.status = dto.status as PostStatus;
    if (dto.coverId !== undefined) {
        if (dto.coverId === null) post.coverId = null;
        else {
            const f = await FileModel.findById(dto.coverId);
            if (!f) throw new AppError('NOT_FOUND', 'Cover file not found', 404);
            post.coverId = f._id;
        }
    }

    await post.save();
    return { ...post.toObject(), id: post._id.toString() };
}

export const remove = async (id: string, userId: string) => {
    const post = await PostModel.findById(id);
    if (!post) throw new AppError('NOT_FOUND', 'Post not found', 404);
    if (post.authorId.toString() !== userId) throw new AppError('FORBIDDEN', 'Not your post', 403);
    await PostModel.deleteOne({ _id: post._id });
    return true;
}
