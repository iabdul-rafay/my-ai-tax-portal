// ============================================================
// Dashboard Service — DEV mock implementation
// Replace with: GET /api/v1/dashboard/summary, GET /api/v1/alerts
// ============================================================

import type { DashboardSummary, Alert } from "../types";
import { mockDashboardSummary, mockAlerts } from "../data/mockData";

export const dashboardService = {
  /**
   * Fetch dashboard summary metrics.
   * Replace with: fetch('/api/v1/dashboard/summary', { headers: { Authorization: `Bearer ${token}` } })
   */
  async getSummary(_token: string): Promise<DashboardSummary> {
    await delay(500);
    return mockDashboardSummary;
  },

  /**
   * Fetch recent alerts.
   * Replace with: fetch('/api/v1/alerts?limit=10', { headers: { Authorization: `Bearer ${token}` } })
   */
  async getAlerts(_token: string): Promise<Alert[]> {
    await delay(400);
    return mockAlerts;
  },
};

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
