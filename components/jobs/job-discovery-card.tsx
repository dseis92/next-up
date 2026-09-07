"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { MatchScore } from "./match-score";
import { formatSalary, formatRelativeDate, cn } from "@/lib/utils";
import { scaleIn } from "@/lib/motion";
import { Bookmark, X, ArrowRight, MapPin } from "lucide-react";
import type { JobMatch } from "@/types";

export interface JobDiscoveryCardProps {
  match: JobMatch;
  onSave?: () => void;
  onPass?: () => void;
  onViewDetails?: () => void;
  disabled?: boolean;
}

export function JobDiscoveryCard({
  match,
  onSave,
  onPass,
  onViewDetails,
  disabled = false,
}: JobDiscoveryCardProps) {
  const { job, overall_score, matched_skills, reasons_fit } = match;

  return (
    <motion.div
      variants={scaleIn}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      <Card variant="elevated" className="overflow-hidden">
        <div className="p-5">
          {/* Header - More Compact */}
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <Avatar
                name={job.company.name}
                size="md"
                className="shrink-0 bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {job.company.name}
                </p>
                <p className="truncate text-xs text-foreground-muted">
                  {formatRelativeDate(new Date(job.posted_date))}
                </p>
              </div>
            </div>
          </div>

          {/* Job Title - Slightly Smaller */}
          <h3 className="mb-2 text-xl font-semibold leading-tight text-foreground">
            {job.title}
          </h3>

          {/* Meta Info - More Compact */}
          <div className="mb-3 flex flex-wrap items-center gap-1.5 text-sm text-foreground-secondary">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-xs">{job.location}</span>
            </div>
            <span className="text-xs">•</span>
            <span className="text-xs capitalize">
              {job.work_arrangement.replace("_", " ")}
            </span>
          </div>

          {/* Salary - Larger and Bold */}
          {job.salary_min && (
            <div className="mb-3">
              <p className="text-2xl font-bold text-foreground">
                {formatSalary(
                  job.salary_min,
                  job.salary_max,
                  job.salary_period
                )}
              </p>
            </div>
          )}

          {/* Match Score - More Prominent */}
          <div className="mb-3">
            <MatchScore score={overall_score} size="md" />
          </div>

          {/* Skills - Condensed */}
          <div className="mb-3">
            <p className="mb-1.5 text-xs font-medium text-foreground-muted">
              Your strengths
            </p>
            <div className="flex flex-wrap gap-1.5">
              {matched_skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="brand" size="sm">
                  {skill}
                </Badge>
              ))}
              {matched_skills.length > 4 && (
                <Badge variant="muted" size="sm">
                  +{matched_skills.length - 4}
                </Badge>
              )}
            </div>
          </div>

          {/* Top reason - Condensed */}
          {reasons_fit.length > 0 && (
            <div className="mb-4 rounded-lg bg-brand/5 p-2.5">
              <p className="text-sm leading-snug text-foreground-secondary">
                {reasons_fit[0]}
              </p>
            </div>
          )}

          {/* Actions - Improved Layout */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onPass}
              disabled={disabled}
              size="md"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="flex-1"
              onClick={onSave}
              disabled={disabled}
              size="md"
            >
              <Bookmark className="mr-1.5 h-4 w-4" />
              Save
            </Button>
            <Link href={`/jobs/${job.id}`} className="flex-1">
              <Button
                variant="primary"
                className="w-full"
                onClick={onViewDetails}
                disabled={disabled}
                size="md"
              >
                Details
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
