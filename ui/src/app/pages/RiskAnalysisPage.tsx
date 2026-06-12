import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { entityService } from "../services/entityService";
import { riskService } from "../services/riskService";
import type { Entity } from "../types";
import { RiskBadge, CaseStatusBadge } from "../components/shared/StatusBadge";
import { ScoreRing } from "../components/shared/ScoreRing";
import { PageLoader } from "../components/shared/LoadingSpinner";
import { formatPKR, riskColors } from "../utils/helpers";

export function RiskAnalysisPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get("entityId");

  const [entities, setEntities] = useState<Entity[]>([]);
  const [selected, setSelected] = useState<Entity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([entityService.getAll(token), riskService.getTopFlagged(token)]).then(
      ([all]) => {
        setEntities(all);
        const preselect = preselectedId
          ? all.find((e) => e.id === preselectedId)
          : all.sort((a, b) => b.complianceScore.total - a.complianceScore.total)[0];
        setSelected(preselect ?? null);
        setIsLoading(false);
      }
    );
  }, [token, preselectedId]);

  if (isLoading) return <PageLoader />;

  const radarData = selected
    ? Object.entries(selected.complianceScore.breakdown).map(([key, val]) => ({
        factor: {
          incomeVsLifestyle: "Income vs Lifestyle",
          assetVsIncome: "Asset vs Income",
          utilityVsIncome: "Utility vs Income",
          travelVsIncome: "Travel vs Income",
          filingConsistency: "Filing Consistency",
        }[key] ?? key,
        score: val,
      }))
    : [];

  const allScores = entities
    .sort((a, b) => b.complianceScore.total - a.complianceScore.total)
    .map((e) => ({
      name: e.fullName.split(" ").slice(0, 2).join(" "),
      score: e.complianceScore.total,
      level: e.complianceScore.level,
    }));

  return (
    <div className="flex h-full">
      {/* Entity selector sidebar */}
      <div className="hidden w-64 flex-shrink-0 overflow-y-auto border-r border-border lg:block">
        <div className="border-b border-border px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Select Entity
          </p>
        </div>
        <div className="divide-y divide-border">
          {entities
            .sort((a, b) => b.complianceScore.total - a.complianceScore.total)
            .map((e) => (
              <button
                key={e.id}
                onClick={() => setSelected(e)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                  selected?.id === e.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent/30"
                }`}
              >
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${riskColors(e.complianceScore.level).bg} ${riskColors(e.complianceScore.level).text}`}
                >
                  {e.complianceScore.total}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{e.fullName}</p>
                  <RiskBadge level={e.complianceScore.level} size="sm" />
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Main analysis area */}
      {selected ? (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Entity header */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-start gap-4">
              <ScoreRing
                score={selected.complianceScore.total}
                level={selected.complianceScore.level}
                size={96}
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-foreground">{selected.fullName}</h2>
                <p className="text-sm text-muted-foreground">{selected.cnic} · {selected.profession}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <RiskBadge level={selected.complianceScore.level} />
                  <CaseStatusBadge status={selected.caseStatus} />
                </div>

                {/* Key flags */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {selected.properties.length > 0 && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {selected.properties.length} Properties ({formatPKR(selected.properties.reduce((s, p) => s + p.estimatedValuePKR, 0))})
                    </div>
                  )}
                  {selected.vehicles.length > 0 && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {selected.vehicles.length} Vehicles Registered
                    </div>
                  )}
                  {selected.travelRecords.length > 0 && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-yellow-50 px-3 py-1.5 text-xs font-medium text-yellow-700">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {selected.travelRecords.length} International Trips
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => navigate(`/search/${selected.id}`)}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent"
              >
                Full Profile <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Radar chart */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-2 font-semibold text-foreground">Risk Factor Radar</h3>
              <p className="mb-4 text-xs text-muted-foreground">
                Higher values indicate greater deviation from expected profile.
              </p>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11 }} />
                  <Radar
                    dataKey="score"
                    stroke="#dc2626"
                    fill="#dc2626"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* All entity comparison bar chart */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-2 font-semibold text-foreground">Comparative Score Ranking</h3>
              <p className="mb-4 text-xs text-muted-foreground">
                All scanned entities sorted by deviation score.
              </p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={allScores}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {allScores.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.level === "critical" ? "#dc2626" :
                          entry.level === "high" ? "#ea580c" :
                          entry.level === "medium" ? "#ca8a04" :
                          "#16a34a"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Score breakdown detail */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-foreground">Detailed Score Breakdown</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {Object.entries(selected.complianceScore.breakdown).map(([key, val]) => {
                const labelMap: Record<string, string> = {
                  incomeVsLifestyle: "Income vs Lifestyle",
                  assetVsIncome: "Asset vs Income",
                  utilityVsIncome: "Utility vs Income",
                  travelVsIncome: "Travel vs Income",
                  filingConsistency: "Filing Consistency",
                };
                const color =
                  val >= 80 ? "text-red-600" : val >= 60 ? "text-orange-600" : val >= 40 ? "text-yellow-600" : "text-green-600";
                const bgColor =
                  val >= 80 ? "bg-red-50 border-red-100" : val >= 60 ? "bg-orange-50 border-orange-100" : val >= 40 ? "bg-yellow-50 border-yellow-100" : "bg-green-50 border-green-100";
                return (
                  <div key={key} className={`rounded-xl border p-4 text-center ${bgColor}`}>
                    <p className={`text-2xl font-bold ${color}`}>{val}</p>
                    <p className="text-xs text-muted-foreground mt-1">{labelMap[key]}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Income comparison card */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-foreground">Income vs Asset Discrepancy</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">Latest Declared Income</p>
                <p className="mt-1 text-xl font-bold text-foreground">
                  {formatPKR(selected.taxFilings[0]?.declaredIncome ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">Per Year (FBR)</p>
              </div>
              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-xs text-muted-foreground">Total Property Value</p>
                <p className="mt-1 text-xl font-bold text-red-700">
                  {formatPKR(selected.properties.reduce((s, p) => s + p.estimatedValuePKR, 0))}
                </p>
                <p className="text-xs text-muted-foreground">Combined (Registry)</p>
              </div>
              <div className="rounded-lg bg-orange-50 p-4">
                <p className="text-xs text-muted-foreground">Annual Utility Bills</p>
                <p className="mt-1 text-xl font-bold text-orange-700">
                  {formatPKR(selected.utilityBills.reduce((s, u) => s + u.averageMonthlyAmount * 12, 0))}
                </p>
                <p className="text-xs text-muted-foreground">Estimated Annual (LESCO/KESC)</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          Select an entity to view risk analysis.
        </div>
      )}
    </div>
  );
}
