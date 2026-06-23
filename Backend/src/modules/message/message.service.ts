import {
  Message,
  IMessage,
  MessageStatus,
  SenderType,
  MessageType,
} from './message.model';
import { Conversation } from '../conversation/conversation.model';
import { Patient } from '../patient/patient.model';
import { Pharmacy } from '../pharmacy/pharmacy.model';
import { ApiError } from '../../utils/ApiError';
import { HTTP_STATUS } from '../../config/constants';
import { isValidObjectId } from '../../utils/objectId';
import { handleMongooseError } from '../../utils/mongooseError';
import { whatsappService } from '../whatsapp/whatsapp.service';
import {
  isPharmacyWhatsappConfigured,
  isServerWhatsappConfigured,
} from '../../utils/whatsappIntegration';
import { logger } from '../../utils/logger';

export interface CreateMessageInput {
  conversationId: string;
  senderType: SenderType;
  content: string;
  messageType?: MessageType;
  whatsappMessageId?: string;
}

export class MessageService {
  private async getConversationForPharmacy(pharmacyId: string, conversationId: string) {
    if (!isValidObjectId(conversationId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid conversation ID');
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      pharmacyId,
    });

    if (!conversation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Conversation not found for this pharmacy');
    }

    return conversation;
  }

  private async deliverPharmacistReply(
    pharmacyId: string,
    patientId: string,
    content: string,
  ): Promise<string | undefined> {
    const pharmacy = await Pharmacy.findById(pharmacyId);
    const patient = await Patient.findById(patientId);

    if (!pharmacy || !patient) {
      return undefined;
    }

    if (!isServerWhatsappConfigured() || !isPharmacyWhatsappConfigured(pharmacy)) {
      return undefined;
    }

    try {
      const result = await whatsappService.sendMessageForPharmacy(
        pharmacyId,
        patient.mobile,
        content,
      );
      return result.messages?.[0]?.id;
    } catch (error) {
      logger.error('Failed to deliver pharmacist reply via WhatsApp', {
        pharmacyId,
        patientId,
        error,
      });
      return undefined;
    }
  }

  async createMessage(pharmacyId: string, data: CreateMessageInput): Promise<IMessage> {
    if (!isValidObjectId(pharmacyId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid pharmacy ID');
    }

    const conversation = await this.getConversationForPharmacy(pharmacyId, data.conversationId);
    const now = new Date();

    let whatsappMessageId = data.whatsappMessageId;

    if (data.senderType === SenderType.PHARMACIST) {
      whatsappMessageId =
        (await this.deliverPharmacistReply(
          pharmacyId,
          String(conversation.patientId),
          data.content,
        )) ?? whatsappMessageId;
    }

    try {
      const message = await Message.create({
        pharmacyId,
        conversationId: data.conversationId,
        patientId: conversation.patientId,
        senderType: data.senderType,
        content: data.content,
        messageType: data.messageType ?? MessageType.TEXT,
        whatsappMessageId,
        status: MessageStatus.SENT,
      });

      await Promise.all([
        Conversation.findByIdAndUpdate(conversation._id, { lastMessageAt: now }),
        Patient.findByIdAndUpdate(conversation.patientId, { lastInteractionAt: now }),
      ]);

      return message;
    } catch (error) {
      return handleMongooseError(error);
    }
  }

  async getMessages(pharmacyId: string, conversationId?: string): Promise<IMessage[]> {
    if (!isValidObjectId(pharmacyId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid pharmacy ID');
    }

    const filter: Record<string, unknown> = { pharmacyId };

    if (conversationId) {
      if (!isValidObjectId(conversationId)) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid conversation ID');
      }

      await this.getConversationForPharmacy(pharmacyId, conversationId);
      filter.conversationId = conversationId;
    }

    return Message.find(filter).sort({ createdAt: -1 });
  }
}

export const messageService = new MessageService();
