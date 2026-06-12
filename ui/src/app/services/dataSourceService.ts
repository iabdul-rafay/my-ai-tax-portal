// ============================================================
// Data Source Service — DEV mock implementation
// Replace with: GET /api/v1/data-sources
// ============================================================

import type { DataSource } from "../types";
import { mockDataSources } from "../data/mockData";

export const dataSourceService = {
  async getAll(_token: string): Promise<DataSource[]> {
    await delay(400);
    return mockDataSources;
  },
};

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
