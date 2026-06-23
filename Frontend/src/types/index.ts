export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface WhatsappIntegrationStatus {
  connected: boolean;
  serverTokenConfigured: boolean;
  pharmacyNumberConfigured: boolean;
}

export interface Pharmacy {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  whatsappPhoneNumberId: string;
  businessAccountId: string;
  greetingImageUrl?: string;
  paymentLinkUrl?: string;
  paymentQrImageUrl?: string;
  isActive: boolean;
  whatsappIntegration?: WhatsappIntegrationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Patient {
  _id: string;
  pharmacyId: string;
  name: string;
  mobile: string;
  email?: string;
  lastInteractionAt?: string;
  isActive: boolean;
}

export interface PopulatedPatient {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
}

export type ConversationStatus = 'open' | 'closed' | 'pending';

export interface Conversation {
  _id: string;
  pharmacyId: string;
  patientId: PopulatedPatient | string;
  status: ConversationStatus;
  lastMessageAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SenderType = 'patient' | 'pharmacist' | 'bot';
export type MessageType = 'text' | 'image' | 'document';

export interface Message {
  _id: string;
  pharmacyId: string;
  conversationId: string;
  patientId: string;
  senderType: SenderType;
  content: string;
  messageType: MessageType;
  whatsappMessageId?: string;
  status: string;
  createdAt?: string;
}

export interface CreatePharmacyInput {
  name: string;
  email: string;
  mobile: string;
  whatsappPhoneNumberId: string;
  businessAccountId: string;
  greetingImageUrl?: string;
}

export interface CreatePatientInput {
  name: string;
  mobile: string;
  email?: string;
}

export interface CreateMessageInput {
  conversationId: string;
  senderType: SenderType;
  content: string;
  messageType?: MessageType;
}

export type OrderStatus =
  | 'prescription_received'
  | 'order_verified'
  | 'prescription_rejected'
  | 'order_accepted'
  | 'payment_pending'
  | 'payment_confirmed'
  | 'order_processing'
  | 'order_ready_pickup'
  | 'order_ready_delivery'
  | 'out_for_delivery'
  | 'order_completed'
  | 'order_cancelled'
  | 'refill_reminder';

export interface OrderStatusHistory {
  status: OrderStatus;
  note?: string;
  changedAt: string;
}

export interface Prescription {
  _id: string;
  fileUrl: string;
  mimeType?: string;
  fileName?: string;
}

export interface Order {
  _id: string;
  pharmacyId: string;
  patientId: PopulatedPatient | string;
  conversationId?: string;
  prescriptionId?: Prescription | string;
  status: OrderStatus;
  rejectionReason?: string;
  paymentAmount?: number;
  paymentLinkUrl?: string;
  paymentQrImageUrl?: string;
  paymentDetailsSentAt?: string;
  paymentStatus?: string;
  deliveryType?: 'pickup' | 'delivery';
  refillDueAt?: string;
  statusHistory: OrderStatusHistory[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderStats {
  totalOrders: number;
  pendingPrescriptions: number;
  activeDeliveries: number;
  completedOrders: number;
  revenue: number;
}

export interface OrderActivity {
  orderId: string;
  status: OrderStatus;
  patientName?: string;
  updatedAt?: string;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  rejectionReason?: string;
  paymentAmount?: number;
  paymentLinkUrl?: string;
  paymentQrImageUrl?: string;
  deliveryType?: 'pickup' | 'delivery';
  refillDueAt?: string;
  note?: string;
}

export interface PaymentSettingsInput {
  paymentLinkUrl?: string;
  paymentQrImageUrl?: string;
}

export interface SendPaymentDetailsInput {
  paymentLinkUrl?: string;
  paymentQrImageUrl?: string;
}
