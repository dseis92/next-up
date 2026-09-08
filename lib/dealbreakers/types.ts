/**
 * NextUp Dealbreaker Engine - Type Definitions
 *
 * Dealbreakers are user-defined non-negotiables that flag opportunities
 * that conflict with explicit requirements.
 *
 * Core principle: Dealbreakers are separate from match scoring.
 * A job can be a 93% match AND have 1 dealbreaker conflict.
 * That is correct.
 *
 * Three-state evaluation: PASS | CONFLICT | UNKNOWN
 * UNKNOWN means insufficient trusted job data, NOT a conflict.
 */

/**
 * User's dealbreaker preferences
 * This is persisted per-user and represents their non-negotiables
 */
export interface DealbreakerPreferences {
  userId: string;

  // Minimum compensation requirement
  minimumSalary?: number;

  // Require salary disclosure
  requireSalaryDisclosure: boolean;

  // Allowed work arrangements (empty = no restriction)
  allowedWorkArrangements: ("remote" | "hybrid" | "onsite")[];

  // Allowed employment types (empty = no restriction)
  allowedEmploymentTypes: ("full_time" | "part_time" | "contract" | "temporary")[];

  createdAt: string;
  updatedAt: string;
}

/**
 * Outcome of evaluating a single dealbreaker rule
 */
export type RuleOutcome = "pass" | "conflict" | "unknown";

/**
 * Result of evaluating a single dealbreaker rule against a job
 */
export interface DealbreakerFinding {
  ruleType: "minimum_salary" | "salary_disclosure" | "work_arrangement" | "employment_type";
  outcome: RuleOutcome;
  title: string;
  explanation: string;
}

/**
 * Overall dealbreaker evaluation status
 */
export type DealbreakerStatus =
  | "inactive" // No active rules configured
  | "clear" // All active rules pass
  | "conflict" // At least one rule conflicts
  | "unknown"; // No conflicts but at least one unknown

/**
 * Complete dealbreaker evaluation result for a job
 */
export interface DealbreakerEvaluation {
  status: DealbreakerStatus;

  // Counts by outcome
  conflictCount: number;
  unknownCount: number;
  passCount: number;

  // Individual rule findings
  findings: DealbreakerFinding[];
}

/**
 * Job data needed for dealbreaker evaluation
 * Adapted from the full Job type
 *
 * Nullable fields represent database reality where jobs may have
 * incomplete or unverified data.
 */
export interface DealbreakerJobData {
  id: string;
  title: string;
  workArrangement?: "remote" | "hybrid" | "onsite" | null;
  employmentType?: "full_time" | "part_time" | "contract" | "temporary" | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryPeriod?: "hourly" | "yearly" | null;
  salaryIsEstimated?: boolean | null;
}
