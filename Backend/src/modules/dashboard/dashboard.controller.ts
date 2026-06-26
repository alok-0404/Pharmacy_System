import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { HTTP_STATUS } from '../../config/constants';
import { ApiError } from '../../utils/ApiError';
import { dashboardService } from './dashboard.service';
import type { DashboardRange } from './dashboard.utils';

export const getDashboardAnalytics = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant ID is required');
  }

  const range = (req.query.range as DashboardRange | undefined) ?? '30d';
  const analytics = await dashboardService.getAnalytics(req.tenantId, range);

  res
    .status(HTTP_STATUS.OK)
    .json(ApiResponse.success('Dashboard analytics retrieved successfully', analytics));
});
