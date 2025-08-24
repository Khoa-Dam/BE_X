import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import cookieParser from 'cookie-parser';

import { errorHandler } from './middlewares/error';
import authRoutes from './modules/auth/auth.routes';
import googleAuthRoutes from './modules/auth/google.oauth.routes';
// import usersRoutes from './modules/users/users.routes';
import postsRoutes from './modules/posts/posts.routes';
// import uploadsRoutes from './modules/uploads/uploads.routes';

export const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.resolve('uploads')));
app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
// app.use('/api/users', usersRoutes);
// app.use('/api/uploads', uploadsRoutes);
app.use('/api/posts', postsRoutes);

app.use(errorHandler);
