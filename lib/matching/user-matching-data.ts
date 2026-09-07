/**
 * User Matching Data Loader
 *
 * Efficiently loads all user data needed for matching calculations.
 * Designed to minimize N+1 queries - load profile data ONCE per page/session.
 *
 * Hydrates from actual persisted tables:
 * - onboarding_progress
 * - user_skills
 * - work_experiences
 * - user_preferences
 * - user_goals
 * - target_roles
 * - preferred_locations
 */

import { createClient } from "@/lib/supabase/client";
import type { UserMatchingData } from "./adapters";
import type { UserSkill, WorkExperience } from "@/types";

/**
 * Load all user matching data in one efficient operation
 *
 * @param userId - Authenticated user ID
 * @returns UserMatchingData or null if load fails
 */
export async function loadUserMatchingData(
  userId: string
): Promise<UserMatchingData | null> {
  const supabase = createClient();

  try {
    // Parallelize independent reads
    const [
      onboardingResult,
      skillsResult,
      experiencesResult,
      preferencesResult,
      goalsResult,
      rolesResult,
      locationsResult,
    ] = await Promise.all([
      // Fetch onboarding progress (may not exist for incomplete users)
      supabase
        .from("onboarding_progress")
        .select("current_title, industry, years_experience, employment_status, location, max_commute, willing_to_relocate, salary_min, salary_ideal")
        .eq("user_id", userId)
        .maybeSingle(),

      // Fetch skills
      supabase
        .from("user_skills")
        .select("id, user_id, skill_id, skill_name, proficiency, years")
        .eq("user_id", userId),

      // Fetch work experiences
      supabase
        .from("work_experiences")
        .select("*")
        .eq("user_id", userId)
        .order("current", { ascending: false })
        .order("start_date", { ascending: false }),

      // Fetch preferences (may not exist for incomplete users)
      supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),

      // Fetch goals
      supabase
        .from("user_goals")
        .select("goal")
        .eq("user_id", userId),

      // Fetch target roles
      supabase
        .from("target_roles")
        .select("role")
        .eq("user_id", userId),

      // Fetch preferred locations
      supabase
        .from("preferred_locations")
        .select("location")
        .eq("user_id", userId),
    ]);

    // Check for critical errors (not just missing data)
    if (onboardingResult.error && onboardingResult.error.code !== "PGRST116") {
      console.error("Failed to load onboarding progress:", onboardingResult.error);
      return null;
    }

    if (skillsResult.error) {
      console.error("Failed to load user skills:", skillsResult.error);
      return null;
    }

    if (experiencesResult.error) {
      console.error("Failed to load work experiences:", experiencesResult.error);
      return null;
    }

    if (preferencesResult.error && preferencesResult.error.code !== "PGRST116") {
      console.error("Failed to load user preferences:", preferencesResult.error);
      return null;
    }

    if (goalsResult.error) {
      console.error("Failed to load user goals:", goalsResult.error);
      return null;
    }

    if (rolesResult.error) {
      console.error("Failed to load target roles:", rolesResult.error);
      return null;
    }

    if (locationsResult.error) {
      console.error("Failed to load preferred locations:", locationsResult.error);
      return null;
    }

    // Transform skills data structure
    // skill_name is the canonical persisted name; skill_id may be null
    const skills: UserSkill[] = (skillsResult.data || []).map((us) => ({
      id: us.id,
      user_id: us.user_id,
      skill_id: us.skill_id || us.id, // Use id as fallback if skill_id is null
      skill: {
        id: us.skill_id || us.id,
        name: us.skill_name,
        category: undefined, // Category not available without join
      },
      proficiency: us.proficiency,
      years: us.years,
    }));

    // Transform preferences to match PersistedUserPreferences shape
    const rawPriorities = (preferencesResult.data?.priorities as Record<string, number>) || {};
    const preferences = preferencesResult.data
      ? {
          remote: preferencesResult.data.remote,
          hybrid: preferencesResult.data.hybrid,
          onsite: preferencesResult.data.onsite,
          full_time: preferencesResult.data.full_time,
          part_time: preferencesResult.data.part_time,
          contract: preferencesResult.data.contract,
          travel_tolerance: preferencesResult.data.travel_tolerance,
          priorities: {
            salary: rawPriorities.salary ?? 5,
            workLifeBalance: rawPriorities.work_life_balance ?? rawPriorities.workLifeBalance ?? 5,
            careerGrowth: rawPriorities.career_growth ?? rawPriorities.careerGrowth ?? 5,
            location: rawPriorities.location ?? 5,
            remoteFlexibility: rawPriorities.remote_flexibility ?? rawPriorities.remoteFlexibility ?? 5,
            culture: rawPriorities.culture ?? 5,
            stability: rawPriorities.stability ?? 5,
            benefits: rawPriorities.benefits ?? 5,
            mission: rawPriorities.mission ?? 5,
            learning: rawPriorities.learning ?? 5,
          },
        }
      : null;

    return {
      onboarding: onboardingResult.data || null,
      skills,
      experiences: (experiencesResult.data as WorkExperience[]) || [],
      preferences,
      goals: (goalsResult.data || []).map((g) => g.goal),
      targetRoles: (rolesResult.data || []).map((r) => r.role),
      preferredLocations: (locationsResult.data || []).map((l) => l.location),
    };
  } catch (error) {
    console.error("Unexpected error loading user matching data:", error);
    return null;
  }
}
