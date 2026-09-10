/**
 * E4 Opportunity Radar — Category Selectors
 *
 * Pure functions that select and rank jobs for each Radar category.
 * No Date.now(), no network calls, no database access, no React.
 */

import type { RadarJobInput, RadarCategoryResult } from "./types";
import {
  compareByOverallScore,
  compareByPostedDate,
  compareByJobId,
  compareBySalaryMin,
} from "./comparators";

/**
 * Select Best Matches
 *
 * Jobs ordered by overall match score (no minimum threshold).
 *
 * Eligibility: All scored jobs
 * Ranking: overallScore DESC, posted_date DESC, job.id ASC
 * Limit: 20
 *
 * @param jobs - Array of RadarJobInput
 * @returns Best Matches result
 */
export function selectBestMatches(
  jobs: readonly RadarJobInput[]
): RadarCategoryResult {
  // Sort: score DESC, date DESC, id ASC
  const sorted = [...jobs].sort((a, b) => {
    const scoreComp = compareByOverallScore(a, b);
    if (scoreComp !== 0) return scoreComp;

    const dateComp = compareByPostedDate(a, b);
    if (dateComp !== 0) return dateComp;

    return compareByJobId(a, b);
  });

  return {
    category: "bestMatches",
    jobs: sorted.slice(0, 20),
    totalEligible: jobs.length,
  };
}

/**
 * Select New Opportunities
 *
 * Jobs posted within the last 7 days relative to asOfMs.
 *
 * Eligibility:
 * - Valid posted_date
 * - Age >= 0 days (not future)
 * - Age <= 7 days
 *
 * Ranking: posted_date DESC, overallScore DESC, job.id ASC
 * Limit: 30
 *
 * @param jobs - Array of RadarJobInput
 * @param asOfMs - Explicit "now" timestamp (milliseconds since epoch)
 * @returns New Opportunities result
 */
export function selectNewOpportunities(
  jobs: readonly RadarJobInput[],
  asOfMs: number
): RadarCategoryResult {
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  const eligible = jobs.filter((input) => {
    const postedDate = input.job.posted_date;

    // Missing/invalid date: exclude
    if (!postedDate) return false;

    const postedMs = new Date(postedDate).getTime();

    // Invalid date: exclude
    if (isNaN(postedMs)) return false;

    // Future date: exclude
    if (postedMs > asOfMs) return false;

    // Age in milliseconds
    const ageMs = asOfMs - postedMs;

    // Exclude if older than 7 days
    if (ageMs > SEVEN_DAYS_MS) return false;

    // Include if within 7 days (0-7 days inclusive)
    return true;
  });

  // Sort: date DESC, score DESC, id ASC
  const sorted = [...eligible].sort((a, b) => {
    const dateComp = compareByPostedDate(a, b);
    if (dateComp !== 0) return dateComp;

    const scoreComp = compareByOverallScore(a, b);
    if (scoreComp !== 0) return scoreComp;

    return compareByJobId(a, b);
  });

  return {
    category: "newOpportunities",
    jobs: sorted.slice(0, 30),
    totalEligible: eligible.length,
  };
}

/**
 * Select High Compensation
 *
 * Jobs with disclosed, non-estimated yearly salaries at or above the 75th percentile.
 *
 * Eligibility:
 * - salary_min is present (not null)
 * - salary_is_estimated === false
 * - salary_period === "yearly"
 *
 * 75th Percentile Algorithm (Nearest-Rank):
 * 1. Collect eligible salary_min values
 * 2. Sort ascending
 * 3. n = values.length
 * 4. If n === 0, return empty result
 * 5. index = max(0, ceil(0.75 * n) - 1)
 * 6. threshold = sorted[index]
 * 7. Include jobs with salary_min >= threshold
 *
 * Ranking: salary_min DESC, posted_date DESC, job.id ASC
 * Limit: 20
 *
 * @param jobs - Array of RadarJobInput
 * @returns High Compensation result
 */
export function selectHighCompensation(
  jobs: readonly RadarJobInput[]
): RadarCategoryResult {
  // Filter eligible jobs
  const eligible = jobs.filter((input) => {
    const { salary_min, salary_is_estimated, salary_period } = input.job;

    // Must have salary_min
    if (salary_min === null || salary_min === undefined) return false;

    // Must be disclosed (not estimated)
    if (salary_is_estimated === true) return false;

    // Must be yearly (hourly excluded)
    if (salary_period !== "yearly") return false;

    return true;
  });

  // If no eligible jobs, return empty
  if (eligible.length === 0) {
    return {
      category: "highCompensation",
      jobs: [],
      totalEligible: 0,
    };
  }

  // Collect salary_min values and sort ascending
  const salaries = eligible.map((input) => input.job.salary_min!).sort((a, b) => a - b);

  // Calculate 75th percentile threshold (nearest-rank method)
  const n = salaries.length;
  const index = Math.max(0, Math.ceil(0.75 * n) - 1);
  const threshold = salaries[index];

  // Filter jobs at or above threshold
  const qualified = eligible.filter((input) => input.job.salary_min! >= threshold);

  // Sort: salary DESC, date DESC, id ASC
  const sorted = [...qualified].sort((a, b) => {
    const salaryComp = compareBySalaryMin(a, b);
    if (salaryComp !== 0) return salaryComp;

    const dateComp = compareByPostedDate(a, b);
    if (dateComp !== 0) return dateComp;

    return compareByJobId(a, b);
  });

  return {
    category: "highCompensation",
    jobs: sorted.slice(0, 20),
    totalEligible: qualified.length,
  };
}

/**
 * Select Stretch Opportunities
 *
 * Jobs where user has moderate qualification (60-85) and missing skills to develop.
 *
 * Eligibility (EXACT):
 * - qualificationScore >= 60 AND <= 85
 * - missingSkills.length > 0
 *
 * Ranking: overallScore DESC, posted_date DESC, job.id ASC
 * Limit: 15
 *
 * @param jobs - Array of RadarJobInput
 * @returns Stretch Opportunities result
 */
export function selectStretchOpportunities(
  jobs: readonly RadarJobInput[]
): RadarCategoryResult {
  const eligible = jobs.filter((input) => {
    // Qualification score must be 60-85 inclusive
    if (input.qualificationScore < 60 || input.qualificationScore > 85) {
      return false;
    }

    // Must have missing skills (learning opportunity)
    if (input.missingSkills.length === 0) {
      return false;
    }

    return true;
  });

  // Sort: score DESC, date DESC, id ASC
  const sorted = [...eligible].sort((a, b) => {
    const scoreComp = compareByOverallScore(a, b);
    if (scoreComp !== 0) return scoreComp;

    const dateComp = compareByPostedDate(a, b);
    if (dateComp !== 0) return dateComp;

    return compareByJobId(a, b);
  });

  return {
    category: "stretchOpportunities",
    jobs: sorted.slice(0, 15),
    totalEligible: eligible.length,
  };
}
