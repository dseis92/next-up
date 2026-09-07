/**
 * Server-side User Matching Data Loader
 *
 * Loads user matching data using server Supabase client (NO browser client dependency).
 * Reuses pure transformation function from user-matching-data.ts.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserMatchingData } from "./adapters";
import type { WorkExperience } from "@/types";
import {
  transformUserMatchingRows,
  type RawOnboardingRow,
  type RawSkillRow,
  type RawPreferencesRow,
  type RawGoalRow,
  type RawTargetRoleRow,
  type RawPreferredLocationRow,
} from "./user-matching-data";

/**
 * Load all user matching data using server Supabase client
 *
 * @param supabase - Server Supabase client (from createClient in app/api)
 * @param userId - Authenticated user ID
 * @returns UserMatchingData or null if load fails
 */
export async function loadUserMatchingDataServer(
  supabase: SupabaseClient,
  userId: string
): Promise<UserMatchingData | null> {
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

    // Use pure transformation helper (reused from user-matching-data.ts)
    return transformUserMatchingRows({
      onboarding: onboardingResult.data || null,
      skills: (skillsResult.data || []) as RawSkillRow[],
      experiences: (experiencesResult.data as WorkExperience[]) || [],
      preferences: preferencesResult.data as RawPreferencesRow | null,
      goals: (goalsResult.data || []) as RawGoalRow[],
      roles: (rolesResult.data || []) as RawTargetRoleRow[],
      locations: (locationsResult.data || []) as RawPreferredLocationRow[],
    });
  } catch (error) {
    console.error("Unexpected error loading user matching data:", error);
    return null;
  }
}
