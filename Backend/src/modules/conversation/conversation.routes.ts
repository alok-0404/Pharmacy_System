import { Router } from 'express';
import {
  createConversation,
  getConversations,
  sendConversationPaymentDetails,
} from './conversation.controller';
import { validate } from '../../middlewares/validate.middleware';
import {
  createConversationSchema,
  sendConversationPaymentDetailsSchema,
} from './conversation.validation';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';

const router = Router();

router.use(tenantMiddleware);

router.post('/', validate(createConversationSchema), createConversation);
router.get('/', getConversations);
router.post(
  '/:id/send-payment',
  validate(sendConversationPaymentDetailsSchema),
  sendConversationPaymentDetails,
);

export default router;
