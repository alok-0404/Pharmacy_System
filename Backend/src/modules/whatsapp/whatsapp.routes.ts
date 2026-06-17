import { Router } from 'express';
import { verifyWebhook, handleWebhook, sendMessage } from './whatsapp.controller';
import { validate } from '../../middlewares/validate.middleware';
import { sendMessageSchema } from './whatsapp.validation';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';

export const webhookRouter = Router();

webhookRouter.get('/', verifyWebhook);
webhookRouter.post('/', handleWebhook);

const router = Router();

router.post(
  '/send',
  tenantMiddleware,
  authMiddleware,
  validate(sendMessageSchema),
  sendMessage,
);

export default router;
