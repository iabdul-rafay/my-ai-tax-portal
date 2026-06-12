import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  GitMerge,
  Search,
  CheckCircle,
  AlertCircle,
  Database,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Save,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { EntityMatchingResult } from "../types";
import { RelationshipGraph } from "../components/shared/RelationshipGraph";
import { formatPKR } from "../utils/helpers";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5002/api";

const EXAMPLE_TAXPAYERS = [
  { name: "Zia Khan", cnic: "42101-1234567-3" },
  { name: "Asma Tariq", cnic: "35201-9988776-2" },
  { name: "Muhammad Bilal", cnic: "37405-5555444-1" },
];

export function EntityMatchingPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [cnic, setCnic] = useState("");
  const [loading, setLoading] = useState(false);
  const [matchingStep, setMatchingStep] = useState(0);
  const [result, setResult] = useState<EntityMatchingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [linkedSuccess, setLinkedSuccess] = useState(false);

  const steps = [
    "Normalizing inputs and cleaning text formats...",
    "Scanning NADRA identity base registry...",
    "Fuzzy matching FBR tax filing records (Jaro-Winkler)...",
    "Resolving Excise & Taxation vehicle assets...",
    "Cross-referencing electricity/gas utility addresses...",
    "Compiling travel logs & building Knowledge Graph...",
  ];

  function runSimulatedLoader(callback: () => void) {
    setLoading(true);
    setMatchingStep(0);
    setError(null);
    setResult(null);
    setLinkedSuccess(false);

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setMatchingStep(currentStep);
      } else {
        clearInterval(interval);
        callback();
      }
    }, 600);
  }

  async function handleMatch(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !cnic.trim()) return;

    runSimulatedLoader(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/entities/match`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, cnic }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to match record.");
        }

        const data = await response.json();
        setResult(data);
      } catch (err: any) {
        setError(err.message || "An unexpected matching error occurred.");
      } finally {
        setLoading(false);
      }
    });
  }

  async function handleLinkEntity() {
    if (!result || !token) return;
    setIsLinking(true);

    try {
      const response = await fetch(`${API_BASE_URL}/entities/link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profile: result.resolvedProfile }),
      });

      if (!response.ok) throw new Error("Failed to link entity to database.");

      toast.success("Entity successfully linked to system database.");
      setLinkedSuccess(true);
    } catch {
      toast.error("Failed to save and link profile.");
    } finally {
      setIsLinking(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header bar */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <GitMerge className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Entity Resolution & Linkage</h1>
          <p className="text-sm text-muted-foreground">
            Resolve unlinked database silos in real-time using fuzzy logic and map relationship graphs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Input Console */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h2 className="font-semibold text-foreground">Resolution Console</h2>
            
            <form onSubmit={handleMatch} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Zia Khan"
                  disabled={loading}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  CNIC (National ID)
                </label>
                <input
                  type="text"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  placeholder="e.g. 42101-1234567-3"
                  disabled={loading}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 block"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !name.trim() || !cnic.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                <Search className="h-4 w-4" />
                Cross-Reference databases
              </button>
            </form>

            {/* Examples list */}
            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                Sample Unresolved Identities:
              </p>
              <div className="space-y-1.5">
                {EXAMPLE_TAXPAYERS.map((ex) => (
                  <button
                    key={ex.cnic}
                    onClick={() => {
                      setName(ex.name);
                      setCnic(ex.cnic);
                    }}
                    className="w-full text-left p-2 rounded-lg border border-border bg-muted/20 text-xs hover:bg-accent/40 transition-colors flex items-center justify-between"
                  >
                    <span>{ex.name}</span>
                    <span className="font-mono text-muted-foreground">{ex.cnic}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Engine Status / Explainer */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm text-xs space-y-2 text-muted-foreground leading-relaxed">
            <h3 className="font-semibold text-foreground text-sm">Real-time Fuzzy Engine Specifications:</h3>
            <p>
              💡 **Name Matching:** Utilizes Jaro-Winkler distance string algorithm with a custom honorific parser (Syed, Muhammad, Khan, etc. stripped dynamically).
            </p>
            <p>
              💡 **Address Matching:** Computes token intersection metrics (Jaccard Index) to evaluate location overlap ratios.
            </p>
            <p>
              💡 **CNIC Matching:** Standardizes numeric strings, supporting prefix-segment matching for legacy databases.
            </p>
          </div>
        </div>

        {/* Right: Loading state / Results Panel */}
        <div className="lg:col-span-2">
          {loading && (
            <div className="rounded-xl border border-border bg-card p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px] space-y-6">
              {/* Spinner */}
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <div className="text-center space-y-2">
                <p className="font-semibold text-foreground text-lg">Running Entity Resolution Pipeline</p>
                <p className="text-sm text-muted-foreground animate-pulse">
                  {steps[matchingStep]}
                </p>
              </div>

              {/* Progress track */}
              <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${((matchingStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
              <AlertCircle className="h-10 w-10 text-red-600 mb-3" />
              <h3 className="text-lg font-bold text-red-800">Resolution Failed</h3>
              <p className="text-sm text-red-700 max-w-md mt-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && !result && (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px] text-muted-foreground">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <GitMerge className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground">Awaiting Query Inputs</p>
              <p className="mt-1 text-sm max-w-sm">
                Enter an identity name and CNIC in the left panel, or select a sample taxpayer, to execute the resolution matching pipeline.
              </p>
            </div>
          )}

          {/* Results dashboard */}
          {!loading && !error && result && (
            <div className="space-y-6">
              {/* Summary card */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                      RESOLUTION SUCCESSFUL
                    </span>
                    <h2 className="text-xl font-bold text-foreground mt-1.5">
                      {result.resolvedProfile.fullName}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Resolved CNIC: {result.resolvedProfile.cnic} · {result.resolvedProfile.profession}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Match Confidence</p>
                    <p className="text-3xl font-black text-blue-600">{result.confidenceScore}%</p>
                  </div>
                </div>

                {/* Score bar */}
                <div className="mt-4 border-t border-border pt-4 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Compliance Risk Score</p>
                      <p className="text-lg font-bold text-foreground">{result.resolvedProfile.complianceScore.total}/100</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Risk Category</p>
                      <span className={`inline-block mt-0.5 rounded px-2 py-0.5 text-xs font-semibold uppercase ${
                        result.resolvedProfile.complianceScore.level === 'critical' ? 'bg-red-100 text-red-800' :
                        result.resolvedProfile.complianceScore.level === 'high' ? 'bg-orange-100 text-orange-800' :
                        result.resolvedProfile.complianceScore.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {result.resolvedProfile.complianceScore.level}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {linkedSuccess ? (
                      <button
                        onClick={() => navigate(`/search/${result.resolvedProfile.id}`)}
                        className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        View Full Case Profile
                      </button>
                    ) : (
                      <button
                        onClick={handleLinkEntity}
                        disabled={isLinking}
                        className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        {isLinking ? "Saving..." : "Save & Link Case Profile"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Matched Records Table */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  Linked Source Registries
                </h3>
                <div className="divide-y divide-border text-sm">
                  {result.matchedRecords.map((rec, i) => (
                    <div key={i} className="py-3 flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <span className="inline-block rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-muted text-muted-foreground">
                          {rec.source === "immigration" ? "FIA TRAVEL" : rec.source.toUpperCase()}
                        </span>
                        <p className="mt-1 font-medium text-foreground">
                          {rec.source === "nadra" && rec.record.fullName}
                          {rec.source === "fbr" && rec.record.name}
                          {rec.source === "excise" && `${rec.record.make} ${rec.record.model} (${rec.record.registrationNumber})`}
                          {rec.source === "utility" && `${rec.record.provider} connection (${rec.record.consumerNumber})`}
                          {rec.source === "immigration" && `Passport ${rec.record.passportNumber} (${rec.record.trips.length} flights)`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{rec.reason}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-blue-600 block">Match Score</span>
                        <span className="font-bold text-foreground">{rec.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Relationship Graph visualization */}
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <GitMerge className="h-4 w-4 text-muted-foreground" />
                  Knowledge Graph Relationship Map
                </h3>
                <RelationshipGraph
                  nodes={result.graph.nodes}
                  edges={result.graph.edges}
                />
              </div>

              {/* Compliance findings list */}
              {result.resolvedProfile.auditTrail.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    Automated Risk & Compliance Discrepancy Findings
                  </h3>
                  <div className="space-y-3">
                    {result.resolvedProfile.auditTrail.map((audit) => (
                      <div key={audit.id} className="p-3.5 rounded-lg border border-red-100 bg-red-50/50">
                        <p className="text-sm font-semibold text-red-900">{audit.category}</p>
                        <p className="text-xs text-red-700 font-medium mt-0.5">{audit.finding}</p>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                          {audit.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
