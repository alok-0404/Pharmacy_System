import { z } from 'zod';

export const dashboardAnalyticsQuerySchema = z.object({
  range: z.enum(['7d', '30d', '90d', 'year']).default('30d'),
});
