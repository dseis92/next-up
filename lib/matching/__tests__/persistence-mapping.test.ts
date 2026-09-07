/**
 * Persistence row transformation tests
 * Verifies that persisted database rows are correctly mapped to UserMatchingData
 */

import { describe, it, expect } from "vitest";
import { buildMatchProfile } from "../adapters";
import type { UserMatchingData } from "../adapters";

describe("Persistence row mapping", () => {
  it("should map onboarding_progress.current_title to currentRole", () => {
    const userData: UserMatchingData = {
      onboarding: {
        current_title: "Tower Foreman",
        industry: "Telecommunications",
        years_experience: 4,
        employment_status: "employed",
        location: "Madison, WI",
        max_commute: 30,
        willing_to_relocate: false,
        salary_min: 65000,
        salary_ideal: 80000,
      },
      skills: [],
      experiences: [],
      preferences: null,
      goals: [],
      targetRoles: [],
      preferredLocations: [],
    };

    const profile = buildMatchProfile(userData);

    expect(profile.currentRole).toBe("Tower Foreman");
  });

  it("should map onboarding_progress.industry to industry", () => {
    const userData: UserMatchingData = {
      onboarding: {
        current_title: "Tower Foreman",
        industry: "Telecommunications",
        years_experience: 4,
        employment_status: "employed",
        location: "Madison, WI",
        max_commute: 30,
        willing_to_relocate: false,
        salary_min: 65000,
        salary_ideal: 80000,
      },
      skills: [],
      experiences: [],
      preferences: null,
      goals: [],
      targetRoles: [],
      preferredLocations: [],
    };

    const profile = buildMatchProfile(userData);

    expect(profile.industry).toBe("Telecommunications");
  });

  it("should map onboarding_progress.years_experience to yearsExperience", () => {
    const userData: UserMatchingData = {
      onboarding: {
        current_title: "Tower Foreman",
        industry: "Telecommunications",
        years_experience: 4,
        employment_status: "employed",
        location: "Madison, WI",
        max_commute: 30,
        willing_to_relocate: false,
        salary_min: 65000,
        salary_ideal: 80000,
      },
      skills: [],
      experiences: [],
      preferences: null,
      goals: [],
      targetRoles: [],
      preferredLocations: [],
    };

    const profile = buildMatchProfile(userData);

    expect(profile.yearsExperience).toBe(4);
  });

  it("should map onboarding_progress.salary_min to salaryMin", () => {
    const userData: UserMatchingData = {
      onboarding: {
        current_title: "Tower Foreman",
        industry: "Telecommunications",
        years_experience: 4,
        employment_status: "employed",
        location: "Madison, WI",
        max_commute: 30,
        willing_to_relocate: false,
        salary_min: 65000,
        salary_ideal: 80000,
      },
      skills: [],
      experiences: [],
      preferences: null,
      goals: [],
      targetRoles: [],
      preferredLocations: [],
    };

    const profile = buildMatchProfile(userData);

    expect(profile.salaryMin).toBe(65000);
  });

  it("should map onboarding_progress.salary_ideal to salaryIdeal", () => {
    const userData: UserMatchingData = {
      onboarding: {
        current_title: "Tower Foreman",
        industry: "Telecommunications",
        years_experience: 4,
        employment_status: "employed",
        location: "Madison, WI",
        max_commute: 30,
        willing_to_relocate: false,
        salary_min: 65000,
        salary_ideal: 80000,
      },
      skills: [],
      experiences: [],
      preferences: null,
      goals: [],
      targetRoles: [],
      preferredLocations: [],
    };

    const profile = buildMatchProfile(userData);

    expect(profile.salaryIdeal).toBe(80000);
  });

  it("should map onboarding_progress.location to location", () => {
    const userData: UserMatchingData = {
      onboarding: {
        current_title: "Tower Foreman",
        industry: "Telecommunications",
        years_experience: 4,
        employment_status: "employed",
        location: "Madison, WI",
        max_commute: 30,
        willing_to_relocate: false,
        salary_min: 65000,
        salary_ideal: 80000,
      },
      skills: [],
      experiences: [],
      preferences: null,
      goals: [],
      targetRoles: [],
      preferredLocations: [],
    };

    const profile = buildMatchProfile(userData);

    expect(profile.location).toBe("Madison, WI");
  });

  it("should map onboarding_progress.max_commute to maxCommute", () => {
    const userData: UserMatchingData = {
      onboarding: {
        current_title: "Tower Foreman",
        industry: "Telecommunications",
        years_experience: 4,
        employment_status: "employed",
        location: "Madison, WI",
        max_commute: 30,
        willing_to_relocate: false,
        salary_min: 65000,
        salary_ideal: 80000,
      },
      skills: [],
      experiences: [],
      preferences: null,
      goals: [],
      targetRoles: [],
      preferredLocations: [],
    };

    const profile = buildMatchProfile(userData);

    expect(profile.maxCommute).toBe(30);
  });

  it("should map onboarding_progress.willing_to_relocate to willingToRelocate", () => {
    const userData: UserMatchingData = {
      onboarding: {
        current_title: "Tower Foreman",
        industry: "Telecommunications",
        years_experience: 4,
        employment_status: "employed",
        location: "Madison, WI",
        max_commute: 30,
        willing_to_relocate: true,
        salary_min: 65000,
        salary_ideal: 80000,
      },
      skills: [],
      experiences: [],
      preferences: null,
      goals: [],
      targetRoles: [],
      preferredLocations: [],
    };

    const profile = buildMatchProfile(userData);

    expect(profile.willingToRelocate).toBe(true);
  });

  it("should map target_roles.role to targetRoles", () => {
    const userData: UserMatchingData = {
      onboarding: null,
      skills: [],
      experiences: [],
      preferences: null,
      goals: [],
      targetRoles: ["Project Engineer", "Site Manager"],
      preferredLocations: [],
    };

    const profile = buildMatchProfile(userData);

    expect(profile.targetRoles).toEqual(["Project Engineer", "Site Manager"]);
  });

  it("should map preferred_locations.location to preferredLocations", () => {
    const userData: UserMatchingData = {
      onboarding: null,
      skills: [],
      experiences: [],
      preferences: null,
      goals: [],
      targetRoles: [],
      preferredLocations: ["Madison, WI", "Milwaukee, WI"],
    };

    const profile = buildMatchProfile(userData);

    expect(profile.preferredLocations).toEqual(["Madison, WI", "Milwaukee, WI"]);
  });

  it("should map user_skills.skill_name correctly when skill_id is null", () => {
    const userData: UserMatchingData = {
      onboarding: null,
      skills: [
        {
          id: "skill-1",
          user_id: "user-1",
          skill_id: "skill-1", // Use skill_id as fallback
          skill: {
            id: "skill-1",
            name: "Safety", // skill_name should be preserved
            category: undefined,
          },
          proficiency: "expert",
          years: 4,
        },
      ],
      experiences: [],
      preferences: null,
      goals: [],
      targetRoles: [],
      preferredLocations: [],
    };

    const profile = buildMatchProfile(userData);

    expect(profile.skills).toHaveLength(1);
    expect(profile.skills[0].name).toBe("Safety");
    expect(profile.skills[0].proficiency).toBe("expert");
  });

  it("should preserve priority value 0", () => {
    const userData: UserMatchingData = {
      onboarding: null,
      skills: [],
      experiences: [],
      preferences: {
        remote: false,
        hybrid: true,
        onsite: true,
        full_time: true,
        part_time: false,
        contract: false,
        travel_tolerance: 25,
        priorities: {
          salary: 0, // Explicit 0 value
          workLifeBalance: 6,
          careerGrowth: 9,
          location: 7,
          remoteFlexibility: 5,
          culture: 6,
          stability: 7,
          benefits: 6,
          mission: 5,
          learning: 8,
        },
      },
      goals: [],
      targetRoles: [],
      preferredLocations: [],
    };

    const profile = buildMatchProfile(userData);

    expect(profile.priorities?.salary).toBe(0);
  });

  it("should handle missing onboarding as incomplete profile", () => {
    const userData: UserMatchingData = {
      onboarding: null,
      skills: [],
      experiences: [],
      preferences: null,
      goals: [],
      targetRoles: [],
      preferredLocations: [],
    };

    const profile = buildMatchProfile(userData);

    expect(profile.currentRole).toBeUndefined();
    expect(profile.industry).toBeUndefined();
    expect(profile.yearsExperience).toBeUndefined();
  });
});
