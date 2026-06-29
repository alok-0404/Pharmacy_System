import { Conversation, IConversation, ConversationStatus } from './conversation.model';
import { Patient } from '../patient/patient.model';
import { Pharmacy } from '../pharmacy/pharmacy.model';
import { ApiError } from '../../utils/ApiError';
import { HTTP_STATUS } from '../../config/constants';
import { isValidObjectId } from '../../utils/objectId';
import { handleMongooseError } from '../../utils/mongooseError';
import {
  paymentNotificationService,
  PaymentDetailsInput,
} from '../notification/payment-notification.service';

export interface CreateConversationInput {
  patientId: string;
  status?: ConversationStatus;
}

export class ConversationService {
  private async assertPatientBelongsToPharmacy(
    pharmacyId: string,
    patientId: string,
  ): Promise<void> {
    if (!isValidObjectId(patientId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid patient ID');
    }

    const patient = await Patient.findOne({ _id: patientId, pharmacyId });

    if (!patient) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Patient not found for this pharmacy');
    }
  }

  async createConversation(
    pharmacyId: string,
    data: CreateConversationInput,
  ): Promise<IConversation> {
    if (!isValidObjectId(pharmacyId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid pharmacy ID');
    }

    await this.assertPatientBelongsToPharmacy(pharmacyId, data.patientId);

    try {
      const conversation = await Conversation.create({
        pharmacyId,
        patientId: data.patientId,
        status: data.status ?? ConversationStatus.OPEN,
      });
      return conversation;
    } catch (error) {
      return handleMongooseError(error);
    }
  }

  async getConversations(pharmacyId: string): Promise<IConversation[]> {
    if (!isValidObjectId(pharmacyId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid pharmacy ID');
    }

    return Conversation.find({ pharmacyId })
      .populate('patientId', 'name mobile email')
      .sort({ lastMessageAt: -1, createdAt: -1 });
  }

  async setHandoffActive(conversationId: string, active: boolean): Promise<void> {
    if (!isValidObjectId(conversationId)) {
      return;
    }

    await Conversation.findByIdAndUpdate(conversationId, { handoffActive: active });
  }

  async getConversationById(pharmacyId: string, conversationId: string): Promise<IConversation> {
    if (!isValidObjectId(pharmacyId) || !isValidObjectId(conversationId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid pharmacy or conversation ID');
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

  async sendPaymentDetails(
    pharmacyId: string,
    conversationId: string,
    input?: PaymentDetailsInput,
  ): Promise<void> {
    const conversation = await this.getConversationById(pharmacyId, conversationId);
    const pharmacy = await Pharmacy.findById(pharmacyId);
    const patient = await Patient.findOne({ _id: conversation.patientId, pharmacyId });

    if (!pharmacy || !patient) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Pharmacy or patient not found');
    }

    const paymentLink = paymentNotificationService.resolveConversationPaymentLink(pharmacy, input);
    const paymentQr = paymentNotificationService.resolveConversationQrImageUrl(pharmacy, input);

    if (!paymentLink && !paymentQr) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Payment link or QR code is required. Add it in Settings first.',
      );
    }

    await paymentNotificationService.sendPaymentDetailsForConversation(
      pharmacyId,
      conversationId,
      pharmacy,
      patient,
      input,
    );
  }

  async findOrCreateOpenConversation(
    pharmacyId: string,
    patientId: string,
  ): Promise<IConversation> {
    if (!isValidObjectId(pharmacyId) || !isValidObjectId(patientId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid pharmacy or patient ID');
    }

    const existing = await Conversation.findOne({
      pharmacyId,
      patientId,
      status: ConversationStatus.OPEN,
    });

    if (existing) {
      return existing;
    }

    try {
      return await Conversation.create({
        pharmacyId,
        patientId,
        status: ConversationStatus.OPEN,
      });
    } catch (error) {
      return handleMongooseError(error);
    }
  }
}

export const conversationService = new ConversationService();
