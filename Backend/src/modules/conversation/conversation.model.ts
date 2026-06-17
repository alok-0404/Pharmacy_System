import { Schema, model, Document, Types } from 'mongoose';
import {
  ISoftDelete,
  SoftDeleteMethods,
  softDeletePlugin,
} from '../../database/plugins/softDelete.plugin';
import { ITimestamps } from '../../types/common.types';

export enum ConversationStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  PENDING = 'pending',
}

export interface IConversation
  extends Document,
    ISoftDelete,
    ITimestamps,
    SoftDeleteMethods {
  pharmacyId: Types.ObjectId;
  patientId: Types.ObjectId;
  status: ConversationStatus;
  lastMessageAt?: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    status: {
      type: String,
      enum: Object.values(ConversationStatus),
      default: ConversationStatus.OPEN,
    },
    lastMessageAt: { type: Date },
  },
  { timestamps: true },
);

conversationSchema.plugin(softDeletePlugin);

conversationSchema.index(
  { pharmacyId: 1, patientId: 1 },
  { partialFilterExpression: { deletedAt: null } },
);
conversationSchema.index({ pharmacyId: 1, status: 1 });
conversationSchema.index({ pharmacyId: 1, lastMessageAt: -1 });

export const Conversation = model<IConversation>('Conversation', conversationSchema);
