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
