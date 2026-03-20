import express from 'express';
import type { Request, Response } from 'express';
import { connectToMongoDb } from '@/db/db';
import cookieParser from 'cookie-parser';
import { logger } from '@packages/httputils';
import authRoutes from '@/routes/authRoutes/auth.routes';
import oauthRoutes from '@/routes/authRoutes/oauth.routes';
import fileRoutes from '@/routes/fileuploadRoutes/fileupload.routes';
import { errorHandler } from '@/middlewares/error.middleware';
import env from '@packages/env';
import cors from 'cors';
import { validateUser } from './middlewares/user.middleware';

const app = express();

const PORT = env.PORT;

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Storex Backend is running!' });
});
app.use(
  cors({
    origin: env.ALLOWED_ORIGINS, // Your frontend URL
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(cookieParser()); // handles the req.cookies for middlewares.
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes);
app.use('/api/files', validateUser, fileRoutes);

app.use(errorHandler);
connectToMongoDb(env.DATABASE_URL);

app.listen(PORT, () => {
  logger('INFO', `Server is running on http://localhost:${PORT}`);
});
