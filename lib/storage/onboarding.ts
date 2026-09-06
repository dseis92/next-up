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
  const { data: onboarding } = await supabase
    .from("onboarding_progress")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!onboarding) return {};

  // Fetch goals
  const { data: goals } = await supabase
    .from("user_goals")
    .select("goal")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  // Fetch skills
  const { data: skills } = await supabase
    .from("user_skills")
    .select("skill_name, proficiency")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  // Fetch experiences
  const { data: experiences } = await supabase
    .from("work_experiences")
    .select("*")
    .eq("user_id", user.id)
    .order("start_date", { ascending: false });

  // Fetch target roles
  const { data: targetRoles } = await supabase
    .from("target_roles")
    .select("role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  // Fetch preferred locations
  const { data: preferredLocations } = await supabase
    .from("preferred_locations")
    .select("location")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  // Fetch work preferences
  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

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

  if (!user) return;

  // Save onboarding progress
  await supabase.from("onboarding_progress").upsert({
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
  });

  // Save goals
  if (data.goals) {
    // Delete existing goals
    await supabase.from("user_goals").delete().eq("user_id", user.id);
    // Insert new goals
    if (data.goals.length > 0) {
      await supabase
        .from("user_goals")
        .insert(data.goals.map((goal) => ({ user_id: user.id, goal })));
    }
  }

  // Save skills
  if (data.skills) {
    // Delete existing skills
    await supabase.from("user_skills").delete().eq("user_id", user.id);
    // Insert new skills
    if (data.skills.length > 0) {
      await supabase
        .from("user_skills")
        .insert(
          data.skills.map((skill) => ({
            user_id: user.id,
            skill_name: skill.name,
            proficiency: skill.proficiency,
          }))
        );
    }
  }

  // Save experiences
  if (data.experiences) {
    // Delete existing experiences
    await supabase.from("work_experiences").delete().eq("user_id", user.id);
    // Insert new experiences
    if (data.experiences.length > 0) {
      await supabase
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
    }
  }

  // Save target roles
  if (data.targetRoles) {
    // Delete existing target roles
    await supabase.from("target_roles").delete().eq("user_id", user.id);
    // Insert new target roles
    if (data.targetRoles.length > 0) {
      await supabase
        .from("target_roles")
        .insert(data.targetRoles.map((role) => ({ user_id: user.id, role })));
    }
  }

  // Save preferred locations
  if (data.preferredLocations) {
    // Delete existing preferred locations
    await supabase.from("preferred_locations").delete().eq("user_id", user.id);
    // Insert new preferred locations
    if (data.preferredLocations.length > 0) {
      await supabase
        .from("preferred_locations")
        .insert(
          data.preferredLocations.map((location) => ({ user_id: user.id, location }))
        );
    }
  }

  // Save work preferences
  if (data.workPreferences || data.priorities) {
    await supabase.from("user_preferences").upsert({
      user_id: user.id,
      remote: data.workPreferences?.remote,
      hybrid: data.workPreferences?.hybrid,
      onsite: data.workPreferences?.onsite,
      full_time: data.workPreferences?.fullTime,
      part_time: data.workPreferences?.partTime,
      contract: data.workPreferences?.contract,
      travel_tolerance: data.workPreferences?.travelTolerance,
      priorities: data.priorities,
    });
  }
}

export async function clearOnboardingData(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // Delete all onboarding data (cascading deletes will handle related tables)
  await supabase.from("onboarding_progress").delete().eq("user_id", user.id);
  await supabase.from("user_goals").delete().eq("user_id", user.id);
  await supabase.from("user_skills").delete().eq("user_id", user.id);
  await supabase.from("work_experiences").delete().eq("user_id", user.id);
  await supabase.from("target_roles").delete().eq("user_id", user.id);
  await supabase.from("preferred_locations").delete().eq("user_id", user.id);
  await supabase.from("user_preferences").delete().eq("user_id", user.id);
}

export async function isOnboardingComplete(): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: onboarding } = await supabase
    .from("onboarding_progress")
    .select("completed")
    .eq("user_id", user.id)
    .single();

  return onboarding?.completed || false;
}
