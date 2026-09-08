/**
 * URL query parameter handling for /compare route
 */

const MAX_COMPARE_JOBS = 4;

/**
 * UUID v4 validation regex
 * Jobs table uses UUID primary keys
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validate UUID format
 */
function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

/**
 * Parse job IDs from URL query parameter
 * Validates UUID format, handles malformed input, deduplication, and maximum limit
 *
 * @param jobsParam - The "jobs" query parameter value (e.g., "id1,id2,id3")
 * @returns Array of unique, valid job IDs (max 4)
 */
export function parseCompareJobIds(jobsParam: string | null | undefined): string[] {
  if (!jobsParam || typeof jobsParam !== "string") {
    return [];
  }

  // Split by comma, trim whitespace, filter empty strings
  const rawIds = jobsParam
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  // Validate UUIDs and deduplicate while preserving order
  const uniqueIds: string[] = [];
  const seen = new Set<string>();

  for (const id of rawIds) {
    // Reject malformed IDs before database query
    if (!isValidUUID(id)) {
      continue;
    }

    if (!seen.has(id)) {
      seen.add(id);
      uniqueIds.push(id);
    }
  }

  // Take first N valid IDs (max 4)
  return uniqueIds.slice(0, MAX_COMPARE_JOBS);
}

/**
 * Build compare URL with job IDs
 *
 * @param jobIds - Array of job IDs to compare
 * @returns URL path with query parameters
 */
export function buildCompareUrl(jobIds: string[]): string {
  if (jobIds.length === 0) {
    return "/compare";
  }

  const uniqueIds = Array.from(new Set(jobIds)).slice(0, MAX_COMPARE_JOBS);
  return `/compare?jobs=${uniqueIds.join(",")}`;
}
