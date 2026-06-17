import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { MetaWebhookPayload } from './whatsapp.types';
import { whatsappService } from './whatsapp.service';

class BotRouterService {
  async routeIncomingWebhook(payload: MetaWebhookPayload): Promise<void> {
    logger.info(`[ACTIVE BOT]: ${env.ACTIVE_BOT}`);

    switch (env.ACTIVE_BOT) {
      case 'PHARMACY':
        await whatsappService.processIncomingMessage(payload);
        return;
      case 'HEALTHCARE':
        logger.info('Healthcare bot mode active; pharmacy flow bypassed');
        return;
      case 'LEAD':
        logger.info('Lead bot mode active; pharmacy flow bypassed');
        return;
      default:
        logger.warn('Unsupported ACTIVE_BOT value', { activeBot: env.ACTIVE_BOT });
    }
  }
}

export const botRouterService = new BotRouterService();
