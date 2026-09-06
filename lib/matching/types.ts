/**
 * NextUp Deterministic Matching Engine - Type Definitions
 *
 * This module defines all types used by the matching engine.
 * The matching engine is a pure, deterministic function that calculates
 * how well a job matches a user's profile.
 *
 * Core principle: Same inputs always produce same outputs.
 * No AI, no embeddings, no randomness, no network calls.
 */

/**
 * User profile input for matching calculation
 * Derived from onboarding/profile data
 */
export interface MatchProfile {
  // Identity
  currentRole?: string;
  yearsExperience?: number;
  industry?: string;

  // Goals and career direction
  goals: string[];
  targetRoles: string[];

  // Skills with proficiency levels
  skills: Array<{
    name: string;
    proficiency: "learning" | "comfortable" | "strong" | "expert";
  }>;

  // Work history
  experiences: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
  }>;

  // Compensation expectations
  salaryMin?: number;
  salaryIdeal?: number;

  // Work arrangement preferences
  workPreferences?: {
    remote: boolean;
    hybrid: boolean;
    onsite: boolean;
    fullTime: boolean;
    partTime: boolean;
    contract: boolean;
  };

  // Location preferences
  location?: string;
  preferredLocations: string[];
  willingToRelocate: boolean;
  maxCommute?: number;

  // User priorities (0-10 scale for each)
  priorities?: {
    salary: number;
    workLifeBalance: number;
    careerGrowth: number;
    location: number;
    remoteFlexibility: number;
    culture: number;
    stability: number;
    benefits: number;
    mission: number;
    learning: number;
  };
}

/**
 * Job data for matching calculation
 */
export interface MatchJob {
  id: string;
  title: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];

  // Work details
  workArrangement: "remote" | "hybrid" | "onsite";
  employmentType: "full_time" | "part_time" | "contract" | "temporary";
  experienceLevel?: "entry" | "mid" | "senior" | "lead" | "executive";

  // Compensation
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: "hourly" | "yearly";

  // Location
  location?: string;

  // Company context
  company: {
    name: string;
    industry?: string;
  };
}

/**
 * Component score with metadata
 */
export interface ComponentScore {
  score: number; // 0-100
  weight: number; // Weight in overall calculation
  confidence: "high" | "medium" | "low" | "unknown";
  metadata?: Record<string, unknown>;
}

/**
 * Hard failure that prevents job from being a strong match
 */
export interface HardFailure {
  code: string;
  severity: "hard";
  message: string;
  component: string;
}

/**
 * Match reason (fit or concern)
 */
export interface MatchReason {
  text: string;
  priority: number; // Higher = more important
  component: string;
}

/**
 * Result status
 */
export type MatchStatus = "scored" | "incomplete_profile";

/**
 * Complete matching result
 */
export interface MatchResult {
  // Overall assessment
  status: MatchStatus;
  overallScore: number | null; // 0-100 when scored, null when incomplete
  qualificationScore: number | null; // 0-100 when scored
  lifestyleScore: number | null; // 0-100 when scored

  // Component breakdown
  breakdown: {
    skills: ComponentScore;
    experience: ComponentScore;
    salary: ComponentScore;
    location: ComponentScore;
    workArrangement: ComponentScore;
    careerGoals: ComponentScore;
    seniority: ComponentScore;
    userPriorities: ComponentScore;
  };

  // Skill analysis
  matchedSkills: string[];
  missingSkills: string[];

  // Hard incompatibilities
  hardFailures: HardFailure[];

  // Explanations
  reasonsFit: MatchReason[];
  reasonsConcern: MatchReason[];

  // Profile completeness feedback
  missingProfileFields?: string[];
}

/**
 * Normalized seniority level
 */
export type SeniorityLevel =
  | "entry"
  | "junior"
  | "mid"
  | "senior"
  | "lead"
  | "supervisor"
  | "manager"
  | "director"
  | "executive";

/**
 * Career transferability relationship
 */
export interface TransferableRole {
  fromRole: string;
  toRole: string;
  transferabilityScore: number; // 0-1, how much experience transfers
  sharedDimensions: string[];
}

/**
 * Parsed experience requirement
 */
export interface ExperienceRequirement {
  minYears: number;
  maxYears?: number;
  field?: string;
  confidence: "high" | "medium" | "low";
}
