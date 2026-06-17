import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { Pharmacy } from '../modules/pharmacy/pharmacy.model';
import { User } from '../modules/user/user.model';
import { Patient } from '../modules/patient/patient.model';
import { Conversation } from '../modules/conversation/conversation.model';
import { Message } from '../modules/message/message.model';
import { PharmacyConversation } from '../modules/pharmacy-bot/pharmacy-conversation.model';
import { PharmacyMessage } from '../modules/pharmacy-bot/pharmacy-message.model';

const syncModelIndexes = async (): Promise<void> => {
  const models = [
    Pharmacy,
    User,
    Patient,
    Conversation,
    Message,
    PharmacyConversation,
    PharmacyMessage,
  ];

  for (const model of models) {
    try {
      await model.syncIndexes();
      logger.info(`Indexes synced for ${model.modelName}`);
    } catch (error) {
      logger.warn(`Index sync skipped for ${model.modelName}`, { error });
    }
  }
};

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    await syncModelIndexes();
    logger.info(`MongoDB connected successfully [${mongoose.connection.db?.databaseName}]`);
  } catch (error) {
    logger.error('MongoDB connection failed', { error });
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  logger.error('MongoDB connection error', { error });
});
