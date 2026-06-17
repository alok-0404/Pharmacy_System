import { z } from 'zod';

export const sendMessageSchema = z.object({
  to: z.string().min(1, 'Recipient number is required'),
  message: z.string().min(1, 'Message is required'),
});
