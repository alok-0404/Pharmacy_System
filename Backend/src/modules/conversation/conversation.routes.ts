import { Router } from 'express';
import { createConversation, getConversations } from './conversation.controller';
import { validate } from '../../middlewares/validate.middleware';
import { createConversationSchema } from './conversation.validation';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';

const router = Router();

router.use(tenantMiddleware);

router.post('/', validate(createConversationSchema), createConversation);
router.get('/', getConversations);

export default router;
