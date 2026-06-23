import cron from 'node-cron';
import { OrderStatus } from '../config/order.constants';
import { Order } from '../modules/order/order.model';
import { orderStatusService } from '../modules/order/order-status.service';
import { logger } from '../utils/logger';

/** Runs daily at 9:00 AM — sends refill reminders for due orders. */
export function startRefillReminderJob(): void {
  cron.schedule('0 9 * * *', async () => {
    logger.info('Running refill reminder job');

    const now = new Date();

    try {
      const dueOrders = await Order.find({
        status: OrderStatus.ORDER_COMPLETED,
        refillDueAt: { $lte: now },
        $or: [{ refillReminderSentAt: { $exists: false } }, { refillReminderSentAt: null }],
      }).limit(100);

      for (const order of dueOrders) {
        try {
          await orderStatusService.sendRefillReminder(order);
        } catch (error) {
          logger.error('Refill reminder failed for order', { orderId: order._id, error });
        }
      }

      logger.info('Refill reminder job completed', { processed: dueOrders.length });
    } catch (error) {
      logger.error('Refill reminder job failed', { error });
    }
  });

  logger.info('Refill reminder cron job scheduled (daily 9:00 AM)');
}
