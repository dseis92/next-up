/**
 * E4 Opportunity Radar — Main Entry Point
 *
 * Generates all Radar category results from scored jobs.
 */

import type { RadarJobInput, RadarResults } from "./types";
import {
  selectBestMatches,
  selectNewOpportunities,
  selectHighCompensation,
  selectStretchOpportunities,
} from "./selectors";

/**
 * Generate Radar Results
 *
 * Applies all category selectors to the input jobs and returns organized results.
 *
 * @param jobs - Array of RadarJobInput (scored only, incomplete profiles excluded)
 * @param asOfMs - Explicit "now" timestamp for time-dependent categories
 * @returns Complete Radar results with all categories
 */
export function generateRadarResults(
  jobs: readonly RadarJobInput[],
  asOfMs: number
): RadarResults {
  return {
    bestMatches: selectBestMatches(jobs),
    newOpportunities: selectNewOpportunities(jobs, asOfMs),
    highCompensation: selectHighCompensation(jobs),
    stretchOpportunities: selectStretchOpportunities(jobs),
    asOfMs,
  };
}

// Re-export types and adapters
export type { RadarJobInput, RadarCategory, RadarCategoryResult, RadarResults } from "./types";
export { adaptJobForRadar, adaptJobsForRadar } from "./adapters";
export {
  selectBestMatches,
  selectNewOpportunities,
  selectHighCompensation,
  selectStretchOpportunities,
} from "./selectors";
