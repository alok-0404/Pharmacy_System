import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { HTTP_STATUS } from '../../config/constants';
import { ApiError } from '../../utils/ApiError';
import { faqService } from './faq.service';

export const getFaqs = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant ID is required');
  }

  const faqs = await faqService.getFaqs(req.tenantId);

  res.status(HTTP_STATUS.OK).json(ApiResponse.success('FAQs retrieved successfully', faqs));
});

export const createFaq = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant ID is required');
  }

  const faq = await faqService.createFaq(req.tenantId, req.body);

  res.status(HTTP_STATUS.CREATED).json(ApiResponse.success('FAQ created successfully', faq));
});

export const updateFaq = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant ID is required');
  }

  const faq = await faqService.updateFaq(req.tenantId, String(req.params.id), req.body);

  res.status(HTTP_STATUS.OK).json(ApiResponse.success('FAQ updated successfully', faq));
});

export const deleteFaq = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant ID is required');
  }

  await faqService.deleteFaq(req.tenantId, String(req.params.id));

  res.status(HTTP_STATUS.OK).json(ApiResponse.success('FAQ deleted successfully'));
});
