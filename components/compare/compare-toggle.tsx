"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, CheckCircle } from "lucide-react";
import { useCompareStore } from "@/store/compare-store";
import { useCompareHydration } from "@/hooks/use-compare-hydration";

export interface CompareToggleProps {
  jobId: string;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CompareToggle({
  jobId,
  variant = "secondary",
  size = "sm",
  className,
}: CompareToggleProps) {
  const hasHydrated = useCompareHydration();

  // Before hydration: use deterministic default state
  // After hydration: use persisted session state
  const isSelected = useCompareStore((state) => hasHydrated && state.isSelected(jobId));
  const canAddMore = useCompareStore((state) => state.canAddMore());
  const addJobId = useCompareStore((state) => state.addJobId);
  const removeJobId = useCompareStore((state) => state.removeJobId);

  const handleToggle = () => {
    if (isSelected) {
      removeJobId(jobId);
    } else {
      addJobId(jobId);
    }
  };

  // Disable before hydration to prevent early interaction race
  const disabled = !hasHydrated || (!isSelected && !canAddMore);

  return (
    <Button
      variant={isSelected ? "primary" : variant}
      size={size}
      onClick={handleToggle}
      disabled={disabled}
      className={className}
      aria-pressed={isSelected}
      aria-label={isSelected ? "Remove from comparison" : "Add to comparison"}
    >
      {isSelected ? (
        <>
          <CheckCircle className="h-4 w-4" />
          Comparing
        </>
      ) : (
        <>
          <PlusCircle className="h-4 w-4" />
          Compare
        </>
      )}
    </Button>
  );
}
