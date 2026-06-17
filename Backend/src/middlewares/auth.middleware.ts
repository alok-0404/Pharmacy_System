import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authMiddleware = (
  _req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  // TODO: Implement JWT authentication
  next();
};
