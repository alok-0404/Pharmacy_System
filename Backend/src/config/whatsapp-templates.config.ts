import { OrderStatus } from './order.constants';
import type { OrderNotificationContext } from '../modules/notification/order-notification.service';

/**
 * Maps order statuses to Meta-approved WhatsApp template names.
 * Template body variables must match the order defined in Meta Business Manager.
 *
 * Expected variable order (update if your Meta templates differ):
 * - order_verified: {{1}} order ref, {{2}} pharmacy name
 * - prescription_rejected: {{1}} order ref, {{2}} reason, {{3}} pharmacy name
 * - order_accepted: {{1}} order ref, {{2}} pharmacy name
 * - order_ready_pickup: {{1}} order ref, {{2}} pharmacy name
 * - order_ready_delivery: {{1}} order ref, {{2}} pharmacy name
 * - order_cancelled: {{1}} order ref, {{2}} pharmacy name
 * - order_completed: {{1}} order ref, {{2}} pharmacy name
 * - payment_confirmed: {{1}} order ref, {{2}} pharmacy name
 * - refill_reminder: {{1}} order ref, {{2}} pharmacy name
 */
export const META_ORDER_TEMPLATE_MAP: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.ORDER_VERIFIED]: 'order_verified',
  [OrderStatus.PRESCRIPTION_REJECTED]: 'prescription_rejected',
  [OrderStatus.ORDER_ACCEPTED]: 'order_accepted',
  [OrderStatus.ORDER_READY_PICKUP]: 'order_ready_pickup',
  [OrderStatus.ORDER_READY_DELIVERY]: 'order_ready_delivery',
  [OrderStatus.ORDER_CANCELLED]: 'order_cancelled',
  [OrderStatus.ORDER_COMPLETED]: 'order_completed',
  [OrderStatus.PAYMENT_CONFIRMED]: 'payment_confirmed',
  [OrderStatus.REFILL_REMINDER]: 'refill_reminder',
};

export function getMetaTemplateName(status: OrderStatus): string | undefined {
  return META_ORDER_TEMPLATE_MAP[status];
}

export function buildMetaTemplateBodyParams(
  status: OrderStatus,
  context: OrderNotificationContext,
): string[] {
  const shortId = context.orderId.slice(-6).toUpperCase();
  const pharmacy = context.pharmacyName;

  switch (status) {
    case OrderStatus.PRESCRIPTION_REJECTED:
      return [shortId, context.rejectionReason ?? 'Not specified', pharmacy];

    case OrderStatus.PAYMENT_PENDING:
      return context.paymentAmount
        ? [shortId, String(context.paymentAmount), pharmacy]
        : [shortId, pharmacy];

    default:
      return [shortId, pharmacy];
  }
}
