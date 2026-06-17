import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { HTTP_STATUS } from '../../config/constants';
import { logger } from '../../utils/logger';
import { whatsappService } from './whatsapp.service';
import { MetaWebhookPayload } from './whatsapp.types';
import { ApiError } from '../../utils/ApiError';
import { botRouterService } from './bot-router.service';

export const verifyWebhook = asyncHandler(async (req: Request, res: Response) => {
  const mode = String(req.query['hub.mode'] ?? '');
  const token = String(req.query['hub.verify_token'] ?? '');
  const challenge = String(req.query['hub.challenge'] ?? '');

  const result = whatsappService.verifyWebhook(mode, token, challenge);

  res.status(HTTP_STATUS.OK).send(result);
});

export const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body as MetaWebhookPayload;

  if (payload.object !== 'whatsapp_business_account') {
    res.sendStatus(HTTP_STATUS.NOT_FOUND);
    return;
  }

  botRouterService.routeIncomingWebhook(payload).catch((error) => {
    logger.error('Unhandled error processing WhatsApp webhook', { error });
  });

  res.sendStatus(HTTP_STATUS.OK);
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant ID is required');
  }

  const { to, message } = req.body as { to: string; message: string };

  const result = await whatsappService.sendMessageForPharmacy(req.tenantId, to, message);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success('WhatsApp message sent successfully', result),
  );
});
