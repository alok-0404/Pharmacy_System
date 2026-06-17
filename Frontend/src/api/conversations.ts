import { apiGet, apiPost } from './client';
import type { Conversation } from '../types';

const API_PREFIX = '/api/v1';

export const getConversations = (pharmacyId: string) =>
  apiGet<Conversation[]>(`${API_PREFIX}/conversations`, pharmacyId);

export const createConversation = (pharmacyId: string, patientId: string) =>
  apiPost<Conversation>(
    `${API_PREFIX}/conversations`,
    { patientId },
    pharmacyId,
  );
