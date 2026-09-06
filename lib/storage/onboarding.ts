/**
 * Onboarding data storage
 * This will be replaced by Supabase in Phase 8
 */

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

export function getOnboardingData(): Partial<OnboardingData> | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("onboarding");
  return stored ? JSON.parse(stored) : {};
}

export function saveOnboardingData(data: Partial<OnboardingData>): void {
  localStorage.setItem("onboarding", JSON.stringify(data));
}

export function clearOnboardingData(): void {
  localStorage.removeItem("onboarding");
}

export function isOnboardingComplete(): boolean {
  const data = getOnboardingData();
  if (!data) return false;

  // Check required fields
  return !!(
    data.goals &&
    data.goals.length > 0 &&
    data.currentTitle &&
    data.yearsExperience !== undefined &&
    data.skills &&
    data.skills.length > 0 &&
    data.targetRoles &&
    data.targetRoles.length > 0
  );
}
