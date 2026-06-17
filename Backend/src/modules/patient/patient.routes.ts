import { Router } from 'express';
import { createPatient, getPatients } from './patient.controller';
import { validate } from '../../middlewares/validate.middleware';
import { createPatientSchema } from './patient.validation';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';

const router = Router();

router.use(tenantMiddleware);

router.post('/', validate(createPatientSchema), createPatient);
router.get('/', getPatients);

export default router;
