import {
  Message,
  IMessage,
  MessageStatus,
  SenderType,
  MessageType,
} from './message.model';
import { Conversation } from '../conversation/conversation.model';
import { Patient } from '../patient/patient.model';
import { ApiError } from '../../utils/ApiError';
import { HTTP_STATUS } from '../../config/constants';
import { isValidObjectId } from '../../utils/objectId';
import { handleMongooseError } from '../../utils/mongooseError';

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

  async createMessage(pharmacyId: string, data: CreateMessageInput): Promise<IMessage> {
    if (!isValidObjectId(pharmacyId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid pharmacy ID');
    }

    const conversation = await this.getConversationForPharmacy(pharmacyId, data.conversationId);
    const now = new Date();

    try {
      const message = await Message.create({
        pharmacyId,
        conversationId: data.conversationId,
        patientId: conversation.patientId,
        senderType: data.senderType,
        content: data.content,
        messageType: data.messageType,
        whatsappMessageId: data.whatsappMessageId,
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
