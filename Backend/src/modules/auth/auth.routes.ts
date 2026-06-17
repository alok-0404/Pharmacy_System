import { Router } from 'express';
import { login, pharmacyRegister } from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { loginSchema, pharmacyRegisterSchema } from './auth.validation';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/pharmacy-register', validate(pharmacyRegisterSchema), pharmacyRegister);

export default router;
