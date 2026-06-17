import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  API_PREFIX: z.string().default('/api/v1'),
  ACTIVE_BOT: z.enum(['LEAD', 'HEALTHCARE', 'PHARMACY']).default('PHARMACY'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  META_ACCESS_TOKEN: z.string().min(1, 'META_ACCESS_TOKEN is required'),
  META_VERIFY_TOKEN: z.string().min(1, 'META_VERIFY_TOKEN is required'),
  META_API_VERSION: z.string().default('v21.0'),
  APP_PUBLIC_URL: z.string().url().default('http://localhost:5000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
