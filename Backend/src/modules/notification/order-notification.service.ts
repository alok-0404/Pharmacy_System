import { OrderStatus } from '../../config/order.constants';

export interface OrderNotificationContext {
  pharmacyName: string;
  orderId: string;
  rejectionReason?: string;
  paymentAmount?: number;
}

/** WhatsApp message text for each order status transition. */
export function getOrderStatusMessage(
  status: OrderStatus,
  context: OrderNotificationContext,
): string {
  const shortId = context.orderId.slice(-6).toUpperCase();

  switch (status) {
    case OrderStatus.PRESCRIPTION_RECEIVED:
      return `Thank you! Your prescription has been received and is under review at ${context.pharmacyName}. Order ref: #${shortId}`;

    case OrderStatus.ORDER_VERIFIED:
      return `Good news! Your prescription for order #${shortId} has been verified by ${context.pharmacyName}.`;

    case OrderStatus.PRESCRIPTION_REJECTED:
      return `We could not process your prescription for order #${shortId}.${
        context.rejectionReason ? ` Reason: ${context.rejectionReason}` : ''
      } Please contact ${context.pharmacyName} for assistance.`;

    case OrderStatus.ORDER_ACCEPTED:
      return `Your order #${shortId} has been accepted by ${context.pharmacyName}. We will update you on the next step shortly.`;

    case OrderStatus.PAYMENT_PENDING:
      return `Payment is required for order #${shortId}.${
        context.paymentAmount ? ` Amount: ₹${context.paymentAmount}.` : ''
      } Please complete payment to proceed. ${context.pharmacyName}`;

    case OrderStatus.PAYMENT_CONFIRMED:
      return `Payment received for order #${shortId}. Thank you! ${context.pharmacyName} will start preparing your order.`;

    case OrderStatus.ORDER_PROCESSING:
      return `Your order #${shortId} is now being prepared at ${context.pharmacyName}.`;

    case OrderStatus.ORDER_READY_PICKUP:
      return `Your order #${shortId} is ready for pickup at ${context.pharmacyName}. Please visit the store to collect it.`;

    case OrderStatus.ORDER_READY_DELIVERY:
      return `Your order #${shortId} has been packed and is ready for delivery from ${context.pharmacyName}.`;

    case OrderStatus.OUT_FOR_DELIVERY:
      return `Your order #${shortId} is out for delivery. It will reach you soon. — ${context.pharmacyName}`;

    case OrderStatus.ORDER_COMPLETED:
      return `Your order #${shortId} has been delivered successfully. Thank you for choosing ${context.pharmacyName}!`;

    case OrderStatus.ORDER_CANCELLED:
      return `Order #${shortId} has been cancelled. Contact ${context.pharmacyName} if you have questions.`;

    case OrderStatus.REFILL_REMINDER:
      return `Reminder from ${context.pharmacyName}: Your medicines for order #${shortId} may be running low soon. Reply here to reorder.`;

    default:
      return `Order #${shortId} status updated at ${context.pharmacyName}.`;
  }
}

export function getOrderStatusLabel(status: OrderStatus): string {
  return status.replace(/_/g, ' ');
}
