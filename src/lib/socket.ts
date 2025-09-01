import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../env';
import { JwtUser } from '../middlewares/auth';

// Map to store online users: userId -> socketId
const onlineUsers = new Map<string, string>();

export const initializeSocket = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: true,
            credentials: true
        }
    });

    // Middleware xác thực token
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtUser;
            socket.data.userId = decoded.id;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.data.userId;
        
        // Lưu thông tin user online
        onlineUsers.set(userId, socket.id);

        // Thông báo status online cho friends
        socket.broadcast.emit('user:online', { userId });

        // Join vào room của các chat mà user tham gia
        socket.join(`user:${userId}`);

        // Handle disconnect
        socket.on('disconnect', () => {
            onlineUsers.delete(userId);
            socket.broadcast.emit('user:offline', { userId });
        });

        // Handle join chat room
        socket.on('chat:join', (chatId: string) => {
            socket.join(`chat:${chatId}`);
        });

        // Handle leave chat room  
        socket.on('chat:leave', (chatId: string) => {
            socket.leave(`chat:${chatId}`);
        });
    });

    return io;
};
