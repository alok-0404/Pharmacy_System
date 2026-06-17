import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { HTTP_STATUS } from '../../config/constants';
import { patientService } from './patient.service';
import { ApiError } from '../../utils/ApiError';

export const createPatient = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant ID is required');
  }

  const patient = await patientService.createPatient(req.tenantId, req.body);

  res.status(HTTP_STATUS.CREATED).json(
    ApiResponse.success('Patient created successfully', patient),
  );
});

export const getPatients = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant ID is required');
  }

  const patients = await patientService.getPatients(req.tenantId);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success('Patients retrieved successfully', patients),
  );
});
