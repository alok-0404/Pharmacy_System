import { createApp } from './app';
import { connectDatabase } from './database/connection';
import { env } from './config/env';
import { logger } from './utils/logger';
import { startRefillReminderJob } from './jobs/refill-reminder.job';

const startServer = async (): Promise<void> => {
  await connectDatabase();

  startRefillReminderJob();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`API available at http://localhost:${env.PORT}${env.API_PREFIX}`);
    logger.info(`[ACTIVE BOT]: ${env.ACTIVE_BOT}`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((error) => {
  logger.error('Failed to start server', { error });
  process.exit(1);
});
