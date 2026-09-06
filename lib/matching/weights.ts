/**
 * NextUp Matching Engine - Centralized Weights Configuration
 *
 * This module contains all scoring weights and constants used by the matching engine.
 * All weights are defined in one place for easy tuning and transparency.
 *
 * Total weight across all components: 100 points
 */

/**
 * Component weights for overall score calculation
 * These must sum to 100
 */
export const COMPONENT_WEIGHTS = {
  skills: 25,
  experience: 20,
  salary: 15,
  location: 10,
  workArrangement: 10,
  careerGoals: 10,
  seniority: 5, // Part of qualification, measured separately
  userPriorities: 5, // Adjusts based on what user values most
} as const;

/**
 * Verify weights sum to 100 at module load time
 */
const totalWeight = Object.values(COMPONENT_WEIGHTS).reduce((sum, w) => sum + w, 0);
if (totalWeight !== 100) {
  throw new Error(
    `Component weights must sum to 100, but sum to ${totalWeight}`
  );
}

/**
 * Components that primarily contribute to qualification score
 */
export const QUALIFICATION_COMPONENTS = [
  "skills",
  "experience",
  "seniority",
  "careerGoals",
] as const;

/**
 * Components that primarily contribute to lifestyle score
 */
export const LIFESTYLE_COMPONENTS = [
  "salary",
  "location",
  "workArrangement",
  "userPriorities",
] as const;

/**
 * Hard failure score cap
 * A job with ANY hard failure cannot score above this threshold
 */
export const HARD_FAILURE_SCORE_CAP = 65;

/**
 * Skill matching weights
 */
export const SKILL_WEIGHTS = {
  // Proficiency score multipliers (how much weight a skill carries based on user's proficiency)
  proficiencyMultiplier: {
    learning: 0.5,
    comfortable: 0.75,
    strong: 1.0,
    expert: 1.0,
  },

  // Penalty for missing required skills (per skill, as percentage of total skill score)
  missingSkillPenalty: 15, // Each missing skill reduces score by up to 15% of max

  // Maximum number of missing skills to penalize (beyond this, score floors at minimum)
  maxMissingSkillsPenalized: 3,
} as const;

/**
 * Experience scoring weights
 */
export const EXPERIENCE_WEIGHTS = {
  // Years of experience scoring
  perfectMatchYears: 1.0, // Multiplier when user meets/exceeds requirement
  partialMatchYears: 0.6, // Multiplier when user has some but not all required years
  underQualifiedPenalty: 0.15, // Penalty per missing year (as fraction of total score)
  maxYearsPenalty: 3, // Maximum years difference to penalize

  // Transferable experience credit
  transferableExperienceCredit: 0.7, // Credit when experience is transferable vs exact match
} as const;

/**
 * Seniority level scoring
 */
export const SENIORITY_WEIGHTS = {
  // Perfect match: same level
  exactMatch: 1.0,

  // Adjacent levels (e.g., mid → senior)
  adjacentMatch: 0.85,

  // Two levels apart (e.g., mid → lead)
  twoLevelsApart: 0.6,

  // Three+ levels apart (e.g., entry → director)
  majorGap: 0.3,

  // Unknown seniority
  unknownSeniority: 0.7, // Neutral score when not enough data
} as const;

/**
 * Salary scoring weights
 */
export const SALARY_WEIGHTS = {
  // Perfect score: job range meets or exceeds ideal
  meetsIdeal: 1.0,

  // Partial score: job range meets minimum but below ideal
  meetsMinimum: 0.7,

  // Below minimum but close (within 10%)
  nearMinimum: 0.4,

  // Unknown salary
  unknownSalary: 0.6, // Neutral when employer doesn't publish salary

  // Hourly to yearly conversion constant
  hoursPerYear: 2080,
} as const;

/**
 * Work arrangement scoring
 */
export const WORK_ARRANGEMENT_WEIGHTS = {
  // Perfect match (user prefers and job offers)
  perfectMatch: 1.0,

  // Acceptable match (user accepts this arrangement)
  acceptableMatch: 0.8,

  // Not preferred but user didn't exclude it
  notPreferred: 0.5,

  // Unknown arrangement
  unknownArrangement: 0.6,
} as const;

/**
 * Location scoring weights
 */
export const LOCATION_WEIGHTS = {
  // Remote job (generally location-compatible)
  remoteJob: 1.0,

  // Same city/exact match
  exactLocationMatch: 1.0,

  // Same state
  sameState: 0.7,

  // Willing to relocate
  willingToRelocate: 0.8,

  // Different location, not willing to relocate
  incompatibleLocation: 0.3,

  // Unknown location
  unknownLocation: 0.6,
} as const;

/**
 * Career goals scoring
 */
export const CAREER_GOALS_WEIGHTS = {
  // Job title matches target role exactly
  exactTargetMatch: 1.0,

  // Job is a defined transferable next step
  transferableTargetMatch: 0.8,

  // Industry alignment bonus
  industryAlignment: 0.15, // Additive bonus to base score

  // No clear career alignment
  noAlignment: 0.4,

  // Unknown goals
  unknownGoals: 0.5,
} as const;

/**
 * Minimum profile completeness requirements
 * User must have these fields to receive a scored match
 */
export const MINIMUM_PROFILE_REQUIREMENTS = {
  // At least one of these experience indicators
  requireExperienceIndicator: true, // yearsExperience OR experiences.length > 0

  // Minimum skills
  minSkills: 2,

  // At least one career direction indicator
  requireCareerDirection: true, // targetRoles.length > 0 OR goals.length > 0

  // Minimum preferences (at least one work arrangement preference)
  requireWorkPreference: true,
} as const;

/**
 * Reason generation limits
 */
export const REASON_LIMITS = {
  maxFitReasons: 4,
  maxConcernReasons: 3,
} as const;

/**
 * Normalization and rounding
 */
export const NORMALIZATION = {
  // Round final scores to nearest integer
  roundToInteger: true,

  // Minimum score floor
  minScore: 0,

  // Maximum score ceiling
  maxScore: 100,
} as const;
