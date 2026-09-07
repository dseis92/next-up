/**
 * NextUp Matching Engine - Canonical Adapters
 *
 * This module provides the SINGLE SOURCE OF TRUTH for transforming
 * NextUp application data into Phase 9 matching engine inputs.
 *
 * CRITICAL INVARIANT:
 * All matching calculations MUST use these adapters.
 * Do not create page-specific profile/job transformations.
 */

import type { MatchProfile, MatchJob } from "./types";
import type {
  UserProfile,
  UserSkill,
  WorkExperience,
  UserPreferences,
  Job,
} from "@/types";

/**
 * Persisted onboarding progress data
 * Represents actual data from onboarding_progress table
 */
export interface OnboardingProgress {
  current_title?: string;
  industry?: string;
  years_experience?: number;
  employment_status?: string;
  location?: string;
  max_commute?: number;
  willing_to_relocate: boolean;
  salary_min?: number;
  salary_ideal?: number;
}

/**
 * Persisted user preferences data
 * Represents actual data from user_preferences table
 */
export interface PersistedUserPreferences {
  remote: boolean;
  hybrid: boolean;
  onsite: boolean;
  full_time: boolean;
  part_time: boolean;
  contract: boolean;
  travel_tolerance?: number;
  priorities: {
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
 * User matching data
 * Consolidated data needed to build MatchProfile
 * Maps to actual persisted structure, not application domain types
 */
export interface UserMatchingData {
  onboarding: OnboardingProgress | null;
  skills: UserSkill[];
  experiences: WorkExperience[];
  preferences: PersistedUserPreferences | null;
  goals: string[];
  targetRoles: string[];
  preferredLocations: string[];
}

/**
 * Build MatchProfile from persisted user data
 *
 * This is the canonical transformation from NextUp user data → Phase 9 MatchProfile.
 * Uses actual persisted values. Does NOT invent defaults for incomplete profiles.
 *
 * @param data - Consolidated user matching data from storage
 * @returns MatchProfile for matching engine
 */
export function buildMatchProfile(data: UserMatchingData): MatchProfile {
  const { onboarding, skills, experiences, preferences, goals, targetRoles, preferredLocations } = data;

  return {
    // Identity
    currentRole: onboarding?.current_title,
    yearsExperience: onboarding?.years_experience,
    industry: onboarding?.industry,

    // Goals and career direction
    goals: goals,
    targetRoles: targetRoles,

    // Skills with proficiency
    skills: skills.map((userSkill) => ({
      name: userSkill.skill.name,
      proficiency: userSkill.proficiency,
    })),

    // Work history
    experiences: experiences.map((exp) => ({
      title: exp.title,
      company: exp.company,
      startDate: exp.start_date,
      endDate: exp.end_date,
      current: exp.current,
      description: exp.description,
    })),

    // Compensation expectations
    salaryMin: onboarding?.salary_min,
    salaryIdeal: onboarding?.salary_ideal,

    // Work arrangement preferences
    workPreferences: preferences
      ? {
          remote: preferences.remote,
          hybrid: preferences.hybrid,
          onsite: preferences.onsite,
          fullTime: preferences.full_time,
          partTime: preferences.part_time,
          contract: preferences.contract,
        }
      : undefined,

    // Location preferences
    location: onboarding?.location,
    preferredLocations: preferredLocations,
    willingToRelocate: onboarding?.willing_to_relocate ?? false,
    maxCommute: onboarding?.max_commute,

    // User priorities (0-10 scale)
    priorities: preferences
      ? {
          salary: preferences.priorities.salary,
          workLifeBalance: preferences.priorities.workLifeBalance,
          careerGrowth: preferences.priorities.careerGrowth,
          location: preferences.priorities.location,
          remoteFlexibility: preferences.priorities.remoteFlexibility,
          culture: preferences.priorities.culture,
          stability: preferences.priorities.stability,
          benefits: preferences.priorities.benefits,
          mission: preferences.priorities.mission,
          learning: preferences.priorities.learning,
        }
      : undefined,
  };
}

/**
 * Adapt NextUp Job to Phase 9 MatchJob
 *
 * This is the canonical transformation from NextUp Job → Phase 9 MatchJob.
 * Maps actual job fields without mutation.
 *
 * @param job - NextUp Job from database/storage
 * @returns MatchJob for matching engine
 */
export function adaptJobForMatching(job: Job): MatchJob {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    requirements: job.requirements,
    responsibilities: job.responsibilities,

    // Work details
    workArrangement: job.work_arrangement,
    employmentType: job.employment_type,
    experienceLevel: job.experience_level,

    // Compensation
    salaryMin: job.salary_min,
    salaryMax: job.salary_max,
    salaryPeriod: job.salary_period,

    // Location
    location: job.location,

    // Company context
    company: {
      name: job.company.name,
      industry: job.company.industry,
    },
  };
}
