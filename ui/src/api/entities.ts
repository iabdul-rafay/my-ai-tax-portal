// Use an environment variable for the API base URL, with a fallback for local development.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5002/api";

export async function fetchEntities(filters?: {
  query?: string;
  riskLevel?: string;
  caseStatus?: string;
  province?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.query)      params.set("query",      filters.query);
  if (filters?.riskLevel)  params.set("riskLevel",  filters.riskLevel);
  if (filters?.caseStatus) params.set("caseStatus", filters.caseStatus);
  if (filters?.province)   params.set("province",   filters.province);

  const qs = params.toString();
  const response = await fetch(`${API_BASE_URL}/entities${qs ? `?${qs}` : ""}`);
  if (!response.ok) throw new Error("Failed to fetch entities");
  const data = await response.json();
  return data.entities as unknown[];
}

export async function fetchEntityById(id: string) {
  if (!id) return null;
  const response = await fetch(`${API_BASE_URL}/entities/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to fetch entity with id: ${id}`);
  const data = await response.json();
  return data.entity;
}

export async function searchEntityByCnic(cnic: string) {
  if (!cnic) return null;
  const response = await fetch(`${API_BASE_URL}/entities/cnic/${encodeURIComponent(cnic)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to search entity with cnic: ${cnic}`);
  const data = await response.json();
  return data.entity;
}
