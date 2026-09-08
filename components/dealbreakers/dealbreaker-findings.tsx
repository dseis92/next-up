/**
 * Detailed dealbreaker findings display
 * Shows all rule evaluations with outcomes and explanations
 */

import { AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
import type { DealbreakerEvaluation, DealbreakerFinding } from "@/lib/dealbreakers/types";

export interface DealbreakerFindingsProps {
  evaluation: DealbreakerEvaluation;
}

export function DealbreakerFindings({ evaluation }: DealbreakerFindingsProps) {
  const { status, findings, conflictCount, unknownCount } = evaluation;

  // Don't show if inactive
  if (status === "inactive") {
    return null;
  }

  return (
    <div className="bg-surface-secondary rounded-lg border border-surface-tertiary p-6">
      <div className="mb-4">
        <h3 className="text-foreground text-body-lg mb-1 font-medium">Your dealbreakers</h3>

        {/* Summary */}
        {status === "clear" && (
          <p className="text-foreground-secondary text-body-sm">
            No dealbreaker conflicts found.
          </p>
        )}

        {(status === "conflict" || status === "unknown") && (
          <p className="text-foreground-secondary text-body-sm">
            {conflictCount > 0 && (
              <span>
                {conflictCount} {conflictCount === 1 ? "conflict" : "conflicts"}
              </span>
            )}
            {conflictCount > 0 && unknownCount > 0 && <span> · </span>}
            {unknownCount > 0 && (
              <span>
                {unknownCount} {unknownCount === 1 ? "preference" : "preferences"} unknown
              </span>
            )}
          </p>
        )}
      </div>

      {/* Individual findings */}
      <div className="space-y-3">
        {findings.map((finding, index) => (
          <FindingRow key={index} finding={finding} />
        ))}
      </div>
    </div>
  );
}

function FindingRow({ finding }: { finding: DealbreakerFinding }) {
  const { outcome, title, explanation } = finding;

  return (
    <div className="flex items-start gap-3">
      {/* Icon */}
      <div className="mt-0.5 flex-shrink-0">
        {outcome === "pass" && <CheckCircle className="text-success h-5 w-5" />}
        {outcome === "conflict" && <AlertTriangle className="text-error h-5 w-5" />}
        {outcome === "unknown" && <HelpCircle className="text-foreground-secondary h-5 w-5" />}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-foreground text-body-sm mb-0.5 font-medium">{title}</p>
        <p
          className={
            outcome === "conflict"
              ? "text-error text-body-sm"
              : outcome === "unknown"
                ? "text-foreground-secondary text-body-sm"
                : "text-foreground-secondary text-body-sm"
          }
        >
          {explanation}
        </p>
      </div>
    </div>
  );
}
