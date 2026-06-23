import { Schema, model, Document, Types } from 'mongoose';
import {
  ISoftDelete,
  SoftDeleteMethods,
  softDeletePlugin,
} from '../../database/plugins/softDelete.plugin';
import { ITimestamps } from '../../types/common.types';
import {
  DeliveryType,
  OrderStatus,
  PaymentStatus,
} from '../../config/order.constants';

export interface IOrderStatusHistory {
  status: OrderStatus;
  note?: string;
  changedAt: Date;
}

export interface IOrder extends Document, ISoftDelete, ITimestamps, SoftDeleteMethods {
  pharmacyId: Types.ObjectId;
  patientId: Types.ObjectId;
  conversationId?: Types.ObjectId;
  prescriptionId?: Types.ObjectId;
  status: OrderStatus;
  rejectionReason?: string;
  paymentAmount?: number;
  paymentStatus?: PaymentStatus;
  deliveryType?: DeliveryType;
  refillDueAt?: Date;
  refillReminderSentAt?: Date;
  statusHistory: IOrderStatusHistory[];
}

const statusHistorySchema = new Schema<IOrderStatusHistory>(
  {
    status: { type: String, enum: Object.values(OrderStatus), required: true },
    note: { type: String, trim: true },
    changedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    prescriptionId: { type: Schema.Types.ObjectId, ref: 'Prescription' },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PRESCRIPTION_RECEIVED,
      required: true,
    },
    rejectionReason: { type: String, trim: true },
    paymentAmount: { type: Number, min: 0 },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
    },
    deliveryType: {
      type: String,
      enum: Object.values(DeliveryType),
    },
    refillDueAt: { type: Date },
    refillReminderSentAt: { type: Date },
    statusHistory: { type: [statusHistorySchema], default: [] },
  },
  { timestamps: true },
);

orderSchema.plugin(softDeletePlugin);

orderSchema.index({ pharmacyId: 1, status: 1 });
orderSchema.index({ pharmacyId: 1, createdAt: -1 });
orderSchema.index({ patientId: 1, createdAt: -1 });
orderSchema.index({ refillDueAt: 1, status: 1 });

export const Order = model<IOrder>('Order', orderSchema);
