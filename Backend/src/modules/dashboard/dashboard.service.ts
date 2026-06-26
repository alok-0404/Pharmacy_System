import { Types } from 'mongoose';
import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError';
import { HTTP_STATUS } from '../../config/constants';
import { isValidObjectId } from '../../utils/objectId';
import { OrderStatus, PaymentStatus } from '../../config/order.constants';
import { Order } from '../order/order.model';
import { Patient } from '../patient/patient.model';
import { Conversation, ConversationStatus } from '../conversation/conversation.model';
import { Message, SenderType } from '../message/message.model';
import { Medicine } from '../medicine/medicine.model';
import { Pharmacy } from '../pharmacy/pharmacy.model';
import { env } from '../../config/env';
import {
  addDays,
  comparePeriods,
  endOfDay,
  formatDateKey,
  rangeToDays,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  type DashboardRange,
  type PeriodComparison,
} from './dashboard.utils';

const LOW_STOCK_THRESHOLD = 10;
const DELIVERY_STATUSES = [
  OrderStatus.ORDER_PROCESSING,
  OrderStatus.ORDER_READY_PICKUP,
  OrderStatus.ORDER_READY_DELIVERY,
  OrderStatus.OUT_FOR_DELIVERY,
] as const;

const PENDING_PRESCRIPTION_STATUSES = [
  OrderStatus.PRESCRIPTION_RECEIVED,
  OrderStatus.ORDER_VERIFIED,
] as const;

export interface DashboardAnalytics {
  generatedAt: string;
  range: DashboardRange;
  kpis: {
    totalOrders: PeriodComparison & { total: number };
    activePatients: PeriodComparison & { total: number };
    pendingPrescriptions: PeriodComparison & { total: number };
    activeDeliveries: PeriodComparison & { total: number };
    revenue: PeriodComparison & { total: number };
    averageOrderValue: PeriodComparison & { value: number };
    cancelledOrders: PeriodComparison & { total: number };
    prescriptionApprovalRate: PeriodComparison & { rate: number };
  };
  comparisons: {
    todayVsYesterday: { orders: PeriodComparison; revenue: PeriodComparison };
    weekVsLastWeek: { orders: PeriodComparison; revenue: PeriodComparison };
    monthVsLastMonth: { orders: PeriodComparison; revenue: PeriodComparison };
    yearVsLastYear: { orders: PeriodComparison; revenue: PeriodComparison };
  };
  revenue: {
    trend: Array<{ date: string; revenue: number; orders: number }>;
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
    growthPercent: number;
    lossPercent: number;
    averageOrderValue: number;
    paymentBreakdown: Array<{ method: string; count: number; amount: number }>;
    topMedicines: Array<{ name: string; unit: string; stockQuantity: number; price: number }>;
  };
  orders: {
    statusBreakdown: Array<{ status: OrderStatus; count: number }>;
    cancelledImpact: { count: number; lostRevenue: number };
    recent: Array<{
      orderId: string;
      patientName: string;
      status: OrderStatus;
      paymentStatus?: string;
      deliveryType?: string;
      paymentAmount?: number;
      createdAt?: Date;
      updatedAt?: Date;
    }>;
  };
  deliveries: {
    summary: Record<string, number>;
    active: Array<{
      orderId: string;
      patientName: string;
      patientMobile: string;
      status: OrderStatus;
      deliveryType?: string;
      orderTime?: Date;
      updatedAt?: Date;
      isDelayed: boolean;
    }>;
  };
  prescriptions: {
    pending: Array<{
      orderId: string;
      patientName: string;
      patientMobile: string;
      status: OrderStatus;
      uploadedAt?: Date;
      waitingMinutes: number;
      priority: 'high' | 'normal';
      continueReviewPath: string;
    }>;
  };
  patients: {
    active: Array<{
      patientId: string;
      name: string;
      mobile: string;
      email?: string;
      lastActivity?: Date;
      registeredAt?: Date;
      orderCount: number;
      lastOrderStatus?: OrderStatus;
    }>;
  };
  whatsapp: {
    totalMessages: number;
    patientMessages: number;
    botMessages: number;
    pharmacistMessages: number;
    openConversations: number;
    handoffActive: number;
    averageResponseTimeMinutes: number | null;
  };
  bot: {
    automatedReplies: number;
    handoffConversations: number;
    handoffRate: number;
  };
  system: {
    apiHealth: 'healthy' | 'degraded';
    database: 'connected' | 'disconnected';
    whatsappConnected: boolean;
    queueStatus: 'idle' | 'active';
  };
  alerts: {
    critical: Array<{ id: string; title: string; detail: string; severity: 'critical' | 'warning' }>;
    lowStock: Array<{ medicineId: string; name: string; stockQuantity: number; unit: string }>;
    pendingFollowUps: Array<{ orderId: string; patientName: string; status: OrderStatus; since?: Date }>;
  };
  activity: Array<{
    id: string;
    type: 'order' | 'message' | 'patient';
    title: string;
    subtitle: string;
    timestamp?: Date;
    orderId?: string;
  }>;
  tasks: {
    today: Array<{ id: string; label: string; href: string; count: number }>;
  };
}

export class DashboardService {
  private async countOrdersBetween(
    pharmacyId: Types.ObjectId,
    from: Date,
    to: Date,
  ): Promise<number> {
    return Order.countDocuments({
      pharmacyId,
      createdAt: { $gte: from, $lte: to },
    });
  }

  private async sumRevenueBetween(
    pharmacyId: Types.ObjectId,
    from: Date,
    to: Date,
  ): Promise<number> {
    const result = await Order.aggregate([
      {
        $match: {
          pharmacyId,
          paymentStatus: PaymentStatus.CONFIRMED,
          paymentAmount: { $gt: 0 },
          updatedAt: { $gte: from, $lte: to },
        },
      },
      { $group: { _id: null, total: { $sum: '$paymentAmount' } } },
    ]);

    return result[0]?.total ?? 0;
  }

  private async computeAverageResponseTime(pharmacyId: Types.ObjectId): Promise<number | null> {
    const conversations = await Conversation.find({ pharmacyId })
      .sort({ lastMessageAt: -1 })
      .limit(20)
      .select('_id');

    const responseTimes: number[] = [];

    for (const conversation of conversations) {
      const messages = await Message.find({ conversationId: conversation._id })
        .sort({ createdAt: 1 })
        .select('senderType createdAt')
        .limit(100);

      for (let i = 0; i < messages.length - 1; i += 1) {
        const current = messages[i];
        const next = messages[i + 1];

        if (
          current.senderType === SenderType.PATIENT &&
          next.senderType === SenderType.PHARMACIST &&
          current.createdAt &&
          next.createdAt
        ) {
          const minutes =
            (next.createdAt.getTime() - current.createdAt.getTime()) / (1000 * 60);
          if (minutes >= 0 && minutes < 24 * 60) {
            responseTimes.push(minutes);
          }
        }
      }
    }

    if (responseTimes.length === 0) {
      return null;
    }

    const avg = responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length;
    return Number(avg.toFixed(1));
  }

  async getAnalytics(pharmacyId: string, range: DashboardRange = '30d'): Promise<DashboardAnalytics> {
    if (!isValidObjectId(pharmacyId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid pharmacy ID');
    }

    const pharmacyObjectId = new Types.ObjectId(pharmacyId);
    const now = new Date();
    const todayStart = startOfDay(now);
    const yesterdayStart = addDays(todayStart, -1);
    const yesterdayEnd = endOfDay(addDays(todayStart, -1));
    const weekStart = startOfWeek(now);
    const lastWeekStart = addDays(weekStart, -7);
    const lastWeekEnd = endOfDay(addDays(weekStart, -1));
    const monthStart = startOfMonth(now);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = endOfDay(addDays(monthStart, -1));
    const yearStart = startOfYear(now);
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearEnd = endOfDay(addDays(yearStart, -1));
    const trendStart = addDays(todayStart, -(rangeToDays(range) - 1));

    const pharmacy = await Pharmacy.findById(pharmacyId);

    const [
      totalOrders,
      pendingPrescriptions,
      activeDeliveries,
      completedOrders,
      cancelledOrders,
      revenueAgg,
      activePatientCount,
      totalPatientCount,
      openConversations,
      handoffActive,
      lowStockMedicines,
      topMedicines,
      recentOrders,
      pendingOrders,
      activeDeliveryOrders,
      messageCounts,
      statusBreakdown,
      todayOrders,
      yesterdayOrders,
      weekOrders,
      lastWeekOrders,
      monthOrders,
      lastMonthOrders,
      yearOrders,
      lastYearOrders,
      todayRevenue,
      yesterdayRevenue,
      weekRevenue,
      lastWeekRevenue,
      monthRevenue,
      lastMonthRevenue,
      yearRevenue,
      lastYearRevenue,
      approvedCount,
      receivedCount,
      cancelledRevenueAgg,
      patientsWithOrders,
      recentMessages,
    ] = await Promise.all([
      Order.countDocuments({ pharmacyId: pharmacyObjectId }),
      Order.countDocuments({
        pharmacyId: pharmacyObjectId,
        status: { $in: PENDING_PRESCRIPTION_STATUSES },
      }),
      Order.countDocuments({
        pharmacyId: pharmacyObjectId,
        status: { $in: DELIVERY_STATUSES },
      }),
      Order.countDocuments({
        pharmacyId: pharmacyObjectId,
        status: OrderStatus.ORDER_COMPLETED,
      }),
      Order.countDocuments({
        pharmacyId: pharmacyObjectId,
        status: OrderStatus.ORDER_CANCELLED,
      }),
      Order.aggregate([
        {
          $match: {
            pharmacyId: pharmacyObjectId,
            paymentStatus: PaymentStatus.CONFIRMED,
            paymentAmount: { $gt: 0 },
          },
        },
        { $group: { _id: null, total: { $sum: '$paymentAmount' } } },
      ]),
      Patient.countDocuments({ pharmacyId: pharmacyObjectId, isActive: true }),
      Patient.countDocuments({ pharmacyId: pharmacyObjectId }),
      Conversation.countDocuments({
        pharmacyId: pharmacyObjectId,
        status: ConversationStatus.OPEN,
      }),
      Conversation.countDocuments({ pharmacyId: pharmacyObjectId, handoffActive: true }),
      Medicine.find({
        pharmacyId: pharmacyObjectId,
        isActive: true,
        stockQuantity: { $lte: LOW_STOCK_THRESHOLD },
      })
        .sort({ stockQuantity: 1 })
        .limit(10),
      Medicine.find({ pharmacyId: pharmacyObjectId, isActive: true })
        .sort({ stockQuantity: -1 })
        .limit(5),
      Order.find({ pharmacyId: pharmacyObjectId })
        .populate('patientId', 'name mobile email')
        .sort({ updatedAt: -1 })
        .limit(25),
      Order.find({
        pharmacyId: pharmacyObjectId,
        status: { $in: PENDING_PRESCRIPTION_STATUSES },
      })
        .populate('patientId', 'name mobile')
        .sort({ createdAt: 1 })
        .limit(20),
      Order.find({
        pharmacyId: pharmacyObjectId,
        status: { $in: DELIVERY_STATUSES },
      })
        .populate('patientId', 'name mobile')
        .sort({ updatedAt: -1 })
        .limit(20),
      Message.aggregate([
        { $match: { pharmacyId: pharmacyObjectId, createdAt: { $gte: trendStart } } },
        { $group: { _id: '$senderType', count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { pharmacyId: pharmacyObjectId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.countOrdersBetween(pharmacyObjectId, todayStart, now),
      this.countOrdersBetween(pharmacyObjectId, yesterdayStart, yesterdayEnd),
      this.countOrdersBetween(pharmacyObjectId, weekStart, now),
      this.countOrdersBetween(pharmacyObjectId, lastWeekStart, lastWeekEnd),
      this.countOrdersBetween(pharmacyObjectId, monthStart, now),
      this.countOrdersBetween(pharmacyObjectId, lastMonthStart, lastMonthEnd),
      this.countOrdersBetween(pharmacyObjectId, yearStart, now),
      this.countOrdersBetween(pharmacyObjectId, lastYearStart, lastYearEnd),
      this.sumRevenueBetween(pharmacyObjectId, todayStart, now),
      this.sumRevenueBetween(pharmacyObjectId, yesterdayStart, yesterdayEnd),
      this.sumRevenueBetween(pharmacyObjectId, weekStart, now),
      this.sumRevenueBetween(pharmacyObjectId, lastWeekStart, lastWeekEnd),
      this.sumRevenueBetween(pharmacyObjectId, monthStart, now),
      this.sumRevenueBetween(pharmacyObjectId, lastMonthStart, lastMonthEnd),
      this.sumRevenueBetween(pharmacyObjectId, yearStart, now),
      this.sumRevenueBetween(pharmacyObjectId, lastYearStart, lastYearEnd),
      Order.countDocuments({
        pharmacyId: pharmacyObjectId,
        status: {
          $in: [
            OrderStatus.ORDER_VERIFIED,
            OrderStatus.ORDER_ACCEPTED,
            OrderStatus.PAYMENT_PENDING,
            OrderStatus.PAYMENT_CONFIRMED,
            OrderStatus.ORDER_PROCESSING,
            OrderStatus.ORDER_READY_PICKUP,
            OrderStatus.ORDER_READY_DELIVERY,
            OrderStatus.OUT_FOR_DELIVERY,
            OrderStatus.ORDER_COMPLETED,
          ],
        },
      }),
      Order.countDocuments({
        pharmacyId: pharmacyObjectId,
        status: OrderStatus.PRESCRIPTION_RECEIVED,
      }),
      Order.aggregate([
        {
          $match: {
            pharmacyId: pharmacyObjectId,
            status: OrderStatus.ORDER_CANCELLED,
            paymentAmount: { $gt: 0 },
          },
        },
        { $group: { _id: null, total: { $sum: '$paymentAmount' } } },
      ]),
      Patient.find({ pharmacyId: pharmacyObjectId, isActive: true })
        .sort({ lastInteractionAt: -1 })
        .limit(15),
      Message.find({ pharmacyId: pharmacyObjectId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('patientId', 'name'),
    ]);

    const totalRevenue = revenueAgg[0]?.total ?? 0;
    const paidOrders = await Order.countDocuments({
      pharmacyId: pharmacyObjectId,
      paymentStatus: PaymentStatus.CONFIRMED,
      paymentAmount: { $gt: 0 },
    });
    const averageOrderValue = paidOrders > 0 ? Number((totalRevenue / paidOrders).toFixed(2)) : 0;

    const approvalRate =
      receivedCount + approvedCount > 0
        ? Number(((approvedCount / (receivedCount + approvedCount)) * 100).toFixed(1))
        : 0;

    const trendAgg = await Order.aggregate([
      {
        $match: {
          pharmacyId: pharmacyObjectId,
          createdAt: { $gte: trendStart, $lte: now },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          orders: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$paymentStatus', PaymentStatus.CONFIRMED] },
                    { $gt: ['$paymentAmount', 0] },
                  ],
                },
                '$paymentAmount',
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const trendMap = new Map(
      trendAgg.map((row) => [row._id as string, { revenue: row.revenue as number, orders: row.orders as number }]),
    );

    const trend: DashboardAnalytics['revenue']['trend'] = [];
    for (let i = 0; i < rangeToDays(range); i += 1) {
      const day = addDays(trendStart, i);
      const key = formatDateKey(day);
      const row = trendMap.get(key);
      trend.push({
        date: key,
        revenue: row?.revenue ?? 0,
        orders: row?.orders ?? 0,
      });
    }

    const messageCountMap = new Map(
      messageCounts.map((row) => [row._id as string, row.count as number]),
    );
    const patientMessages = messageCountMap.get(SenderType.PATIENT) ?? 0;
    const botMessages = messageCountMap.get(SenderType.BOT) ?? 0;
    const pharmacistMessages = messageCountMap.get(SenderType.PHARMACIST) ?? 0;
    const totalMessages = patientMessages + botMessages + pharmacistMessages;

    const patientOrderStats = await Order.aggregate([
      { $match: { pharmacyId: pharmacyObjectId } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$patientId',
          orderCount: { $sum: 1 },
          lastOrderStatus: { $first: '$status' },
        },
      },
    ]);
    const patientOrderMap = new Map(
      patientOrderStats.map((row) => [
        String(row._id),
        {
          orderCount: row.orderCount as number,
          lastOrderStatus: row.lastOrderStatus as OrderStatus,
        },
      ]),
    );

    const avgResponseTime = await this.computeAverageResponseTime(pharmacyObjectId);

    const mapPatient = (patient: unknown): { name: string; mobile: string } => {
      if (typeof patient === 'object' && patient !== null && 'name' in patient) {
        const p = patient as { name?: string; mobile?: string };
        return { name: p.name ?? 'Patient', mobile: p.mobile ?? '' };
      }

      return { name: 'Patient', mobile: '' };
    };

    const recentOrderRows = recentOrders.map((order) => {
      const patient = mapPatient(order.patientId);
      return {
        orderId: String(order._id),
        patientName: patient.name,
        status: order.status,
        paymentStatus: order.paymentStatus,
        deliveryType: order.deliveryType,
        paymentAmount: order.paymentAmount,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });

    const pendingPrescriptionRows = pendingOrders.map((order) => {
      const patient = mapPatient(order.patientId);
      const uploadedAt = order.createdAt ?? new Date();
      const waitingMinutes = Math.max(
        0,
        Math.floor((now.getTime() - uploadedAt.getTime()) / (1000 * 60)),
      );

      return {
        orderId: String(order._id),
        patientName: patient.name,
        patientMobile: patient.mobile,
        status: order.status,
        uploadedAt: order.createdAt,
        waitingMinutes,
        priority: waitingMinutes >= 60 ? ('high' as const) : ('normal' as const),
        continueReviewPath: `/dashboard/orders?order=${order._id}`,
      };
    });

    const deliveryRows = activeDeliveryOrders.map((order) => {
      const patient = mapPatient(order.patientId);
      const updatedAt = order.updatedAt ?? order.createdAt ?? now;
      const hoursSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);

      return {
        orderId: String(order._id),
        patientName: patient.name,
        patientMobile: patient.mobile,
        status: order.status,
        deliveryType: order.deliveryType,
        orderTime: order.createdAt,
        updatedAt: order.updatedAt,
        isDelayed: hoursSinceUpdate >= 24,
      };
    });

    const deliverySummary = {
      readyPickup: deliveryRows.filter((d) => d.status === OrderStatus.ORDER_READY_PICKUP).length,
      readyDelivery: deliveryRows.filter((d) => d.status === OrderStatus.ORDER_READY_DELIVERY).length,
      outForDelivery: deliveryRows.filter((d) => d.status === OrderStatus.OUT_FOR_DELIVERY).length,
      processing: deliveryRows.filter((d) => d.status === OrderStatus.ORDER_PROCESSING).length,
      delayed: deliveryRows.filter((d) => d.isDelayed).length,
      cancelled: cancelledOrders,
      delivered: completedOrders,
    };

    const activePatients = patientsWithOrders.map((patient) => {
      const stats = patientOrderMap.get(String(patient._id));
      return {
        patientId: String(patient._id),
        name: patient.name,
        mobile: patient.mobile,
        email: patient.email,
        lastActivity: patient.lastInteractionAt,
        registeredAt: patient.createdAt,
        orderCount: stats?.orderCount ?? 0,
        lastOrderStatus: stats?.lastOrderStatus,
      };
    });

    const paymentBreakdown = await Order.aggregate([
      {
        $match: {
          pharmacyId: pharmacyObjectId,
          paymentStatus: PaymentStatus.CONFIRMED,
          paymentAmount: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $ifNull: ['$paymentLinkUrl', false] },
              'Online Link',
              'Manual / QR',
            ],
          },
          count: { $sum: 1 },
          amount: { $sum: '$paymentAmount' },
        },
      },
    ]);

    const lostRevenue = cancelledRevenueAgg[0]?.total ?? 0;
    const lossPercent =
      totalRevenue + lostRevenue > 0
        ? Number(((lostRevenue / (totalRevenue + lostRevenue)) * 100).toFixed(1))
        : 0;

    const growthPercent = comparePeriods(monthRevenue, lastMonthRevenue).changePercent;

    const criticalAlerts: DashboardAnalytics['alerts']['critical'] = [];
    if (pendingPrescriptions > 5) {
      criticalAlerts.push({
        id: 'pending-rx',
        title: 'High prescription backlog',
        detail: `${pendingPrescriptions} prescriptions waiting for review`,
        severity: 'critical',
      });
    }
    if (lowStockMedicines.some((m) => m.stockQuantity === 0)) {
      criticalAlerts.push({
        id: 'out-of-stock',
        title: 'Medicines out of stock',
        detail: 'Some active medicines have zero stock',
        severity: 'critical',
      });
    }

    const followUpOrders = await Order.find({
      pharmacyId: pharmacyObjectId,
      status: { $in: [OrderStatus.PAYMENT_PENDING, OrderStatus.PRESCRIPTION_RECEIVED] },
    })
      .populate('patientId', 'name')
      .sort({ updatedAt: 1 })
      .limit(10);

    const pendingFollowUps = followUpOrders.map((order) => ({
      orderId: String(order._id),
      patientName: mapPatient(order.patientId).name,
      status: order.status,
      since: order.updatedAt,
    }));

    const activity: DashboardAnalytics['activity'] = [
      ...recentOrderRows.slice(0, 8).map((order) => ({
        id: `order-${order.orderId}`,
        type: 'order' as const,
        title: `${order.patientName} — ${order.status.replace(/_/g, ' ')}`,
        subtitle: 'Order status updated',
        timestamp: order.updatedAt,
        orderId: order.orderId,
      })),
      ...recentMessages.map((message) => {
        const patient = mapPatient(message.patientId);
        return {
          id: `msg-${message._id}`,
          type: 'message' as const,
          title: `${patient.name} — ${message.senderType} message`,
          subtitle: message.content.slice(0, 80),
          timestamp: message.createdAt,
        };
      }),
    ]
      .sort((a, b) => (b.timestamp?.getTime() ?? 0) - (a.timestamp?.getTime() ?? 0))
      .slice(0, 15);

    const whatsappConnected = Boolean(
      env.META_ACCESS_TOKEN &&
        pharmacy?.whatsappPhoneNumberId &&
        pharmacy?.businessAccountId,
    );

    const dbConnected = mongoose.connection.readyState === 1;

    return {
      generatedAt: now.toISOString(),
      range,
      kpis: {
        totalOrders: { ...comparePeriods(monthOrders, lastMonthOrders), total: totalOrders },
        activePatients: {
          ...comparePeriods(activePatientCount, totalPatientCount - activePatientCount),
          total: activePatientCount,
        },
        pendingPrescriptions: {
          ...comparePeriods(pendingPrescriptions, Math.max(0, pendingPrescriptions - 1)),
          total: pendingPrescriptions,
        },
        activeDeliveries: {
          ...comparePeriods(activeDeliveries, Math.max(0, activeDeliveries - 1)),
          total: activeDeliveries,
        },
        revenue: { ...comparePeriods(monthRevenue, lastMonthRevenue), total: totalRevenue },
        averageOrderValue: {
          ...comparePeriods(averageOrderValue, averageOrderValue),
          value: averageOrderValue,
        },
        cancelledOrders: {
          ...comparePeriods(cancelledOrders, Math.max(0, cancelledOrders - 1)),
          total: cancelledOrders,
        },
        prescriptionApprovalRate: {
          ...comparePeriods(approvalRate, Math.max(0, approvalRate - 5)),
          rate: approvalRate,
        },
      },
      comparisons: {
        todayVsYesterday: {
          orders: comparePeriods(todayOrders, yesterdayOrders),
          revenue: comparePeriods(todayRevenue, yesterdayRevenue),
        },
        weekVsLastWeek: {
          orders: comparePeriods(weekOrders, lastWeekOrders),
          revenue: comparePeriods(weekRevenue, lastWeekRevenue),
        },
        monthVsLastMonth: {
          orders: comparePeriods(monthOrders, lastMonthOrders),
          revenue: comparePeriods(monthRevenue, lastMonthRevenue),
        },
        yearVsLastYear: {
          orders: comparePeriods(yearOrders, lastYearOrders),
          revenue: comparePeriods(yearRevenue, lastYearRevenue),
        },
      },
      revenue: {
        trend,
        daily: todayRevenue,
        weekly: weekRevenue,
        monthly: monthRevenue,
        yearly: yearRevenue,
        growthPercent,
        lossPercent,
        averageOrderValue,
        paymentBreakdown: paymentBreakdown.map((row) => ({
          method: row._id as string,
          count: row.count as number,
          amount: row.amount as number,
        })),
        topMedicines: topMedicines.map((medicine) => ({
          name: medicine.name,
          unit: medicine.unit,
          stockQuantity: medicine.stockQuantity,
          price: medicine.price,
        })),
      },
      orders: {
        statusBreakdown: statusBreakdown.map((row) => ({
          status: row._id as OrderStatus,
          count: row.count as number,
        })),
        cancelledImpact: { count: cancelledOrders, lostRevenue },
        recent: recentOrderRows,
      },
      deliveries: {
        summary: deliverySummary,
        active: deliveryRows,
      },
      prescriptions: {
        pending: pendingPrescriptionRows,
      },
      patients: {
        active: activePatients,
      },
      whatsapp: {
        totalMessages,
        patientMessages,
        botMessages,
        pharmacistMessages,
        openConversations,
        handoffActive,
        averageResponseTimeMinutes: avgResponseTime,
      },
      bot: {
        automatedReplies: botMessages,
        handoffConversations: handoffActive,
        handoffRate: openConversations > 0 ? Number(((handoffActive / openConversations) * 100).toFixed(1)) : 0,
      },
      system: {
        apiHealth: dbConnected ? 'healthy' : 'degraded',
        database: dbConnected ? 'connected' : 'disconnected',
        whatsappConnected,
        queueStatus: pendingPrescriptions > 0 || handoffActive > 0 ? 'active' : 'idle',
      },
      alerts: {
        critical: criticalAlerts,
        lowStock: lowStockMedicines.map((medicine) => ({
          medicineId: String(medicine._id),
          name: medicine.name,
          stockQuantity: medicine.stockQuantity,
          unit: medicine.unit,
        })),
        pendingFollowUps,
      },
      activity,
      tasks: {
        today: [
          {
            id: 'pending-rx',
            label: 'Review pending prescriptions',
            href: '/dashboard/orders',
            count: pendingPrescriptions,
          },
          {
            id: 'handoff',
            label: 'Respond to pharmacist handoffs',
            href: '/dashboard/inbox',
            count: handoffActive,
          },
          {
            id: 'low-stock',
            label: 'Restock low inventory',
            href: '/dashboard/medicines',
            count: lowStockMedicines.length,
          },
        ],
      },
    };
  }
}

export const dashboardService = new DashboardService();
