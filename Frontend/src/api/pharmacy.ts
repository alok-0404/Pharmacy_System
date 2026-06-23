import { apiGet, apiPatch, apiPost } from './client';
import type { CreatePharmacyInput, PaymentSettingsInput, Pharmacy, StoreSettingsInput } from '../types';

const API_PREFIX = '/api/v1';

export const createPharmacy = (data: CreatePharmacyInput) =>
  apiPost<Pharmacy>(`${API_PREFIX}/pharmacies`, data);

export const getPharmacy = (id: string) =>
  apiGet<Pharmacy>(`${API_PREFIX}/pharmacies/${id}`);

export const updatePaymentSettings = (pharmacyId: string, data: PaymentSettingsInput) =>
  apiPatch<Pharmacy>(`${API_PREFIX}/pharmacies/${pharmacyId}/payment-settings`, data, pharmacyId);

export const updateStoreSettings = (pharmacyId: string, data: StoreSettingsInput) =>
  apiPatch<Pharmacy>(`${API_PREFIX}/pharmacies/${pharmacyId}/store-settings`, data, pharmacyId);
