import { apiGet, apiPost } from './client';
import type { CreatePharmacyInput, Pharmacy } from '../types';

const API_PREFIX = '/api/v1';

export const createPharmacy = (data: CreatePharmacyInput) =>
  apiPost<Pharmacy>(`${API_PREFIX}/pharmacies`, data);

export const getPharmacy = (id: string) =>
  apiGet<Pharmacy>(`${API_PREFIX}/pharmacies/${id}`);
