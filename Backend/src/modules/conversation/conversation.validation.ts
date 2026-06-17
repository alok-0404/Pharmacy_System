import { z } from 'zod';

export const createConversationSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  status: z.enum(['open', 'closed', 'pending']).optional(),
});
