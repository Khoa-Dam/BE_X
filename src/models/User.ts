import { Schema, model, Types } from 'mongoose';

export enum Role { USER = 'USER', ADMIN = 'ADMIN' }
export enum AuthProvider { LOCAL = 'LOCAL', GOOGLE = 'GOOGLE' }

export interface IUser {
    _id: Types.ObjectId;
    name: string;
    email: string;
    passwordHash?: string;
    role: Role;
    googleId?: string;
    provider: AuthProvider;
    avatarId?: Types.ObjectId | null;
    backgroundAvatarId?: Types.ObjectId | null;
    backgroundAvatar?: string; // Thêm field string để lưu URL trực tiếp
    username?: string;
    bio?: string;
    occupation?: string;
    location?: string;
    joinDate?: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema({
    name: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, maxlength: 191, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null, select: false },
    role: { type: String, enum: Object.values(Role), default: Role.USER },
    googleId: { type: String, unique: true, sparse: true },
    provider: { type: String, enum: Object.values(AuthProvider), default: AuthProvider.LOCAL },
    avatarId: { type: Schema.Types.ObjectId, ref: 'File', default: null },
    backgroundAvatarId: { type: Schema.Types.ObjectId, ref: 'File', default: null },
    backgroundAvatar: { type: String, default: '' }, // Thêm field string để lưu URL trực tiếp
    username: { type: String, maxlength: 50, unique: true, sparse: true },
    bio: { type: String, maxlength: 500, default: '' },
    occupation: { type: String, maxlength: 100, default: '' },
    location: { type: String, maxlength: 100, default: '' },
    joinDate: { type: String, default: () => new Date().getFullYear().toString() },
}, { timestamps: true });

export const UserModel = model<IUser>('User', userSchema);
