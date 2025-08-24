import { Schema, model, Types } from 'mongoose';

export enum PostStatus { DRAFT = 'DRAFT', PUBLISHED = 'PUBLISHED' }

export interface IPost {
    _id: Types.ObjectId;
    authorId: Types.ObjectId;
    title: string;
    slug: string;
    content?: string;
    status: PostStatus;
    coverId?: Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new Schema<IPost>({
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, maxlength: 200, index: true },
    slug: { type: String, required: true, maxlength: 220, unique: true },
    content: { type: String, default: '' },
    status: { type: String, enum: Object.values(PostStatus), default: PostStatus.PUBLISHED },
    coverId: { type: Schema.Types.ObjectId, ref: 'File', default: null },
}, { timestamps: true });

postSchema.index({ createdAt: -1 });

export const PostModel = model<IPost>('Post', postSchema);
