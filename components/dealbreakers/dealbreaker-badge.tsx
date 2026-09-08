/**
 * Compact dealbreaker status badge
 * Shows conflict/unknown count in a minimal format
 */

import { AlertTriangle, HelpCircle } from "lucide-react";
import type { DealbreakerEvaluation } from "@/lib/dealbreakers/types";

export interface DealbreakerBadgeProps {
  evaluation: DealbreakerEvaluation;
  size?: "sm" | "md";
}

export function DealbreakerBadge({ evaluation, size = "sm" }: DealbreakerBadgeProps) {
  const { status, conflictCount, unknownCount } = evaluation;

  // Don't show badge if inactive or clear
  if (status === "inactive" || status === "clear") {
    return null;
  }

  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  // Conflict state
  if (status === "conflict") {
    return (
      <div className="bg-error/10 text-error inline-flex items-center gap-1.5 rounded-full border border-error/20 px-2.5 py-1">
        <AlertTriangle className={iconSize} />
        <span className={`${textSize} font-medium`}>
          {conflictCount} {conflictCount === 1 ? "conflict" : "conflicts"}
        </span>
      </div>
    );
  }

  // Unknown state
  if (status === "unknown") {
    return (
      <div className="bg-surface-tertiary text-foreground-secondary inline-flex items-center gap-1.5 rounded-full border border-surface-tertiary px-2.5 py-1">
        <HelpCircle className={iconSize} />
        <span className={`${textSize} font-medium`}>
          {unknownCount} {unknownCount === 1 ? "unknown" : "unknown"}
        </span>
      </div>
    );
  }

  return null;
}
