import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { HTTP_STATUS } from '../../config/constants';
import { ApiError } from '../../utils/ApiError';
import { orderService } from './order.service';
import { OrderStatus } from '../../config/order.constants';

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant ID is required');
  }

  const status = req.query.status as OrderStatus | undefined;
  const orders = await orderService.getOrders(req.tenantId, status);

  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Orders retrieved successfully', orders));
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant ID is required');
  }

  const order = await orderService.getOrderById(req.tenantId, String(req.params.id));

  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Order retrieved successfully', order));
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant ID is required');
  }

  const order = await orderService.updateOrderStatus(req.tenantId, String(req.params.id), req.body);

  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Order status updated successfully', order));
});

export const getOrderStats = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant ID is required');
  }

  const stats = await orderService.getOrderStats(req.tenantId);

  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Order stats retrieved successfully', stats));
});

export const getRecentOrderActivity = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant ID is required');
  }

  const activity = await orderService.getRecentActivity(req.tenantId);

  res
    .status(HTTP_STATUS.OK)
    .json(ApiResponse.success('Recent order activity retrieved successfully', activity));
});
