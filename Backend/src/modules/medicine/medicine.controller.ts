import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { HTTP_STATUS } from '../../config/constants';
import { ApiError } from '../../utils/ApiError';
import { medicineService } from './medicine.service';

export const getMedicines = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant ID is required');
  }

  const medicines = await medicineService.getMedicines(req.tenantId);

  res
    .status(HTTP_STATUS.OK)
    .json(ApiResponse.success('Medicines retrieved successfully', medicines));
});

export const createMedicine = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant ID is required');
  }

  const medicine = await medicineService.createMedicine(req.tenantId, req.body);

  res
    .status(HTTP_STATUS.CREATED)
    .json(ApiResponse.success('Medicine created successfully', medicine));
});

export const updateMedicine = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant ID is required');
  }

  const medicine = await medicineService.updateMedicine(
    req.tenantId,
    String(req.params.id),
    req.body,
  );

  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Medicine updated successfully', medicine));
});

export const deleteMedicine = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant ID is required');
  }

  await medicineService.deleteMedicine(req.tenantId, String(req.params.id));

  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Medicine deleted successfully'));
});
