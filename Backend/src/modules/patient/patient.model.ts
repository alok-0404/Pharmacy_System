import { Schema, model, Document, Types } from 'mongoose';
import {
  ISoftDelete,
  SoftDeleteMethods,
  softDeletePlugin,
} from '../../database/plugins/softDelete.plugin';
import { ITimestamps } from '../../types/common.types';

export interface IPatient extends Document, ISoftDelete, ITimestamps, SoftDeleteMethods {
  pharmacyId: Types.ObjectId;
  name: string;
  mobile: string;
  email?: string;
  lastInteractionAt?: Date;
  isActive: boolean;
}

const patientSchema = new Schema<IPatient>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    lastInteractionAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

patientSchema.plugin(softDeletePlugin);

patientSchema.index(
  { pharmacyId: 1, mobile: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);
patientSchema.index({ pharmacyId: 1, isActive: 1 });
patientSchema.index({ pharmacyId: 1, lastInteractionAt: -1 });

export const Patient = model<IPatient>('Patient', patientSchema);
