import { useEffect, useState } from "react";
import { Database, CheckCircle2, AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { dataSourceService } from "../services/dataSourceService";
import type { DataSource } from "../types";
import { PageLoader } from "../components/shared/LoadingSpinner";
import { formatDateTime } from "../utils/helpers";

const sourceIcons: Record<string, string> = {
  fbr: "🏛️",
  nadra: "🪪",
  excise: "🚗",
  utility: "⚡",
  property: "🏘️",
  immigration: "✈️",
};

function StatusIndicator({ status }: { status: DataSource["status"] }) {
  switch (status) {
    case "active":
      return (
        <div className="flex items-center gap-1.5 text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-xs font-medium">Active</span>
        </div>
      );
    case "stale":
      return (
        <div className="flex items-center gap-1.5 text-yellow-700">
          <Clock className="h-4 w-4" />
          <span className="text-xs font-medium">Stale</span>
        </div>
      );
    case "error":
      return (
        <div className="flex items-center gap-1.5 text-red-700">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs font-medium">Error</span>
        </div>
      );
  }
}

export function DataSourcesPage() {
  const { token } = useAuth();
  const [sources, setSources] = useState<DataSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    dataSourceService.getAll(token).then((s) => {
      setSources(s);
      setIsLoading(false);
    });
  }, [token]);

  if (isLoading) return <PageLoader />;

  const activeCount = sources.filter((s) => s.status === "active").length;
  const totalRecords = sources.reduce((sum, s) => sum + s.recordCount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Connected Sources", value: sources.length, icon: Database, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active / Healthy", value: activeCount, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
          { label: "Total Records", value: (totalRecords / 1_000_000).toFixed(1) + "M", icon: RefreshCw, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Stale / Error", value: sources.filter((s) => s.status !== "active").length, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className={`mb-2 inline-flex rounded-lg p-2 ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <p className="text-xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Data source cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sources.map((source) => (
          <div
            key={source.id}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{sourceIcons[source.type] ?? "📦"}</span>
                <div>
                  <p className="font-semibold text-foreground text-sm">{source.name}</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{source.type}</p>
                </div>
              </div>
              <StatusIndicator status={source.status} />
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">{source.description}</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-2.5">
                <p className="text-xs text-muted-foreground">Records</p>
                <p className="font-semibold text-foreground text-sm">
                  {source.recordCount.toLocaleString("en-PK")}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5">
                <p className="text-xs text-muted-foreground">Last Synced</p>
                <p className="font-semibold text-foreground text-sm">
                  {formatDateTime(source.lastSynced)}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Available Fields</p>
              <div className="flex flex-wrap gap-1">
                {source.fields.map((field) => (
                  <span
                    key={field}
                    className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info box */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <h3 className="mb-1 font-semibold text-blue-900">About Data Integration</h3>
        <p className="text-sm text-blue-800 leading-relaxed">
          This system cross-references records from six government databases to build a unified
          compliance picture per entity. Data is ingested via secure government-to-government (G2G)
          APIs and is updated on a rolling basis. Field-level record matching uses CNIC as the
          primary key, with fuzzy name matching as a secondary identifier for alias detection.
        </p>
      </div>
    </div>
  );
}
