import { Schema, model } from 'mongoose';

export interface IFile {
    filename: string;
    mime?: string;
    size?: number;
    sha256?: string;

    provider: 'cloudinary';
    publicId: string;
    secureUrl: string;

    resourceType?: string;  // image | video | raw
    format?: string;        // png, jpg, mp4...
    width?: number;
    height?: number;
    bytes?: number;

    createdAt?: Date;
    updatedAt?: Date;
}

const fileSchema = new Schema({
    filename: { type: String, required: true },
    mime: { type: String },
    size: { type: Number },
    sha256: { type: String },

    provider: { type: String, default: 'cloudinary' },
    publicId: { type: String, required: true, index: true, unique: true },
    secureUrl: { type: String, required: true },

    resourceType: { type: String },
    format: { type: String },
    width: { type: Number },
    height: { type: Number },
    bytes: { type: Number },
}, { timestamps: true });

fileSchema.virtual('url').get(function (this: any) { return this.secureUrl; });
fileSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        const { _id, __v, ...rest } = ret as any; // ret là any để TS không cằn nhằn
        return { id: _id?.toString?.() ?? String(_id), ...rest };
    }
});


export const FileModel = model<IFile>('File', fileSchema);
