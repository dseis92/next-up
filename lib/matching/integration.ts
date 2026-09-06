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

/**
 * Calculate personalized match for a job using authenticated user data
 *
 * This is the primary integration point for the Phase 9 matching engine.
 * Loads user data, adapts to matching types, and calculates result.
 *
 * @param userId - Authenticated user ID
 * @param job - Job to match against
 * @returns MatchResult from Phase 9 engine
 */
export async function calculatePersonalizedMatch(
  userId: string,
  job: Job
): Promise<MatchResult> {
  // Load user matching data
  const userData = await loadUserMatchingData(userId);

  if (!userData) {
    // User data failed to load - return incomplete profile
    return {
      status: "incomplete_profile",
      overallScore: null,
      qualificationScore: null,
      lifestyleScore: null,
      breakdown: {
        skills: { score: 0, weight: 25, confidence: "unknown", metadata: {} },
        experience: { score: 0, weight: 20, confidence: "unknown", metadata: {} },
        salary: { score: 0, weight: 15, confidence: "unknown", metadata: {} },
        location: { score: 0, weight: 10, confidence: "unknown", metadata: {} },
        workArrangement: { score: 0, weight: 10, confidence: "unknown", metadata: {} },
        careerGoals: { score: 0, weight: 10, confidence: "unknown", metadata: {} },
        seniority: { score: 0, weight: 5, confidence: "unknown", metadata: {} },
        userPriorities: { score: 0, weight: 5, confidence: "unknown", metadata: {} },
      },
      matchedSkills: [],
      missingSkills: [],
      hardFailures: [],
      reasonsFit: [],
      reasonsConcern: [],
      missingProfileFields: ["profile"],
    };
  }

  // Build MatchProfile from user data
  const matchProfile = buildMatchProfile(userData);

  // Adapt job for matching
  const matchJob = adaptJobForMatching(job);

  // Calculate match using Phase 9 engine
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
 * @returns Array of MatchResults in same order as input jobs
 */
export async function calculatePersonalizedMatches(
  userId: string,
  jobs: Job[]
): Promise<MatchResult[]> {
  // Load user matching data once
  const userData = await loadUserMatchingData(userId);

  if (!userData) {
    // Return incomplete profile for all jobs
    const incompleteResult: MatchResult = {
      status: "incomplete_profile",
      overallScore: null,
      qualificationScore: null,
      lifestyleScore: null,
      breakdown: {
        skills: { score: 0, weight: 25, confidence: "unknown", metadata: {} },
        experience: { score: 0, weight: 20, confidence: "unknown", metadata: {} },
        salary: { score: 0, weight: 15, confidence: "unknown", metadata: {} },
        location: { score: 0, weight: 10, confidence: "unknown", metadata: {} },
        workArrangement: { score: 0, weight: 10, confidence: "unknown", metadata: {} },
        careerGoals: { score: 0, weight: 10, confidence: "unknown", metadata: {} },
        seniority: { score: 0, weight: 5, confidence: "unknown", metadata: {} },
        userPriorities: { score: 0, weight: 5, confidence: "unknown", metadata: {} },
      },
      matchedSkills: [],
      missingSkills: [],
      hardFailures: [],
      reasonsFit: [],
      reasonsConcern: [],
      missingProfileFields: ["profile"],
    };

    return jobs.map(() => ({ ...incompleteResult }));
  }

  // Build MatchProfile once
  const matchProfile = buildMatchProfile(userData);

  // Calculate match for each job
  return jobs.map((job) => {
    const matchJob = adaptJobForMatching(job);
    return calculateJobMatch(matchProfile, matchJob);
  });
}
