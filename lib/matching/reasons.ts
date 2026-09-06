/**
 * NextUp Matching Engine - Centralized Reason Generation
 *
 * This module is the single source for generating match reasons.
 * All reason strings are defined here and used by the matching engine.
 *
 * All reasons must be:
 * - Factual (based on actual data, not speculation)
 * - Helpful (actionable or informative)
 * - Concise (one clear sentence)
 * - Deterministic (same inputs = same reasons)
 */

import type { MatchReason, MatchProfile, MatchJob, ComponentScore } from "./types";

/**
 * Reason priority constants
 * Priority scale: 100 = most important, 0 = least important
 */
const PRIORITY = {
  HARD_FAILURE: 100,
  STRONG_FIT: 100,
  EXACT_TARGET: 95,
  SALARY_MATCH: 90,
  TRANSFERABLE: 90,
  WORK_ARRANGEMENT: 85,
  LOCATION_MATCH: 85,
  MISSING_SKILLS: 80,
  EXPERIENCE_GAP: 75,
  INDUSTRY: 70,
  SENIORITY: 75,
  SALARY_PARTIAL: 70,
} as const;

/**
 * Reason generation functions
 * Each function creates a deterministic reason from data
 */
export const REASON_TEMPLATES = {
  // Skill-based reasons
  skills: {
    strongMatch: (count: number): MatchReason => ({
      text: `You match ${count} of the key skills for this role`,
      priority: 100,
      component: "skills",
    }),

    expertiseMatch: (skills: string[]): MatchReason => ({
      text: `Your expertise in ${skills.join(", ")} aligns with core requirements`,
      priority: 95,
      component: "skills",
    }),

    missingSkills: (skills: string[], total: number): MatchReason => ({
      text:
        total === 1
          ? `${skills[0]} listed as a desired skill`
          : `${skills.join(", ")}${
              total > skills.length ? ` and ${total - skills.length} more` : ""
            } listed as desired skills`,
      priority: 80,
      component: "skills",
    }),
  },

  // Experience-based reasons
  experience: {
    meetsRequirement: (years: number): MatchReason => ({
      text: `Your ${years} years of experience meets the role's requirements`,
      priority: 90,
      component: "experience",
    }),

    exceedsRequirement: (userYears: number, required: number): MatchReason => ({
      text: `Your ${userYears} years of experience exceeds the ${required}+ years requested`,
      priority: 85,
      component: "experience",
    }),

    belowRequirement: (userYears: number, required: number): MatchReason => ({
      text: `Role asks for ${required}+ years; your profile shows ${userYears} years`,
      priority: 75,
      component: "experience",
    }),

    transferable: (): MatchReason => ({
      text: "Your current experience transfers well to this role",
      priority: 90,
      component: "experience",
    }),
  },

  // Salary-based reasons
  salary: {
    meetsIdeal: (): MatchReason => ({
      text: "The salary range aligns well with your target compensation",
      priority: 90,
      component: "salary",
    }),

    meetsMinimum: (): MatchReason => ({
      text: "Salary meets your minimum but falls below your ideal target",
      priority: 70,
      component: "salary",
    }),

    belowMinimum: (userMin: number): MatchReason => ({
      text: `Job's maximum salary falls below your minimum requirement of $${userMin.toLocaleString()}`,
      priority: 100,
      component: "salary",
    }),

    belowIdeal: (): MatchReason => ({
      text: "Salary range falls below your ideal target",
      priority: 70,
      component: "salary",
    }),
  },

  // Work arrangement reasons
  workArrangement: {
    perfectMatch: (arrangement: string): MatchReason => ({
      text: `This ${arrangement} role matches your work preferences`,
      priority: 85,
      component: "workArrangement",
    }),

    conflict: (arrangement: string): MatchReason => ({
      text: `This ${arrangement} position conflicts with your work arrangement preferences`,
      priority: 100,
      component: "workArrangement",
    }),

    acceptable: (arrangement: string): MatchReason => ({
      text: `${arrangement} work arrangement is acceptable based on your preferences`,
      priority: 60,
      component: "workArrangement",
    }),
  },

  // Location-based reasons
  location: {
    remote: (): MatchReason => ({
      text: "Remote position offers location flexibility",
      priority: 80,
      component: "location",
    }),

    sameCity: (): MatchReason => ({
      text: "Job location matches your current location",
      priority: 85,
      component: "location",
    }),

    preferredLocation: (): MatchReason => ({
      text: "Job is in one of your preferred locations",
      priority: 85,
      component: "location",
    }),

    willingToRelocate: (): MatchReason => ({
      text: "Location requires relocation, which you're open to",
      priority: 65,
      component: "location",
    }),

    locationMismatch: (): MatchReason => ({
      text: "Job location doesn't align with your preferred areas",
      priority: 70,
      component: "location",
    }),
  },

  // Career goals reasons
  careerGoals: {
    targetRole: (): MatchReason => ({
      text: "This role matches one of your target career paths",
      priority: 95,
      component: "careerGoals",
    }),

    transferableTarget: (): MatchReason => ({
      text: "This role represents a natural next step from your current position",
      priority: 90,
      component: "careerGoals",
    }),

    industryAlignment: (): MatchReason => ({
      text: "Company industry aligns with your background",
      priority: 70,
      component: "careerGoals",
    }),
  },

  // Seniority reasons
  seniority: {
    goodFit: (): MatchReason => ({
      text: "Seniority level aligns well with your experience",
      priority: PRIORITY.SENIORITY,
      component: "seniority",
    }),

    majorGap: (): MatchReason => ({
      text: "Significant seniority gap between your current level and this role",
      priority: PRIORITY.MISSING_SKILLS,
      component: "seniority",
    }),
  },
} as const;

/**
 * Generate fit reasons from breakdown data
 * Centralized logic for creating positive match reasons
 */
export function generateFitReasons(
  matchedSkills: string[],
  breakdown: {
    skills: ComponentScore;
    salary: ComponentScore;
    workArrangement: ComponentScore;
    careerGoals: ComponentScore;
  },
  job: MatchJob
): MatchReason[] {
  const reasons: MatchReason[] = [];

  // Skills match
  if (matchedSkills.length >= 3) {
    reasons.push({
      text: `You match ${matchedSkills.length} of the key skills for this role`,
      priority: PRIORITY.STRONG_FIT,
      component: "skills",
    });
  }

  // Salary match
  if (breakdown.salary.score >= 85) {
    reasons.push({
      text: "The salary range aligns well with your target compensation",
      priority: PRIORITY.SALARY_MATCH,
      component: "salary",
    });
  }

  // Work arrangement match
  if (breakdown.workArrangement.score >= 90) {
    reasons.push({
      text: `This ${job.workArrangement} role matches your work preferences`,
      priority: PRIORITY.WORK_ARRANGEMENT,
      component: "workArrangement",
    });
  }

  // Career goals match
  if (breakdown.careerGoals.score >= 80) {
    const matchType = breakdown.careerGoals.metadata?.matchType;
    if (matchType === "exact") {
      reasons.push({
        text: "This role matches one of your target career paths",
        priority: PRIORITY.EXACT_TARGET,
        component: "careerGoals",
      });
    } else if (matchType === "transferable") {
      reasons.push({
        text: "Your current experience transfers well to this role",
        priority: PRIORITY.TRANSFERABLE,
        component: "careerGoals",
      });
    }
  }

  // Sort by priority (descending) and limit
  reasons.sort((a, b) => b.priority - a.priority);
  return reasons.slice(0, 4);
}

/**
 * Generate concern reasons from breakdown data
 * Centralized logic for creating negative match reasons
 */
export function generateConcernReasons(
  missingSkills: string[],
  breakdown: {
    experience: ComponentScore;
    salary: ComponentScore;
  },
  hardFailures: Array<{ message: string; component: string }>
): MatchReason[] {
  const reasons: MatchReason[] = [];

  // Hard failures are top priority
  for (const failure of hardFailures) {
    reasons.push({
      text: failure.message,
      priority: PRIORITY.HARD_FAILURE,
      component: failure.component,
    });
  }

  // Missing skills
  if (missingSkills.length > 0 && missingSkills.length <= 3) {
    const skillsList = missingSkills.slice(0, 2).join(", ");
    const suffix = missingSkills.length > 2 ? ` and ${missingSkills.length - 2} more` : "";
    reasons.push({
      text: `${skillsList}${suffix} listed as desired skills`,
      priority: PRIORITY.MISSING_SKILLS,
      component: "skills",
    });
  }

  // Experience gap
  const userYears = breakdown.experience.metadata?.userYears as number | undefined;
  const requiredYears = breakdown.experience.metadata?.requiredYears as number | undefined;
  if (requiredYears && userYears !== undefined && userYears < requiredYears) {
    reasons.push({
      text: `Role asks for ${requiredYears}+ years; your profile shows ${userYears} years`,
      priority: PRIORITY.EXPERIENCE_GAP,
      component: "experience",
    });
  }

  // Salary below ideal (but not hard failure)
  if (
    breakdown.salary.score < 85 &&
    breakdown.salary.score > 40 &&
    !breakdown.salary.metadata?.hardFailure
  ) {
    reasons.push({
      text: "Salary range falls below your ideal target",
      priority: PRIORITY.SALARY_PARTIAL,
      component: "salary",
    });
  }

  // Sort by priority and limit
  reasons.sort((a, b) => b.priority - a.priority);
  return reasons.slice(0, 3);
}
