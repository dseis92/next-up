/**
 * Onboarding data storage
 * Uses Supabase for persistence
 */

import { createClient } from "@/lib/supabase/client";

export interface OnboardingData {
  // Goals (step 1)
  goals: string[];

  // Current career (step 2)
  currentTitle?: string;
  industry?: string;
  yearsExperience?: number;
  employmentStatus?: string;

  // Experience (step 3)
  experiences: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
  }>;

  // Skills (step 4)
  skills: Array<{
    name: string;
    proficiency: "learning" | "comfortable" | "strong" | "expert";
  }>;

  // Target roles (step 5)
  targetRoles: string[];

  // Salary (step 6)
  salaryMin?: number;
  salaryIdeal?: number;

  // Work preferences (step 7)
  workPreferences: {
    remote: boolean;
    hybrid: boolean;
    onsite: boolean;
    fullTime: boolean;
    partTime: boolean;
    contract: boolean;
    travelTolerance?: number;
  };

  // Location (step 8)
  location?: string;
  preferredLocations: string[];
  maxCommute?: number;
  willingToRelocate: boolean;

  // Priorities (step 9)
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

export async function getOnboardingData(): Promise<Partial<OnboardingData> | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch onboarding progress
  const { data: onboarding, error: onboardingError } = await supabase
    .from("onboarding_progress")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (onboardingError) {
    console.error("Failed to fetch onboarding progress:", { userId: user.id, error: onboardingError.message });
    return {};
  }

  if (!onboarding) return {};

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
    .select("skill_name, proficiency")
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

  // Fetch work preferences
  const { data: preferences, error: preferencesError } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (preferencesError) {
    console.error("Failed to fetch user preferences:", { userId: user.id, error: preferencesError.message });
  }

  return {
    goals: goals?.map((g) => g.goal) || [],
    currentTitle: onboarding.current_role,
    industry: onboarding.industry,
    yearsExperience: onboarding.years_experience,
    employmentStatus: onboarding.employment_status,
    experiences:
      experiences?.map((e) => ({
        title: e.title,
        company: e.company,
        startDate: e.start_date,
        endDate: e.end_date,
        current: e.current,
        description: e.description,
      })) || [],
    skills:
      skills?.map((s) => ({
        name: s.skill_name,
        proficiency: s.proficiency as "learning" | "comfortable" | "strong" | "expert",
      })) || [],
    targetRoles: targetRoles?.map((tr) => tr.role) || [],
    salaryMin: onboarding.salary_min,
    salaryIdeal: onboarding.salary_ideal,
    workPreferences: preferences
      ? {
          remote: preferences.remote,
          hybrid: preferences.hybrid,
          onsite: preferences.onsite,
          fullTime: preferences.full_time,
          partTime: preferences.part_time,
          contract: preferences.contract,
          travelTolerance: preferences.travel_tolerance,
        }
      : ({} as OnboardingData["workPreferences"]),
    location: onboarding.location,
    preferredLocations: preferredLocations?.map((pl) => pl.location) || [],
    maxCommute: onboarding.max_commute,
    willingToRelocate: onboarding.willing_to_relocate || false,
    priorities: (preferences?.priorities || {}) as OnboardingData["priorities"],
  };
}

export async function saveOnboardingData(data: Partial<OnboardingData>): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Save onboarding progress
  const { error: onboardingError } = await supabase.from("onboarding_progress").upsert(
    {
      user_id: user.id,
      current_role: data.currentTitle,
      industry: data.industry,
      years_experience: data.yearsExperience,
      employment_status: data.employmentStatus,
      location: data.location,
      max_commute: data.maxCommute,
      willing_to_relocate: data.willingToRelocate,
      salary_min: data.salaryMin,
      salary_ideal: data.salaryIdeal,
      completed: !!(
        data.goals &&
        data.goals.length > 0 &&
        data.currentTitle &&
        data.yearsExperience !== undefined &&
        data.skills &&
        data.skills.length > 0 &&
        data.targetRoles &&
        data.targetRoles.length > 0
      ),
      completed_at:
        data.goals &&
        data.goals.length > 0 &&
        data.currentTitle &&
        data.yearsExperience !== undefined &&
        data.skills &&
        data.skills.length > 0 &&
        data.targetRoles &&
        data.targetRoles.length > 0
          ? new Date().toISOString()
          : null,
    },
    {
      onConflict: "user_id",
    }
  );

  if (onboardingError) {
    console.error("Failed to save onboarding progress:", { userId: user.id, error: onboardingError.message });
    throw new Error("Failed to save onboarding progress");
  }

  // Save goals
  if (data.goals) {
    // Delete existing goals
    const { error: deleteGoalsError } = await supabase.from("user_goals").delete().eq("user_id", user.id);
    if (deleteGoalsError) {
      console.error("Failed to delete existing user goals:", { userId: user.id, error: deleteGoalsError.message });
      throw new Error("Failed to delete existing user goals");
    }

    // Insert new goals
    if (data.goals.length > 0) {
      const { error: insertGoalsError } = await supabase
        .from("user_goals")
        .insert(data.goals.map((goal) => ({ user_id: user.id, goal })));
      if (insertGoalsError) {
        console.error("Failed to insert user goals:", { userId: user.id, error: insertGoalsError.message });
        throw new Error("Failed to insert user goals");
      }
    }
  }

  // Save skills
  if (data.skills) {
    // Delete existing skills
    const { error: deleteSkillsError } = await supabase.from("user_skills").delete().eq("user_id", user.id);
    if (deleteSkillsError) {
      console.error("Failed to delete existing user skills:", { userId: user.id, error: deleteSkillsError.message });
      throw new Error("Failed to delete existing user skills");
    }

    // Insert new skills
    if (data.skills.length > 0) {
      const { error: insertSkillsError } = await supabase
        .from("user_skills")
        .insert(
          data.skills.map((skill) => ({
            user_id: user.id,
            skill_name: skill.name,
            proficiency: skill.proficiency,
          }))
        );
      if (insertSkillsError) {
        console.error("Failed to insert user skills:", { userId: user.id, error: insertSkillsError.message });
        throw new Error("Failed to insert user skills");
      }
    }
  }

  // Save experiences
  if (data.experiences) {
    // Delete existing experiences
    const { error: deleteExperiencesError } = await supabase.from("work_experiences").delete().eq("user_id", user.id);
    if (deleteExperiencesError) {
      console.error("Failed to delete existing work experiences:", { userId: user.id, error: deleteExperiencesError.message });
      throw new Error("Failed to delete existing work experiences");
    }

    // Insert new experiences
    if (data.experiences.length > 0) {
      const { error: insertExperiencesError } = await supabase
        .from("work_experiences")
        .insert(
          data.experiences.map((exp) => ({
            user_id: user.id,
            title: exp.title,
            company: exp.company,
            start_date: exp.startDate,
            end_date: exp.endDate,
            current: exp.current,
            description: exp.description,
          }))
        );
      if (insertExperiencesError) {
        console.error("Failed to insert work experiences:", { userId: user.id, error: insertExperiencesError.message });
        throw new Error("Failed to insert work experiences");
      }
    }
  }

  // Save target roles
  if (data.targetRoles) {
    // Delete existing target roles
    const { error: deleteRolesError } = await supabase.from("target_roles").delete().eq("user_id", user.id);
    if (deleteRolesError) {
      console.error("Failed to delete existing target roles:", { userId: user.id, error: deleteRolesError.message });
      throw new Error("Failed to delete existing target roles");
    }

    // Insert new target roles
    if (data.targetRoles.length > 0) {
      const { error: insertRolesError } = await supabase
        .from("target_roles")
        .insert(data.targetRoles.map((role) => ({ user_id: user.id, role })));
      if (insertRolesError) {
        console.error("Failed to insert target roles:", { userId: user.id, error: insertRolesError.message });
        throw new Error("Failed to insert target roles");
      }
    }
  }

  // Save preferred locations
  if (data.preferredLocations) {
    // Delete existing preferred locations
    const { error: deleteLocationsError } = await supabase.from("preferred_locations").delete().eq("user_id", user.id);
    if (deleteLocationsError) {
      console.error("Failed to delete existing preferred locations:", { userId: user.id, error: deleteLocationsError.message });
      throw new Error("Failed to delete existing preferred locations");
    }

    // Insert new preferred locations
    if (data.preferredLocations.length > 0) {
      const { error: insertLocationsError } = await supabase
        .from("preferred_locations")
        .insert(
          data.preferredLocations.map((location) => ({ user_id: user.id, location }))
        );
      if (insertLocationsError) {
        console.error("Failed to insert preferred locations:", { userId: user.id, error: insertLocationsError.message });
        throw new Error("Failed to insert preferred locations");
      }
    }
  }

  // Save work preferences
  if (data.workPreferences || data.priorities) {
    const { error: preferencesError } = await supabase.from("user_preferences").upsert(
      {
        user_id: user.id,
        remote: data.workPreferences?.remote,
        hybrid: data.workPreferences?.hybrid,
        onsite: data.workPreferences?.onsite,
        full_time: data.workPreferences?.fullTime,
        part_time: data.workPreferences?.partTime,
        contract: data.workPreferences?.contract,
        travel_tolerance: data.workPreferences?.travelTolerance,
        priorities: data.priorities,
      },
      {
        onConflict: "user_id",
      }
    );
    if (preferencesError) {
      console.error("Failed to save user preferences:", { userId: user.id, error: preferencesError.message });
      throw new Error("Failed to save user preferences");
    }
  }
}

export async function clearOnboardingData(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Delete all onboarding data (cascading deletes will handle related tables)
  const { error: onboardingError } = await supabase.from("onboarding_progress").delete().eq("user_id", user.id);
  if (onboardingError) {
    console.error("Failed to delete onboarding progress:", { userId: user.id, error: onboardingError.message });
    throw new Error("Failed to delete onboarding progress");
  }

  const { error: goalsError } = await supabase.from("user_goals").delete().eq("user_id", user.id);
  if (goalsError) {
    console.error("Failed to delete user goals:", { userId: user.id, error: goalsError.message });
    throw new Error("Failed to delete user goals");
  }

  const { error: skillsError } = await supabase.from("user_skills").delete().eq("user_id", user.id);
  if (skillsError) {
    console.error("Failed to delete user skills:", { userId: user.id, error: skillsError.message });
    throw new Error("Failed to delete user skills");
  }

  const { error: experiencesError } = await supabase.from("work_experiences").delete().eq("user_id", user.id);
  if (experiencesError) {
    console.error("Failed to delete work experiences:", { userId: user.id, error: experiencesError.message });
    throw new Error("Failed to delete work experiences");
  }

  const { error: rolesError } = await supabase.from("target_roles").delete().eq("user_id", user.id);
  if (rolesError) {
    console.error("Failed to delete target roles:", { userId: user.id, error: rolesError.message });
    throw new Error("Failed to delete target roles");
  }

  const { error: locationsError } = await supabase.from("preferred_locations").delete().eq("user_id", user.id);
  if (locationsError) {
    console.error("Failed to delete preferred locations:", { userId: user.id, error: locationsError.message });
    throw new Error("Failed to delete preferred locations");
  }

  const { error: preferencesError } = await supabase.from("user_preferences").delete().eq("user_id", user.id);
  if (preferencesError) {
    console.error("Failed to delete user preferences:", { userId: user.id, error: preferencesError.message });
    throw new Error("Failed to delete user preferences");
  }
}

export async function isOnboardingComplete(): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: onboarding, error } = await supabase
    .from("onboarding_progress")
    .select("completed")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Failed to check onboarding completion:", { userId: user.id, error: error.message });
    return false;
  }

  return onboarding?.completed || false;
}
