import { z } from 'zod';
import { DeliveryType, OrderStatus } from '../../config/order.constants';

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  rejectionReason: z.string().trim().min(1).optional(),
  paymentAmount: z.coerce.number().min(0).optional(),
  paymentLinkUrl: z.string().url('Invalid payment link').or(z.literal('')).optional(),
  paymentQrImageUrl: z
    .string()
    .url('Invalid QR image URL')
    .or(z.string().startsWith('/'))
    .or(z.literal(''))
    .optional(),
  deliveryType: z.nativeEnum(DeliveryType).optional(),
  refillDueAt: z.coerce.date().optional(),
  note: z.string().trim().optional(),
});

export const sendPaymentDetailsSchema = z.object({
  paymentLinkUrl: z.string().url('Invalid payment link').or(z.literal('')).optional(),
  paymentQrImageUrl: z
    .string()
    .url('Invalid QR image URL')
    .or(z.string().startsWith('/'))
    .or(z.literal(''))
    .optional(),
  sendMode: z.enum(['link', 'qr', 'both']).optional(),
  paymentAmount: z.coerce.number().min(0).optional(),
});

export const getOrdersQuerySchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
});
