import { z } from 'zod';

export const createPharmacySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(1, 'Mobile is required'),
  whatsappPhoneNumberId: z.string().min(1, 'WhatsApp phone number ID is required'),
  businessAccountId: z.string().min(1, 'Business account ID is required'),
  greetingImageUrl: z.string().url('Invalid greeting image URL').or(z.string().startsWith('/')).optional(),
  isActive: z.boolean().optional(),
});

export const pharmacyIdParamsSchema = z.object({
  id: z.string().min(1, 'Pharmacy ID is required'),
});

export const updatePaymentSettingsSchema = z.object({
  paymentLinkUrl: z.string().url('Invalid payment link URL').or(z.literal('')).optional(),
  paymentQrImageUrl: z
    .string()
    .url('Invalid QR image URL')
    .or(z.string().startsWith('/'))
    .or(z.literal(''))
    .optional(),
});

export const updateStoreSettingsSchema = z.object({
  storeAddress: z.string().trim().optional(),
  storeHours: z.string().trim().optional(),
  storeMapUrl: z.string().url('Invalid map URL').or(z.literal('')).optional(),
  greetingImageUrl: z
    .string()
    .url('Invalid greeting image URL')
    .or(z.string().startsWith('/'))
    .or(z.literal(''))
    .optional(),
});
