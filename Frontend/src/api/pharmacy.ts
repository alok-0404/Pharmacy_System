import { apiGet, apiPatch, apiPost } from './client';
import type { CreatePharmacyInput, PaymentSettingsInput, Pharmacy, StoreSettingsInput } from '../types';

const API_PREFIX = '/api/v1';

export type PharmacyAssetType = 'payment_qr' | 'greeting_image';

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export const createPharmacy = (data: CreatePharmacyInput) =>
  apiPost<Pharmacy>(`${API_PREFIX}/pharmacies`, data);

export const getPharmacy = (id: string) =>
  apiGet<Pharmacy>(`${API_PREFIX}/pharmacies/${id}`);

export const updatePaymentSettings = (pharmacyId: string, data: PaymentSettingsInput) =>
  apiPatch<Pharmacy>(`${API_PREFIX}/pharmacies/${pharmacyId}/payment-settings`, data, pharmacyId);

export const updateStoreSettings = (pharmacyId: string, data: StoreSettingsInput) =>
  apiPatch<Pharmacy>(`${API_PREFIX}/pharmacies/${pharmacyId}/store-settings`, data, pharmacyId);

export const uploadPharmacyAsset = async (
  pharmacyId: string,
  type: PharmacyAssetType,
  file: File,
) => {
  const fileData = await readFileAsDataUrl(file);

  return apiPost<Pharmacy>(
    `${API_PREFIX}/pharmacies/${pharmacyId}/upload-asset`,
    {
      type,
      mimeType: file.type,
      file: fileData,
    },
    pharmacyId,
  );
};
