import { apiDelete, apiGet, apiPatch, apiPost } from './client';
import type { CreateFaqInput, Faq } from '../types';

const API_PREFIX = '/api/v1';

export const getFaqs = (pharmacyId: string) =>
  apiGet<Faq[]>(`${API_PREFIX}/faqs`, pharmacyId);

export const createFaq = (pharmacyId: string, data: CreateFaqInput) =>
  apiPost<Faq>(`${API_PREFIX}/faqs`, data, pharmacyId);

export const updateFaq = (pharmacyId: string, faqId: string, data: Partial<CreateFaqInput>) =>
  apiPatch<Faq>(`${API_PREFIX}/faqs/${faqId}`, data, pharmacyId);

export const deleteFaq = (pharmacyId: string, faqId: string) =>
  apiDelete(`${API_PREFIX}/faqs/${faqId}`, pharmacyId);
