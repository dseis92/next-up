"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface RadarErrorBoundaryProps {
  children: ReactNode;
  onReturnToList: () => void;
}

interface RadarErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary for Opportunity Radar
 *
 * Isolates Radar failures to prevent breaking List/Deck modes.
 */
export class RadarErrorBoundary extends Component<
  RadarErrorBoundaryProps,
  RadarErrorBoundaryState
> {
  constructor(props: RadarErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): RadarErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error("Radar Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-[var(--radius-lg)] bg-surface p-12 text-center">
          <p className="text-foreground mb-4">
            Unable to display Opportunity Radar right now.
          </p>
          <Button variant="primary" onClick={this.props.onReturnToList}>
            Return to List
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
