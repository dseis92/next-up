/**
 * Profile data storage
 * Combines onboarding data into a unified profile
 * This will be replaced by Supabase in Phase 8
 */

import { getOnboardingData, type OnboardingData } from "./onboarding";

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

export function getUserProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;

  // Get basic user data
  const userDataRaw = localStorage.getItem("userData");
  const userData = userDataRaw ? JSON.parse(userDataRaw) : {};

  // Get onboarding data
  const onboardingData = getOnboardingData() || {};

  // Combine into profile
  const profile: UserProfile = {
    name: userData.name || "User",
    currentRole: onboardingData.currentTitle,
    location: onboardingData.location,
    yearsExperience: onboardingData.yearsExperience,
    industry: onboardingData.industry,
    employmentStatus: onboardingData.employmentStatus,
    about: userData.about,
    profileStrength: calculateProfileStrength(onboardingData, userData),
    goals: onboardingData.goals || [],
    skills: onboardingData.skills || [],
    experiences: onboardingData.experiences || [],
    targetRoles: onboardingData.targetRoles || [],
    salaryMin: onboardingData.salaryMin,
    salaryIdeal: onboardingData.salaryIdeal,
    workPreferences: onboardingData.workPreferences,
    preferredLocations: onboardingData.preferredLocations || [],
    maxCommute: onboardingData.maxCommute,
    willingToRelocate: onboardingData.willingToRelocate || false,
    priorities: onboardingData.priorities,
  };

  return profile;
}

export function updateUserProfile(updates: {
  name?: string;
  about?: string;
}): void {
  const userDataRaw = localStorage.getItem("userData");
  const userData = userDataRaw ? JSON.parse(userDataRaw) : {};

  const newUserData = { ...userData, ...updates };
  localStorage.setItem("userData", JSON.stringify(newUserData));
}

export function calculateProfileStrength(
  onboarding: Partial<OnboardingData>,
  userData: any
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
