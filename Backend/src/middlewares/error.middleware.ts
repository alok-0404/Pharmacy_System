import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../config/constants';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: messages.join(', '),
    });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
    return;
  }

  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: number }).code === 11000
  ) {
    res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: 'Duplicate entry already exists',
    });
    return;
  }

  logger.error('Unhandled error', { error: err });

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message:
      env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
  });
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: 'Route not found',
  });
};
