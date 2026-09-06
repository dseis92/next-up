"use client";

import { motion } from "framer-motion";
import { cn, formatMatchScore, getMatchLabel } from "@/lib/utils";

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
      container: "h-12 w-12",
      text: "text-sm",
      stroke: "4",
    },
    md: {
      container: "h-16 w-16",
      text: "text-xl",
      stroke: "5",
    },
    lg: {
      container: "h-20 w-20",
      text: "text-2xl",
      stroke: "6",
    },
  };

  const getColor = () => {
    if (score >= 90) return "text-match-high";
    if (score >= 80) return "text-match-medium";
    return "text-match-low";
  };

  const getGradient = () => {
    if (score >= 90) return "from-brand to-green-500";
    if (score >= 80) return "from-brand to-yellow-500";
    return "from-gray-400 to-gray-500";
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center",
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
            stroke="url(#matchGradient)"
            strokeWidth={sizes[size].stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="matchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop
                offset="0%"
                className={cn("stop-color-brand", getGradient().split(" ")[0])}
              />
              <stop
                offset="100%"
                className={cn(getGradient().split(" ")[1])}
              />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold", sizes[size].text, getColor())}>
            {Math.round(score)}
          </span>
        </div>
      </div>
      {showLabel && (
        <div>
          <p className={cn("font-semibold", getColor())}>
            {getMatchLabel(score)}
          </p>
          <p className="text-sm text-foreground-muted">Match score</p>
        </div>
      )}
    </div>
  );
}
