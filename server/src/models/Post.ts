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

    // BỔ SUNG
    title: { type: String, required: true, trim: true, maxlength: 200, index: true },

    // KHÔNG đặt default: null để tránh lưu null
    // Service phải luôn set slug (xem hàm create/update đã gửi)
    slug: { type: String, index: true, default: undefined },

    content: { type: String, required: true, maxlength: 1000, default: '' },
    status: { type: String, enum: Object.values(PostStatus), default: PostStatus.PUBLISHED },

    imageIds: {
        type: [{ type: Schema.Types.ObjectId, ref: 'File' }],
        default: []
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Index phụ trợ
postSchema.index({ createdAt: -1 });

// Text search: gộp cả title + content (Mongo chỉ 1 text index/collection)
postSchema.index({ title: 'text', content: 'text' });

// UNIQUE cho slug nhưng chỉ áp với slug là string (bỏ qua null/missing)
postSchema.index(
    { slug: 1 },
    { unique: true, partialFilterExpression: { slug: { $type: 'string' } } }
);

export const PostModel = model<IPost>('Post', postSchema);
