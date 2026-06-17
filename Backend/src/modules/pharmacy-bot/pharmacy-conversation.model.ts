import { Schema, model, Document, Types } from 'mongoose';
import {
  ISoftDelete,
  SoftDeleteMethods,
  softDeletePlugin,
} from '../../database/plugins/softDelete.plugin';
import { ITimestamps } from '../../types/common.types';

export enum PharmacyConversationStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  PENDING = 'pending',
}

export interface IPharmacyConversation
  extends Document,
    ISoftDelete,
    ITimestamps,
    SoftDeleteMethods {
  pharmacyId: Types.ObjectId;
  patientId: Types.ObjectId;
  status: PharmacyConversationStatus;
  lastMessageAt?: Date;
}

const pharmacyConversationSchema = new Schema<IPharmacyConversation>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    status: {
      type: String,
      enum: Object.values(PharmacyConversationStatus),
      default: PharmacyConversationStatus.OPEN,
    },
    lastMessageAt: { type: Date },
  },
  { timestamps: true },
);

pharmacyConversationSchema.plugin(softDeletePlugin);

pharmacyConversationSchema.index(
  { pharmacyId: 1, patientId: 1 },
  { partialFilterExpression: { deletedAt: null } },
);
pharmacyConversationSchema.index({ pharmacyId: 1, status: 1 });
pharmacyConversationSchema.index({ pharmacyId: 1, lastMessageAt: -1 });

export const PharmacyConversation = model<IPharmacyConversation>(
  'PharmacyConversation',
  pharmacyConversationSchema,
  'pharmacy_conversations',
);
