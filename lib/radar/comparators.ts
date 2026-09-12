/**
 * E4 Opportunity Radar — Safe Comparators
 *
 * Deterministic sorting functions that handle invalid/missing data gracefully.
 */

import type { RadarJobInput } from "./types";

/**
 * Safe Posted Date Comparator
 *
 * Sorts jobs by posted_date with safe handling of invalid/missing dates.
 *
 * Sort order:
 * 1. Valid dates: newer first (DESC)
 * 2. Invalid/missing dates: after valid dates
 * 3. Both invalid: fall through to job.id ASC
 *
 * @param a - First RadarJobInput
 * @param b - Second RadarJobInput
 * @returns Comparison result (-1, 0, 1)
 */
export function compareByPostedDate(
  a: RadarJobInput,
  b: RadarJobInput
): number {
  const aDateStr = a.job.posted_date;
  const bDateStr = b.job.posted_date;

  // Parse dates
  const aDate = aDateStr ? new Date(aDateStr).getTime() : NaN;
  const bDate = bDateStr ? new Date(bDateStr).getTime() : NaN;

  // Check validity (not NaN)
  const aValid = !isNaN(aDate);
  const bValid = !isNaN(bDate);

  // Both valid: newer first (DESC)
  if (aValid && bValid) {
    if (aDate > bDate) return -1;
    if (aDate < bDate) return 1;
    // Dates equal: return 0 to allow caller to use secondary sort key
    return 0;
  }

  // a valid, b invalid: a comes first
  if (aValid && !bValid) return -1;

  // a invalid, b valid: b comes first
  if (!aValid && bValid) return 1;

  // Both invalid: use id ASC as final tiebreaker
  return compareByJobId(a, b);
}

/**
 * Job ID Comparator (ASC)
 *
 * Deterministic tie-breaker for stable sort order.
 *
 * @param a - First RadarJobInput
 * @param b - Second RadarJobInput
 * @returns Comparison result (-1, 0, 1)
 */
export function compareByJobId(a: RadarJobInput, b: RadarJobInput): number {
  if (a.job.id < b.job.id) return -1;
  if (a.job.id > b.job.id) return 1;
  return 0;
}

/**
 * Overall Score Comparator (DESC)
 *
 * Sorts jobs by overall match score, highest first.
 *
 * @param a - First RadarJobInput
 * @param b - Second RadarJobInput
 * @returns Comparison result (-1, 0, 1)
 */
export function compareByOverallScore(
  a: RadarJobInput,
  b: RadarJobInput
): number {
  if (a.overallScore > b.overallScore) return -1;
  if (a.overallScore < b.overallScore) return 1;
  return 0;
}

/**
 * Salary Minimum Comparator (DESC)
 *
 * Sorts jobs by salary_min, highest first.
 * Null salaries are sorted after numeric salaries.
 *
 * @param a - First RadarJobInput
 * @param b - Second RadarJobInput
 * @returns Comparison result (-1, 0, 1)
 */
export function compareBySalaryMin(
  a: RadarJobInput,
  b: RadarJobInput
): number {
  const aSalary = a.job.salary_min;
  const bSalary = b.job.salary_min;

  // Both have salary: higher first
  if (aSalary !== null && aSalary !== undefined && bSalary !== null && bSalary !== undefined) {
    if (aSalary > bSalary) return -1;
    if (aSalary < bSalary) return 1;
    return 0;
  }

  // a has salary, b doesn't: a first
  if ((aSalary !== null && aSalary !== undefined) && (bSalary === null || bSalary === undefined)) return -1;

  // a doesn't, b has: b first
  if ((aSalary === null || aSalary === undefined) && (bSalary !== null && bSalary !== undefined)) return 1;

  // Both null/undefined: equal
  return 0;
}
