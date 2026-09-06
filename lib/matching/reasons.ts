/**
 * NextUp Matching Engine - Reason Generation
 *
 * This module contains utilities for generating match reasons.
 * Reasons are deterministic templates populated with actual match data.
 *
 * All reasons must be:
 * - Factual (based on actual data, not speculation)
 * - Helpful (actionable or informative)
 * - Concise (one clear sentence)
 * - Deterministic (same inputs = same reasons)
 */

import type { MatchReason } from "./types";

/**
 * Reason templates
 * Priority scale: 100 = most important, 0 = least important
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
      priority: 75,
      component: "seniority",
    }),

    majorGap: (): MatchReason => ({
      text: "Significant seniority gap between your current level and this role",
      priority: 80,
      component: "seniority",
    }),
  },
} as const;
