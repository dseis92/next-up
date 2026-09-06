/**
 * NextUp Deterministic Matching Engine
 *
 * Public API for the matching engine.
 * This is the only file that should be imported by application code.
 *
 * Example usage:
 *
 * ```typescript
 * import { calculateJobMatch } from '@/lib/matching';
 *
 * const result = calculateJobMatch(userProfile, job);
 *
 * if (result.status === 'scored') {
 *   console.log(`Overall match: ${result.overallScore}%`);
 *   console.log(`Qualification: ${result.qualificationScore}%`);
 *   console.log(`Lifestyle: ${result.lifestyleScore}%`);
 * }
 * ```
 */

export { calculateJobMatch } from "./calculate-job-match";
export type {
  MatchProfile,
  MatchJob,
  MatchResult,
  ComponentScore,
  HardFailure,
  MatchReason,
  SeniorityLevel,
  ExperienceRequirement,
  TransferableRole,
} from "./types";
export { COMPONENT_WEIGHTS } from "./weights";
