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
 * User matching data
 * Consolidated data needed to build MatchProfile
 */
export interface UserMatchingData {
  profile: UserProfile;
  skills: UserSkill[];
  experiences: WorkExperience[];
  preferences: UserPreferences | null;
  goals: string[];
  targetRoles: string[];
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
  const { profile, skills, experiences, preferences, goals, targetRoles } = data;

  return {
    // Identity
    currentRole: profile.current_title,
    yearsExperience: profile.years_experience,
    industry: undefined, // Not currently stored in profile

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
    salaryMin: preferences?.salary_min,
    salaryIdeal: preferences?.salary_ideal,

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
    location: profile.location,
    preferredLocations: preferences?.preferred_locations || [],
    willingToRelocate: preferences?.willing_to_relocate ?? false,
    maxCommute: preferences?.max_commute_minutes,

    // User priorities (0-10 scale)
    priorities: preferences
      ? {
          salary: preferences.priorities.salary,
          workLifeBalance: preferences.priorities.work_life_balance,
          careerGrowth: preferences.priorities.career_growth,
          location: preferences.priorities.location,
          remoteFlexibility: preferences.priorities.remote_flexibility,
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
