import { Schema, model, Document, Types } from 'mongoose';
import {
  ISoftDelete,
  SoftDeleteMethods,
  softDeletePlugin,
} from '../../database/plugins/softDelete.plugin';
import { ITimestamps } from '../../types/common.types';

export interface IFaq extends Document, ISoftDelete, ITimestamps, SoftDeleteMethods {
  pharmacyId: Types.ObjectId;
  question: string;
  answer: string;
  keywords: string[];
  sortOrder: number;
  isActive: boolean;
}

const faqSchema = new Schema<IFaq>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    keywords: { type: [String], default: [] },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

faqSchema.plugin(softDeletePlugin);

faqSchema.index({ pharmacyId: 1, isActive: 1, sortOrder: 1 });

export const Faq = model<IFaq>('Faq', faqSchema);
