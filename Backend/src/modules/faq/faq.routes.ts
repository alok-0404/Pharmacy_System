import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';
import { createFaq, deleteFaq, getFaqs, updateFaq } from './faq.controller';
import { createFaqSchema, updateFaqSchema } from './faq.validation';

const router = Router();

router.use(tenantMiddleware);

router.get('/', getFaqs);
router.post('/', validate(createFaqSchema), createFaq);
router.patch('/:id', validate(updateFaqSchema), updateFaq);
router.delete('/:id', deleteFaq);

export default router;
