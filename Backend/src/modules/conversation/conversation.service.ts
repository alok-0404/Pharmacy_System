import { Conversation, IConversation, ConversationStatus } from './conversation.model';
import { Patient } from '../patient/patient.model';
import { ApiError } from '../../utils/ApiError';
import { HTTP_STATUS } from '../../config/constants';
import { isValidObjectId } from '../../utils/objectId';
import { handleMongooseError } from '../../utils/mongooseError';

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
}

export const conversationService = new ConversationService();
