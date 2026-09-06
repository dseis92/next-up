/**
 * Profile data storage
 * Uses Supabase for persistence
 */

import { createClient } from "@/lib/supabase/client";
import type { OnboardingData } from "./onboarding";

export interface UserProfile {
  name: string;
  currentRole?: string;
  location?: string;
  yearsExperience?: number;
  industry?: string;
  employmentStatus?: string;
  about?: string;
  profileStrength: number;
  goals: string[];
  skills: Array<{
    name: string;
    proficiency: "learning" | "comfortable" | "strong" | "expert";
  }>;
  experiences: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
  }>;
  targetRoles: string[];
  salaryMin?: number;
  salaryIdeal?: number;
  workPreferences?: OnboardingData["workPreferences"];
  preferredLocations: string[];
  maxCommute?: number;
  willingToRelocate: boolean;
  priorities?: OnboardingData["priorities"];
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch profile data (should be auto-created by trigger, but use maybeSingle for safety)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Failed to fetch user profile:", { userId: user.id, error: profileError.message });
  }

  // Fetch onboarding data (may not exist for fresh users)
  const { data: onboarding, error: onboardingError } = await supabase
    .from("onboarding_progress")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (onboardingError) {
    console.error("Failed to fetch onboarding data:", { userId: user.id, error: onboardingError.message });
  }

  // Fetch goals
  const { data: goals, error: goalsError } = await supabase
    .from("user_goals")
    .select("goal")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (goalsError) {
    console.error("Failed to fetch user goals:", { userId: user.id, error: goalsError.message });
  }

  // Fetch skills
  const { data: skills, error: skillsError } = await supabase
    .from("user_skills")
    .select("skill_name, proficiency, years")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (skillsError) {
    console.error("Failed to fetch user skills:", { userId: user.id, error: skillsError.message });
  }

  // Fetch experiences
  const { data: experiences, error: experiencesError } = await supabase
    .from("work_experiences")
    .select("*")
    .eq("user_id", user.id)
    .order("start_date", { ascending: false });

  if (experiencesError) {
    console.error("Failed to fetch work experiences:", { userId: user.id, error: experiencesError.message });
  }

  // Fetch target roles
  const { data: targetRoles, error: targetRolesError } = await supabase
    .from("target_roles")
    .select("role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (targetRolesError) {
    console.error("Failed to fetch target roles:", { userId: user.id, error: targetRolesError.message });
  }

  // Fetch preferred locations
  const { data: preferredLocations, error: preferredLocationsError } = await supabase
    .from("preferred_locations")
    .select("location")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (preferredLocationsError) {
    console.error("Failed to fetch preferred locations:", { userId: user.id, error: preferredLocationsError.message });
  }

  // Fetch work preferences (may not exist for fresh users)
  const { data: preferences, error: preferencesError } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (preferencesError) {
    console.error("Failed to fetch user preferences:", { userId: user.id, error: preferencesError.message });
  }

  const onboardingData = {
    currentTitle: onboarding?.current_title,
    location: onboarding?.location,
    yearsExperience: onboarding?.years_experience,
    industry: onboarding?.industry,
    employmentStatus: onboarding?.employment_status,
    goals: goals?.map((g) => g.goal) || [],
    skills:
      skills?.map((s) => ({
        name: s.skill_name,
        proficiency: s.proficiency as
          | "learning"
          | "comfortable"
          | "strong"
          | "expert",
      })) || [],
    experiences:
      experiences?.map((e) => ({
        title: e.title,
        company: e.company,
        startDate: e.start_date,
        endDate: e.end_date,
        current: e.current,
        description: e.description,
      })) || [],
    targetRoles: targetRoles?.map((tr) => tr.role) || [],
    salaryMin: onboarding?.salary_min,
    salaryIdeal: onboarding?.salary_ideal,
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
    preferredLocations: preferredLocations?.map((pl) => pl.location) || [],
    maxCommute: onboarding?.max_commute,
    willingToRelocate: onboarding?.willing_to_relocate || false,
    priorities: preferences?.priorities as OnboardingData["priorities"],
  };

  const userData = {
    name: profile?.display_name || user.email?.split("@")[0] || "User",
    about: profile?.about,
  };

  const userProfile: UserProfile = {
    name: userData.name,
    currentRole: onboardingData.currentTitle,
    location: onboardingData.location,
    yearsExperience: onboardingData.yearsExperience,
    industry: onboardingData.industry,
    employmentStatus: onboardingData.employmentStatus,
    about: userData.about,
    profileStrength: calculateProfileStrength(onboardingData, userData),
    goals: onboardingData.goals,
    skills: onboardingData.skills,
    experiences: onboardingData.experiences,
    targetRoles: onboardingData.targetRoles,
    salaryMin: onboardingData.salaryMin,
    salaryIdeal: onboardingData.salaryIdeal,
    workPreferences: onboardingData.workPreferences,
    preferredLocations: onboardingData.preferredLocations,
    maxCommute: onboardingData.maxCommute,
    willingToRelocate: onboardingData.willingToRelocate,
    priorities: onboardingData.priorities,
  };

  return userProfile;
}

export async function updateUserProfile(updates: {
  name?: string;
  about?: string;
}): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      display_name: updates.name,
      about: updates.about,
    })
    .eq("id", user.id);

  if (error) {
    console.error("Failed to update user profile:", { userId: user.id, error: error.message });
    throw new Error("Failed to update user profile");
  }
}

export function calculateProfileStrength(
  onboarding: Partial<OnboardingData>,
  userData: { name?: string; about?: string }
): number {
  let score = 0;

  // Basic identity (10 points)
  if (userData.name) score += 10;

  // Current role (10 points)
  if (onboarding.currentTitle) score += 10;

  // Experience (20 points)
  if (onboarding.yearsExperience !== undefined) score += 10;
  if (onboarding.experiences && onboarding.experiences.length > 0) score += 10;

  // Skills (20 points)
  if (onboarding.skills && onboarding.skills.length > 0) {
    score += Math.min(20, onboarding.skills.length * 4);
  }

  // Goals (10 points)
  if (onboarding.goals && onboarding.goals.length > 0) score += 10;

  // Target roles (10 points)
  if (onboarding.targetRoles && onboarding.targetRoles.length > 0) score += 10;

  // Salary preferences (5 points)
  if (onboarding.salaryMin) score += 5;

  // Work preferences (5 points)
  if (onboarding.workPreferences) {
    const prefs = onboarding.workPreferences;
    if (prefs.remote || prefs.hybrid || prefs.onsite) score += 5;
  }

  // Location preferences (5 points)
  if (onboarding.location) score += 5;

  // About section (5 points)
  if (userData.about) score += 5;

  return Math.min(100, score);
}
