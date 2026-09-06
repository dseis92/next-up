/**
 * User Matching Data Loader
 *
 * Efficiently loads all user data needed for matching calculations.
 * Designed to minimize N+1 queries - load profile data ONCE per page/session.
 */

import { createClient } from "@/lib/supabase/client";
import type { UserMatchingData } from "./adapters";
import type { UserSkill, WorkExperience } from "@/types";

/**
 * Load all user matching data in one efficient operation
 *
 * Fetches:
 * - Profile
 * - Skills
 * - Work experiences
 * - Preferences
 * - Goals
 * - Target roles
 *
 * @param userId - Authenticated user ID
 * @returns UserMatchingData or null if user not found
 */
export async function loadUserMatchingData(
  userId: string
): Promise<UserMatchingData | null> {
  const supabase = createClient();

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    console.error("Failed to load user profile:", profileError);
    return null;
  }

  // Fetch skills (with skill details)
  const { data: userSkills, error: skillsError } = await supabase
    .from("user_skills")
    .select(
      `
      id,
      user_id,
      skill_id,
      proficiency,
      years,
      skills:skill_id (
        id,
        name,
        category
      )
    `
    )
    .eq("user_id", userId);

  if (skillsError) {
    console.error("Failed to load user skills:", skillsError);
  }

  // Transform skills data structure
  const skills: UserSkill[] = (userSkills || []).map((us) => {
    const skillData = us.skills as unknown as
      | { id: string; name: string; category?: string }
      | null
      | undefined;

    return {
      id: us.id,
      user_id: us.user_id,
      skill_id: us.skill_id,
      skill: {
        id: skillData?.id || us.skill_id,
        name: skillData?.name || "Unknown",
        category: skillData?.category,
      },
      proficiency: us.proficiency,
      years: us.years,
    };
  });

  // Fetch work experiences
  const { data: experiences, error: expError } = await supabase
    .from("work_experiences")
    .select("*")
    .eq("user_id", userId)
    .order("current", { ascending: false })
    .order("start_date", { ascending: false });

  if (expError) {
    console.error("Failed to load work experiences:", expError);
  }

  // Fetch preferences
  const { data: preferences, error: prefError } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (prefError && prefError.code !== "PGRST116") {
    // PGRST116 = no rows, which is ok
    console.error("Failed to load user preferences:", prefError);
  }

  // Fetch goals
  const { data: goalsData, error: goalsError } = await supabase
    .from("user_goals")
    .select("goal")
    .eq("user_id", userId);

  if (goalsError) {
    console.error("Failed to load user goals:", goalsError);
  }

  const goals = (goalsData || []).map((g) => g.goal);

  // Fetch target roles
  const { data: rolesData, error: rolesError } = await supabase
    .from("target_roles")
    .select("role_name")
    .eq("user_id", userId);

  if (rolesError) {
    console.error("Failed to load target roles:", rolesError);
  }

  const targetRoles = (rolesData || []).map((r) => r.role_name);

  return {
    profile,
    skills,
    experiences: (experiences as WorkExperience[]) || [],
    preferences: preferences || null,
    goals,
    targetRoles,
  };
}
