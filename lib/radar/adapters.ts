/**
 * E4 Opportunity Radar — Adapters
 *
 * Transforms MatchResult + Job into RadarJobInput.
 * Incomplete profiles must be filtered before calling these adapters.
 */

import type { Job } from "@/types";
import type { MatchResult } from "@/lib/matching/types";
import type { RadarJobInput } from "./types";

/**
 * Adapt Job + MatchResult to RadarJobInput
 *
 * @param job - Job domain object
 * @param matchResult - Phase 9/10 match result (must be status='scored')
 * @returns RadarJobInput for category selection
 *
 * @throws Error if matchResult.status !== 'scored'
 */
export function adaptJobForRadar(
  job: Job,
  matchResult: MatchResult
): RadarJobInput {
  if (matchResult.status !== "scored") {
    throw new Error(
      `Cannot adapt incomplete profile to RadarJobInput. Status: ${matchResult.status}`
    );
  }

  return {
    job,
    overallScore: matchResult.overallScore!,
    qualificationScore: matchResult.qualificationScore!,
    missingSkills: matchResult.missingSkills,
  };
}

/**
 * Batch adapt Jobs + MatchResults to RadarJobInputs
 *
 * Automatically filters out incomplete profiles.
 *
 * @param jobs - Array of Job domain objects
 * @param matchResults - Array of MatchResult (same length as jobs)
 * @returns Array of RadarJobInput (excludes incomplete profiles)
 */
export function adaptJobsForRadar(
  jobs: readonly Job[],
  matchResults: readonly MatchResult[]
): RadarJobInput[] {
  if (jobs.length !== matchResults.length) {
    throw new Error(
      `Jobs and MatchResults length mismatch: ${jobs.length} !== ${matchResults.length}`
    );
  }

  const radarInputs: RadarJobInput[] = [];

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const matchResult = matchResults[i];

    // Skip incomplete profiles
    if (matchResult.status !== "scored") {
      continue;
    }

    radarInputs.push(adaptJobForRadar(job, matchResult));
  }

  return radarInputs;
}
