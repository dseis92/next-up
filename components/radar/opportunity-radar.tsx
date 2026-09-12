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
import { adaptJobMatchesForRadar } from "@/lib/radar/job-match-adapter";
import { generateRadarResults } from "@/lib/radar";
import { formatPostedDaysAgo, formatMissingSkillsCount } from "@/lib/radar/explanations";
import { formatRadarSalary } from "@/lib/radar/salary-format";
import type { JobMatch } from "@/types";
import type { DealbreakerEvaluation } from "@/lib/dealbreakers/types";
import type { RadarCategoryResult, RadarCategory } from "@/lib/radar/types";

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
    // Transform JobMatch[] directly to RadarJobInput[]
    const radarInputs = adaptJobMatchesForRadar(allMatches);

    return generateRadarResults(radarInputs, asOfMs);
  }, [allMatches, asOfMs]);

  // Build matched skills lookup for card evidence (UI-only)
  const matchedSkillsByJobId = useMemo(() => {
    return new Map(allMatches.map((m) => [m.job.id, m.matched_skills]));
  }, [allMatches]);

  return (
    <div className="space-y-8">
      {/* Best Matches */}
      <RadarCategorySection
        result={radarResults.bestMatches}
        category="bestMatches"
        title="Best Matches"
        description="Your strongest available matches"
        emptyMessage="No matching opportunities with your current filters"
        asOfMs={asOfMs}
        dealbreakerEvaluations={dealbreakerEvaluations}
        matchedSkillsByJobId={matchedSkillsByJobId}
        onJobClick={(jobId) => router.push(`/jobs/${jobId}`)}
      />

      {/* New Opportunities */}
      <RadarCategorySection
        result={radarResults.newOpportunities}
        category="newOpportunities"
        title="New Opportunities"
        description="Recently posted jobs"
        emptyMessage="Check back soon for newly posted jobs"
        asOfMs={asOfMs}
        dealbreakerEvaluations={dealbreakerEvaluations}
        matchedSkillsByJobId={matchedSkillsByJobId}
        onJobClick={(jobId) => router.push(`/jobs/${jobId}`)}
      />

      {/* High Compensation */}
      <RadarCategorySection
        result={radarResults.highCompensation}
        category="highCompensation"
        title="High Compensation"
        description="Among the highest disclosed salaries"
        emptyMessage="Jobs with disclosed high salaries will appear here"
        asOfMs={asOfMs}
        dealbreakerEvaluations={dealbreakerEvaluations}
        matchedSkillsByJobId={matchedSkillsByJobId}
        onJobClick={(jobId) => router.push(`/jobs/${jobId}`)}
      />

      {/* Stretch Opportunities */}
      <RadarCategorySection
        result={radarResults.stretchOpportunities}
        category="stretchOpportunities"
        title="Stretch Opportunities"
        description="Qualification stretch roles"
        emptyMessage="Qualification stretch opportunities will appear as you explore"
        asOfMs={asOfMs}
        dealbreakerEvaluations={dealbreakerEvaluations}
        matchedSkillsByJobId={matchedSkillsByJobId}
        onJobClick={(jobId) => router.push(`/jobs/${jobId}`)}
      />
    </div>
  );
}

interface RadarCategorySectionProps {
  result: RadarCategoryResult;
  category: RadarCategory;
  title: string;
  description: string;
  emptyMessage: string;
  asOfMs: number;
  dealbreakerEvaluations: Map<string, DealbreakerEvaluation>;
  matchedSkillsByJobId: Map<string, string[]>;
  onJobClick: (jobId: string) => void;
}

function RadarCategorySection({
  result,
  category,
  title,
  description,
  emptyMessage,
  asOfMs,
  dealbreakerEvaluations,
  matchedSkillsByJobId,
  onJobClick,
}: RadarCategorySectionProps) {
  // Generate stable heading ID
  const headingId = `radar-${category}-heading`;

  if (result.jobs.length === 0) {
    return (
      <section aria-labelledby={headingId}>
        <div className="mb-4">
          <h2 id={headingId} className="text-xl font-semibold text-foreground mb-1">
            {title}
          </h2>
          <p className="text-sm text-foreground-secondary">{description}</p>
        </div>
        <EmptyState
          icon={<Layers className="h-6 w-6" />}
          title={emptyMessage}
          description=""
        />
      </section>
    );
  }

  return (
    <section aria-labelledby={headingId}>
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 id={headingId} className="text-xl font-semibold text-foreground mb-1">
            {title}
          </h2>
          <p className="text-sm text-foreground-secondary">{description}</p>
        </div>
        <span className="text-sm text-foreground-muted">
          {result.jobs.length} {result.jobs.length === 1 ? "job" : "jobs"}
        </span>
      </div>

      {/* Horizontal scrollable job cards */}
      <div className="relative -mx-4 px-4">
        <div
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          role="list"
          aria-label={`${title} jobs`}
          tabIndex={0}
        >
          {result.jobs.map((input) => {
            const { job, overallScore, missingSkills } = input;
            const dealbreakerEval = dealbreakerEvaluations.get(job.id);

            // Generate category-specific explanation
            let categoryExplanation: string | null = null;
            if (category === "newOpportunities") {
              categoryExplanation = formatPostedDaysAgo(job.posted_date, asOfMs);
            } else if (category === "stretchOpportunities") {
              categoryExplanation = formatMissingSkillsCount(missingSkills.length);
            }

            return (
              <Card
                key={job.id}
                variant="elevated"
                className="min-w-[280px] max-w-[280px] shrink-0 cursor-pointer p-4 transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 md:min-w-[320px] md:max-w-[320px]"
                onClick={() => onJobClick(job.id)}
                role="listitem"
                aria-label={`${job.title} at ${job.company.name}, ${overallScore}% match`}
                tabIndex={0}
                onKeyDown={(e) => {
                  // Only handle keyboard events when Card itself is the target
                  // Prevents bubbled events from nested controls
                  if (e.target !== e.currentTarget) return;

                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onJobClick(job.id);
                  }
                }}
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
                        aria-label={`${overallScore}% job match`}
                      >
                        {overallScore}%
                      </Badge>
                      {dealbreakerEval && (
                        <DealbreakerBadge evaluation={dealbreakerEval} size="sm" />
                      )}
                    </div>
                  </div>

                  {/* Location, Work Arrangement & Employment Type */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-foreground-muted">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <span>•</span>
                    <span className="capitalize">
                      {job.work_arrangement.replace("_", " ")}
                    </span>
                    <span>•</span>
                    <span className="capitalize">
                      {job.employment_type.replace("_", " ")}
                    </span>
                  </div>

                  {/* Salary */}
                  <p className="text-base font-bold text-foreground truncate">
                    {formatRadarSalary(job)}
                  </p>

                  {/* Matched Skills (top 3) */}
                  {(() => {
                    const matchedSkills = matchedSkillsByJobId.get(job.id) || [];
                    const displaySkills = matchedSkills.slice(0, 3);
                    const remainingCount = matchedSkills.length - 3;

                    if (displaySkills.length > 0) {
                      return (
                        <div className="flex flex-wrap gap-1.5">
                          {displaySkills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="muted"
                              size="sm"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {remainingCount > 0 && (
                            <Badge
                              variant="muted"
                              size="sm"
                            >
                              +{remainingCount}
                            </Badge>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Category-specific explanation */}
                  {categoryExplanation && (
                    <p className="text-xs text-foreground-secondary italic">
                      {categoryExplanation}
                    </p>
                  )}

                  {/* Actions */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-between gap-2 pt-1"
                  >
                    <CompareToggle jobId={job.id} className="gap-2 min-h-[44px]" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 min-h-[44px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        onJobClick(job.id);
                      }}
                      aria-label={`View details for ${job.title} at ${job.company.name}`}
                    >
                      View
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
