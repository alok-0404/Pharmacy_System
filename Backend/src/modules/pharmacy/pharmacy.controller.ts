import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { HTTP_STATUS } from '../../config/constants';
import { pharmacyService } from './pharmacy.service';

export const createPharmacy = asyncHandler(async (req: Request, res: Response) => {
  const pharmacy = await pharmacyService.createPharmacy(req.body);

  res.status(HTTP_STATUS.CREATED).json(
    ApiResponse.success('Pharmacy created successfully', pharmacy),
  );
});

export const getPharmacy = asyncHandler(async (req: Request, res: Response) => {
  const pharmacy = await pharmacyService.getPharmacyById(String(req.params.id));

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success('Pharmacy retrieved successfully', pharmacy),
  );
});
