// ============================================================
// Risk Service — DEV mock implementation
// Replace with: GET /api/v1/risk/:entityId
// ============================================================

import type { ComplianceScore, AuditEntry, Entity } from "../types";
import { mockEntities } from "../data/mockData";

export const riskService = {
  /**
   * Get compliance score for an entity.
   * Replace with: fetch(`/api/v1/risk/${entityId}`, { headers: { Authorization: `Bearer ${token}` } })
   */
  async getScore(entityId: string, _token: string): Promise<ComplianceScore | null> {
    await delay(300);
    const entity = mockEntities.find((e) => e.id === entityId);
    return entity?.complianceScore ?? null;
  },

  /**
   * Get audit trail entries for an entity.
   * Replace with: fetch(`/api/v1/risk/${entityId}/audit`, { headers: { Authorization: `Bearer ${token}` } })
   */
  async getAuditTrail(entityId: string, _token: string): Promise<AuditEntry[]> {
    await delay(400);
    const entity = mockEntities.find((e) => e.id === entityId);
    return entity?.auditTrail ?? [];
  },

  /**
   * Get top flagged entities for dashboard risk panel.
   * Replace with: fetch('/api/v1/risk/top-flagged', { headers: { Authorization: `Bearer ${token}` } })
   */
  async getTopFlagged(_token: string): Promise<Entity[]> {
    await delay(400);
    return mockEntities
      .filter((e) => e.complianceScore.level === "critical" || e.complianceScore.level === "high")
      .sort((a, b) => b.complianceScore.total - a.complianceScore.total);
  },
};

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
