import { Schema, model, Document, Types } from 'mongoose';
import {
  ISoftDelete,
  SoftDeleteMethods,
  softDeletePlugin,
} from '../../database/plugins/softDelete.plugin';
import { ITimestamps } from '../../types/common.types';

export interface IMedicine extends Document, ISoftDelete, ITimestamps, SoftDeleteMethods {
  pharmacyId: Types.ObjectId;
  name: string;
  unit: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
}

const medicineSchema = new Schema<IMedicine>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    name: { type: String, required: true, trim: true },
    unit: { type: String, default: 'strip', trim: true },
    price: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

medicineSchema.plugin(softDeletePlugin);

medicineSchema.index({ pharmacyId: 1, name: 1 });
medicineSchema.index({ pharmacyId: 1, isActive: 1 });

export const Medicine = model<IMedicine>('Medicine', medicineSchema);
