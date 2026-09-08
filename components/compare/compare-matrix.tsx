"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, TrendingUp, X } from "lucide-react";
import { formatSalary } from "@/lib/utils";
import type { JobMatch } from "@/types";
import type { ComparisonLens, ComparisonLeaders } from "@/lib/compare/comparison";
import {
  getComparisonLeaders,
  getSectionOrder,
  allJobsHaveSameValue,
  allJobsHaveSameSkillStatus,
  getSalaryValue,
} from "@/lib/compare/comparison";

export interface CompareMatrixProps {
  matches: JobMatch[];
  differencesOnly: boolean;
  lens: ComparisonLens;
  onRemoveJob: (jobId: string) => void;
}

export function CompareMatrix({
  matches,
  differencesOnly,
  lens,
  onRemoveJob,
}: CompareMatrixProps) {
  const router = useRouter();

  const leaders = useMemo(() => getComparisonLeaders(matches), [matches]);
  const sectionOrder = useMemo(() => getSectionOrder(lens), [lens]);

  // Check if row should be visible in Differences Only mode
  const shouldShowRow = (getValue: (match: JobMatch) => string | number | boolean | null | undefined) => {
    if (!differencesOnly) return true;
    return !allJobsHaveSameValue(matches, getValue);
  };

  // Mobile: horizontal scroll for job columns
  return (
    <div className="space-y-6">
      {/* Job Summary Cards (Top Row) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {matches.map((match) => {
          const { job, overall_score } = match;
          const isOverallLeader = leaders.overallMatch.jobIds.includes(job.id);

          return (
            <Card
              key={job.id}
              variant="elevated"
              className="relative p-4"
            >
              {isOverallLeader && (
                <div className="absolute right-4 top-4">
                  <Badge variant="success" size="sm" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Top match
                  </Badge>
                </div>
              )}

              {/* Remove button */}
              <button
                onClick={() => onRemoveJob(job.id)}
                className="absolute left-4 top-4 rounded-full p-1.5 text-foreground-muted hover:bg-surface-secondary hover:text-foreground-secondary transition-colors"
                aria-label={`Remove ${job.title} at ${job.company.name} from comparison`}
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-4">
                <Avatar
                  name={job.company.name}
                  size="lg"
                  className="mb-3 bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <h3 className="text-lg font-semibold text-foreground line-clamp-2 mb-1">
                  {job.title}
                </h3>
                <p className="text-foreground-secondary text-sm mb-3">
                  {job.company.name}
                </p>

                <div className="mb-3 flex items-center gap-1.5 text-xs text-foreground-muted">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1">{job.location}</span>
                </div>

                {job.salary_min && (
                  <p className="text-foreground mb-3 font-bold">
                    {formatSalary(job.salary_min, job.salary_max, job.salary_period)}
                  </p>
                )}

                <div className="mb-3">
                  <Badge variant={overall_score >= 90 ? "success" : "brand"} size="lg">
                    {overall_score}% match
                  </Badge>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full gap-2"
                onClick={() => router.push(`/jobs/${job.id}`)}
              >
                View details
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Comparison Sections */}
      <div className="space-y-6">
        {sectionOrder.map((section) => {
          switch (section) {
            case "match":
              return (
                <MatchSection
                  key="match"
                  matches={matches}
                  leaders={leaders}
                  shouldShowRow={shouldShowRow}
                />
              );
            case "compensation":
              return (
                <CompensationSection
                  key="compensation"
                  matches={matches}
                  leaders={leaders}
                  shouldShowRow={shouldShowRow}
                />
              );
            case "lifestyle":
              return (
                <LifestyleSection
                  key="lifestyle"
                  matches={matches}
                  leaders={leaders}
                  shouldShowRow={shouldShowRow}
                />
              );
            case "skills":
              return (
                <SkillsSection
                  key="skills"
                  matches={matches}
                  leaders={leaders}
                  shouldShowRow={shouldShowRow}
                  differencesOnly={differencesOnly}
                />
              );
            case "strengths":
              return <StrengthsSection key="strengths" matches={matches} />;
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}

// Match Section
interface SectionProps {
  matches: JobMatch[];
  leaders: ComparisonLeaders;
  shouldShowRow: (getValue: (match: JobMatch) => string | number | boolean | null | undefined) => boolean;
}

function MatchSection({ matches, leaders, shouldShowRow }: SectionProps) {
  return (
    <Card variant="elevated" className="p-6">
      <h2 className="text-heading mb-4">Match scores</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 pr-4 text-left text-sm font-medium text-foreground-muted">
                Dimension
              </th>
              {matches.map((match: JobMatch) => (
                <th
                  key={match.job.id}
                  className="pb-3 px-4 text-center text-sm font-medium text-foreground-muted"
                >
                  {match.job.company.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shouldShowRow((m: JobMatch) => m.overall_score) && (
              <tr>
                <td className="py-3 pr-4 text-sm font-medium text-foreground">
                  Overall Match
                </td>
                {matches.map((match: JobMatch) => {
                  const isLeader = leaders.overallMatch.jobIds.includes(match.job.id);
                  return (
                    <td key={match.job.id} className="py-3 px-4 text-center">
                      <Badge variant={isLeader ? "success" : "default"}>
                        {match.overall_score}%
                      </Badge>
                    </td>
                  );
                })}
              </tr>
            )}

            {shouldShowRow((m: JobMatch) => m.qualification_score) && (
              <tr>
                <td className="py-3 pr-4 text-sm font-medium text-foreground">
                  Qualification
                </td>
                {matches.map((match: JobMatch) => {
                  const isLeader = leaders.qualification.jobIds.includes(match.job.id);
                  return (
                    <td key={match.job.id} className="py-3 px-4 text-center">
                      <Badge variant={isLeader ? "success" : "default"}>
                        {match.qualification_score}%
                      </Badge>
                    </td>
                  );
                })}
              </tr>
            )}

            {shouldShowRow((m: JobMatch) => m.lifestyle_score) && (
              <tr>
                <td className="py-3 pr-4 text-sm font-medium text-foreground">
                  Lifestyle
                </td>
                {matches.map((match: JobMatch) => {
                  const isLeader = leaders.lifestyle.jobIds.includes(match.job.id);
                  return (
                    <td key={match.job.id} className="py-3 px-4 text-center">
                      <Badge variant={isLeader ? "success" : "default"}>
                        {match.lifestyle_score}%
                      </Badge>
                    </td>
                  );
                })}
              </tr>
            )}

            {shouldShowRow((m: JobMatch) => m.breakdown.skills) && (
              <tr>
                <td className="py-3 pr-4 text-sm text-foreground-secondary">Skills</td>
                {matches.map((match: JobMatch) => (
                  <td
                    key={match.job.id}
                    className="py-3 px-4 text-center text-sm text-foreground"
                  >
                    {match.breakdown.skills}
                  </td>
                ))}
              </tr>
            )}

            {shouldShowRow((m: JobMatch) => m.breakdown.experience) && (
              <tr>
                <td className="py-3 pr-4 text-sm text-foreground-secondary">
                  Experience
                </td>
                {matches.map((match: JobMatch) => (
                  <td
                    key={match.job.id}
                    className="py-3 px-4 text-center text-sm text-foreground"
                  >
                    {match.breakdown.experience}
                  </td>
                ))}
              </tr>
            )}

            {shouldShowRow((m: JobMatch) => m.breakdown.career_goals) && (
              <tr>
                <td className="py-3 pr-4 text-sm text-foreground-secondary">
                  Career Goals
                </td>
                {matches.map((match: JobMatch) => (
                  <td
                    key={match.job.id}
                    className="py-3 px-4 text-center text-sm text-foreground"
                  >
                    {match.breakdown.career_goals}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// Compensation Section
function CompensationSection({ matches, leaders, shouldShowRow }: SectionProps) {
  const hasSalaryData = matches.some((m: JobMatch) => m.job.salary_min != null);

  // Check if listed salary row should be visible
  const showListedSalary = hasSalaryData && shouldShowRow((m: JobMatch) => {
    const salary = getSalaryValue(m.job);
    // Return a composite key representing the full salary value
    return `${salary.min}-${salary.max}-${salary.period}`;
  });

  // Check if salary alignment row should be visible
  const showSalaryAlignment = shouldShowRow((m: JobMatch) => m.breakdown.salary);

  // Hide section entirely if no rows should be visible
  if (!showListedSalary && !showSalaryAlignment) {
    return null;
  }

  return (
    <Card variant="elevated" className="p-6">
      <h2 className="text-heading mb-4">Compensation</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 pr-4 text-left text-sm font-medium text-foreground-muted">
                Dimension
              </th>
              {matches.map((match: JobMatch) => (
                <th
                  key={match.job.id}
                  className="pb-3 px-4 text-center text-sm font-medium text-foreground-muted"
                >
                  {match.job.company.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {showListedSalary && (
              <tr>
                <td className="py-3 pr-4 text-sm font-medium text-foreground">
                  Listed Salary
                </td>
                {matches.map((match: JobMatch) => {
                  const isLeader = leaders.highestSalary.jobIds.includes(match.job.id);
                  return (
                    <td
                      key={match.job.id}
                      className="py-3 px-4 text-center text-sm text-foreground"
                    >
                      {match.job.salary_min ? (
                        <span className={isLeader ? "font-bold text-brand" : ""}>
                          {formatSalary(
                            match.job.salary_min,
                            match.job.salary_max,
                            match.job.salary_period
                          )}
                        </span>
                      ) : (
                        <span className="text-foreground-muted">Not disclosed</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            )}

            {showSalaryAlignment && (
              <tr>
                <td className="py-3 pr-4 text-sm text-foreground-secondary">
                  Salary Alignment
                </td>
                {matches.map((match: JobMatch) => (
                  <td
                    key={match.job.id}
                    className="py-3 px-4 text-center text-sm text-foreground"
                  >
                    {match.breakdown.salary}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// Lifestyle Section
function LifestyleSection({ matches, shouldShowRow }: SectionProps) {
  return (
    <Card variant="elevated" className="p-6">
      <h2 className="text-heading mb-4">Lifestyle</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 pr-4 text-left text-sm font-medium text-foreground-muted">
                Dimension
              </th>
              {matches.map((match: JobMatch) => (
                <th
                  key={match.job.id}
                  className="pb-3 px-4 text-center text-sm font-medium text-foreground-muted"
                >
                  {match.job.company.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shouldShowRow((m: JobMatch) => m.job.work_arrangement) && (
              <tr>
                <td className="py-3 pr-4 text-sm font-medium text-foreground">
                  Work Arrangement
                </td>
                {matches.map((match: JobMatch) => (
                  <td
                    key={match.job.id}
                    className="py-3 px-4 text-center text-sm text-foreground capitalize"
                  >
                    {match.job.work_arrangement.replace("_", " ")}
                  </td>
                ))}
              </tr>
            )}

            {shouldShowRow((m: JobMatch) => m.job.location) && (
              <tr>
                <td className="py-3 pr-4 text-sm font-medium text-foreground">
                  Location
                </td>
                {matches.map((match: JobMatch) => (
                  <td
                    key={match.job.id}
                    className="py-3 px-4 text-center text-sm text-foreground"
                  >
                    {match.job.location}
                  </td>
                ))}
              </tr>
            )}

            {shouldShowRow((m: JobMatch) => m.job.employment_type) && (
              <tr>
                <td className="py-3 pr-4 text-sm font-medium text-foreground">
                  Employment Type
                </td>
                {matches.map((match: JobMatch) => (
                  <td
                    key={match.job.id}
                    className="py-3 px-4 text-center text-sm text-foreground capitalize"
                  >
                    {match.job.employment_type.replace("_", " ")}
                  </td>
                ))}
              </tr>
            )}

            {shouldShowRow((m: JobMatch) => m.breakdown.location) && (
              <tr>
                <td className="py-3 pr-4 text-sm text-foreground-secondary">
                  Location Score
                </td>
                {matches.map((match: JobMatch) => (
                  <td
                    key={match.job.id}
                    className="py-3 px-4 text-center text-sm text-foreground"
                  >
                    {match.breakdown.location}
                  </td>
                ))}
              </tr>
            )}

            {shouldShowRow((m: JobMatch) => m.breakdown.work_arrangement) && (
              <tr>
                <td className="py-3 pr-4 text-sm text-foreground-secondary">
                  Work Arrangement Score
                </td>
                {matches.map((match: JobMatch) => (
                  <td
                    key={match.job.id}
                    className="py-3 px-4 text-center text-sm text-foreground"
                  >
                    {match.breakdown.work_arrangement}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// Skills Section
interface SkillsSectionProps extends SectionProps {
  differencesOnly: boolean;
}

function SkillsSection({ matches, leaders, shouldShowRow, differencesOnly }: SkillsSectionProps) {
  // Build unified skill list
  const allSkills = new Set<string>();
  matches.forEach((match: JobMatch) => {
    match.matched_skills.forEach((skill) => allSkills.add(skill));
    match.missing_skills.forEach((skill) => allSkills.add(skill));
  });

  const sortedSkills = Array.from(allSkills).sort();

  // Determine which skills to show based on difference mode
  const shouldShowSkill = (skill: string): boolean => {
    if (!differencesOnly) return true;

    // In difference mode: hide skill if all jobs have same status
    return !allJobsHaveSameSkillStatus(matches, skill);
  };

  return (
    <Card variant="elevated" className="p-6">
      <h2 className="text-heading mb-4">Skills</h2>

      {/* Matched/Missing Counts */}
      <div className="mb-4 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 pr-4 text-left text-sm font-medium text-foreground-muted">
                Summary
              </th>
              {matches.map((match: JobMatch) => (
                <th
                  key={match.job.id}
                  className="pb-3 px-4 text-center text-sm font-medium text-foreground-muted"
                >
                  {match.job.company.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shouldShowRow((m: JobMatch) => m.matched_skills.length) && (
              <tr>
                <td className="py-3 pr-4 text-sm font-medium text-foreground">
                  Matched Skills
                </td>
                {matches.map((match: JobMatch) => {
                  const isLeader = leaders.mostMatchedSkills.jobIds.includes(match.job.id);
                  return (
                    <td
                      key={match.job.id}
                      className="py-3 px-4 text-center text-sm text-foreground"
                    >
                      <Badge variant={isLeader ? "success" : "default"}>
                        {match.matched_skills.length}
                      </Badge>
                    </td>
                  );
                })}
              </tr>
            )}

            {shouldShowRow((m: JobMatch) => m.missing_skills.length) && (
              <tr>
                <td className="py-3 pr-4 text-sm font-medium text-foreground">
                  Missing Skills
                </td>
                {matches.map((match: JobMatch) => {
                  const isLeader = leaders.fewestMissingSkills.jobIds.includes(match.job.id);
                  return (
                    <td
                      key={match.job.id}
                      className="py-3 px-4 text-center text-sm text-foreground"
                    >
                      <Badge variant={isLeader ? "success" : "default"}>
                        {match.missing_skills.length}
                      </Badge>
                    </td>
                  );
                })}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Skill Matrix (if reasonable number of skills) */}
      {sortedSkills.length > 0 && sortedSkills.length <= 15 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 pr-4 text-left text-sm font-medium text-foreground-muted">
                  Skill
                </th>
                {matches.map((match: JobMatch) => (
                  <th
                    key={match.job.id}
                    className="pb-3 px-4 text-center text-sm font-medium text-foreground-muted"
                  >
                    {match.job.company.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedSkills.filter(shouldShowSkill).map((skill) => (
                <tr key={skill}>
                  <td className="py-2 pr-4 text-sm text-foreground">{skill}</td>
                  {matches.map((match: JobMatch) => {
                    const isMatched = match.matched_skills.includes(skill);
                    const isMissing = match.missing_skills.includes(skill);

                    return (
                      <td key={match.job.id} className="py-2 px-4 text-center">
                        {isMatched && (
                          <Badge variant="success" size="sm">
                            ✓
                          </Badge>
                        )}
                        {isMissing && (
                          <Badge variant="default" size="sm">
                            —
                          </Badge>
                        )}
                        {!isMatched && !isMissing && (
                          <span className="text-foreground-muted text-xs">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

// Strengths & Concerns Section
interface StrengthsSectionProps {
  matches: JobMatch[];
}

function StrengthsSection({ matches }: StrengthsSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {matches.map((match: JobMatch) => (
        <Card key={match.job.id} variant="elevated" className="p-4">
          <h3 className="text-foreground mb-3 font-semibold">
            {match.job.company.name}
          </h3>

          {match.reasons_fit.length > 0 && (
            <div className="mb-4">
              <p className="text-foreground-muted mb-2 text-xs font-medium uppercase">
                Strengths
              </p>
              <ul className="space-y-1">
                {match.reasons_fit.slice(0, 3).map((reason, i) => (
                  <li key={i} className="text-foreground text-sm">
                    <span className="text-brand mr-1">✓</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {match.reasons_concern.length > 0 && (
            <div>
              <p className="text-foreground-muted mb-2 text-xs font-medium uppercase">
                Things to watch
              </p>
              <ul className="space-y-1">
                {match.reasons_concern.slice(0, 3).map((reason, i) => (
                  <li key={i} className="text-foreground-secondary text-sm">
                    <span className="text-orange mr-1">⚠</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
