import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Search,
  Filter,
  ChevronRight,
  MapPin,
  Briefcase,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { entityService } from "../services/entityService";
import type { Entity, SearchFilters, RiskLevel, CaseStatus } from "../types";
import { RiskBadge, CaseStatusBadge } from "../components/shared/StatusBadge";
import { ScoreRing } from "../components/shared/ScoreRing";
import { PageLoader, LoadingSpinner } from "../components/shared/LoadingSpinner";
import { EmptyState } from "../components/shared/EmptyState";
import { ProfileDetailPage } from "./ProfileDetailPage";

export function EntitySearchPage() {
  const { token } = useAuth();
  const { entityId } = useParams();
  const navigate = useNavigate();
  const [allEntities, setAllEntities] = useState<Entity[]>([]);
  const [results, setResults] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    riskLevel: undefined,
    caseStatus: undefined,
  });

  useEffect(() => {
    if (!token) return;
    entityService.getAll(token).then((entities) => {
      setAllEntities(entities);
      setResults(entities);
      setIsLoading(false);
    });
  }, [token]);

  async function handleSearch(newFilters: SearchFilters) {
    if (!token) return;
    setFilters(newFilters);
    setIsSearching(true);
    const { entities } = await entityService.search(newFilters, token);
    setResults(entities);
    setIsSearching(false);
  }

  // If a specific entity is selected, show its detail page
  if (entityId) return <ProfileDetailPage />;

  if (isLoading) return <PageLoader />;

  return (
    <div className="flex h-full gap-0">
      {/* Left: Search panel */}
      <div className="flex w-full flex-col lg:w-96 lg:border-r lg:border-border">
        {/* Search bar */}
        <div className="border-b border-border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) =>
                handleSearch({ ...filters, query: e.target.value })
              }
              placeholder="Search by name, CNIC, profession…"
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>

          {/* Filters */}
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter:</span>
            </div>
            <select
              value={filters.riskLevel ?? ""}
              onChange={(e) =>
                handleSearch({
                  ...filters,
                  riskLevel: (e.target.value as RiskLevel) || undefined,
                })
              }
              className="rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:border-ring"
            >
              <option value="">All Risk Levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filters.caseStatus ?? ""}
              onChange={(e) =>
                handleSearch({
                  ...filters,
                  caseStatus: (e.target.value as CaseStatus) || undefined,
                })
              }
              className="rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:border-ring"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="under_review">Under Review</option>
              <option value="escalated">Escalated</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            {isSearching ? "Searching…" : `${results.length} of ${allEntities.length} entities`}
          </p>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto">
          {isSearching ? (
            <LoadingSpinner message="Searching…" />
          ) : results.length === 0 ? (
            <EmptyState
              title="No entities found"
              description="Try a different name, CNIC, or adjust filters"
            />
          ) : (
            <div className="divide-y divide-border">
              {results.map((entity) => (
                <button
                  key={entity.id}
                  onClick={() => navigate(`/search/${entity.id}`)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent/40 transition-colors"
                >
                  <ScoreRing
                    score={entity.complianceScore.total}
                    level={entity.complianceScore.level}
                    size={52}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {entity.fullName}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CreditCard className="h-3 w-3" />
                      <span className="truncate">{entity.cnic}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Briefcase className="h-3 w-3" />
                      <span className="truncate">{entity.profession}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">
                        {entity.addresses[0]?.city}, {entity.addresses[0]?.province}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <RiskBadge level={entity.complianceScore.level} size="sm" />
                      <CaseStatusBadge status={entity.caseStatus} size="sm" />
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Placeholder when no entity selected (desktop) */}
      <div className="hidden flex-1 items-center justify-center lg:flex">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Search className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">Select an entity</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a record from the list to view their full linked profile
          </p>
        </div>
      </div>
    </div>
  );
}
