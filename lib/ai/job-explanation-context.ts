/**
 * AI Job Explanation Context Builder
 *
 * Transforms deterministic MatchResult into safe, grounded AI context.
 * This is the ONLY authorized context source for AI job explanation.
 *
 * Security principles:
 * - NO user IDs, emails, or auth tokens
 * - NO persisted user data beyond what's in MatchResult
 * - NO job IDs (internal database references)
 * - ONLY factual matching data from Phase 9 engine
 */

import type { MatchResult } from "@/lib/matching/types";
import type { Job } from "@/types";

/**
 * Safe context for AI job explanation
 * Contains ONLY public-safe, explanation-relevant data
 */
export interface JobExplanationContext {
  // Job information (public data)
  jobTitle: string;
  companyName: string;
  location: string;
  workArrangement: string;
  employmentType: string;
  experienceLevel: string;
  salaryRange: string | null;

  // Match result (deterministic scores from Phase 9)
  overallScore: number;
  qualificationScore: number;
  lifestyleScore: number;

  // Breakdown scores
  skillsScore: number;
  experienceScore: number;
  careerGoalsScore: number;
  salaryScore: number;
  locationScore: number;
  workArrangementScore: number;

  // Matched and missing skills
  matchedSkills: string[];
  missingSkills: string[];

  // Hard failures (dealbreakers)
  hardFailures: string[];

  // Profile status
  isIncompleteProfile: boolean;
}

/**
 * Build safe AI context from deterministic MatchResult
 *
 * @param matchResult - Deterministic match result from Phase 9 engine
 * @param job - Job data (public information)
 * @returns Safe context for AI explanation, or null if profile incomplete
 */
export function buildJobExplanationContext(
  matchResult: MatchResult,
  job: Job
): JobExplanationContext | null {
  // Incomplete profiles cannot be explained
  if (matchResult.status === "incomplete_profile") {
    return null;
  }

  // Format salary range
  const salaryRange =
    job.salary_min && job.salary_max
      ? `$${job.salary_min.toLocaleString()}-$${job.salary_max.toLocaleString()}/${job.salary_period}`
      : null;

  return {
    // Job information
    jobTitle: job.title,
    companyName: job.company.name,
    location: job.location || "Not specified",
    workArrangement: job.work_arrangement,
    employmentType: job.employment_type,
    experienceLevel: job.experience_level || "Not specified",
    salaryRange,

    // Overall scores
    overallScore: matchResult.overallScore!,
    qualificationScore: matchResult.qualificationScore!,
    lifestyleScore: matchResult.lifestyleScore!,

    // Breakdown scores
    skillsScore: matchResult.breakdown.skills.score,
    experienceScore: matchResult.breakdown.experience.score,
    careerGoalsScore: matchResult.breakdown.careerGoals.score,
    salaryScore: matchResult.breakdown.salary.score,
    locationScore: matchResult.breakdown.location.score,
    workArrangementScore: matchResult.breakdown.workArrangement.score,

    // Skills
    matchedSkills: matchResult.matchedSkills,
    missingSkills: matchResult.missingSkills,

    // Hard failures (extract messages from HardFailure objects)
    hardFailures: matchResult.hardFailures.map((f) => f.message),

    // Status
    isIncompleteProfile: false,
  };
}
