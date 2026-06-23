import { detectIntent, Intent, IntentResult } from './intent-detector';
import { generateReply, PharmacyContext } from './auto-reply';
import { orderService } from '../modules/order/order.service';
import { logger } from '../utils/logger';

export interface BotFlowInput {
  message: string;
  buttonId?: string;
  pharmacyId: string;
  patientId: string;
  context: PharmacyContext;
}

export interface BotFlowResponse {
  intent: Intent;
  reply: string;
  confidence: number;
  imageUrl?: string;
  sendServiceMenu: boolean;
}

export class BotFlowService {
  async process(input: BotFlowInput): Promise<BotFlowResponse> {
    const { intent, confidence }: IntentResult = detectIntent(input.message, input.buttonId);

    let orderStatus;

    if (intent === Intent.ORDER_STATUS) {
      const latestOrder = await orderService.getLatestOrderForPatient(
        input.pharmacyId,
        input.patientId,
      );
      orderStatus = latestOrder?.status;
    }

    const { text, imageUrl, sendServiceMenu } = generateReply(intent, input.context, orderStatus);

    logger.info('Bot flow processed message', {
      intent,
      confidence,
      buttonId: input.buttonId,
      pharmacyName: input.context.name,
    });

    return {
      intent,
      reply: text,
      confidence,
      imageUrl,
      sendServiceMenu: Boolean(sendServiceMenu),
    };
  }
}

export const botFlowService = new BotFlowService();
