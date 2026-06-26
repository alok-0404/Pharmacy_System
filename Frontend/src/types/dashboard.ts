import type { OrderStatus } from './index';

export type DashboardRange = '7d' | '30d' | '90d' | 'year';

export interface PeriodComparison {
  current: number;
  previous: number;
  changePercent: number;
}

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
      createdAt?: string;
      updatedAt?: string;
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
      orderTime?: string;
      updatedAt?: string;
      isDelayed: boolean;
    }>;
  };
  prescriptions: {
    pending: Array<{
      orderId: string;
      patientName: string;
      patientMobile: string;
      status: OrderStatus;
      uploadedAt?: string;
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
      lastActivity?: string;
      registeredAt?: string;
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
    pendingFollowUps: Array<{ orderId: string; patientName: string; status: OrderStatus; since?: string }>;
  };
  activity: Array<{
    id: string;
    type: 'order' | 'message' | 'patient';
    title: string;
    subtitle: string;
    timestamp?: string;
    orderId?: string;
  }>;
  tasks: {
    today: Array<{ id: string; label: string; href: string; count: number }>;
  };
}
