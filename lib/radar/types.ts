/**
 * E4 Opportunity Radar — Pure Domain Types
 *
 * Radar organizes scored opportunities into purpose-driven categories using
 * deterministic, evidence-backed rules.
 *
 * Radar does NOT:
 * - Create new match scores
 * - Modify MatchResult
 * - Infer missing data
 * - Call Date.now() in pure selectors
 */

import type { Job } from "@/types";

/**
 * Radar Job Input
 *
 * Minimal adapter from MatchResult + Job for category selection.
 * Incomplete profiles are excluded before adaptation.
 */
export interface RadarJobInput {
  readonly job: Job;
  readonly overallScore: number;
  readonly qualificationScore: number;
  readonly missingSkills: readonly string[];
}

/**
 * Radar Category
 *
 * Each category represents a purpose-driven lens for discovering opportunities.
 */
export type RadarCategory =
  | "bestMatches"
  | "newOpportunities"
  | "highCompensation"
  | "stretchOpportunities";

/**
 * Radar Category Result
 *
 * Ordered, limited subset of jobs for a specific category.
 */
export interface RadarCategoryResult {
  readonly category: RadarCategory;
  readonly jobs: readonly RadarJobInput[];
  readonly totalEligible: number;
}

/**
 * Radar Results
 *
 * All category results for a Radar session.
 */
export interface RadarResults {
  readonly bestMatches: RadarCategoryResult;
  readonly newOpportunities: RadarCategoryResult;
  readonly highCompensation: RadarCategoryResult;
  readonly stretchOpportunities: RadarCategoryResult;
  readonly asOfMs: number;
}
