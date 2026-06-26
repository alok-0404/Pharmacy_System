import { ApiError } from '../../utils/ApiError';
import { HTTP_STATUS } from '../../config/constants';
import { OrderStatus, PaymentStatus } from '../../config/order.constants';
import { IOrder, Order } from './order.model';
import { Prescription, IPrescription } from '../prescription/prescription.model';
import { Patient } from '../patient/patient.model';
import { isValidObjectId } from '../../utils/objectId';
import { handleMongooseError } from '../../utils/mongooseError';
import { orderStatusService, UpdateOrderStatusInput } from './order-status.service';
import { paymentNotificationService } from '../notification/payment-notification.service';
import { Pharmacy } from '../pharmacy/pharmacy.model';
import { Types } from 'mongoose';

export interface SendPaymentDetailsInput {
  paymentLinkUrl?: string;
  paymentQrImageUrl?: string;
  sendMode?: 'link' | 'qr' | 'both';
  paymentAmount?: number;
}

export interface CreateOrderFromPrescriptionInput {
  pharmacyId: string;
  patientId: string;
  conversationId: string;
  messageId: string;
  fileUrl: string;
  metaMediaId?: string;
  mimeType?: string;
  fileName?: string;
}

export class OrderService {
  async createFromPrescription(
    data: CreateOrderFromPrescriptionInput,
  ): Promise<{ order: IOrder; prescription: IPrescription }> {
    if (!isValidObjectId(data.pharmacyId) || !isValidObjectId(data.patientId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid pharmacy or patient ID');
    }

    const patient = await Patient.findOne({
      _id: data.patientId,
      pharmacyId: data.pharmacyId,
    });

    if (!patient) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Patient not found');
    }

    try {
      const prescription = await Prescription.create({
        pharmacyId: data.pharmacyId,
        patientId: data.patientId,
        conversationId: data.conversationId,
        messageId: data.messageId,
        fileUrl: data.fileUrl,
        metaMediaId: data.metaMediaId,
        mimeType: data.mimeType,
        fileName: data.fileName,
      });

      const order = await Order.create({
        pharmacyId: data.pharmacyId,
        patientId: data.patientId,
        conversationId: data.conversationId,
        prescriptionId: prescription._id,
        status: OrderStatus.PRESCRIPTION_RECEIVED,
        statusHistory: [
          {
            status: OrderStatus.PRESCRIPTION_RECEIVED,
            changedAt: new Date(),
            note: 'Prescription uploaded via WhatsApp',
          },
        ],
      });

      await Prescription.findByIdAndUpdate(prescription._id, { orderId: order._id });

      await orderStatusService.notifyPatient(order, OrderStatus.PRESCRIPTION_RECEIVED);

      return { order, prescription };
    } catch (error) {
      return handleMongooseError(error);
    }
  }

  async getLatestOrderForPatient(pharmacyId: string, patientId: string): Promise<IOrder | null> {
    if (!isValidObjectId(pharmacyId) || !isValidObjectId(patientId)) {
      return null;
    }

    return Order.findOne({ pharmacyId, patientId }).sort({ createdAt: -1 });
  }

  async createRepeatOrder(pharmacyId: string, patientId: string): Promise<IOrder | null> {
    if (!isValidObjectId(pharmacyId) || !isValidObjectId(patientId)) {
      return null;
    }

    const previousOrder = await Order.findOne({
      pharmacyId,
      patientId,
      prescriptionId: { $exists: true, $ne: null },
    }).sort({ createdAt: -1 });

    if (!previousOrder?.prescriptionId) {
      return null;
    }

    try {
      const order = await Order.create({
        pharmacyId,
        patientId,
        conversationId: previousOrder.conversationId,
        prescriptionId: previousOrder.prescriptionId,
        status: OrderStatus.PRESCRIPTION_RECEIVED,
        statusHistory: [
          {
            status: OrderStatus.PRESCRIPTION_RECEIVED,
            changedAt: new Date(),
            note: 'Repeat order requested via WhatsApp',
          },
        ],
      });

      await orderStatusService.notifyPatient(order, OrderStatus.PRESCRIPTION_RECEIVED);

      return order;
    } catch (error) {
      return handleMongooseError(error);
    }
  }

  async getOrders(pharmacyId: string, status?: OrderStatus): Promise<IOrder[]> {
    if (!isValidObjectId(pharmacyId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid pharmacy ID');
    }

    const filter: Record<string, unknown> = { pharmacyId };

    if (status) {
      filter.status = status;
    }

    return Order.find(filter)
      .populate('patientId', 'name mobile email')
      .populate('prescriptionId', 'fileUrl mimeType fileName')
      .sort({ createdAt: -1 });
  }

  async getOrderById(pharmacyId: string, orderId: string): Promise<IOrder> {
    if (!isValidObjectId(orderId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid order ID');
    }

    const order = await Order.findOne({ _id: orderId, pharmacyId })
      .populate('patientId', 'name mobile email')
      .populate('prescriptionId', 'fileUrl mimeType fileName');

    if (!order) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Order not found');
    }

    return order;
  }

  async updateOrderStatus(
    pharmacyId: string,
    orderId: string,
    input: UpdateOrderStatusInput,
  ): Promise<IOrder> {
    return orderStatusService.transitionOrder(pharmacyId, orderId, input);
  }

  async sendOrderPaymentDetails(
    pharmacyId: string,
    orderId: string,
    input?: SendPaymentDetailsInput,
  ): Promise<IOrder> {
    const order = await this.getOrderById(pharmacyId, orderId);

    if (
      order.status !== OrderStatus.PAYMENT_PENDING &&
      order.status !== OrderStatus.ORDER_ACCEPTED
    ) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Payment can only be sent for accepted or payment-pending orders',
      );
    }

    const pharmacy = await Pharmacy.findById(pharmacyId);
    const patient = await Patient.findOne({ _id: order.patientId, pharmacyId });

    if (!pharmacy || !patient) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Pharmacy or patient not found');
    }

    if (input?.paymentAmount !== undefined) {
      order.paymentAmount = input.paymentAmount;
      await order.save();
    }

    const paymentLink = paymentNotificationService.resolvePaymentLink(order, pharmacy, input);
    const paymentQr = paymentNotificationService.resolveQrImageUrl(order, pharmacy, input);

    if (!paymentLink && !paymentQr) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Payment link or QR code is required. Add it in Settings or enter details for this order.',
      );
    }

    return paymentNotificationService.sendPaymentDetails(order, pharmacy, patient, input);
  }

  async getOrderStats(pharmacyId: string) {
    if (!isValidObjectId(pharmacyId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid pharmacy ID');
    }

    const pharmacyObjectId = new Types.ObjectId(pharmacyId);

    const [totalOrders, pendingPrescriptions, activeOrders, completedOrders, revenueAgg] =
      await Promise.all([
        Order.countDocuments({ pharmacyId: pharmacyObjectId }),
        Order.countDocuments({
          pharmacyId: pharmacyObjectId,
          status: {
            $in: [OrderStatus.PRESCRIPTION_RECEIVED, OrderStatus.ORDER_VERIFIED],
          },
        }),
        Order.countDocuments({
          pharmacyId: pharmacyObjectId,
          status: {
            $in: [
              OrderStatus.ORDER_PROCESSING,
              OrderStatus.ORDER_READY_PICKUP,
              OrderStatus.ORDER_READY_DELIVERY,
              OrderStatus.OUT_FOR_DELIVERY,
            ],
          },
        }),
        Order.countDocuments({
          pharmacyId: pharmacyObjectId,
          status: OrderStatus.ORDER_COMPLETED,
        }),
        Order.aggregate([
          {
            $match: {
              pharmacyId: pharmacyObjectId,
              paymentStatus: PaymentStatus.CONFIRMED,
              paymentAmount: { $exists: true, $gt: 0 },
            },
          },
          { $group: { _id: null, total: { $sum: '$paymentAmount' } } },
        ]),
      ]);

    return {
      totalOrders,
      pendingPrescriptions,
      activeDeliveries: activeOrders,
      completedOrders,
      revenue: revenueAgg[0]?.total ?? 0,
    };
  }

  async getRecentActivity(pharmacyId: string, limit = 5) {
    const orders = await Order.find({ pharmacyId })
      .populate('patientId', 'name')
      .sort({ updatedAt: -1 })
      .limit(limit);

    return orders.map((order) => {
      const patient = order.patientId as { name?: string } | Types.ObjectId;
      const patientName =
        typeof patient === 'object' && patient !== null && 'name' in patient
          ? patient.name
          : 'Patient';

      return {
        orderId: String(order._id),
        status: order.status,
        patientName,
        updatedAt: order.updatedAt,
      };
    });
  }
}

export const orderService = new OrderService();
