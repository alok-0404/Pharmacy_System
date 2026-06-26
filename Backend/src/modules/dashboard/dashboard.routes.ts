import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';
import { getDashboardAnalytics } from './dashboard.controller';
import { dashboardAnalyticsQuerySchema } from './dashboard.validation';

const router = Router();

router.use(tenantMiddleware);

router.get('/analytics', validate(dashboardAnalyticsQuerySchema, 'query'), getDashboardAnalytics);

export default router;
