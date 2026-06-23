import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';
import {
  getOrder,
  getOrders,
  getOrderStats,
  getRecentOrderActivity,
  updateOrderStatus,
} from './order.controller';
import { getOrdersQuerySchema, updateOrderStatusSchema } from './order.validation';

const router = Router();

router.use(tenantMiddleware);

router.get('/stats', getOrderStats);
router.get('/activity', getRecentOrderActivity);
router.get('/', validate(getOrdersQuerySchema, 'query'), getOrders);
router.get('/:id', getOrder);
router.patch('/:id/status', validate(updateOrderStatusSchema), updateOrderStatus);

export default router;
