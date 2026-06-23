import { Schema, model, Document, Types } from 'mongoose';
import {
  ISoftDelete,
  SoftDeleteMethods,
  softDeletePlugin,
} from '../../database/plugins/softDelete.plugin';
import { ITimestamps } from '../../types/common.types';

export interface IPrescription
  extends Document,
    ISoftDelete,
    ITimestamps,
    SoftDeleteMethods {
  pharmacyId: Types.ObjectId;
  patientId: Types.ObjectId;
  orderId?: Types.ObjectId;
  conversationId?: Types.ObjectId;
  messageId?: Types.ObjectId;
  fileUrl: string;
  metaMediaId?: string;
  mimeType?: string;
  fileName?: string;
}

const prescriptionSchema = new Schema<IPrescription>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    messageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    fileUrl: { type: String, required: true, trim: true },
    metaMediaId: { type: String, trim: true },
    mimeType: { type: String, trim: true },
    fileName: { type: String, trim: true },
  },
  { timestamps: true },
);

prescriptionSchema.plugin(softDeletePlugin);

prescriptionSchema.index({ pharmacyId: 1, createdAt: -1 });
prescriptionSchema.index({ orderId: 1 });
prescriptionSchema.index({ patientId: 1, createdAt: -1 });

export const Prescription = model<IPrescription>('Prescription', prescriptionSchema);
