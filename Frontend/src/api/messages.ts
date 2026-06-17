import { apiGet, apiPost } from './client';
import type { CreateMessageInput, Message } from '../types';

const API_PREFIX = '/api/v1';

export const getMessages = (pharmacyId: string, conversationId: string) =>
  apiGet<Message[]>(
    `${API_PREFIX}/messages?conversationId=${encodeURIComponent(conversationId)}`,
    pharmacyId,
  );

export const createMessage = (pharmacyId: string, data: CreateMessageInput) =>
  apiPost<Message>(`${API_PREFIX}/messages`, data, pharmacyId);
