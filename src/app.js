import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.js';
import authRoutes from './routes/auth.routes.js';
import contentRoutes from './routes/content.routes.js';

const app = express();

if (env.isProd) app.set('trust proxy', 1); // di belakang reverse proxy (Nginx, Render, dll.)

app.use(helmet());
app.use(cors({ origin: env.clientUrls, credentials: true }));
app.use(express.json({ limit: '10kb' }));
if (env.nodeEnv !== 'test') app.use(morgan(env.isProd ? 'combined' : 'dev'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.use('/api/auth', authRoutes);
app.use('/api', contentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
