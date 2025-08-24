import { Schema, model, Types } from 'mongoose';

export enum Role { USER = 'USER', ADMIN = 'ADMIN' }
export enum AuthProvider { LOCAL = 'LOCAL', GOOGLE = 'GOOGLE' }

export interface IUser {
    _id: Types.ObjectId;
    name: string;
    email: string;
    passwordHash?: string | null;
    role: Role;
    googleId?: string | null;
    provider: AuthProvider;
    avatarId?: Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>({
    name: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, maxlength: 191, unique: true, index: true },
    passwordHash: { type: String, default: null },
    role: { type: String, enum: Object.values(Role), default: Role.USER },
    googleId: { type: String, default: null, unique: true, sparse: true },
    provider: { type: String, enum: Object.values(AuthProvider), default: AuthProvider.LOCAL },
    avatarId: { type: Schema.Types.ObjectId, ref: 'File', default: null },
}, { timestamps: true });

export const UserModel = model<IUser>('User', userSchema);
