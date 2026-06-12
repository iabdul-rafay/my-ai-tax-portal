// ============================================================
// Utility helpers
// ============================================================

import type { RiskLevel, CaseStatus } from "../types";

/** Format PKR amount with locale formatting */
export function formatPKR(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `PKR ${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `PKR ${(amount / 1_000_000).toFixed(1)}M`;
  }
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

/** Format ISO date string to readable date */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Format ISO date string to readable date-time */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Returns Tailwind color classes for risk level */
export function riskColors(level: RiskLevel): {
  bg: string;
  text: string;
  border: string;
  badge: string;
} {
  switch (level) {
    case "critical":
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-300",
        badge: "bg-red-100 text-red-700 border-red-200",
      };
    case "high":
      return {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-300",
        badge: "bg-orange-100 text-orange-700 border-orange-200",
      };
    case "medium":
      return {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-300",
        badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
      };
    case "low":
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-300",
        badge: "bg-green-100 text-green-700 border-green-200",
      };
  }
}

/** Human-readable risk level label */
export function riskLabel(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    critical: "Critical Risk",
    high: "High Risk",
    medium: "Medium Risk",
    low: "Low Risk",
  };
  return map[level];
}

/** Human-readable case status label */
export function caseStatusLabel(status: CaseStatus): string {
  const map: Record<CaseStatus, string> = {
    open: "Open",
    under_review: "Under Review",
    escalated: "Escalated",
    closed: "Closed",
  };
  return map[status];
}

/** Returns Tailwind classes for case status badge */
export function caseStatusColors(status: CaseStatus): string {
  switch (status) {
    case "open":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "under_review":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "escalated":
      return "bg-red-100 text-red-700 border-red-200";
    case "closed":
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

/** Returns a time-ago label for timestamps */
export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Returns score ring color class */
export function scoreRingColor(score: number): string {
  if (score >= 80) return "#dc2626"; // red-600
  if (score >= 60) return "#ea580c"; // orange-600
  if (score >= 40) return "#ca8a04"; // yellow-600
  return "#16a34a"; // green-600
}
