import { z } from 'zod';

export const createMedicineSchema = z.object({
  name: z.string().trim().min(1, 'Medicine name is required'),
  unit: z.string().trim().min(1).optional(),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  stockQuantity: z.coerce.number().int().min(0, 'Stock must be 0 or greater'),
  isActive: z.boolean().optional(),
});

export const updateMedicineSchema = createMedicineSchema.partial();
