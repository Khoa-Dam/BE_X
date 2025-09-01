import { Schema, model, Types } from 'mongoose';

export interface IFollow {
    follower: Types.ObjectId;    // Người follow
    following: Types.ObjectId;    // Người được follow
    createdAt: Date;
}

const followSchema = new Schema({
    follower: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    following: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

// Compound index để đảm bảo unique follow và tối ưu query
followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ following: 1 }); // Để query người được follow

export const FollowModel = model<IFollow>('Follow', followSchema);
