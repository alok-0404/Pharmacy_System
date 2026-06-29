import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { HTTP_STATUS } from '../../config/constants';
import { conversationService } from './conversation.service';
import { ApiError } from '../../utils/ApiError';

export const createConversation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant ID is required');
  }

  const conversation = await conversationService.createConversation(req.tenantId, req.body);

  res.status(HTTP_STATUS.CREATED).json(
    ApiResponse.success('Conversation created successfully', conversation),
  );
});

export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant ID is required');
  }

  const conversations = await conversationService.getConversations(req.tenantId);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success('Conversations retrieved successfully', conversations),
  );
});

export const sendConversationPaymentDetails = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant ID is required');
  }

  await conversationService.sendPaymentDetails(
    req.tenantId,
    String(req.params.id),
    req.body,
  );

  res
    .status(HTTP_STATUS.OK)
    .json(ApiResponse.success('Payment link and QR sent successfully'));
});
