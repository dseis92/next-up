/**
 * Pure comparison derivation logic for E2 Opportunity Compare
 * All functions are deterministic and testable
 */

import type { JobMatch } from "@/types";

export type ComparisonLens = "balanced" | "compensation" | "lifestyle" | "qualification";

export interface LeaderInfo {
  jobIds: string[];
  isTie: boolean;
}

export interface ComparisonLeaders {
  overallMatch: LeaderInfo;
  qualification: LeaderInfo;
  lifestyle: LeaderInfo;
  highestSalary: LeaderInfo;
  mostMatchedSkills: LeaderInfo;
  fewestMissingSkills: LeaderInfo;
}

/**
 * Determine which job(s) lead in overall match score
 */
export function getOverallMatchLeader(matches: JobMatch[]): LeaderInfo {
  if (matches.length === 0) {
    return { jobIds: [], isTie: false };
  }

  const maxScore = Math.max(...matches.map((m) => m.overall_score));
  const leaders = matches.filter((m) => m.overall_score === maxScore);

  return {
    jobIds: leaders.map((m) => m.job_id),
    isTie: leaders.length > 1,
  };
}

/**
 * Determine which job(s) lead in qualification score
 */
export function getQualificationLeader(matches: JobMatch[]): LeaderInfo {
  if (matches.length === 0) {
    return { jobIds: [], isTie: false };
  }

  const maxScore = Math.max(...matches.map((m) => m.qualification_score));
  const leaders = matches.filter((m) => m.qualification_score === maxScore);

  return {
    jobIds: leaders.map((m) => m.job_id),
    isTie: leaders.length > 1,
  };
}

/**
 * Determine which job(s) lead in lifestyle score
 */
export function getLifestyleLeader(matches: JobMatch[]): LeaderInfo {
  if (matches.length === 0) {
    return { jobIds: [], isTie: false };
  }

  const maxScore = Math.max(...matches.map((m) => m.lifestyle_score));
  const leaders = matches.filter((m) => m.lifestyle_score === maxScore);

  return {
    jobIds: leaders.map((m) => m.job_id),
    isTie: leaders.length > 1,
  };
}

/**
 * Determine which job(s) have the highest listed salary maximum
 * Treats missing salary as undefined (not zero)
 */
export function getHighestSalaryLeader(matches: JobMatch[]): LeaderInfo {
  const matchesWithSalary = matches.filter((m) => m.job.salary_max != null);

  if (matchesWithSalary.length === 0) {
    return { jobIds: [], isTie: false };
  }

  const maxSalary = Math.max(...matchesWithSalary.map((m) => m.job.salary_max!));
  const leaders = matchesWithSalary.filter((m) => m.job.salary_max === maxSalary);

  return {
    jobIds: leaders.map((m) => m.job_id),
    isTie: leaders.length > 1,
  };
}

/**
 * Determine which job(s) have the most matched skills
 */
export function getMostMatchedSkillsLeader(matches: JobMatch[]): LeaderInfo {
  if (matches.length === 0) {
    return { jobIds: [], isTie: false };
  }

  const maxCount = Math.max(...matches.map((m) => m.matched_skills.length));
  const leaders = matches.filter((m) => m.matched_skills.length === maxCount);

  return {
    jobIds: leaders.map((m) => m.job_id),
    isTie: leaders.length > 1,
  };
}

/**
 * Determine which job(s) have the fewest missing skills
 */
export function getFewestMissingSkillsLeader(matches: JobMatch[]): LeaderInfo {
  if (matches.length === 0) {
    return { jobIds: [], isTie: false };
  }

  const minCount = Math.min(...matches.map((m) => m.missing_skills.length));
  const leaders = matches.filter((m) => m.missing_skills.length === minCount);

  return {
    jobIds: leaders.map((m) => m.job_id),
    isTie: leaders.length > 1,
  };
}

/**
 * Get all comparison leaders for a set of matches
 */
export function getComparisonLeaders(matches: JobMatch[]): ComparisonLeaders {
  return {
    overallMatch: getOverallMatchLeader(matches),
    qualification: getQualificationLeader(matches),
    lifestyle: getLifestyleLeader(matches),
    highestSalary: getHighestSalaryLeader(matches),
    mostMatchedSkills: getMostMatchedSkillsLeader(matches),
    fewestMissingSkills: getFewestMissingSkillsLeader(matches),
  };
}

/**
 * Check if two values are equivalent for comparison purposes
 * Handles strings, numbers, booleans, and null/undefined
 */
export function areValuesEquivalent(
  value1: string | number | boolean | null | undefined,
  value2: string | number | boolean | null | undefined
): boolean {
  // Normalize null and undefined as equivalent
  if (value1 == null && value2 == null) return true;
  if (value1 == null || value2 == null) return false;

  // Direct comparison for primitives
  return value1 === value2;
}

/**
 * Check if all jobs have the same value for a specific property
 * Used for Difference Mode filtering
 */
export function allJobsHaveSameValue<T>(
  items: T[],
  getValue: (item: T) => string | number | boolean | null | undefined
): boolean {
  if (items.length === 0) return true;

  const firstValue = getValue(items[0]);
  return items.every((item) => areValuesEquivalent(getValue(item), firstValue));
}

/**
 * Get section ordering based on lens
 */
export function getSectionOrder(lens: ComparisonLens): string[] {
  switch (lens) {
    case "compensation":
      return ["compensation", "match", "lifestyle", "skills", "strengths"];
    case "lifestyle":
      return ["lifestyle", "match", "compensation", "skills", "strengths"];
    case "qualification":
      return ["match", "skills", "strengths", "compensation", "lifestyle"];
    case "balanced":
    default:
      return ["match", "compensation", "lifestyle", "skills", "strengths"];
  }
}
