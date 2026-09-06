import express from 'express';
import cors from 'cors';
import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2/options';
import { getEnv } from './config/env';
import { initializeFirebase } from './config/firebase';
import { API_PREFIX } from './config/constants';
import { apiRouter } from './routes';
import {
  errorHandler,
  notFoundHandler,
} from './middleware/errorMiddleware';
import {
  requestContextMiddleware,
  requestLoggerMiddleware,
} from './middleware/requestMiddleware';

setGlobalOptions({
  region: 'asia-south1',
  maxInstances: 10,
});

initializeFirebase();

function createApp(): express.Application {
  const app = express();
  const env = getEnv();

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || env.CORS_ALLOWED_ORIGINS.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(requestContextMiddleware);
  app.use(requestLoggerMiddleware);

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      data: {
        name: env.APP_NAME,
        api: API_PREFIX,
        docs: 'See backend/README.md',
      },
    });
  });

  app.use(API_PREFIX, apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

const app = createApp();

export const api = onRequest(
  {
    cors: false,
    memory: '512MiB',
    timeoutSeconds: 60,
  },
  app,
);

export { app, createApp };
