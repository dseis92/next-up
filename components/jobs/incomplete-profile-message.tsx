import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface IncompleteProfileMessageProps {
  variant?: "inline" | "card";
}

export function IncompleteProfileMessage({
  variant = "card",
}: IncompleteProfileMessageProps) {
  const content = (
    <div className="flex items-start gap-3">
      <AlertCircle className="h-5 w-5 shrink-0 text-warning" />
      <div className="flex-1">
        <p className="mb-2 font-medium text-foreground">
          Finish your profile to see your match
        </p>
        <p className="mb-3 text-sm text-foreground-secondary">
          Complete your profile to get personalized match scores for this
          opportunity.
        </p>
        <Link href="/onboarding">
          <Button variant="primary" size="sm">
            Complete profile
          </Button>
        </Link>
      </div>
    </div>
  );

  if (variant === "inline") {
    return <div className="rounded-lg bg-warning/10 p-4">{content}</div>;
  }

  return (
    <Card variant="elevated" className="p-4">
      {content}
    </Card>
  );
}
