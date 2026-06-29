import { apiGet, apiPost } from './client';
import type { Conversation, SendPaymentDetailsInput } from '../types';

const API_PREFIX = '/api/v1';

export const getConversations = (pharmacyId: string) =>
  apiGet<Conversation[]>(`${API_PREFIX}/conversations`, pharmacyId);

export const createConversation = (pharmacyId: string, patientId: string) =>
  apiPost<Conversation>(
    `${API_PREFIX}/conversations`,
    { patientId },
    pharmacyId,
  );

export const sendConversationPaymentDetails = (
  pharmacyId: string,
  conversationId: string,
  data?: SendPaymentDetailsInput,
) =>
  apiPost<void>(
    `${API_PREFIX}/conversations/${conversationId}/send-payment`,
    data ?? {},
    pharmacyId,
  );
