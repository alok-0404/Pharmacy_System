export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface Pharmacy {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  whatsappPhoneNumberId: string;
  businessAccountId: string;
  greetingImageUrl?: string;
  isActive: boolean;
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
