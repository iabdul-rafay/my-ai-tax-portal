import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import {
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { entityService } from "../services/entityService";
import { riskService } from "../services/riskService";
import type { Entity, AuditEntry, RiskLevel } from "../types";
import { RiskBadge } from "../components/shared/StatusBadge";
import { PageLoader } from "../components/shared/LoadingSpinner";
import { EmptyState } from "../components/shared/EmptyState";
import { formatDateTime } from "../utils/helpers";

const sourceLabel: Record<string, string> = {
  fbr: "FBR",
  nadra: "NADRA",
  excise: "Excise",
  utility: "Utility",
  property: "Property Registry",
  immigration: "FIA Immigration",
};

function SeverityIcon({ level }: { level: RiskLevel }) {
  switch (level) {
    case "critical":
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    case "high":
      return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    case "medium":
      return <Info className="h-4 w-4 text-yellow-600" />;
    case "low":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  }
}

export function AuditTrailPage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get("entityId");

  const [entities, setEntities] = useState<Entity[]>([]);
  const [selected, setSelected] = useState<Entity | null>(null);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<RiskLevel | "">("");
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    entityService.getAll(token).then((all) => {
      setEntities(all);
      const preselect = preselectedId
        ? all.find((e) => e.id === preselectedId)
        : all.find((e) => e.auditTrail.length > 0);
      if (preselect) {
        setSelected(preselect);
        riskService.getAuditTrail(preselect.id, token).then(setAuditEntries);
      }
      setIsLoading(false);
    });
  }, [token, preselectedId]);

  async function selectEntity(entity: Entity) {
    if (!token) return;
    setSelected(entity);
    setFilterSeverity("");
    const entries = await riskService.getAuditTrail(entity.id, token);
    setAuditEntries(entries);
  }

  const filteredEntries = filterSeverity
    ? auditEntries.filter((e) => e.severity === filterSeverity)
    : auditEntries;

  if (isLoading) return <PageLoader />;

  return (
    <div className="flex h-full">
      {/* Entity selector */}
      <div className="hidden w-64 flex-shrink-0 overflow-y-auto border-r border-border lg:block">
        <div className="border-b border-border px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Cases with Audit Trail
          </p>
        </div>
        {entities
          .filter((e) => e.auditTrail.length > 0)
          .map((e) => (
            <button
              key={e.id}
              onClick={() => selectEntity(e)}
              className={`flex w-full flex-col px-4 py-3 text-left transition-colors ${
                selected?.id === e.id ? "bg-primary/10" : "hover:bg-accent/30"
              }`}
            >
              <p className="text-sm font-medium text-foreground">{e.fullName}</p>
              <p className="text-xs text-muted-foreground">{e.auditTrail.length} findings</p>
              <RiskBadge level={e.complianceScore.level} size="sm" />
            </button>
          ))}
      </div>

      {/* Audit entries */}
      <div className="flex-1 overflow-y-auto p-6">
        {selected ? (
          <>
            <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm">
              <h2 className="font-semibold text-foreground">{selected.fullName}</h2>
              <p className="text-sm text-muted-foreground">{selected.cnic} · {selected.profession}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <RiskBadge level={selected.complianceScore.level} />
                <div className="flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value as RiskLevel | "")}
                    className="rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none"
                  >
                    <option value="">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <span className="text-xs text-muted-foreground">
                  {filteredEntries.length} finding{filteredEntries.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {filteredEntries.length === 0 ? (
              <EmptyState title="No audit entries" description="Try removing severity filter" />
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 h-full w-0.5 bg-border" />

                <div className="space-y-4 pl-12">
                  {filteredEntries.map((entry) => (
                    <div key={entry.id} className="relative">
                      {/* Timeline dot */}
                      <div
                        className={`absolute -left-7 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background ${
                          entry.severity === "critical" ? "bg-red-100" :
                          entry.severity === "high" ? "bg-orange-100" :
                          entry.severity === "medium" ? "bg-yellow-100" :
                          "bg-green-100"
                        }`}
                      >
                        <SeverityIcon level={entry.severity} />
                      </div>

                      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                        <button
                          onClick={() =>
                            setExpandedEntry(
                              expandedEntry === entry.id ? null : entry.id
                            )
                          }
                          className="w-full p-4 text-left hover:bg-accent/20 transition-colors"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <RiskBadge level={entry.severity} size="sm" />
                              <span className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                                {sourceLabel[entry.dataSource] ?? entry.dataSource}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDateTime(entry.timestamp)}
                            </div>
                          </div>
                          <p className="mt-2 font-medium text-foreground">{entry.category}</p>
                          <p className="mt-0.5 text-sm text-muted-foreground">{entry.finding}</p>
                        </button>

                        {expandedEntry === entry.id && (
                          <div className="border-t border-border bg-muted/20 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                              Detailed Explanation
                            </p>
                            <p className="text-sm text-foreground leading-relaxed">{entry.detail}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analyst notes */}
            {selected.analystNotes.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-3 font-semibold text-foreground">Analyst Notes</h3>
                <div className="space-y-3">
                  {selected.analystNotes.map((note) => (
                    <div key={note.id} className="rounded-xl border border-border bg-amber-50/50 p-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-sm font-medium text-foreground">{note.authorName}</span>
                        <span className="text-xs text-muted-foreground">{formatDateTime(note.timestamp)}</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="Select an entity"
            description="Choose a case from the list to view its audit trail and findings"
          />
        )}
      </div>
    </div>
  );
}
