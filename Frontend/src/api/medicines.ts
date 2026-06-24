import { apiDelete, apiGet, apiPatch, apiPost } from './client';
import type { CreateMedicineInput, Medicine } from '../types';

const API_PREFIX = '/api/v1';

export const getMedicines = (pharmacyId: string) =>
  apiGet<Medicine[]>(`${API_PREFIX}/medicines`, pharmacyId);

export const createMedicine = (pharmacyId: string, data: CreateMedicineInput) =>
  apiPost<Medicine>(`${API_PREFIX}/medicines`, data, pharmacyId);

export const updateMedicine = (
  pharmacyId: string,
  medicineId: string,
  data: Partial<CreateMedicineInput>,
) => apiPatch<Medicine>(`${API_PREFIX}/medicines/${medicineId}`, data, pharmacyId);

export const deleteMedicine = (pharmacyId: string, medicineId: string) =>
  apiDelete(`${API_PREFIX}/medicines/${medicineId}`, pharmacyId);
