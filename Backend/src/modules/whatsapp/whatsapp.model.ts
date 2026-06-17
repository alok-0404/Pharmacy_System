import { Schema, model, Document, Types } from 'mongoose';

export interface IWhatsAppConfig extends Document {
  pharmacyId: Types.ObjectId;
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  webhookVerifyToken: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const whatsappConfigSchema = new Schema<IWhatsAppConfig>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true, unique: true },
    phoneNumberId: { type: String, required: true },
    businessAccountId: { type: String, required: true },
    accessToken: { type: String, required: true },
    webhookVerifyToken: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const WhatsAppConfig = model<IWhatsAppConfig>('WhatsAppConfig', whatsappConfigSchema);
