import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';
import { createMedicine, deleteMedicine, getMedicines, updateMedicine } from './medicine.controller';
import { createMedicineSchema, updateMedicineSchema } from './medicine.validation';

const router = Router();

router.use(tenantMiddleware);

router.get('/', getMedicines);
router.post('/', validate(createMedicineSchema), createMedicine);
router.patch('/:id', validate(updateMedicineSchema), updateMedicine);
router.delete('/:id', deleteMedicine);

export default router;
