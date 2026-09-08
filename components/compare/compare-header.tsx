import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";

export interface CompareHeaderProps {
  matchCount: number;
  onBack: () => void;
  onClear: () => void;
}

export function CompareHeader({ matchCount, onBack, onClear }: CompareHeaderProps) {
  return (
    <div className="mb-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-4 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-heading-lg mb-2">Compare opportunities</h1>
          <p className="text-foreground-secondary">
            See how your opportunities stack up
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onClear}
          className="shrink-0 gap-2"
        >
          <X className="h-4 w-4" />
          Clear comparison
        </Button>
      </div>

      <div className="mt-4 text-sm text-foreground-muted">
        Comparing {matchCount} {matchCount === 1 ? "opportunity" : "opportunities"}
      </div>
    </div>
  );
}
