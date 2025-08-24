import express, { Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import cookieParser from 'cookie-parser';

import { errorHandler } from './middlewares/error';
import authRoutes from './modules/auth/auth.routes';
import googleAuthRoutes from './modules/auth/google.oauth.routes';
import usersRoutes from './modules/users/users.routes';
import postsRoutes from './modules/posts/posts.routes';
import uploadsRoutes from './modules/uploads/uploads.routes';
import { env } from './env';

export const app = express();
const apiV = env.API_PREFIX;
console.log(apiV);

app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.resolve('uploads')));
app.get('/health', (_req, res) => res.json({ ok: true }));

app.use(`${apiV}/auth`, authRoutes);
app.use(`${apiV}/auth`, googleAuthRoutes);
app.use(`${apiV}/users`, usersRoutes);
app.use(`${apiV}/uploads`, uploadsRoutes);
app.use(`${apiV}/posts`, postsRoutes);

app.use(errorHandler);
