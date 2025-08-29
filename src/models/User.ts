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

    // NEW fields
    bio?: string;
    occupation?: string;
    location?: string;
    joinDate: Date;
    username?: string | null;
    backgroundAvatarId?: Types.ObjectId | null;

    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema(
    {
        name: { type: String, required: true, maxlength: 100 },
        email: { type: String, required: true, maxlength: 191, unique: true, index: true, lowercase: true, trim: true },
        passwordHash: { type: String, default: null, select: false },
        role: { type: String, enum: Object.values(Role), default: Role.USER },
        googleId: { type: String, unique: true, sparse: true, default: null },
        provider: { type: String, enum: Object.values(AuthProvider), default: AuthProvider.LOCAL },
        avatarId: { type: Schema.Types.ObjectId, ref: 'File', default: null },

        // NEW fields
        bio: { type: String, default: '', maxlength: 500 },
        occupation: { type: String, default: '', maxlength: 100 },
        location: { type: String, default: '', maxlength: 120 },
        joinDate: { type: Date, default: Date.now },
        username: {
            type: String,
            lowercase: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
            match: /^[a-z0-9_]+$/i,
            unique: true,
            sparse: true,
            index: true,
            default: null
        },
        backgroundAvatarId: { type: Schema.Types.ObjectId, ref: 'File', default: null }
    },
    { timestamps: true }
);

userSchema.index({ createdAt: -1 });

export const UserModel = model<IUser>('User', userSchema);
