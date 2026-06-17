import { Schema, model, Document, Types } from 'mongoose';
import {
  ISoftDelete,
  SoftDeleteMethods,
  softDeletePlugin,
} from '../../database/plugins/softDelete.plugin';
import { ITimestamps } from '../../types/common.types';

export enum SenderType {
  PATIENT = 'patient',
  PHARMACIST = 'pharmacist',
  BOT = 'bot',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  DOCUMENT = 'document',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

export interface IMessage extends Document, ISoftDelete, ITimestamps, SoftDeleteMethods {
  pharmacyId: Types.ObjectId;
  conversationId: Types.ObjectId;
  patientId: Types.ObjectId;
  senderType: SenderType;
  content: string;
  messageType: MessageType;
  whatsappMessageId?: string;
  status: MessageStatus;
}

const messageSchema = new Schema<IMessage>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    senderType: {
      type: String,
      enum: Object.values(SenderType),
      required: true,
    },
    content: { type: String, required: true },
    messageType: {
      type: String,
      enum: Object.values(MessageType),
      default: MessageType.TEXT,
    },
    whatsappMessageId: { type: String, trim: true },
    status: {
      type: String,
      enum: Object.values(MessageStatus),
      default: MessageStatus.SENT,
    },
  },
  { timestamps: true },
);

messageSchema.plugin(softDeletePlugin);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ pharmacyId: 1, createdAt: -1 });
messageSchema.index({ patientId: 1, createdAt: -1 });
messageSchema.index(
  { whatsappMessageId: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null, whatsappMessageId: { $type: 'string' } },
  },
);

export const Message = model<IMessage>('Message', messageSchema);
