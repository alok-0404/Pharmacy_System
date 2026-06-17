import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import { HTTP_STATUS } from '../../config/constants';
import { logger } from '../../utils/logger';
import { handleMongooseError } from '../../utils/mongooseError';
import { Pharmacy } from '../pharmacy/pharmacy.model';
import { Patient } from '../patient/patient.model';
import {
  PharmacyConversation,
  PharmacyConversationStatus,
} from '../pharmacy-bot/pharmacy-conversation.model';
import {
  PharmacyMessage,
  PharmacyMessageStatus,
  PharmacyMessageType,
  PharmacySenderType,
} from '../pharmacy-bot/pharmacy-message.model';
import { botService } from '../../bot/bot.service';
import { Intent } from '../../bot/intent-detector';
import { resolvePublicUrl } from '../../utils/publicUrl';
import {
  MetaSendMessageResponse,
  MetaWebhookPayload,
  ParsedIncomingMessage,
  SendImageParams,
  SendMessageParams,
} from './whatsapp.types';

export class WhatsAppService {
  verifyWebhook(mode: string, token: string, challenge: string): string {
    if (mode === 'subscribe' && token === env.META_VERIFY_TOKEN) {
      logger.info('WhatsApp webhook verified successfully');
      return challenge;
    }

    logger.warn('WhatsApp webhook verification failed', { mode });
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Webhook verification failed');
  }

  extractIncomingMessages(payload: MetaWebhookPayload): ParsedIncomingMessage[] {
    const parsed: ParsedIncomingMessage[] = [];

    if (!payload.entry?.length) {
      return parsed;
    }

    for (const entry of payload.entry) {
      for (const change of entry.changes ?? []) {
        if (change.field !== 'messages') {
          continue;
        }

        const { metadata, contacts, messages } = change.value;
        const phoneNumberId = metadata?.phone_number_id;

        if (!phoneNumberId || !messages?.length) {
          continue;
        }

        for (const message of messages) {
          if (message.type !== 'text' || !message.text?.body) {
            logger.info('Skipping non-text WhatsApp message', {
              type: message.type,
              messageId: message.id,
            });
            continue;
          }

          const contact = contacts?.find((c) => c.wa_id === message.from);

          parsed.push({
            phoneNumberId,
            senderMobile: message.from,
            senderName: contact?.profile?.name,
            messageText: message.text.body,
            messageId: message.id,
          });
        }
      }
    }

    return parsed;
  }

  async processIncomingMessage(payload: MetaWebhookPayload): Promise<void> {
    const incomingMessages = this.extractIncomingMessages(payload);

    if (!incomingMessages.length) {
      logger.info('No processable WhatsApp messages in webhook payload');
      return;
    }

    for (const incoming of incomingMessages) {
      try {
        await this.handleIncomingMessage(incoming);
      } catch (error) {
        logger.error('Failed to handle incoming WhatsApp message', {
          error,
          messageId: incoming.messageId,
          senderMobile: incoming.senderMobile,
        });
      }
    }
  }

  private async handleIncomingMessage(incoming: ParsedIncomingMessage): Promise<void> {
    const pharmacy = await Pharmacy.findOne({
      whatsappPhoneNumberId: incoming.phoneNumberId,
      isActive: true,
    });

    if (!pharmacy) {
      logger.warn('No pharmacy found for WhatsApp phone_number_id', {
        phoneNumberId: incoming.phoneNumberId,
      });
      return;
    }

    const pharmacyId = String(pharmacy._id);

    const existingMessage = await PharmacyMessage.findOne({
      whatsappMessageId: incoming.messageId,
    }).setOptions({ withDeleted: true });

    if (existingMessage) {
      logger.info('Duplicate WhatsApp message skipped', { messageId: incoming.messageId });
      return;
    }

    let patient = await Patient.findOne({
      pharmacyId,
      mobile: incoming.senderMobile,
    });

    if (!patient) {
      try {
        patient = await Patient.create({
          pharmacyId,
          name: incoming.senderName ?? incoming.senderMobile,
          mobile: incoming.senderMobile,
          lastInteractionAt: new Date(),
        });
        logger.info('New patient created from WhatsApp', {
          patientId: patient._id,
          pharmacyId,
        });
      } catch (error) {
        return handleMongooseError(error);
      }
    }

    let conversation = await PharmacyConversation.findOne({
      pharmacyId,
      patientId: patient._id,
      status: PharmacyConversationStatus.OPEN,
    });

    if (!conversation) {
      try {
        conversation = await PharmacyConversation.create({
          pharmacyId,
          patientId: patient._id,
          status: PharmacyConversationStatus.OPEN,
        });
        logger.info('New conversation created from WhatsApp', {
          conversationId: conversation._id,
          pharmacyId,
        });
      } catch (error) {
        return handleMongooseError(error);
      }
    }

    const now = new Date();

    try {
      await PharmacyMessage.create({
        pharmacyId,
        conversationId: conversation._id,
        patientId: patient._id,
        senderType: PharmacySenderType.PATIENT,
        content: incoming.messageText,
        messageType: PharmacyMessageType.TEXT,
        whatsappMessageId: incoming.messageId,
        status: PharmacyMessageStatus.DELIVERED,
      });
    } catch (error) {
      return handleMongooseError(error);
    }

    await Promise.all([
      PharmacyConversation.findByIdAndUpdate(conversation._id, { lastMessageAt: now }),
      Patient.findByIdAndUpdate(patient._id, { lastInteractionAt: now }),
    ]);

    logger.info('Incoming WhatsApp message saved', {
      pharmacyId,
      conversationId: conversation._id,
      messageId: incoming.messageId,
    });

    const botResponse = botService.processMessage(incoming.messageText, {
      name: pharmacy.name,
      greetingImageUrl: pharmacy.greetingImageUrl,
    });

    const sendResult =
      botResponse.intent === Intent.GREETING && botResponse.imageUrl
        ? await this.sendImageMessage({
            phoneNumberId: incoming.phoneNumberId,
            to: incoming.senderMobile,
            imageUrl: resolvePublicUrl(botResponse.imageUrl),
            caption: botResponse.reply,
          })
        : await this.sendMessage({
            phoneNumberId: incoming.phoneNumberId,
            to: incoming.senderMobile,
            message: botResponse.reply,
          });

    try {
      await PharmacyMessage.create({
        pharmacyId,
        conversationId: conversation._id,
        patientId: patient._id,
        senderType: PharmacySenderType.BOT,
        content: botResponse.reply,
        messageType:
          botResponse.intent === Intent.GREETING && botResponse.imageUrl
            ? PharmacyMessageType.IMAGE
            : PharmacyMessageType.TEXT,
        whatsappMessageId: sendResult.messages?.[0]?.id,
        status: PharmacyMessageStatus.SENT,
      });

      await PharmacyConversation.findByIdAndUpdate(conversation._id, {
        lastMessageAt: new Date(),
      });
    } catch (error) {
      return handleMongooseError(error);
    }

    logger.info('Bot reply sent via WhatsApp', {
      pharmacyId,
      to: incoming.senderMobile,
      whatsappMessageId: sendResult.messages?.[0]?.id,
    });
  }

  async sendMessage(params: SendMessageParams): Promise<MetaSendMessageResponse> {
    const url = `https://graph.facebook.com/${env.META_API_VERSION}/${params.phoneNumberId}/messages`;

    logger.info('Sending WhatsApp message', {
      phoneNumberId: params.phoneNumberId,
      to: params.to,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.META_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: params.to,
        type: 'text',
        text: { body: params.message },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error('WhatsApp API send failed', {
        status: response.status,
        body: errorBody,
        to: params.to,
      });
      throw new ApiError(HTTP_STATUS.BAD_GATEWAY, 'Failed to send WhatsApp message');
    }

    const result = (await response.json()) as MetaSendMessageResponse;

    logger.info('WhatsApp message sent successfully', {
      to: params.to,
      whatsappMessageId: result.messages?.[0]?.id,
    });

    return result;
  }

  async sendImageMessage(params: SendImageParams): Promise<MetaSendMessageResponse> {
    const url = `https://graph.facebook.com/${env.META_API_VERSION}/${params.phoneNumberId}/messages`;

    logger.info('Sending WhatsApp image message', {
      phoneNumberId: params.phoneNumberId,
      to: params.to,
      imageUrl: params.imageUrl,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.META_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: params.to,
        type: 'image',
        image: {
          link: params.imageUrl,
          ...(params.caption ? { caption: params.caption } : {}),
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error('WhatsApp API image send failed', {
        status: response.status,
        body: errorBody,
        to: params.to,
      });
      throw new ApiError(HTTP_STATUS.BAD_GATEWAY, 'Failed to send WhatsApp image message');
    }

    const result = (await response.json()) as MetaSendMessageResponse;

    logger.info('WhatsApp image message sent successfully', {
      to: params.to,
      whatsappMessageId: result.messages?.[0]?.id,
    });

    return result;
  }

  async sendMessageForPharmacy(
    pharmacyId: string,
    to: string,
    message: string,
  ): Promise<MetaSendMessageResponse> {
    const pharmacy = await Pharmacy.findById(pharmacyId);

    if (!pharmacy) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Pharmacy not found');
    }

    if (!pharmacy.isActive) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Pharmacy is not active');
    }

    return this.sendMessage({
      phoneNumberId: pharmacy.whatsappPhoneNumberId,
      to,
      message,
    });
  }
}

export const whatsappService = new WhatsAppService();
