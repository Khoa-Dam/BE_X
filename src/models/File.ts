import { Schema, model } from 'mongoose';

export interface IFile {
    filename: string;
    path: string;
    mime?: string;
    size?: number;
    sha256?: string;
    createdAt: Date;
    updatedAt: Date;
}

const fileSchema = new Schema({
    filename: { type: String, required: true },
    path: { type: String, required: true },
    mime: String,
    size: Number,
    sha256: { type: String, index: true, sparse: true }
}, { timestamps: true });

export const FileModel = model<IFile>('File', fileSchema);
