"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DealbreakerBadge } from "@/components/dealbreakers/dealbreaker-badge";
import { CompareToggle } from "@/components/compare/compare-toggle";
import { MapPin, ChevronRight, Layers } from "lucide-react";
import { formatSalary } from "@/lib/utils";
import { adaptJobsForRadar } from "@/lib/radar/adapters";
import { generateRadarResults } from "@/lib/radar";
import type { JobMatch } from "@/types";
import type { DealbreakerEvaluation } from "@/lib/dealbreakers/types";
import type { RadarCategoryResult } from "@/lib/radar/types";

interface OpportunityRadarProps {
  allMatches: JobMatch[];
  dealbreakerEvaluations: Map<string, DealbreakerEvaluation>;
}

export function OpportunityRadar({
  allMatches,
  dealbreakerEvaluations,
}: OpportunityRadarProps) {
  const router = useRouter();

  // Capture asOfMs at component mount time (not during every render)
  const [asOfMs] = useState(() => Date.now());

  // Generate Radar categories from matches
  const radarResults = useMemo(() => {
    // Transform JobMatch[] to RadarJobInput[]
    const jobs = allMatches.map((m) => m.job);
    const matchResults = allMatches.map((m) => ({
      status: "scored" as const,
      overallScore: m.overall_score,
      qualificationScore: m.qualification_score,
      lifestyleScore: m.lifestyle_score,
      breakdown: {
        skills: { score: m.breakdown.skills, weight: 25, confidence: "high" as const },
        experience: { score: m.breakdown.experience, weight: 20, confidence: "high" as const },
        salary: { score: m.breakdown.salary, weight: 15, confidence: "high" as const },
        location: { score: m.breakdown.location, weight: 10, confidence: "high" as const },
        workArrangement: { score: m.breakdown.work_arrangement, weight: 10, confidence: "high" as const },
        careerGoals: { score: m.breakdown.career_goals, weight: 10, confidence: "high" as const },
        seniority: { score: 0, weight: 5, confidence: "unknown" as const },
        userPriorities: { score: 0, weight: 5, confidence: "unknown" as const },
      },
      matchedSkills: m.matched_skills,
      missingSkills: m.missing_skills,
      hardFailures: [],
      reasonsFit: m.reasons_fit.map((text) => ({ text, component: "skills", priority: 1 })),
      reasonsConcern: m.reasons_concern.map((text) => ({ text, component: "skills", priority: 1 })),
    }));

    const radarInputs = adaptJobsForRadar(jobs, matchResults);

    return generateRadarResults(radarInputs, asOfMs);
  }, [allMatches, asOfMs]);

  return (
    <div className="space-y-8">
      {/* Best Matches */}
      <RadarCategorySection
        result={radarResults.bestMatches}
        title="Best Matches"
        description="Your top-scoring opportunities"
        emptyMessage="No jobs match your criteria yet"
        dealbreakerEvaluations={dealbreakerEvaluations}
        onJobClick={(jobId) => router.push(`/jobs/${jobId}`)}
      />

      {/* New Opportunities */}
      <RadarCategorySection
        result={radarResults.newOpportunities}
        title="New Opportunities"
        description="Posted within the last 7 days"
        emptyMessage="No new jobs posted recently"
        dealbreakerEvaluations={dealbreakerEvaluations}
        onJobClick={(jobId) => router.push(`/jobs/${jobId}`)}
      />

      {/* High Compensation */}
      <RadarCategorySection
        result={radarResults.highCompensation}
        title="High Compensation"
        description="Top 25% disclosed salaries"
        emptyMessage="No high-compensation jobs with disclosed salaries"
        dealbreakerEvaluations={dealbreakerEvaluations}
        onJobClick={(jobId) => router.push(`/jobs/${jobId}`)}
      />

      {/* Stretch Opportunities */}
      <RadarCategorySection
        result={radarResults.stretchOpportunities}
        title="Stretch Opportunities"
        description="Roles to grow into"
        emptyMessage="No stretch opportunities available"
        dealbreakerEvaluations={dealbreakerEvaluations}
        onJobClick={(jobId) => router.push(`/jobs/${jobId}`)}
      />
    </div>
  );
}

interface RadarCategorySectionProps {
  result: RadarCategoryResult;
  title: string;
  description: string;
  emptyMessage: string;
  dealbreakerEvaluations: Map<string, DealbreakerEvaluation>;
  onJobClick: (jobId: string) => void;
}

function RadarCategorySection({
  result,
  title,
  description,
  emptyMessage,
  dealbreakerEvaluations,
  onJobClick,
}: RadarCategorySectionProps) {
  if (result.jobs.length === 0) {
    return (
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground mb-1">{title}</h2>
          <p className="text-sm text-foreground-secondary">{description}</p>
        </div>
        <EmptyState
          icon={<Layers className="h-6 w-6" />}
          title={emptyMessage}
          description=""
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">{title}</h2>
          <p className="text-sm text-foreground-secondary">{description}</p>
        </div>
        <span className="text-sm text-foreground-muted">
          {result.jobs.length} {result.jobs.length === 1 ? "job" : "jobs"}
        </span>
      </div>

      {/* Horizontal scrollable job cards */}
      <div className="relative -mx-4 px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {result.jobs.map((input) => {
            const { job, overallScore } = input;
            const dealbreakerEval = dealbreakerEvaluations.get(job.id);

            return (
              <Card
                key={job.id}
                variant="elevated"
                className="min-w-[280px] max-w-[280px] shrink-0 cursor-pointer p-4 transition-all hover:shadow-lg md:min-w-[320px] md:max-w-[320px]"
                onClick={() => onJobClick(job.id)}
              >
                <div className="flex flex-col gap-3">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={job.company.name}
                      size="md"
                      className="shrink-0 bg-gradient-to-br from-blue-500 to-blue-600"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-foreground line-clamp-2">
                        {job.title}
                      </h3>
                      <p className="text-sm text-foreground-secondary truncate">
                        {job.company.name}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1.5">
                      <Badge
                        variant={overallScore >= 90 ? "success" : "brand"}
                        size="sm"
                      >
                        {overallScore}%
                      </Badge>
                      {dealbreakerEval && (
                        <DealbreakerBadge evaluation={dealbreakerEval} size="sm" />
                      )}
                    </div>
                  </div>

                  {/* Location & Work Arrangement */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-foreground-muted">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <span>•</span>
                    <span className="capitalize">
                      {job.work_arrangement.replace("_", " ")}
                    </span>
                  </div>

                  {/* Salary */}
                  {job.salary_min && (
                    <p className="text-base font-bold text-foreground truncate">
                      {formatSalary(
                        job.salary_min,
                        job.salary_max,
                        job.salary_period
                      )}
                    </p>
                  )}

                  {/* Actions */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-between gap-2 pt-1"
                  >
                    <CompareToggle jobId={job.id} className="gap-2" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onJobClick(job.id);
                      }}
                    >
                      View
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
