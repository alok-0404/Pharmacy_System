import { Router } from 'express';
import { createPharmacy, getPharmacy } from './pharmacy.controller';
import { validate } from '../../middlewares/validate.middleware';
import { createPharmacySchema, pharmacyIdParamsSchema } from './pharmacy.validation';

const router = Router();

router.post('/', validate(createPharmacySchema), createPharmacy);
router.get('/:id', validate(pharmacyIdParamsSchema, 'params'), getPharmacy);

export default router;
