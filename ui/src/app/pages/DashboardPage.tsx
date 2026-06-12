import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  AlertTriangle,
  TrendingUp,
  FileWarning,
  Bell,
  ArrowRight,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { dashboardService } from "../services/dashboardService";
import { riskService } from "../services/riskService";
import type { DashboardSummary, Alert, Entity } from "../types";
import { RiskBadge, CaseStatusBadge } from "../components/shared/StatusBadge";
import { PageLoader } from "../components/shared/LoadingSpinner";
import { formatPKR, formatDateTime, riskColors } from "../utils/helpers";

// ---- Mock trend data for charts --------------------------------
const trendData = [
  { month: "Sep", flagged: 52, resolved: 38 },
  { month: "Oct", flagged: 71, resolved: 45 },
  { month: "Nov", flagged: 68, resolved: 51 },
  { month: "Dec", flagged: 89, resolved: 60 },
  { month: "Jan", flagged: 112, resolved: 74 },
  { month: "Feb", flagged: 134, resolved: 88 },
  { month: "Mar", flagged: 158, resolved: 102 },
];

const sectorData = [
  { sector: "Real Estate", count: 124 },
  { sector: "Wholesale", count: 98 },
  { sector: "Import/Export", count: 87 },
  { sector: "Professionals", count: 63 },
  { sector: "Retail", count: 45 },
];

export function DashboardPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [topFlagged, setTopFlagged] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      dashboardService.getSummary(token),
      dashboardService.getAlerts(token),
      riskService.getTopFlagged(token),
    ]).then(([s, a, f]) => {
      setSummary(s);
      setAlerts(a);
      setTopFlagged(f);
      setIsLoading(false);
    });
  }, [token]);

  if (isLoading || !summary) return <PageLoader />;

  const summaryCards = [
    {
      label: "Total Entities Scanned",
      value: summary.totalEntitiesScanned.toLocaleString("en-PK"),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Critical Risk Cases",
      value: summary.flaggedCritical,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "High Risk Cases",
      value: summary.flaggedHigh,
      icon: FileWarning,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Under Review",
      value: summary.casesUnderReview,
      icon: Activity,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "New Alerts Today",
      value: summary.newAlertsToday,
      icon: Bell,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Est. Revenue Leakage",
      value: formatPKR(summary.totalRevenueLeakageEstimatePKR),
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className={`mb-2 inline-flex rounded-lg p-2 ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <p className="text-xl font-bold text-foreground">{card.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Trend chart */}
        <div className="col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-foreground">
            Monthly Flagging Trend
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="flagGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="flagged" stroke="#dc2626" fill="url(#flagGrad)" strokeWidth={2} name="Flagged" />
              <Area type="monotone" dataKey="resolved" stroke="#16a34a" fill="url(#resGrad)" strokeWidth={2} name="Resolved" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-4 rounded-full bg-red-500" /> Flagged</span>
            <span className="flex items-center gap-1"><span className="h-2 w-4 rounded-full bg-green-600" /> Resolved</span>
          </div>
        </div>

        {/* Sector bar chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-foreground">
            Cases by Sector
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sectorData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="sector" type="category" tick={{ fontSize: 11 }} width={80} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {sectorData.map((_, i) => (
                  <Cell key={i} fill={["#dc2626", "#ea580c", "#ca8a04", "#2563eb", "#7c3aed"][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row: alerts + top flagged */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Alerts */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="font-semibold text-foreground">Recent Alerts</h3>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              {alerts.filter((a) => !a.isRead).length} unread
            </span>
          </div>
          <div className="divide-y divide-border">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex gap-3 px-5 py-3 ${!alert.isRead ? "bg-accent/30" : ""}`}
              >
                <div className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${!alert.isRead ? "bg-red-500" : "bg-transparent"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground truncate">{alert.entityName}</span>
                    <RiskBadge level={alert.severity} size="sm" />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{alert.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(alert.timestamp)}</p>
                </div>
                <button
                  onClick={() => navigate(`/search/${alert.entityId}`)}
                  className="flex-shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Top Flagged Entities */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="font-semibold text-foreground">Top Flagged Entities</h3>
            <button
              onClick={() => navigate("/search")}
              className="text-xs text-primary hover:underline"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-border">
            {topFlagged.map((entity) => (
              <div
                key={entity.id}
                className="flex cursor-pointer items-center gap-3 px-5 py-3 hover:bg-accent/30 transition-colors"
                onClick={() => navigate(`/search/${entity.id}`)}
              >
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${riskColors(entity.complianceScore.level).bg} ${riskColors(entity.complianceScore.level).text}`}>
                  {entity.complianceScore.total}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{entity.fullName}</p>
                  <p className="text-xs text-muted-foreground">{entity.profession} · {entity.cnic}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <RiskBadge level={entity.complianceScore.level} size="sm" />
                  <CaseStatusBadge status={entity.caseStatus} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
