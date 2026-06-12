// ============================================================
// Core TypeScript interfaces for My AI Portal – Tax Compliance
// Intelligence System
// ============================================================

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type CaseStatus = "open" | "under_review" | "escalated" | "closed";
export type DataSourceType =
  | "fbr"
  | "nadra"
  | "excise"
  | "utility"
  | "property"
  | "immigration";

// ---- Auth -------------------------------------------------------
export interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string; // DEV: mock token; replace with real JWT from backend later
}

// ---- Entity / Person Profile ------------------------------------
export interface Alias {
  name: string;
  source: DataSourceType;
}

export interface Address {
  street: string;
  city: string;
  province: string;
  source: DataSourceType;
}

export interface TaxFiling {
  year: number;
  declaredIncome: number; // PKR
  taxPaid: number; // PKR
  filingStatus: "filed" | "not_filed" | "late";
  category: string;
}

export interface Vehicle {
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  engineCC: number;
  registeredCity: string;
}

export interface UtilityBill {
  type: "electricity" | "gas" | "water";
  provider: string;
  averageMonthlyUnits: number;
  averageMonthlyAmount: number; // PKR
  connectionAddress: string;
}

export interface Property {
  type: "residential" | "commercial" | "agricultural";
  location: string;
  estimatedValuePKR: number;
  area: string;
  registeredIn: string;
}

export interface TravelRecord {
  destination: string;
  departureDate: string;
  returnDate: string;
  purpose: "personal" | "business" | "unknown";
  airline?: string;
}

export interface ComplianceScore {
  total: number; // 0-100, higher = more suspicious
  level: RiskLevel;
  breakdown: {
    incomeVsLifestyle: number;
    assetVsIncome: number;
    utilityVsIncome: number;
    travelVsIncome: number;
    filingConsistency: number;
  };
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  category: string;
  finding: string;
  severity: RiskLevel;
  dataSource: DataSourceType;
  detail: string;
}

export interface AnalystNote {
  id: string;
  authorName: string;
  timestamp: string;
  content: string;
}

export interface Entity {
  id: string;
  cnic: string; // Pakistani CNIC format: XXXXX-XXXXXXX-X
  fullName: string;
  aliases: Alias[];
  dateOfBirth: string;
  profession: string;
  addresses: Address[];
  taxFilings: TaxFiling[];
  vehicles: Vehicle[];
  utilityBills: UtilityBill[];
  properties: Property[];
  travelRecords: TravelRecord[];
  complianceScore: ComplianceScore;
  caseStatus: CaseStatus;
  auditTrail: AuditEntry[];
  analystNotes: AnalystNote[];
  flaggedAt?: string;
  assignedAnalyst?: string;
}

// ---- Dashboard --------------------------------------------------
export interface DashboardSummary {
  totalEntitiesScanned: number;
  flaggedHigh: number;
  flaggedCritical: number;
  casesUnderReview: number;
  newAlertsToday: number;
  totalRevenueLeakageEstimatePKR: number;
}

export interface Alert {
  id: string;
  entityId: string;
  entityName: string;
  cnic: string;
  message: string;
  severity: RiskLevel;
  timestamp: string;
  isRead: boolean;
}

// ---- Chat -------------------------------------------------------
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  token: string; // DEV: included for auth simulation; replace with backend auth
  history?: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
  timestamp: string;
}

// ---- Data Sources -----------------------------------------------
export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  description: string;
  recordCount: number;
  lastSynced: string;
  status: "active" | "stale" | "error";
  fields: string[];
}

// ---- Search -----------------------------------------------------
export interface SearchFilters {
  query: string;
  riskLevel?: RiskLevel;
  caseStatus?: CaseStatus;
  province?: string;
}

export interface SearchResult {
  entities: Entity[];
  total: number;
}

// ---- Graph & Entity Linkage -------------------------------------
export interface GraphNode {
  id: string;
  label: string;
  type: "person" | "address" | "vehicle" | "property" | "utility" | "passport";
  val?: number; // size value
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
}

export interface MatchRecord {
  source: DataSourceType;
  record: any;
  confidence: number;
  reason: string;
}

export interface EntityMatchingResult {
  resolvedProfile: Entity;
  confidenceScore: number;
  matchedRecords: MatchRecord[];
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}
