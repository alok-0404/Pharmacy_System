import { apiPost } from './client';

const API_PREFIX = '/api/v1';

export interface AuthResult {
  pharmacyId: string;
  pharmacyName: string;
  ownerName: string;
  email: string;
}

export interface PharmacyRegisterInput {
  pharmacyName: string;
  ownerName: string;
  email: string;
  mobile: string;
  city: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const registerPharmacy = (data: PharmacyRegisterInput) =>
  apiPost<AuthResult>(`${API_PREFIX}/auth/pharmacy-register`, data);

export const loginPharmacy = (data: LoginInput) =>
  apiPost<AuthResult>(`${API_PREFIX}/auth/login`, data);
