import { z } from 'zod';

export const createPatientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().min(1, 'Mobile is required'),
  email: z.string().email('Invalid email address').optional(),
  isActive: z.boolean().optional(),
});
