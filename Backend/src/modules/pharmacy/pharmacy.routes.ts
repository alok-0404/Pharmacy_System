import { Router } from 'express';
import { createPharmacy, getPharmacy, updatePaymentSettings } from './pharmacy.controller';
import { validate } from '../../middlewares/validate.middleware';
import {
  createPharmacySchema,
  pharmacyIdParamsSchema,
  updatePaymentSettingsSchema,
} from './pharmacy.validation';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';

const router = Router();

router.post('/', validate(createPharmacySchema), createPharmacy);
router.get('/:id', validate(pharmacyIdParamsSchema, 'params'), getPharmacy);
router.patch(
  '/:id/payment-settings',
  tenantMiddleware,
  validate(pharmacyIdParamsSchema, 'params'),
  validate(updatePaymentSettingsSchema),
  updatePaymentSettings,
);

export default router;
