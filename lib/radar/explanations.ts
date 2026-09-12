/**
 * E4 Opportunity Radar — Category Explanations
 *
 * Pure deterministic helpers for category-specific job explanations.
 * No Date.now() calls - asOfMs must be passed explicitly.
 */

/**
 * Format days ago for New Opportunities
 *
 * @param postedDate - ISO date string from job.posted_date
 * @param asOfMs - Explicit "now" timestamp in milliseconds
 * @returns "Posted X days ago" or null if invalid
 */
export function formatPostedDaysAgo(
  postedDate: string | undefined,
  asOfMs: number
): string | null {
  if (!postedDate) return null;

  const postedMs = new Date(postedDate).getTime();
  if (isNaN(postedMs)) return null;

  const ageMs = asOfMs - postedMs;
  const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));

  if (ageDays < 0) return null; // Future date
  if (ageDays === 0) return "Posted today";
  if (ageDays === 1) return "Posted 1 day ago";
  return `Posted ${ageDays} days ago`;
}

/**
 * Format unmatched skills count for Stretch Opportunities
 *
 * @param missingSkillsCount - Number of missing skills
 * @returns "[N] required skills aren't currently matched" or null
 */
export function formatMissingSkillsCount(
  missingSkillsCount: number
): string | null {
  if (missingSkillsCount <= 0) return null;

  if (missingSkillsCount === 1) {
    return "1 required skill isn't currently matched";
  }

  return `${missingSkillsCount} required skills aren't currently matched`;
}
