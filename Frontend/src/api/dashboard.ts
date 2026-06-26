import { apiGet } from './client';
import type { DashboardAnalytics, DashboardRange } from '../types/dashboard';

const API_PREFIX = '/api/v1';

export const getDashboardAnalytics = (pharmacyId: string, range: DashboardRange = '30d') =>
  apiGet<DashboardAnalytics>(
    `${API_PREFIX}/dashboard/analytics?range=${encodeURIComponent(range)}`,
    pharmacyId,
  );
