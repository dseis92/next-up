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
import { Bookmark, X, ArrowRight, MapPin, Briefcase } from "lucide-react";
import type { JobMatch } from "@/types";

export interface JobDiscoveryCardProps {
  match: JobMatch;
  onSave?: () => void;
  onPass?: () => void;
  onViewDetails?: () => void;
}

export function JobDiscoveryCard({
  match,
  onSave,
  onPass,
  onViewDetails,
}: JobDiscoveryCardProps) {
  const { job, overall_score, matched_skills, reasons_fit, reasons_concern } =
    match;

  return (
    <motion.div
      variants={scaleIn}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      <Card variant="elevated" className="overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                name={job.company.name}
                size="lg"
                className="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {job.company.name}
                </p>
                <p className="text-xs text-foreground-muted">
                  {formatRelativeDate(new Date(job.posted_date))}
                </p>
              </div>
            </div>
          </div>

          {/* Job Title */}
          <h3 className="text-heading mb-2">{job.title}</h3>

          {/* Meta Info */}
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-foreground-secondary">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span className="capitalize">
                {job.work_arrangement.replace("_", " ")}
              </span>
            </div>
            <span>•</span>
            <span className="capitalize">
              {job.employment_type.replace("_", " ")}
            </span>
          </div>

          {/* Salary */}
          {job.salary_min && (
            <div className="mb-4">
              <p className="text-display text-foreground">
                {formatSalary(
                  job.salary_min,
                  job.salary_max,
                  job.salary_period
                )}
              </p>
              {job.salary_is_estimated && (
                <p className="text-xs text-foreground-muted">Estimated</p>
              )}
            </div>
          )}

          {/* Match Score */}
          <div className="mb-4">
            <MatchScore score={overall_score} size="md" />
          </div>

          {/* Why it fits */}
          <div className="mb-4">
            <p className="mb-2 text-sm font-semibold text-foreground">
              Why it fits
            </p>
            <div className="flex flex-wrap gap-2">
              {matched_skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="brand" size="sm">
                  {skill}
                </Badge>
              ))}
              {matched_skills.length > 4 && (
                <Badge variant="muted" size="sm">
                  +{matched_skills.length - 4} more
                </Badge>
              )}
            </div>
          </div>

          {/* Top reason */}
          {reasons_fit.length > 0 && (
            <div className="mb-4 rounded-lg bg-brand/5 p-3">
              <p className="text-sm text-foreground-secondary">
                {reasons_fit[0]}
              </p>
            </div>
          )}

          {/* Watch out */}
          {reasons_concern.length > 0 && (
            <div className="mb-4">
              <p className="mb-1 text-xs font-medium text-foreground-muted">
                Worth knowing
              </p>
              <p className="text-sm text-foreground-secondary">
                {reasons_concern[0]}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onPass}
              size="lg"
            >
              <X className="mr-2 h-5 w-5" />
              Pass
            </Button>
            <Button
              variant="ghost"
              className="flex-1"
              onClick={onSave}
              size="lg"
            >
              <Bookmark className="mr-2 h-5 w-5" />
              Save
            </Button>
            <Link href={`/jobs/${job.id}`} className="flex-1">
              <Button
                variant="primary"
                className="w-full"
                onClick={onViewDetails}
                size="lg"
              >
                Details
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
