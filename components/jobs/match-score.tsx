"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MatchScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function MatchScore({
  score,
  size = "md",
  showLabel = true,
  className,
}: MatchScoreProps) {
  const percentage = Math.min(Math.max(score, 0), 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizes = {
    sm: {
      container: "h-14 w-14",
      text: "text-lg",
      stroke: "5",
    },
    md: {
      container: "h-20 w-20",
      text: "text-2xl",
      stroke: "6",
    },
    lg: {
      container: "h-24 w-24",
      text: "text-3xl",
      stroke: "7",
    },
  };

  const getLabel = () => {
    if (score >= 90) return "Great fit";
    if (score >= 80) return "Strong fit";
    if (score >= 70) return "Worth a look";
    return "Possible fit";
  };

  const getStrokeColor = () => {
    if (score >= 90) return "#22c55e";
    if (score >= 80) return "#a3e635";
    return "#94a3b8";
  };

  const getTextColor = () => {
    if (score >= 90) return "text-green-500";
    if (score >= 80) return "text-brand";
    return "text-gray-400";
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center",
          sizes[size].container
        )}
      >
        <svg className="h-full w-full -rotate-90 transform">
          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth={sizes[size].stroke}
            className="text-surface-muted"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth={sizes[size].stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn("font-bold", sizes[size].text, getTextColor())}
          >
            {Math.round(score)}%
          </span>
        </div>
      </div>
      {showLabel && (
        <div className="min-w-0">
          <p className={cn("truncate font-semibold", getTextColor())}>
            {getLabel()}
          </p>
          <p className="truncate text-sm text-foreground-muted">Match score</p>
        </div>
      )}
    </div>
  );
}
