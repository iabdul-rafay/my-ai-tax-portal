import type { Entity, SearchFilters, SearchResult } from "../types";
import { fetchEntities, fetchEntityById } from "../../api/entities";

export const entityService = {
  async search(filters: SearchFilters, _token: string): Promise<SearchResult> {
    const entities = (await fetchEntities({
      query:       filters.query      || undefined,
      riskLevel:   filters.riskLevel  || undefined,
      caseStatus:  filters.caseStatus || undefined,
      province:    filters.province   || undefined,
    })) as Entity[];
    return { entities, total: entities.length };
  },

  /**
   * Get a single entity by ID.
   * Replace with: fetch(`/api/v1/entities/${id}`, buildRequestConfig(token))
   */
  async getById(id: string, _token: string): Promise<Entity | null> {
    return (await fetchEntityById(id)) as Entity | null;
  },

  /**
   * Get all entities (used on dashboard and search initial load).
   * Replace with: fetch('/api/v1/entities', buildRequestConfig(token))
   */
  async getAll(_token: string): Promise<Entity[]> {
    return (await fetchEntities()) as Entity[];
  },
};
