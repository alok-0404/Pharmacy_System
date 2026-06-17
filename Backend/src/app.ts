import express, { Application, Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middlewares';
import { logger } from './utils/logger';
import { ApiResponse } from './utils/ApiResponse';
import pharmacyRoutes from './modules/pharmacy/pharmacy.routes';
import patientRoutes from './modules/patient/patient.routes';
import conversationRoutes from './modules/conversation/conversation.routes';
import messageRoutes from './modules/message/message.routes';
import { authRoutes } from './modules/auth';
import { whatsappRoutes, webhookRouter } from './modules/whatsapp';

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  app.use(
    morgan('combined', {
      stream: {
        write: (message: string) => logger.http(message.trim()),
      },
    }),
  );

  app.get(`${env.API_PREFIX}/health`, (_req: Request, res: Response) => {
    res.json(ApiResponse.success('API is running'));
  });

  app.use(`${env.API_PREFIX}/auth`, authRoutes);
  app.use(`${env.API_PREFIX}/pharmacies`, pharmacyRoutes);
  app.use(`${env.API_PREFIX}/patients`, patientRoutes);
  app.use(`${env.API_PREFIX}/conversations`, conversationRoutes);
  app.use(`${env.API_PREFIX}/messages`, messageRoutes);
  app.use(`${env.API_PREFIX}/webhook`, webhookRouter);
  app.use(`${env.API_PREFIX}/whatsapp`, whatsappRoutes);

  if (env.NODE_ENV === 'production') {
    const frontendDist = path.join(__dirname, '..', '..', 'Frontend', 'dist');

    app.use(express.static(frontendDist));

    app.get('*', (req: Request, res: Response, next) => {
      if (req.path.startsWith(env.API_PREFIX) || req.path.startsWith('/uploads')) {
        return next();
      }
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
