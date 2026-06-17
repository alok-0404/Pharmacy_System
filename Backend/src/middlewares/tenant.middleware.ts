import { Request, Response, NextFunction } from 'express';
import { TENANT_HEADER } from '../config/constants';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../config/constants';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

export const tenantMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const tenantId = req.headers[TENANT_HEADER] as string | undefined;

  if (!tenantId) {
    next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant ID is required'));
    return;
  }

  req.tenantId = tenantId;
  next();
};
