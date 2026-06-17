import {
  detectIntent,
  Intent,
  IntentDetector,
  IntentResult,
} from './intent-detector';
import { generateReply, PharmacyContext, ReplyGenerator } from './auto-reply';
import { logger } from '../utils/logger';

export interface BotResponse {
  intent: Intent;
  reply: string;
  confidence: number;
  imageUrl?: string;
}

export interface BotServiceOptions {
  intentDetector?: IntentDetector;
  replyGenerator?: ReplyGenerator;
}

export class BotService {
  private readonly intentDetector: IntentDetector;
  private readonly replyGenerator: ReplyGenerator;

  constructor(options: BotServiceOptions = {}) {
    this.intentDetector = options.intentDetector ?? { detect: detectIntent };
    this.replyGenerator = options.replyGenerator ?? { generate: generateReply };
  }

  handle(message: string, context: PharmacyContext): BotResponse {
    const { intent, confidence }: IntentResult = this.intentDetector.detect(message);
    const { text, imageUrl } = this.replyGenerator.generate(intent, context);

    logger.info('Bot processed message', { intent, confidence, pharmacyName: context.name });

    return { intent, reply: text, confidence, imageUrl };
  }

  processMessage(message: string, context: PharmacyContext): BotResponse {
    return this.handle(message, context);
  }
}

export const botService = new BotService();
