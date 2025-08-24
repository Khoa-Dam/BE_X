import { AppDataSource } from '../../db';
import { Post, PostStatus } from '../../entities/Post';
import { User } from '../../entities/User';
import { AppError } from '../../utils/response';
import { slugify } from '../../utils/slugify';
import { ILike } from 'typeorm';

export async function list({ search, sort = 'createdAt', order = 'desc', skip, take }: { search?: string; sort?: 'createdAt' | 'title'; order?: 'asc' | 'desc'; skip: number; take: number; }) {
    const repo = AppDataSource.getRepository(Post);
    const where = search ? [{ title: ILike(`%${search}%`) }, { content: ILike(`%${search}%`) }] : undefined;
    const [items, total] = await repo.findAndCount({
        where, relations: { author: true, cover: true },
        order: { [sort]: order.toUpperCase() as 'ASC' | 'DESC' },
        skip, take
    });
    return { total, items };
}

export async function getById(id: number) {
    const post = await AppDataSource.getRepository(Post).findOne({ where: { id }, relations: { author: true, cover: true } });
    if (!post) throw new AppError('NOT_FOUND', 'Post not found', 404);
    return post;
}

export async function create(authorId: number, dto: { title: string; content?: string; status?: 'DRAFT' | 'PUBLISHED'; coverId?: number | null }) {
    const user = await AppDataSource.getRepository(User).findOne({ where: { id: authorId } });
    if (!user) throw new AppError('UNAUTHORIZED', 'User not found', 401);

    const repo = AppDataSource.getRepository(Post);
    const base = slugify(dto.title);
    const existed = await repo.findOne({ where: { slug: base } });

    const post = repo.create({
        authorId,
        title: dto.title,
        slug: existed ? `${base}-${Date.now()}` : base,
        content: dto.content ?? '',
        status: (dto.status ?? 'PUBLISHED') as PostStatus,
        coverId: dto.coverId ?? null
    });
    await repo.save(post);
    return post;
}

export async function update(id: number, userId: number, dto: Partial<{ title: string; content: string; status: 'DRAFT' | 'PUBLISHED'; coverId: number | null }>) {
    const repo = AppDataSource.getRepository(Post);
    const post = await repo.findOne({ where: { id } });
    if (!post) throw new AppError('NOT_FOUND', 'Post not found', 404);
    if (post.authorId !== userId) throw new AppError('FORBIDDEN', 'Not your post', 403);

    if (dto.title && dto.title !== post.title) {
        const base = slugify(dto.title);
        const existed = await repo.findOne({ where: { slug: base } });
        post.title = dto.title;
        post.slug = (existed && existed.id !== id) ? `${base}-${Date.now()}` : base;
    }
    if (dto.content !== undefined) post.content = dto.content;
    if (dto.status) post.status = dto.status as PostStatus;
    if (dto.coverId !== undefined) post.coverId = dto.coverId;

    await repo.save(post);
    return post;
}

export async function remove(id: number, userId: number) {
    const repo = AppDataSource.getRepository(Post);
    const post = await repo.findOne({ where: { id } });
    if (!post) throw new AppError('NOT_FOUND', 'Post not found', 404);
    if (post.authorId !== userId) throw new AppError('FORBIDDEN', 'Not your post', 403);
    await repo.delete(id);
    return true;
}
