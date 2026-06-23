import { z } from 'zod';
import { DeliveryType, OrderStatus } from '../../config/order.constants';

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  rejectionReason: z.string().trim().min(1).optional(),
  paymentAmount: z.coerce.number().min(0).optional(),
  deliveryType: z.nativeEnum(DeliveryType).optional(),
  refillDueAt: z.coerce.date().optional(),
  note: z.string().trim().optional(),
});

export const getOrdersQuerySchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
});
