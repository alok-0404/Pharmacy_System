import { apiGet, apiPatch } from './client';
import type { Order, OrderActivity, OrderStats, OrderStatus, UpdateOrderStatusInput } from '../types';

const API_PREFIX = '/api/v1';

export const getOrders = (pharmacyId: string, status?: OrderStatus) => {
  const query = status ? `?status=${status}` : '';
  return apiGet<Order[]>(`${API_PREFIX}/orders${query}`, pharmacyId);
};

export const getOrder = (pharmacyId: string, orderId: string) =>
  apiGet<Order>(`${API_PREFIX}/orders/${orderId}`, pharmacyId);

export const updateOrderStatus = (
  pharmacyId: string,
  orderId: string,
  data: UpdateOrderStatusInput,
) => apiPatch<Order>(`${API_PREFIX}/orders/${orderId}/status`, data, pharmacyId);

export const getOrderStats = (pharmacyId: string) =>
  apiGet<OrderStats>(`${API_PREFIX}/orders/stats`, pharmacyId);

export const getOrderActivity = (pharmacyId: string) =>
  apiGet<OrderActivity[]>(`${API_PREFIX}/orders/activity`, pharmacyId);

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  prescription_received: 'Prescription Received',
  order_verified: 'Order Verified',
  prescription_rejected: 'Prescription Rejected',
  order_accepted: 'Order Accepted',
  payment_pending: 'Payment Pending',
  payment_confirmed: 'Payment Confirmed',
  order_processing: 'Processing',
  order_ready_pickup: 'Ready for Pickup',
  order_ready_delivery: 'Ready for Delivery',
  out_for_delivery: 'Out for Delivery',
  order_completed: 'Completed',
  order_cancelled: 'Cancelled',
  refill_reminder: 'Refill Reminder',
};

export const ORDER_NEXT_ACTIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  prescription_received: ['order_verified', 'prescription_rejected', 'order_cancelled'],
  order_verified: ['order_accepted', 'prescription_rejected', 'order_cancelled'],
  order_accepted: ['payment_pending', 'order_processing', 'order_cancelled'],
  payment_pending: ['payment_confirmed', 'order_cancelled'],
  payment_confirmed: ['order_processing'],
  order_processing: ['order_ready_pickup', 'order_ready_delivery', 'order_cancelled'],
  order_ready_pickup: ['order_completed', 'order_cancelled'],
  order_ready_delivery: ['out_for_delivery', 'order_cancelled'],
  out_for_delivery: ['order_completed', 'order_cancelled'],
};
