import { Schema, model, Types } from 'mongoose';

export enum PostStatus { DRAFT = 'DRAFT', PUBLISHED = 'PUBLISHED' }

export interface IPost {
    _id: Types.ObjectId;
    authorId: Types.ObjectId;
    title: string;
    slug: string;
    content?: string;
    status: PostStatus;
    imageIds: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new Schema({
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, maxlength: 200, index: true },
    slug: { type: String, required: true, maxlength: 220, unique: true },
    content: { type: String, default: '' },
    status: { type: String, enum: Object.values(PostStatus), default: PostStatus.PUBLISHED },
    imageIds: {
        type: [{ type: Schema.Types.ObjectId, ref: 'File' }],
        default: []
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });


postSchema.index({ createdAt: -1 });

export const PostModel = model<IPost>('Post', postSchema);
