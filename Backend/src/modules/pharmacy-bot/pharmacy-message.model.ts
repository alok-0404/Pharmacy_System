import { Schema, model, Document, Types } from 'mongoose';
import {
  ISoftDelete,
  SoftDeleteMethods,
  softDeletePlugin,
} from '../../database/plugins/softDelete.plugin';
import { ITimestamps } from '../../types/common.types';

export enum PharmacySenderType {
  PATIENT = 'patient',
  PHARMACIST = 'pharmacist',
  BOT = 'bot',
}

export enum PharmacyMessageType {
  TEXT = 'text',
  IMAGE = 'image',
  DOCUMENT = 'document',
}

export enum PharmacyMessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

export interface IPharmacyMessage
  extends Document,
    ISoftDelete,
    ITimestamps,
    SoftDeleteMethods {
  pharmacyId: Types.ObjectId;
  conversationId: Types.ObjectId;
  patientId: Types.ObjectId;
  senderType: PharmacySenderType;
  content: string;
  messageType: PharmacyMessageType;
  whatsappMessageId?: string;
  status: PharmacyMessageStatus;
}

const pharmacyMessageSchema = new Schema<IPharmacyMessage>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'PharmacyConversation',
      required: true,
    },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    senderType: {
      type: String,
      enum: Object.values(PharmacySenderType),
      required: true,
    },
    content: { type: String, required: true },
    messageType: {
      type: String,
      enum: Object.values(PharmacyMessageType),
      default: PharmacyMessageType.TEXT,
    },
    whatsappMessageId: { type: String, trim: true },
    status: {
      type: String,
      enum: Object.values(PharmacyMessageStatus),
      default: PharmacyMessageStatus.SENT,
    },
  },
  { timestamps: true },
);

pharmacyMessageSchema.plugin(softDeletePlugin);

pharmacyMessageSchema.index({ conversationId: 1, createdAt: -1 });
pharmacyMessageSchema.index({ pharmacyId: 1, createdAt: -1 });
pharmacyMessageSchema.index({ patientId: 1, createdAt: -1 });
pharmacyMessageSchema.index(
  { whatsappMessageId: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null, whatsappMessageId: { $type: 'string' } },
  },
);

export const PharmacyMessage = model<IPharmacyMessage>(
  'PharmacyMessage',
  pharmacyMessageSchema,
  'pharmacy_messages',
);
