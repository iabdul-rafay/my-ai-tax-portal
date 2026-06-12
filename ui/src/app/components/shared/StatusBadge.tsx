import type { RiskLevel, CaseStatus } from "../../types";
import { riskColors, riskLabel, caseStatusColors, caseStatusLabel } from "../../utils/helpers";

interface RiskBadgeProps {
  level: RiskLevel;
  size?: "sm" | "md";
}

export function RiskBadge({ level, size = "md" }: RiskBadgeProps) {
  const colors = riskColors(level);
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${sizeClass} ${colors.badge}`}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {riskLabel(level)}
    </span>
  );
}

interface CaseStatusBadgeProps {
  status: CaseStatus;
  size?: "sm" | "md";
}

export function CaseStatusBadge({ status, size = "md" }: CaseStatusBadgeProps) {
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizeClass} ${caseStatusColors(status)}`}
    >
      {caseStatusLabel(status)}
    </span>
  );
}
