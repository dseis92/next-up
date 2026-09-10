/**
 * E4 Opportunity Radar — JobMatch Adapter
 *
 * Transforms Explore's JobMatch type directly into RadarJobInput.
 * Does NOT reconstruct MatchResult.
 */

import type { JobMatch } from "@/types";
import type { RadarJobInput } from "./types";

/**
 * Adapt JobMatch to RadarJobInput
 *
 * Explore has already filtered out incomplete profiles.
 * Extract only the fields Radar selectors need.
 *
 * @param match - Existing Explore JobMatch
 * @returns RadarJobInput
 */
export function adaptJobMatchForRadar(match: JobMatch): RadarJobInput {
  return {
    job: match.job,
    overallScore: match.overall_score,
    qualificationScore: match.qualification_score,
    missingSkills: match.missing_skills,
  };
}

/**
 * Adapt multiple JobMatch objects
 *
 * @param matches - Array of Explore JobMatch objects
 * @returns Array of RadarJobInput
 */
export function adaptJobMatchesForRadar(
  matches: readonly JobMatch[]
): RadarJobInput[] {
  return matches.map(adaptJobMatchForRadar);
}
