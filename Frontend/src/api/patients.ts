import { apiGet, apiPost } from './client';
import type { CreatePatientInput, Patient } from '../types';

const API_PREFIX = '/api/v1';

export const getPatients = (pharmacyId: string) =>
  apiGet<Patient[]>(`${API_PREFIX}/patients`, pharmacyId);

export const createPatient = (pharmacyId: string, data: CreatePatientInput) =>
  apiPost<Patient>(`${API_PREFIX}/patients`, data, pharmacyId);
