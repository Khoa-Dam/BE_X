import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { errorHandler } from './middlewares/error';
import authRoutes from './modules/auth/auth.routes';
import googleAuthRoutes from './modules/auth/google/google.oauth.routes';
import usersRoutes from './modules/users/users.routes';
import postsRoutes from './modules/posts/posts.routes';
import uploadsRoutes from './modules/uploads/uploads.routes';
import chatRoutes from './modules/chat/chat.routes';
import followRoutes from './modules/follow/follow.routes';
import { env } from './env';

export const app = express();

// Create router instance
const apiV = express.Router();

app.use(cors({
    origin: true, credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type']
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => res.json({ ok: true }));

// Mount routes on router
apiV.use('/auth', authRoutes);
apiV.use('/auth', googleAuthRoutes);
apiV.use('/users', usersRoutes);
apiV.use('/uploads', uploadsRoutes);
apiV.use('/posts', postsRoutes);
apiV.use('/chats', chatRoutes);
apiV.use('/social', followRoutes);

app.use(errorHandler);

// Mount router on app
app.use(env.API_PREFIX ?? '/api/v1', apiV);