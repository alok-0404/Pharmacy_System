import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const pharmacyRegisterSchema = z.object({
  pharmacyName: z.string().min(1, 'Pharmacy name is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(1, 'Mobile is required'),
  city: z.string().min(1, 'City is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
