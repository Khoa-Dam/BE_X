import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { errorHandler } from './middlewares/error';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import postsRoutes from './modules/posts/posts.routes';
import uploadsRoutes from './modules/uploads/uploads.routes';

export const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// static
app.use('/uploads', express.static(path.resolve('uploads')));

// health
app.get('/health', (_req, res) => res.json({ ok: true }));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/uploads', uploadsRoutes);

// error (last)
app.use(errorHandler);
