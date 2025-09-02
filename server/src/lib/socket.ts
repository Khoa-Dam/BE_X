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
        // Ưu tiên lấy từ handshake.auth.token
        let token: string | undefined = socket.handshake.auth?.token as any;

        // Fallback: đọc từ cookie "access_token" nếu có (Engine.IO gửi cookie trong headers)
        if (!token) {
            const cookieHeader = socket.request.headers.cookie || '';
            const cookies = Object.fromEntries(
                cookieHeader
                    .split(';')
                    .map((c) => c.trim())
                    .filter(Boolean)
                    .map((c) => {
                        const idx = c.indexOf('=');
                        const k = idx >= 0 ? c.slice(0, idx) : c;
                        const v = idx >= 0 ? decodeURIComponent(c.slice(idx + 1)) : '';
                        return [k, v];
                    })
            );
            token = cookies['access_token'];
        }

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
