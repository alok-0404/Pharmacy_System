import { Router } from 'express';
import { createPharmacy, getPharmacy, updatePaymentSettings, updateStoreSettings } from './pharmacy.controller';
import { validate } from '../../middlewares/validate.middleware';
import {
  createPharmacySchema,
  pharmacyIdParamsSchema,
  updatePaymentSettingsSchema,
  updateStoreSettingsSchema,
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

router.patch(
  '/:id/store-settings',
  tenantMiddleware,
  validate(pharmacyIdParamsSchema, 'params'),
  validate(updateStoreSettingsSchema),
  updateStoreSettings,
);

export default router;
