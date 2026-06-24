import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { HTTP_STATUS } from '../../config/constants';
import { ApiError } from '../../utils/ApiError';
import { pharmacyService } from './pharmacy.service';
import { getWhatsappIntegrationStatus } from '../../utils/whatsappIntegration';

export const createPharmacy = asyncHandler(async (req: Request, res: Response) => {
  const pharmacy = await pharmacyService.createPharmacy(req.body);

  res.status(HTTP_STATUS.CREATED).json(
    ApiResponse.success('Pharmacy created successfully', pharmacy),
  );
});

export const getPharmacy = asyncHandler(async (req: Request, res: Response) => {
  const pharmacy = await pharmacyService.getPharmacyById(String(req.params.id));

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success('Pharmacy retrieved successfully', {
      ...pharmacy.toJSON(),
      whatsappIntegration: getWhatsappIntegrationStatus(pharmacy),
    }),
  );
});

export const updatePaymentSettings = asyncHandler(async (req: Request, res: Response) => {
  const pharmacyId = String(req.params.id);

  if (!req.tenantId || req.tenantId !== pharmacyId) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You can only update your own pharmacy settings');
  }

  const pharmacy = await pharmacyService.updatePaymentSettings(pharmacyId, req.body);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success('Payment settings updated successfully', {
      ...pharmacy.toJSON(),
      whatsappIntegration: getWhatsappIntegrationStatus(pharmacy),
    }),
  );
});

export const updateStoreSettings = asyncHandler(async (req: Request, res: Response) => {
  const pharmacyId = String(req.params.id);

  if (!req.tenantId || req.tenantId !== pharmacyId) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You can only update your own pharmacy settings');
  }

  const pharmacy = await pharmacyService.updateStoreSettings(pharmacyId, req.body);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success('Store settings updated successfully', {
      ...pharmacy.toJSON(),
      whatsappIntegration: getWhatsappIntegrationStatus(pharmacy),
    }),
  );
});

export const uploadPharmacyAsset = asyncHandler(async (req: Request, res: Response) => {
  const pharmacyId = String(req.params.id);

  if (!req.tenantId || req.tenantId !== pharmacyId) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You can only update your own pharmacy settings');
  }

  const pharmacy = await pharmacyService.uploadAsset(pharmacyId, req.body);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success('Image uploaded successfully', {
      ...pharmacy.toJSON(),
      whatsappIntegration: getWhatsappIntegrationStatus(pharmacy),
    }),
  );
});
