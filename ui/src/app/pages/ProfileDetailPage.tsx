import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  User,
  CreditCard,
  MapPin,
  Car,
  Zap,
  Home,
  Plane,
  FileText,
  MessageSquare,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { entityService } from "../services/entityService";
import type { Entity } from "../types";
import { RiskBadge, CaseStatusBadge } from "../components/shared/StatusBadge";
import { ScoreRing } from "../components/shared/ScoreRing";
import { PageLoader } from "../components/shared/LoadingSpinner";
import { formatPKR, formatDate } from "../utils/helpers";

export function ProfileDetailPage() {
  const { token } = useAuth();
  const { entityId } = useParams();
  const navigate = useNavigate();
  const [entity, setEntity] = useState<Entity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["overview", "tax", "vehicles"])
  );

  useEffect(() => {
    if (!token || !entityId) return;
    entityService.getById(entityId, token).then((e) => {
      setEntity(e);
      setIsLoading(false);
    });
  }, [token, entityId]);

  function toggleSection(key: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  if (isLoading) return <PageLoader />;
  if (!entity) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Entity not found.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Back bar */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/95 px-6 py-3 backdrop-blur">
        <button
          onClick={() => navigate("/search")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Search
        </button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium text-foreground">{entity.fullName}</span>
      </div>

      <div className="p-6">
        {/* Header card */}
        <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start gap-4">
            <ScoreRing
              score={entity.complianceScore.total}
              level={entity.complianceScore.level}
              size={90}
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">{entity.fullName}</h2>
                <RiskBadge level={entity.complianceScore.level} />
                <CaseStatusBadge status={entity.caseStatus} />
              </div>
              {entity.aliases.length > 0 && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Also known as:{" "}
                  {entity.aliases.map((a) => a.name).join(", ")}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <CreditCard className="h-3.5 w-3.5" />
                  {entity.cnic}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  {entity.profession}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {entity.addresses[0]?.city}, {entity.addresses[0]?.province}
                </span>
              </div>
              {entity.assignedAnalyst && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Assigned to: <span className="font-medium text-foreground">{entity.assignedAnalyst}</span>
                  {entity.flaggedAt && ` · Flagged ${formatDate(entity.flaggedAt)}`}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/risk?entityId=${entity.id}`)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-accent"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Risk Analysis
              </button>
              <button
                onClick={() => navigate(`/audit?entityId=${entity.id}`)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-accent"
              >
                <FileText className="h-3.5 w-3.5" />
                Audit Trail
              </button>
              <button
                onClick={() => navigate("/chat")}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Ask AI
              </button>
            </div>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-foreground">Compliance Score Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(entity.complianceScore.breakdown).map(([key, value]) => {
              const label: Record<string, string> = {
                incomeVsLifestyle: "Income vs Lifestyle",
                assetVsIncome: "Asset vs Income",
                utilityVsIncome: "Utility vs Income",
                travelVsIncome: "Travel vs Income",
                filingConsistency: "Filing Consistency",
              };
              const pct = value;
              const color =
                pct >= 80 ? "bg-red-500" : pct >= 60 ? "bg-orange-500" : pct >= 40 ? "bg-yellow-500" : "bg-green-500";
              return (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{label[key]}</span>
                    <span className="font-medium text-foreground">{pct}/100</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Collapsible data sections */}
        <div className="space-y-4">
          <Section
            id="tax"
            title="Tax Filing History"
            icon={FileText}
            expanded={expandedSections.has("tax")}
            onToggle={() => toggleSection("tax")}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4">Year</th>
                    <th className="pb-2 pr-4">Declared Income</th>
                    <th className="pb-2 pr-4">Tax Paid</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {entity.taxFilings.map((f) => (
                    <tr key={f.year}>
                      <td className="py-2 pr-4 font-medium">{f.year}</td>
                      <td className="py-2 pr-4">{formatPKR(f.declaredIncome)}</td>
                      <td className="py-2 pr-4">{formatPKR(f.taxPaid)}</td>
                      <td className="py-2 pr-4">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          f.filingStatus === "filed" ? "bg-green-100 text-green-700" :
                          f.filingStatus === "late" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {f.filingStatus === "not_filed" ? "Not Filed" : f.filingStatus === "late" ? "Late" : "Filed"}
                        </span>
                      </td>
                      <td className="py-2 text-muted-foreground">{f.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section
            id="vehicles"
            title={`Vehicles (${entity.vehicles.length})`}
            icon={Car}
            expanded={expandedSections.has("vehicles")}
            onToggle={() => toggleSection("vehicles")}
          >
            {entity.vehicles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No vehicle records found.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {entity.vehicles.map((v) => (
                  <div key={v.registrationNumber} className="rounded-lg border border-border p-3">
                    <p className="font-medium text-foreground">{v.make} {v.model} ({v.year})</p>
                    <p className="text-xs text-muted-foreground">{v.registrationNumber} · {v.engineCC}cc · {v.registeredCity}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section
            id="properties"
            title={`Properties (${entity.properties.length})`}
            icon={Home}
            expanded={expandedSections.has("properties")}
            onToggle={() => toggleSection("properties")}
          >
            {entity.properties.length === 0 ? (
              <p className="text-sm text-muted-foreground">No property records found.</p>
            ) : (
              <div className="space-y-3">
                {entity.properties.map((p, i) => (
                  <div key={i} className="rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground">{p.location}</p>
                        <p className="text-xs text-muted-foreground capitalize">{p.type} · {p.area}</p>
                        <p className="text-xs text-muted-foreground">Registered in: {p.registeredIn}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{formatPKR(p.estimatedValuePKR)}</p>
                        <p className="text-xs text-muted-foreground">Est. Value</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section
            id="utility"
            title="Utility Bills"
            icon={Zap}
            expanded={expandedSections.has("utility")}
            onToggle={() => toggleSection("utility")}
          >
            {entity.utilityBills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No utility records found.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {entity.utilityBills.map((u, i) => (
                  <div key={i} className="rounded-lg border border-border p-3">
                    <p className="font-medium capitalize text-foreground">{u.type} — {u.provider}</p>
                    <p className="text-xs text-muted-foreground">{u.connectionAddress}</p>
                    <div className="mt-2 flex gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Monthly</p>
                        <p className="font-medium text-foreground">{u.averageMonthlyUnits} units</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Bill</p>
                        <p className="font-medium text-foreground">{formatPKR(u.averageMonthlyAmount)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section
            id="travel"
            title={`International Travel (${entity.travelRecords.length} trips)`}
            icon={Plane}
            expanded={expandedSections.has("travel")}
            onToggle={() => toggleSection("travel")}
          >
            {entity.travelRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground">No travel records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="pb-2 pr-4">Destination</th>
                      <th className="pb-2 pr-4">Departure</th>
                      <th className="pb-2 pr-4">Return</th>
                      <th className="pb-2 pr-4">Purpose</th>
                      <th className="pb-2">Airline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {entity.travelRecords.map((t, i) => (
                      <tr key={i}>
                        <td className="py-2 pr-4 font-medium">{t.destination}</td>
                        <td className="py-2 pr-4 text-muted-foreground">{formatDate(t.departureDate)}</td>
                        <td className="py-2 pr-4 text-muted-foreground">{formatDate(t.returnDate)}</td>
                        <td className="py-2 pr-4 capitalize text-muted-foreground">{t.purpose}</td>
                        <td className="py-2 text-muted-foreground">{t.airline ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          {/* Addresses */}
          <Section
            id="addresses"
            title={`Addresses (${entity.addresses.length} records)`}
            icon={MapPin}
            expanded={expandedSections.has("addresses")}
            onToggle={() => toggleSection("addresses")}
          >
            <div className="space-y-2">
              {entity.addresses.map((a, i) => (
                <div key={i} className="flex items-start justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm text-foreground">{a.street}</p>
                    <p className="text-xs text-muted-foreground">{a.city}, {a.province}</p>
                  </div>
                  <span className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs uppercase text-muted-foreground">
                    {a.source}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

// ---- Collapsible section wrapper --------------------------------

interface SectionProps {
  id: string;
  title: string;
  icon: React.ElementType;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Section({ title, icon: Icon, expanded, onToggle, children }: SectionProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 hover:bg-accent/30 transition-colors rounded-t-xl"
      >
        <div className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-foreground text-sm">{title}</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {expanded && <div className="border-t border-border px-5 py-4">{children}</div>}
    </div>
  );
}
