import { z } from 'zod';

export const createConversationSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  status: z.enum(['open', 'closed', 'pending']).optional(),
});

export const sendConversationPaymentDetailsSchema = z.object({
  paymentLinkUrl: z.string().url('Invalid payment link').or(z.literal('')).optional(),
  paymentQrImageUrl: z
    .string()
    .url('Invalid QR image URL')
    .or(z.string().startsWith('/'))
    .or(z.literal(''))
    .optional(),
  sendMode: z.enum(['link', 'qr', 'both']).optional(),
  paymentAmount: z.coerce.number().min(0).optional(),
});
