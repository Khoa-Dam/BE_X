import { Schema, model, Types } from 'mongoose';
import { slugify } from '../utils/slugify';

export enum PostStatus { DRAFT = 'DRAFT', PUBLISHED = 'PUBLISHED' }

export interface IPost {
    _id: Types.ObjectId;
    authorId: Types.ObjectId;
    content: string;
    status: PostStatus;
    coverId?: Types.ObjectId | null;
    slug?: string;
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new Schema({
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true, maxlength: 1000, index: true },
    status: { type: String, enum: Object.values(PostStatus), default: PostStatus.PUBLISHED },
    coverId: { type: Schema.Types.ObjectId, ref: 'File', default: null },
    slug: { type: String, unique: true, sparse: true }
}, { timestamps: true });

// Generate slug before saving
postSchema.pre('save', function(next) {
    if (this.isModified('content') && this.content) {
        // Generate slug from content (first 50 characters)
        const contentPreview = this.content.substring(0, 50);
        this.slug = slugify(contentPreview) + '-' + Date.now();
    }
    next();
});

postSchema.index({ createdAt: -1 });
postSchema.index({ content: 'text' }); // Add text search index for content

export const PostModel = model<IPost>('Post', postSchema);
