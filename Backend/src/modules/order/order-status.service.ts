import { ApiError } from '../../utils/ApiError';
import { HTTP_STATUS } from '../../config/constants';
import {
  ORDER_STATUS_TRANSITIONS,
  OrderStatus,
  PaymentStatus,
  DeliveryType,
} from '../../config/order.constants';
import { IOrder, Order } from './order.model';
import { IPatient, Patient } from '../patient/patient.model';
import { IPharmacy, Pharmacy } from '../pharmacy/pharmacy.model';
import { isValidObjectId } from '../../utils/objectId';
import { handleMongooseError } from '../../utils/mongooseError';
import {
  formatDate,
  getOrderStatusMessage,
  OrderNotificationContext,
} from '../notification/order-notification.service';
import { whatsappService } from '../whatsapp/whatsapp.service';
import { Message, MessageStatus, MessageType, SenderType } from '../message/message.model';
import { Conversation } from '../conversation/conversation.model';
import { logger } from '../../utils/logger';
import { paymentNotificationService } from '../notification/payment-notification.service';
import { env } from '../../config/env';
import {
  buildMetaTemplateBodyParams,
  getMetaTemplateName,
} from '../../config/whatsapp-templates.config';

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  rejectionReason?: string;
  paymentAmount?: number;
  paymentLinkUrl?: string;
  paymentQrImageUrl?: string;
  deliveryType?: DeliveryType;
  refillDueAt?: Date;
  note?: string;
}

export class OrderStatusService {
  assertTransitionAllowed(current: OrderStatus, next: OrderStatus): void {
    const allowed = ORDER_STATUS_TRANSITIONS[current] ?? [];

    if (!allowed.includes(next)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Cannot transition from "${current}" to "${next}"`,
      );
    }
  }

  private toDate(value: Date | string | undefined): Date | undefined {
    if (!value) {
      return undefined;
    }

    return value instanceof Date ? value : new Date(value);
  }

  private buildNotificationContext(
    order: IOrder,
    pharmacy: IPharmacy,
    patient: IPatient,
    input?: UpdateOrderStatusInput,
  ): OrderNotificationContext {
    const refillDueAt =
      this.toDate(input?.refillDueAt) ?? this.toDate(order.refillDueAt as Date | string | undefined);
    const daysRemaining = refillDueAt
      ? Math.max(
          0,
          Math.ceil((refillDueAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        )
      : undefined;

    return {
      pharmacyName: pharmacy.name,
      orderId: String(order._id),
      rejectionReason: input?.rejectionReason ?? order.rejectionReason,
      paymentAmount: input?.paymentAmount ?? order.paymentAmount,
      storeAddress: pharmacy.storeAddress,
      storeHours: pharmacy.storeHours,
      patientName: patient.name,
      paymentDate: formatDate(new Date()),
      lastOrderDate: order.createdAt ? formatDate(order.createdAt) : undefined,
      daysRemaining,
    };
  }

  async notifyPatient(
    order: IOrder,
    status: OrderStatus,
    input?: UpdateOrderStatusInput,
  ): Promise<void> {
    try {
      const pharmacy = await Pharmacy.findById(order.pharmacyId);

      if (!pharmacy) {
        return;
      }

      const patient = await Patient.findById(order.patientId);

      if (!patient) {
        return;
      }

      const context = this.buildNotificationContext(order, pharmacy, patient, input);
      const messageText = getOrderStatusMessage(status, context);
      const templateName = getMetaTemplateName(status);

      let sendResult;

      if (env.USE_META_TEMPLATES && templateName) {
        try {
          sendResult = await whatsappService.sendTemplateForPharmacy(
            String(order.pharmacyId),
            patient.mobile,
            templateName,
            buildMetaTemplateBodyParams(status, context),
          );
          logger.info('Order notification sent via Meta template', {
            orderId: order._id,
            status,
            templateName,
          });
        } catch (templateError) {
          logger.warn('Meta template failed, falling back to session text', {
            orderId: order._id,
            status,
            templateName,
            error: templateError,
          });
          sendResult = await whatsappService.sendMessageForPharmacy(
            String(order.pharmacyId),
            patient.mobile,
            messageText,
          );
        }
      } else {
        sendResult = await whatsappService.sendMessageForPharmacy(
          String(order.pharmacyId),
          patient.mobile,
          messageText,
        );
      }

      if (order.conversationId) {
        await Message.create({
          pharmacyId: order.pharmacyId,
          conversationId: order.conversationId,
          patientId: order.patientId,
          senderType: SenderType.BOT,
          content: messageText,
          messageType: MessageType.TEXT,
          whatsappMessageId: sendResult.messages?.[0]?.id,
          status: MessageStatus.SENT,
        });

        await Conversation.findByIdAndUpdate(order.conversationId, {
          lastMessageAt: new Date(),
        });
      }
    } catch (error) {
      logger.error('Failed to send order status WhatsApp notification', {
        orderId: order._id,
        status,
        error,
      });
    }
  }

  async sendRefillReminder(order: IOrder): Promise<void> {
    await this.notifyPatient(order, OrderStatus.REFILL_REMINDER);
    order.refillReminderSentAt = new Date();
    await order.save();
  }

  async applyStatusUpdate(
    order: IOrder,
    input: UpdateOrderStatusInput,
  ): Promise<IOrder> {
    if (order.status === input.status) {
      return order;
    }

    this.assertTransitionAllowed(order.status, input.status);

    const now = new Date();
    order.status = input.status;
    order.statusHistory.push({
      status: input.status,
      note: input.note,
      changedAt: now,
    });

    if (input.rejectionReason) {
      order.rejectionReason = input.rejectionReason;
    }

    if (input.paymentAmount !== undefined) {
      order.paymentAmount = input.paymentAmount;
    }

    if (input.paymentLinkUrl) {
      order.paymentLinkUrl = input.paymentLinkUrl;
    }

    if (input.paymentQrImageUrl) {
      order.paymentQrImageUrl = input.paymentQrImageUrl;
    }

    if (input.deliveryType) {
      order.deliveryType = input.deliveryType;
    }

    if (input.refillDueAt) {
      order.refillDueAt = this.toDate(input.refillDueAt) ?? order.refillDueAt;
    }

    if (input.status === OrderStatus.ORDER_COMPLETED && !order.refillDueAt) {
      order.refillDueAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    if (input.status === OrderStatus.PAYMENT_PENDING) {
      order.paymentStatus = PaymentStatus.PENDING;
    }

    if (input.status === OrderStatus.PAYMENT_CONFIRMED) {
      order.paymentStatus = PaymentStatus.CONFIRMED;
    }

    try {
      await order.save();
    } catch (error) {
      return handleMongooseError(error);
    }

    await this.notifyPatient(order, input.status, input);

    if (input.status === OrderStatus.PAYMENT_PENDING) {
      const pharmacy = await Pharmacy.findById(order.pharmacyId);
      const patient = await Patient.findById(order.patientId);

      if (pharmacy && patient) {
        await paymentNotificationService.sendPaymentDetails(order, pharmacy, patient, {
          paymentLinkUrl: input.paymentLinkUrl || pharmacy.paymentLinkUrl,
          paymentQrImageUrl: input.paymentQrImageUrl || pharmacy.paymentQrImageUrl,
        });
      }
    }

    return order;
  }

  async transitionOrder(
    pharmacyId: string,
    orderId: string,
    input: UpdateOrderStatusInput,
  ): Promise<IOrder> {
    if (!isValidObjectId(orderId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid order ID');
    }

    const order = await Order.findOne({ _id: orderId, pharmacyId });

    if (!order) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Order not found');
    }

    return this.applyStatusUpdate(order, input);
  }
}

export const orderStatusService = new OrderStatusService();
