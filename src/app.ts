import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { globalRateLimiter } from './middlewares/rateLimiter';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { logger } from './utils/logger';
import apiRoutes from './routes';

// Initialize models and associations
import './database/models';

const normalizeOrigin = (origin: string): string => origin.trim().replace(/\/+$/, '');

const createApp = (): Application => {
  const app = express();
  const allowedOrigins = env.cors.origin
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

  // ─── Security ─────────────────────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        const normalizedOrigin = normalizeOrigin(origin);
        if (allowedOrigins.includes(normalizedOrigin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }),
  );

  // ─── Rate limiting ─────────────────────────────────────────────────────────
  app.use(globalRateLimiter);

  // ─── Body parsing ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ─── HTTP Logging ──────────────────────────────────────────────────────────
  if (env.isDevelopment) {
    app.use(morgan('dev'));
  } else {
    app.use(
      morgan('combined', {
        stream: {
          write: (message: string) => logger.info(message.trim()),
        },
      }),
    );
  }

  // ─── Swagger ───────────────────────────────────────────────────────────────
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'Inventario API Docs',
      swaggerOptions: {
        persistAuthorization: true,
      },
    }),
  );

  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // ─── API Routes ────────────────────────────────────────────────────────────
  app.use('/api', apiRoutes);

  // ─── 404 handler ──────────────────────────────────────────────────────────
  app.use(notFoundHandler);

  // ─── Global error handler ─────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
};

export default createApp;
