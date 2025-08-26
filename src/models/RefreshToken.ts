import { Schema, model, Types } from 'mongoose';

export interface IRefreshToken {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    tokenHash: string;
    revoked: boolean;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const refreshTokenSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    revoked: { type: Boolean, default: false, index: true },
    expiresAt: { type: Date, required: true, index: true },
}, { timestamps: true });

export const RefreshTokenModel = model<IRefreshToken>('RefreshToken', refreshTokenSchema);
