import { Schema, model, Types } from 'mongoose';

export interface IChat {
    participants: Types.ObjectId[];
    messages: {
        sender: Types.ObjectId;
        content: string;
        createdAt: Date;
        updatedAt: Date;
        read: boolean;
        readAt?: Date;
    }[];
    lastMessage?: {
        content: string;
        sender: Types.ObjectId;
        createdAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

const chatSchema = new Schema({
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    messages: [{
        sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        read: { type: Boolean, default: false },
        readAt: { type: Date }
    }]
    ,
    lastMessage: {
        content: String,
        sender: { type: Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date }
    }
}, {
    timestamps: true
});

chatSchema.index({ participants: 1 });
chatSchema.index({ updatedAt: -1 });

export const ChatModel = model<IChat>('Chat', chatSchema);
