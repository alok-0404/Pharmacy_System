import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import { HTTP_STATUS } from '../../config/constants';
import { logger } from '../../utils/logger';
import { handleMongooseError } from '../../utils/mongooseError';
import { saveBufferToUploads } from '../../utils/mediaStorage';
import { Pharmacy } from '../pharmacy/pharmacy.model';
import { Patient } from '../patient/patient.model';
import { Conversation } from '../conversation/conversation.model';
import {
  Message,
  MessageStatus,
  MessageType,
  SenderType,
} from '../message/message.model';
import { conversationService } from '../conversation/conversation.service';
import { orderService } from '../order/order.service';
import { botFlowService } from '../../bot/bot-flow.service';
import { Intent } from '../../bot/intent-detector';
import { DEFAULT_GREETING_IMAGE_URL } from '../../config/greeting.constants';
import { SERVICE_MENU_BODY, getServiceOptionLabel, SERVICE_MENU_ROWS } from '../../bot/service-menu';
import { sendInteractiveListMessage } from './whatsapp.interactive';
import { resolvePublicUrl } from '../../utils/publicUrl';
import { isServerWhatsappConfigured } from '../../utils/whatsappIntegration';
import {
  MetaMediaInfoResponse,
  MetaSendMessageResponse,
  MetaWebhookPayload,
  ParsedIncomingMessage,
  SendImageParams,
  SendMessageParams,
} from './whatsapp.types';

const MIME_EXTENSION: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

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
          const contact = contacts?.find((c) => c.wa_id === message.from);
          const base = {
            phoneNumberId,
            senderMobile: message.from,
            senderName: contact?.profile?.name,
            messageId: message.id,
          };

          if (message.type === 'text' && message.text?.body) {
            parsed.push({
              ...base,
              messageType: 'text',
              messageText: message.text.body,
            });
            continue;
          }

          if (message.type === 'interactive' && message.interactive) {
            const buttonReply = message.interactive.button_reply;
            const listReply = message.interactive.list_reply;
            const selected = buttonReply ?? listReply;

            if (!selected) {
              continue;
            }

            parsed.push({
              ...base,
              messageType: 'interactive',
              messageText: selected.title,
              buttonId: selected.id,
            });
            continue;
          }

          if (message.type === 'image' && message.image?.id) {
            parsed.push({
              ...base,
              messageType: 'image',
              messageText: message.image.caption ?? '[Prescription image]',
              mediaId: message.image.id,
              mimeType: message.image.mime_type,
            });
            continue;
          }

          if (message.type === 'document' && message.document?.id) {
            parsed.push({
              ...base,
              messageType: 'document',
              messageText: message.document.caption ?? message.document.filename ?? '[Document]',
              mediaId: message.document.id,
              mimeType: message.document.mime_type,
              fileName: message.document.filename,
            });
            continue;
          }

          logger.info('Skipping unsupported WhatsApp message type', {
            type: message.type,
            messageId: message.id,
          });
        }
      }
    }

    return parsed;
  }

  private extensionForMime(mimeType?: string): string {
    if (!mimeType) {
      return '.bin';
    }

    return MIME_EXTENSION[mimeType] ?? '.bin';
  }

  async downloadMedia(mediaId: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const infoUrl = `https://graph.facebook.com/${env.META_API_VERSION}/${mediaId}`;

    const infoResponse = await fetch(infoUrl, {
      headers: { Authorization: `Bearer ${env.META_ACCESS_TOKEN}` },
    });

    if (!infoResponse.ok) {
      throw new ApiError(HTTP_STATUS.BAD_GATEWAY, 'Failed to fetch WhatsApp media info');
    }

    const info = (await infoResponse.json()) as MetaMediaInfoResponse;

    const fileResponse = await fetch(info.url, {
      headers: { Authorization: `Bearer ${env.META_ACCESS_TOKEN}` },
    });

    if (!fileResponse.ok) {
      throw new ApiError(HTTP_STATUS.BAD_GATEWAY, 'Failed to download WhatsApp media');
    }

    const arrayBuffer = await fileResponse.arrayBuffer();

    return {
      buffer: Buffer.from(arrayBuffer),
      mimeType: info.mime_type,
    };
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

    const existingMessage = await Message.findOne({
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

    const conversation = await conversationService.findOrCreateOpenConversation(
      pharmacyId,
      String(patient._id),
    );

    const now = new Date();
    const isPrescriptionMedia =
      incoming.messageType === 'image' || incoming.messageType === 'document';

    let messageType = MessageType.TEXT;
    let content = incoming.messageText;
    let fileUrl: string | undefined;

    if (isPrescriptionMedia && incoming.mediaId) {
      try {
        const media = await this.downloadMedia(incoming.mediaId);
        fileUrl = await saveBufferToUploads(
          `prescriptions/${pharmacyId}`,
          media.buffer,
          this.extensionForMime(media.mimeType ?? incoming.mimeType),
        );
        messageType =
          incoming.messageType === 'image' ? MessageType.IMAGE : MessageType.DOCUMENT;
        content = fileUrl;
      } catch (error) {
        logger.error('Failed to download prescription media', {
          mediaId: incoming.mediaId,
          error,
        });
        messageType =
          incoming.messageType === 'image' ? MessageType.IMAGE : MessageType.DOCUMENT;
        content = incoming.messageText;
      }
    }

    let savedMessage;

    try {
      savedMessage = await Message.create({
        pharmacyId,
        conversationId: conversation._id,
        patientId: patient._id,
        senderType: SenderType.PATIENT,
        content,
        messageType,
        whatsappMessageId: incoming.messageId,
        status: MessageStatus.DELIVERED,
      });
    } catch (error) {
      return handleMongooseError(error);
    }

    await Promise.all([
      Conversation.findByIdAndUpdate(conversation._id, { lastMessageAt: now }),
      Patient.findByIdAndUpdate(patient._id, { lastInteractionAt: now }),
    ]);

    logger.info('Incoming WhatsApp message saved to inbox', {
      pharmacyId,
      conversationId: conversation._id,
      messageId: incoming.messageId,
      messageType: incoming.messageType,
    });

    if (isPrescriptionMedia && fileUrl) {
      await orderService.createFromPrescription({
        pharmacyId,
        patientId: String(patient._id),
        conversationId: String(conversation._id),
        messageId: String(savedMessage._id),
        fileUrl,
        metaMediaId: incoming.mediaId,
        mimeType: incoming.mimeType,
        fileName: incoming.fileName,
      });
      return;
    }

    const botResponse = await botFlowService.process({
      message: incoming.messageText,
      buttonId: incoming.buttonId,
      pharmacyId,
      patientId: String(patient._id),
      context: {
        name: pharmacy.name,
        greetingImageUrl: pharmacy.greetingImageUrl || DEFAULT_GREETING_IMAGE_URL,
        storeAddress: pharmacy.storeAddress,
        storeHours: pharmacy.storeHours,
        storeMapUrl: pharmacy.storeMapUrl,
      },
    });

    await this.sendBotReply({
      pharmacyId,
      phoneNumberId: incoming.phoneNumberId,
      senderMobile: incoming.senderMobile,
      conversationId: String(conversation._id),
      patientId: String(patient._id),
      botResponse,
    });
  }

  private async sendBotReply(params: {
    pharmacyId: string;
    phoneNumberId: string;
    senderMobile: string;
    conversationId: string;
    patientId: string;
    botResponse: {
      intent: Intent;
      reply: string;
      imageUrl?: string;
      sendServiceMenu: boolean;
    };
  }): Promise<void> {
    const { pharmacyId, phoneNumberId, senderMobile, conversationId, patientId, botResponse } =
      params;

    if (!isServerWhatsappConfigured()) {
      return;
    }

    const isGreetingImage =
      botResponse.intent === Intent.GREETING && Boolean(botResponse.imageUrl);

    const sendResult = isGreetingImage
      ? await this.sendImageMessage({
          phoneNumberId,
          to: senderMobile,
          imageUrl: resolvePublicUrl(botResponse.imageUrl!),
          caption: botResponse.reply,
        })
      : await this.sendMessage({
          phoneNumberId,
          to: senderMobile,
          message: botResponse.reply,
        });

    try {
      await Message.create({
        pharmacyId,
        conversationId,
        patientId,
        senderType: SenderType.BOT,
        content: isGreetingImage ? botResponse.imageUrl! : botResponse.reply,
        messageType: isGreetingImage ? MessageType.IMAGE : MessageType.TEXT,
        whatsappMessageId: sendResult.messages?.[0]?.id,
        status: MessageStatus.SENT,
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessageAt: new Date(),
      });
    } catch (error) {
      return handleMongooseError(error);
    }

    if (botResponse.sendServiceMenu) {
      await this.sendServiceMenu({
        pharmacyId,
        phoneNumberId,
        senderMobile,
        conversationId,
        patientId,
      });
    }

    logger.info('Bot reply sent via WhatsApp', {
      pharmacyId,
      to: senderMobile,
      intent: botResponse.intent,
      whatsappMessageId: sendResult.messages?.[0]?.id,
    });
  }

  private async sendServiceMenu(params: {
    pharmacyId: string;
    phoneNumberId: string;
    senderMobile: string;
    conversationId: string;
    patientId: string;
  }): Promise<void> {
    const { pharmacyId, phoneNumberId, senderMobile, conversationId, patientId } = params;

    if (!isServerWhatsappConfigured()) {
      return;
    }

    const menuSummary = `Service menu: ${SERVICE_MENU_ROWS.map((row) => getServiceOptionLabel(row.id)).join(', ')}`;

    try {
      const sendResult = await sendInteractiveListMessage(
        { phoneNumberId, to: senderMobile, bodyText: SERVICE_MENU_BODY },
        (id, body) => this.sendRawMessage(id, body),
      );

      await Message.create({
        pharmacyId,
        conversationId,
        patientId,
        senderType: SenderType.BOT,
        content: menuSummary,
        messageType: MessageType.TEXT,
        whatsappMessageId: sendResult.messages?.[0]?.id,
        status: MessageStatus.SENT,
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessageAt: new Date(),
      });

      logger.info('Service menu sent via WhatsApp', {
        pharmacyId,
        to: senderMobile,
      });
    } catch (error) {
      logger.error('Failed to send service menu', { pharmacyId, error });
    }
  }

  private async sendRawMessage(
    phoneNumberId: string,
    body: unknown,
  ): Promise<MetaSendMessageResponse> {
    const url = `https://graph.facebook.com/${env.META_API_VERSION}/${phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.META_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error('WhatsApp API raw send failed', {
        status: response.status,
        body: errorBody,
      });
      throw new ApiError(HTTP_STATUS.BAD_GATEWAY, 'Failed to send WhatsApp message');
    }

    return (await response.json()) as MetaSendMessageResponse;
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

    return (await response.json()) as MetaSendMessageResponse;
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

    if (!isServerWhatsappConfigured()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'WhatsApp is not configured on the server');
    }

    return this.sendMessage({
      phoneNumberId: pharmacy.whatsappPhoneNumberId,
      to,
      message,
    });
  }

  async sendImageMessageForPharmacy(
    pharmacyId: string,
    to: string,
    imageUrl: string,
    caption?: string,
  ): Promise<MetaSendMessageResponse> {
    const pharmacy = await Pharmacy.findById(pharmacyId);

    if (!pharmacy) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Pharmacy not found');
    }

    if (!pharmacy.isActive) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Pharmacy is not active');
    }

    if (!isServerWhatsappConfigured()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'WhatsApp is not configured on the server');
    }

    return this.sendImageMessage({
      phoneNumberId: pharmacy.whatsappPhoneNumberId,
      to,
      imageUrl,
      caption,
    });
  }
}

export const whatsappService = new WhatsAppService();
