import mongoose from 'mongoose';
import { ApiError } from './ApiError';
import { HTTP_STATUS } from '../config/constants';

export const handleMongooseError = (error: unknown): never => {
  if (error instanceof ApiError) {
    throw error;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(error.errors).map((e) => e.message);
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, messages.join(', '));
  }

  if (error instanceof mongoose.Error.CastError) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Invalid ${error.path}: ${error.value}`);
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: number }).code === 11000
  ) {
    const keyPattern = (error as { keyPattern?: Record<string, number> }).keyPattern;
    const field = keyPattern ? Object.keys(keyPattern)[0] : undefined;

    const messages: Record<string, string> = {
      email: 'This email is already registered. Please log in instead.',
      mobile: 'This mobile number is already registered.',
      whatsappPhoneNumberId: 'This WhatsApp number is already linked to another pharmacy.',
    };

    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      field && messages[field] ? messages[field] : 'Duplicate entry already exists',
    );
  }

  throw error;
};
