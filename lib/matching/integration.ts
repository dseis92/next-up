/**
 * Matching Engine Integration Helper
 *
 * Provides a clean API for calculating job matches throughout the NextUp application.
 * Handles profile loading, adaptation, and matching orchestration.
 *
 * SINGLE SOURCE OF TRUTH for all job matching in the application.
 */

import { calculateJobMatch } from "./calculate-job-match";
import { buildMatchProfile, adaptJobForMatching } from "./adapters";
import { loadUserMatchingData } from "./user-matching-data";
import type { MatchResult } from "./types";
import type { Job } from "@/types";
import type { UserMatchingData } from "./adapters";

/**
 * Calculate personalized match for a job using authenticated user data
 *
 * This is the primary integration point for the Phase 9 matching engine.
 * Loads user data, adapts to matching types, and calculates result.
 *
 * @param userId - Authenticated user ID
 * @param job - Job to match against
 * @returns MatchResult or null if load fails
 */
export async function calculatePersonalizedMatch(
  userId: string,
  job: Job
): Promise<MatchResult | null> {
  // Load user matching data
  const userData = await loadUserMatchingData(userId);

  if (!userData) {
    // User data failed to load
    return null;
  }

  // Build MatchProfile from user data
  const matchProfile = buildMatchProfile(userData);

  // Adapt job for matching
  const matchJob = adaptJobForMatching(job);

  // Calculate match using Phase 9 engine
  // Phase 9 will return incomplete_profile if required fields are missing
  return calculateJobMatch(matchProfile, matchJob);
}

/**
 * Calculate matches for multiple jobs using same user profile
 *
 * Efficient batch matching - loads profile once, calculates against all jobs.
 * Use this for job lists (Discover, Explore, Saved) to avoid N+1 queries.
 *
 * @param userId - Authenticated user ID
 * @param jobs - Array of jobs to match against
 * @returns Array of MatchResults (empty on load failure)
 */
export async function calculatePersonalizedMatches(
  userId: string,
  jobs: Job[]
): Promise<MatchResult[]> {
  // Load user matching data once
  const userData = await loadUserMatchingData(userId);

  if (!userData) {
    // User data failed to load - return empty array
    return [];
  }

  // Build MatchProfile once
  const matchProfile = buildMatchProfile(userData);

  // Calculate match for each job
  return jobs.map((job) => {
    const matchJob = adaptJobForMatching(job);
    return calculateJobMatch(matchProfile, matchJob);
  });
}

/**
 * Helper to calculate a single match from loaded user data
 * Useful for testing and situations where data is already loaded
 */
export function calculateMatchFromUserData(
  userData: UserMatchingData,
  job: Job
): MatchResult {
  const matchProfile = buildMatchProfile(userData);
  const matchJob = adaptJobForMatching(job);
  return calculateJobMatch(matchProfile, matchJob);
}

/**
 * Helper to calculate multiple matches from loaded user data
 * Useful for testing and situations where data is already loaded
 */
export function calculateMatchesFromUserData(
  userData: UserMatchingData,
  jobs: Job[]
): MatchResult[] {
  const matchProfile = buildMatchProfile(userData);
  return jobs.map((job) => {
    const matchJob = adaptJobForMatching(job);
    return calculateJobMatch(matchProfile, matchJob);
  });
}
