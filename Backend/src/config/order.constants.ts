/** Order lifecycle statuses for the pharmacy WhatsApp bot workflow. */
export enum OrderStatus {
  PRESCRIPTION_RECEIVED = 'prescription_received',
  ORDER_VERIFIED = 'order_verified',
  PRESCRIPTION_REJECTED = 'prescription_rejected',
  ORDER_ACCEPTED = 'order_accepted',
  PAYMENT_PENDING = 'payment_pending',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  ORDER_PROCESSING = 'order_processing',
  ORDER_READY_PICKUP = 'order_ready_pickup',
  ORDER_READY_DELIVERY = 'order_ready_delivery',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  ORDER_COMPLETED = 'order_completed',
  ORDER_CANCELLED = 'order_cancelled',
  REFILL_REMINDER = 'refill_reminder',
}

export enum PaymentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

export enum DeliveryType {
  PICKUP = 'pickup',
  DELIVERY = 'delivery',
}

/**
 * Allowed status transitions — pharmacist or system moves order forward.
 * Terminal states have no outgoing transitions.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PRESCRIPTION_RECEIVED]: [
    OrderStatus.ORDER_VERIFIED,
    OrderStatus.PRESCRIPTION_REJECTED,
    OrderStatus.ORDER_CANCELLED,
  ],
  [OrderStatus.ORDER_VERIFIED]: [
    OrderStatus.ORDER_ACCEPTED,
    OrderStatus.PRESCRIPTION_REJECTED,
    OrderStatus.ORDER_CANCELLED,
  ],
  [OrderStatus.PRESCRIPTION_REJECTED]: [],
  [OrderStatus.ORDER_ACCEPTED]: [
    OrderStatus.PAYMENT_PENDING,
    OrderStatus.ORDER_PROCESSING,
    OrderStatus.ORDER_CANCELLED,
  ],
  [OrderStatus.PAYMENT_PENDING]: [
    OrderStatus.PAYMENT_CONFIRMED,
    OrderStatus.ORDER_CANCELLED,
  ],
  [OrderStatus.PAYMENT_CONFIRMED]: [OrderStatus.ORDER_PROCESSING],
  [OrderStatus.ORDER_PROCESSING]: [
    OrderStatus.ORDER_READY_PICKUP,
    OrderStatus.ORDER_READY_DELIVERY,
    OrderStatus.ORDER_CANCELLED,
  ],
  [OrderStatus.ORDER_READY_PICKUP]: [
    OrderStatus.ORDER_COMPLETED,
    OrderStatus.ORDER_CANCELLED,
  ],
  [OrderStatus.ORDER_READY_DELIVERY]: [
    OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.ORDER_CANCELLED,
  ],
  [OrderStatus.OUT_FOR_DELIVERY]: [
    OrderStatus.ORDER_COMPLETED,
    OrderStatus.ORDER_CANCELLED,
  ],
  [OrderStatus.ORDER_COMPLETED]: [OrderStatus.REFILL_REMINDER],
  [OrderStatus.ORDER_CANCELLED]: [],
  [OrderStatus.REFILL_REMINDER]: [],
};

export const TERMINAL_ORDER_STATUSES = new Set<OrderStatus>([
  OrderStatus.PRESCRIPTION_REJECTED,
  OrderStatus.ORDER_COMPLETED,
  OrderStatus.ORDER_CANCELLED,
]);
