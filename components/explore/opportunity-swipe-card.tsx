"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { MapPin, Briefcase, X, Heart, Info } from "lucide-react";
import { formatSalary } from "@/lib/utils";
import type { JobMatch } from "@/types";

export interface OpportunitySwipeCardProps {
  match: JobMatch;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onDetails?: () => void;
  disabled?: boolean;
  zIndex?: number;
}

const SWIPE_THRESHOLD = 100;

export function OpportunitySwipeCard({
  match,
  onSwipeLeft,
  onSwipeRight,
  onDetails,
  disabled = false,
  zIndex = 0,
}: OpportunitySwipeCardProps) {
  const { job, overall_score, matched_skills, reasons_fit } = match;
  const [exitX, setExitX] = useState(0);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -50, 0, 50, 200], [0, 1, 1, 1, 0]);

  // Indicator opacity for swipe direction
  const passOpacity = useTransform(x, [-200, -SWIPE_THRESHOLD, 0], [1, 0.7, 0]);
  const saveOpacity = useTransform(x, [0, SWIPE_THRESHOLD, 200], [0, 0.7, 1]);

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;

    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Determine swipe direction
    if (offset < -SWIPE_THRESHOLD || velocity < -500) {
      setExitX(-300);
      onSwipeLeft?.();
    } else if (offset > SWIPE_THRESHOLD || velocity > 500) {
      setExitX(300);
      onSwipeRight?.();
    }
  };

  return (
    <motion.div
      drag={!disabled ? "x" : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      style={{
        x,
        rotate,
        opacity,
        zIndex,
      }}
      animate={
        exitX !== 0
          ? {
              x: exitX,
              opacity: 0,
              transition: { duration: 0.2 },
            }
          : {}
      }
      className="absolute w-full"
    >
      <Card variant="elevated" className="relative overflow-hidden shadow-2xl">
        {/* Pass Indicator */}
        <motion.div
          style={{ opacity: passOpacity }}
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-red-500/20"
        >
          <div className="flex items-center gap-2 rounded-full bg-red-500 px-6 py-3">
            <X className="h-6 w-6 text-white" />
            <span className="text-lg font-bold text-white">PASS</span>
          </div>
        </motion.div>

        {/* Save Indicator */}
        <motion.div
          style={{ opacity: saveOpacity }}
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-brand/20"
        >
          <div className="flex items-center gap-2 rounded-full bg-brand px-6 py-3">
            <Heart className="h-6 w-6 fill-current text-surface" />
            <span className="text-lg font-bold text-surface">SAVE</span>
          </div>
        </motion.div>

        {/* Card Content */}
        <div className="p-6">
          {/* Header */}
          <div className="mb-4 flex items-start gap-4">
            <Avatar
              name={job.company.name}
              size="xl"
              className="shrink-0 bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-heading-lg mb-2 line-clamp-2">{job.title}</h2>
              <p className="text-foreground-secondary mb-2 text-lg font-medium">
                {job.company.name}
              </p>
            </div>
            <Badge
              variant={overall_score >= 90 ? "success" : "brand"}
              size="lg"
              className="shrink-0 text-lg font-bold"
            >
              {overall_score}%
            </Badge>
          </div>

          {/* Details */}
          <div className="mb-4 space-y-2 text-sm text-foreground-secondary">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 shrink-0" />
              <span className="capitalize">
                {job.work_arrangement.replace("_", " ")} • {job.employment_type.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Salary */}
          {job.salary_min && (
            <div className="mb-4">
              <p className="text-display text-foreground">
                {formatSalary(job.salary_min, job.salary_max, job.salary_period)}
              </p>
            </div>
          )}

          {/* Matched Skills */}
          <div className="mb-4">
            <p className="text-foreground-muted mb-2 text-xs font-medium uppercase">
              Your matched skills
            </p>
            <div className="flex flex-wrap gap-2">
              {matched_skills.slice(0, 6).map((skill) => (
                <Badge key={skill} variant="muted" size="sm">
                  {skill}
                </Badge>
              ))}
              {matched_skills.length > 6 && (
                <Badge variant="muted" size="sm">
                  +{matched_skills.length - 6} more
                </Badge>
              )}
            </div>
          </div>

          {/* Top Fit Reason */}
          {reasons_fit.length > 0 && (
            <div className="mb-4">
              <p className="text-foreground-muted mb-2 text-xs font-medium uppercase">
                Why this fits
              </p>
              <p className="text-foreground text-sm">{reasons_fit[0]}</p>
            </div>
          )}

          {/* Details Button */}
          <button
            onClick={onDetails}
            disabled={disabled}
            className="text-brand flex w-full items-center justify-center gap-2 rounded-lg border-2 border-border bg-surface px-4 py-3 text-sm font-medium transition-colors hover:border-brand disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="View job details"
          >
            <Info className="h-4 w-4" />
            View full details
          </button>
        </div>
      </Card>
    </motion.div>
  );
}
