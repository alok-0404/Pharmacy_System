import { OrderStatus } from './order.constants';
import {
  formatDate,
  type OrderNotificationContext,
} from '../modules/notification/order-notification.service';

/**
 * Maps order statuses to Meta-approved WhatsApp template names.
 * Template body variables must match the order defined in Meta Business Manager.
 *
 * Variable order per approved template (keep in sync with Meta):
 * - order_verified:        {{1}} pharmacy, {{2}} order details
 * - prescription_rejected: {{1}} pharmacy, {{2}} reason, {{3}} location
 * - order_accepted:        {{1}} pharmacy
 * - order_ready_pickup:    {{1}} pharmacy, {{2}} location, {{3}} hours
 * - order_ready_delivery:  {{1}} pharmacy
 * - order_cancelled:       {{1}} pharmacy, {{2}} reason, {{3}} contact
 * - order_completed:       {{1}} pharmacy
 * - payment_confirmed:     {{1}} pharmacy, {{2}} amount, {{3}} date, {{4}} mode
 * - refill_reminder:       {{1}} patient, {{2}} pharmacy, {{3}} medicine, {{4}} last order, {{5}} date, {{6}} days
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

/**
 * Meta rejects template parameters that are empty or contain newlines, tabs,
 * or more than four consecutive spaces. This collapses whitespace and applies a
 * non-empty fallback so a send never fails on a blank/optional value.
 */
function clean(value: string | number | undefined | null, fallback: string): string {
  const text = value == null ? '' : String(value).replace(/\s+/g, ' ').trim();
  return text.length > 0 ? text : fallback;
}

export function buildMetaTemplateBodyParams(
  status: OrderStatus,
  context: OrderNotificationContext,
): string[] {
  const orderRef = `#${context.orderId.slice(-6).toUpperCase()}`;
  const pharmacy = clean(context.pharmacyName, 'our pharmacy');

  switch (status) {
    case OrderStatus.ORDER_VERIFIED:
      // {{1}} pharmacy, {{2}} order details
      return [pharmacy, orderRef];

    case OrderStatus.PRESCRIPTION_REJECTED:
      // {{1}} pharmacy, {{2}} reason, {{3}} location
      return [
        pharmacy,
        clean(context.rejectionReason, 'Not specified'),
        clean(context.storeAddress, pharmacy),
      ];

    case OrderStatus.ORDER_ACCEPTED:
      // {{1}} pharmacy
      return [pharmacy];

    case OrderStatus.ORDER_READY_PICKUP:
      // {{1}} pharmacy, {{2}} location, {{3}} hours
      return [
        pharmacy,
        clean(context.storeAddress, 'our store'),
        clean(context.storeHours, 'our opening hours'),
      ];

    case OrderStatus.ORDER_READY_DELIVERY:
      // {{1}} pharmacy
      return [pharmacy];

    case OrderStatus.ORDER_CANCELLED:
      // {{1}} pharmacy, {{2}} reason, {{3}} contact
      return [
        pharmacy,
        clean(context.rejectionReason, 'Not specified'),
        clean(context.storeAddress, pharmacy),
      ];

    case OrderStatus.ORDER_COMPLETED:
      // {{1}} pharmacy
      return [pharmacy];

    case OrderStatus.PAYMENT_CONFIRMED:
      // {{1}} pharmacy, {{2}} amount, {{3}} date, {{4}} mode
      return [
        pharmacy,
        clean(context.paymentAmount, '0'),
        clean(context.paymentDate, formatDate(new Date())),
        clean(context.paymentMode, 'Online'),
      ];

    case OrderStatus.REFILL_REMINDER:
      // {{1}} patient, {{2}} pharmacy, {{3}} medicine, {{4}} last order, {{5}} date, {{6}} days
      return [
        clean(context.patientName, 'there'),
        pharmacy,
        clean(context.medicineName, 'your medicine'),
        orderRef,
        clean(context.lastOrderDate, formatDate(new Date())),
        clean(context.daysRemaining, '7'),
      ];

    default:
      return [pharmacy];
  }
}
