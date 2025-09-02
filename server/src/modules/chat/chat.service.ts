import { ChatModel } from '../../models/Chat';
import { UserModel } from '../../models/User';
import { Types } from 'mongoose';
import { AppError } from '../../utils/response';

// Helper để check user exists
const checkUserExists = async (userId: string) => {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);
    return user;
};

// Lấy hoặc tạo chat giữa 2 users
export const getOrCreateChat = async (userId1: string, userId2: string) => {
    // Check users exist
    await Promise.all([checkUserExists(userId1), checkUserExists(userId2)]);

    // Tìm chat hiện có
    let chat = await ChatModel.findOne({
        participants: { $all: [userId1, userId2] }
    }).populate('participants', 'name email avatarId');

    // Nếu chưa có thì tạo mới
    if (!chat) {
        chat = await ChatModel.create({
            participants: [userId1, userId2],
            messages: []
        });
        chat = await chat.populate('participants', 'name email avatarId');
    }

    return chat;
};

// Lấy danh sách chat của user
export const getChats = async (userId: string) => {
    return ChatModel.find({
        participants: userId
    })
    .sort({ updatedAt: -1 })
    .populate('participants', 'name email avatarId')
    .populate('lastMessage.sender', 'name');
};

export async function getMessages(chatId: string) {
    const chat = await ChatModel.findById(chatId)
        .populate({
            path: 'messages.sender',
            select: 'name email'
        });

    if (!chat) throw new AppError('NOT_FOUND', 'Chat not found', 404);

    return chat.messages;
}


// Gửi tin nhắn
export const sendMessage = async (chatId: string, senderId: string, content: string) => {
    const chat = await ChatModel.findById(chatId);
    if (!chat) throw new AppError('NOT_FOUND', 'Chat not found', 404);

    // Check sender in participants
    if (!chat.participants.includes(new Types.ObjectId(senderId))) {
        throw new AppError('FORBIDDEN', 'Not a participant', 403);
    }

    const now = new Date();

    // Add message
    const message = {
        sender: new Types.ObjectId(senderId),
        content,
        createdAt: now,
        updatedAt: now,
        read: false
    };

    chat.messages.push(message);
    chat.lastMessage = {
        content,
        sender: new Types.ObjectId(senderId),
        createdAt: now
    };

    await chat.save();
    
    // Populate the chat
    await chat.populate([
        { path: 'participants', select: 'name email avatarId' },
        { path: 'lastMessage.sender', select: 'name' },
        { path: 'messages.sender', select: 'name' }
    ]);

    // Emit to all participants except sender
    const io = global.io;
    if (io) {
        chat.participants.forEach(participant => {
            if (participant._id.toString() !== senderId) {
                io.to(`user:${participant._id}`).emit('chat:message', {
                    chatId,
                    message: {
                        ...message,
                        sender: chat.participants.find(p => p._id.toString() === senderId)
                    }
                });
            }
        });
    }

    return chat;
};

// Đánh dấu tin nhắn đã đọc
export const markAsRead = async (chatId: string, userId: string) => {
    const chat = await ChatModel.findById(chatId);
    if (!chat) throw new AppError('NOT_FOUND', 'Chat not found', 404);

    // Update tất cả tin chưa đọc của người khác gửi
    chat.messages = chat.messages.map(msg => {
        if (!msg.read && msg.sender.toString() !== userId) {
            return { ...msg, read: true };
        }
        return msg;
    });

    await chat.save();
    return chat.populate([
        { path: 'participants', select: 'name email avatarId' },
        { path: 'lastMessage.sender', select: 'name' }
    ]);
};
