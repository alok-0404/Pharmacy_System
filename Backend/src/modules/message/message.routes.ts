import { Router } from 'express';
import { createMessage, getMessages } from './message.controller';
import { validate } from '../../middlewares/validate.middleware';
import { createMessageSchema, getMessagesQuerySchema } from './message.validation';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';

const router = Router();

router.use(tenantMiddleware);

router.post('/', validate(createMessageSchema), createMessage);
router.get('/', validate(getMessagesQuerySchema, 'query'), getMessages);

export default router;
