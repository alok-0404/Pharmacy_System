import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type RequestPart = 'body' | 'query' | 'params';

export const validate =
  (schema: ZodSchema, part: RequestPart = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    req[part] = schema.parse(req[part]);
    next();
  };
