import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as svc from './chat.service';
import { success } from '../../utils/response';

const SendMessageDto = z.object({
    content: z.string().min(1).max(1000)
});

export const getChats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const chats = await svc.getChats(req.user!.id);
        res.json(success(chats));
    } catch (e) { next(e); }
};

export const getOrCreateChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const chat = await svc.getOrCreateChat(req.user!.id, userId);
        res.json(success(chat));
    } catch (e) { next(e); }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { chatId } = req.params;
        const messages = await svc.getMessages(chatId);
        res.json(success(messages));
    } catch (e) {
        next(e);
    }
};



export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { chatId } = req.params;
        const dto = SendMessageDto.parse(req.body);
        const chat = await svc.sendMessage(chatId, req.user!.id, dto.content);
        res.json(success(chat));
    } catch (e) { next(e); }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { chatId } = req.params;
        const chat = await svc.markAsRead(chatId, req.user!.id);
        res.json(success(chat));
    } catch (e) { next(e); }
};
