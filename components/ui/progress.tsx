"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Progress({
  value,
  max = 100,
  className,
  barClassName,
  showLabel = false,
  size = "md",
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-surface-muted",
          sizes[size]
        )}
      >
        <motion.div
          className={cn(
            "h-full rounded-full bg-brand transition-colors",
            barClassName
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-sm text-foreground-secondary">
          {value} / {max}
        </p>
      )}
    </div>
  );
}
