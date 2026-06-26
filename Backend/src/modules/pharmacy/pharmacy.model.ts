import { Schema, model, Document } from 'mongoose';
import {
  ISoftDelete,
  SoftDeleteMethods,
  softDeletePlugin,
} from '../../database/plugins/softDelete.plugin';
import { ITimestamps } from '../../types/common.types';

export interface IPharmacy extends Document, ISoftDelete, ITimestamps, SoftDeleteMethods {
  name: string;
  email: string;
  mobile: string;
  whatsappPhoneNumberId: string;
  businessAccountId: string;
  greetingImageUrl?: string;
  paymentLinkUrl?: string;
  paymentQrImageUrl?: string;
  storeAddress?: string;
  storeHours?: string;
  storeMapUrl?: string;
  storeLatitude?: number;
  storeLongitude?: number;
  isActive: boolean;
}

const pharmacySchema = new Schema<IPharmacy>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    whatsappPhoneNumberId: { type: String, required: true, trim: true },
    businessAccountId: { type: String, required: true, trim: true },
    greetingImageUrl: { type: String, trim: true },
    paymentLinkUrl: { type: String, trim: true },
    paymentQrImageUrl: { type: String, trim: true },
    storeAddress: { type: String, trim: true },
    storeHours: { type: String, trim: true },
    storeMapUrl: { type: String, trim: true },
    storeLatitude: { type: Number, min: -90, max: 90 },
    storeLongitude: { type: Number, min: -180, max: 180 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

pharmacySchema.plugin(softDeletePlugin);

pharmacySchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);
pharmacySchema.index(
  { whatsappPhoneNumberId: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);
pharmacySchema.index({ isActive: 1 });
pharmacySchema.index({ mobile: 1 });

export const Pharmacy = model<IPharmacy>('Pharmacy', pharmacySchema);
