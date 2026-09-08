"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ArrowRight } from "lucide-react";
import { useCompareStore } from "@/store/compare-store";
import { buildCompareUrl } from "@/lib/compare/query";

export function CompareTray() {
  const router = useRouter();
  const selectedJobIds = useCompareStore((state) => state.selectedJobIds);
  const removeJobId = useCompareStore((state) => state.removeJobId);

  if (selectedJobIds.length === 0) {
    return null;
  }

  const canCompare = selectedJobIds.length >= 2;

  const handleCompare = () => {
    const url = buildCompareUrl(selectedJobIds);
    router.push(url);
  };

  return (
    <div
      className="fixed bottom-20 left-0 right-0 z-40 px-4 pb-4 md:bottom-4"
      role="region"
      aria-label="Comparison tray"
    >
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-foreground font-semibold">
              Compare opportunities
            </h3>
            <span className="text-foreground-muted text-sm">
              {selectedJobIds.length} / 4
            </span>
          </div>

          {selectedJobIds.length === 1 && (
            <p className="text-foreground-secondary mb-3 text-sm">
              Select at least one more opportunity
            </p>
          )}

          {selectedJobIds.length === 4 && (
            <p className="text-foreground-secondary mb-3 text-sm">
              Maximum 4 opportunities selected
            </p>
          )}

          <div className="mb-3 flex flex-wrap gap-2">
            {selectedJobIds.map((jobId, index) => (
              <Badge
                key={jobId}
                variant="brand"
                className="gap-2"
              >
                <span>Opportunity {index + 1}</span>
                <button
                  onClick={() => removeJobId(jobId)}
                  className="hover:bg-brand-hover rounded-full p-0.5 transition-colors"
                  aria-label={`Remove opportunity ${index + 1} from comparison`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleCompare}
            disabled={!canCompare}
            className="w-full gap-2"
          >
            {canCompare ? "Compare opportunities" : "Select one more"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
