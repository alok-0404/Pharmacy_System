import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { HTTP_STATUS } from '../../config/constants';
import { messageService } from './message.service';
import { ApiError } from '../../utils/ApiError';

export const createMessage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant ID is required');
  }

  const message = await messageService.createMessage(req.tenantId, req.body);

  res.status(HTTP_STATUS.CREATED).json(
    ApiResponse.success('Message created successfully', message),
  );
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant ID is required');
  }

  const { conversationId } = req.query as { conversationId?: string };
  const messages = await messageService.getMessages(req.tenantId, conversationId);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success('Messages retrieved successfully', messages),
  );
});
