import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { HTTP_STATUS } from '../../config/constants';
import { authService } from './auth.service';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);

  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Login successful', result));
});

export const pharmacyRegister = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerPharmacy(req.body);

  res.status(HTTP_STATUS.CREATED).json(
    ApiResponse.success('Pharmacy registered successfully', result),
  );
});
