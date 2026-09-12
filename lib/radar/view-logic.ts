/**
 * E4 Opportunity Radar — View Logic
 *
 * Production helper functions for Explore view mode management,
 * URL parameter handling, CompareTray visibility, and Radar candidate filtering.
 *
 * These functions are pure, testable, and independent of React/Next.js runtime.
 */

export type ExploreViewMode = "list" | "deck" | "radar";

/**
 * Parse view mode from URL search parameter
 *
 * @param value - The "view" query parameter value (may be null)
 * @returns Validated view mode ("list" is default)
 */
export function parseExploreView(value: string | null): ExploreViewMode {
  if (value === "radar" || value === "deck") {
    return value;
  }
  return "list";
}

/**
 * Build Explore URL with view mode parameter
 *
 * Preserves other query parameters while updating/removing view parameter.
 * List mode removes the view parameter entirely (default state).
 *
 * @param currentQueryString - Current URLSearchParams.toString() value
 * @param newView - Target view mode
 * @returns Full URL path with query string (or just /explore for default)
 */
export function buildExploreViewUrl(
  currentQueryString: string,
  newView: ExploreViewMode
): string {
  const params = new URLSearchParams(currentQueryString);

  if (newView === "list") {
    params.delete("view");
  } else {
    params.set("view", newView);
  }

  return params.toString() ? `/explore?${params}` : "/explore";
}

/**
 * Determine if CompareTray should be visible
 *
 * CompareTray is shown in List and Radar modes only.
 * Deck mode hides it (uses its own swipe-based navigation).
 *
 * @param view - Current view mode
 * @returns True if CompareTray should render
 */
export function shouldShowCompareTray(view: ExploreViewMode): boolean {
  return view === "list" || view === "radar";
}

/**
 * Filter Radar candidates by excluding passed jobs
 *
 * Radar shows unreviewed opportunities. Jobs that have been explicitly
 * passed should not appear in Radar categories.
 *
 * Note: Saved and Applied jobs MAY still appear in Radar unless also passed.
 *
 * @param matches - Filtered job matches (after search/arrangement/score filters)
 * @param passedJobIds - Set of job IDs that have been passed
 * @returns Matches excluding passed jobs
 */
export function filterRadarCandidates<T extends { job: { id: string } }>(
  matches: readonly T[],
  passedJobIds: ReadonlySet<string>
): T[] {
  return matches.filter((match) => !passedJobIds.has(match.job.id));
}
