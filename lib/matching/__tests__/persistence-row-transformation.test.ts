/**
 * Persistence row transformation tests
 * Tests the actual boundary between Supabase rows and UserMatchingData
 */

import { describe, it, expect } from "vitest";
import { transformUserMatchingRows } from "../user-matching-data";
import type {
  RawOnboardingRow,
  RawSkillRow,
  RawPreferencesRow,
  RawTargetRoleRow,
  RawPreferredLocationRow,
} from "../user-matching-data";

describe("Raw persistence row transformation", () => {
  it("should transform target_roles.role to targetRoles", () => {
    const rawRoles: RawTargetRoleRow[] = [
      { role: "Project Engineer" },
      { role: "Site Manager" },
    ];

    const result = transformUserMatchingRows({
      onboarding: null,
      skills: [],
      experiences: [],
      preferences: null,
      goals: [],
      roles: rawRoles,
      locations: [],
    });

    expect(result.targetRoles).toEqual(["Project Engineer", "Site Manager"]);
  });

  it("should transform user_skills with null skill_id", () => {
    const rawSkills: RawSkillRow[] = [
      {
        id: "row-1",
        user_id: "user-1",
        skill_id: null,
        skill_name: "Safety",
        proficiency: "expert",
        years: 4,
      },
    ];

    const result = transformUserMatchingRows({
      onboarding: null,
      skills: rawSkills,
      experiences: [],
      preferences: null,
      goals: [],
      roles: [],
      locations: [],
    });

    expect(result.skills).toHaveLength(1);
    expect(result.skills[0].skill.name).toBe("Safety");
    expect(result.skills[0].proficiency).toBe("expert");
    expect(result.skills[0].years).toBe(4);
  });

  it("should transform preferred_locations.location to preferredLocations", () => {
    const rawLocations: RawPreferredLocationRow[] = [
      { location: "Madison, WI" },
      { location: "Milwaukee, WI" },
    ];

    const result = transformUserMatchingRows({
      onboarding: null,
      skills: [],
      experiences: [],
      preferences: null,
      goals: [],
      roles: [],
      locations: rawLocations,
    });

    expect(result.preferredLocations).toEqual(["Madison, WI", "Milwaukee, WI"]);
  });

  it("should preserve priority value 0", () => {
    const rawPreferences: RawPreferencesRow = {
      remote: false,
      hybrid: true,
      onsite: true,
      full_time: true,
      part_time: false,
      contract: false,
      travel_tolerance: 25,
      priorities: {
        salary: 0,
        career_growth: 9,
        remote_flexibility: 0,
        work_life_balance: 6,
        location: 7,
        culture: 6,
        stability: 7,
        benefits: 6,
        mission: 5,
        learning: 8,
      },
    };

    const result = transformUserMatchingRows({
      onboarding: null,
      skills: [],
      experiences: [],
      preferences: rawPreferences,
      goals: [],
      roles: [],
      locations: [],
    });

    expect(result.preferences?.priorities.salary).toBe(0);
    expect(result.preferences?.priorities.careerGrowth).toBe(9);
    expect(result.preferences?.priorities.remoteFlexibility).toBe(0);
  });

  it("should transform onboarding_progress fields correctly", () => {
    const rawOnboarding: RawOnboardingRow = {
      current_title: "Tower Foreman",
      industry: "Telecommunications",
      years_experience: 4,
      employment_status: "employed",
      location: "Madison, WI",
      max_commute: 30,
      willing_to_relocate: true,
      salary_min: 65000,
      salary_ideal: 80000,
    };

    const result = transformUserMatchingRows({
      onboarding: rawOnboarding,
      skills: [],
      experiences: [],
      preferences: null,
      goals: [],
      roles: [],
      locations: [],
    });

    expect(result.onboarding?.current_title).toBe("Tower Foreman");
    expect(result.onboarding?.industry).toBe("Telecommunications");
    expect(result.onboarding?.years_experience).toBe(4);
    expect(result.onboarding?.location).toBe("Madison, WI");
    expect(result.onboarding?.max_commute).toBe(30);
    expect(result.onboarding?.willing_to_relocate).toBe(true);
    expect(result.onboarding?.salary_min).toBe(65000);
    expect(result.onboarding?.salary_ideal).toBe(80000);
  });

  it("should handle missing onboarding as null", () => {
    const result = transformUserMatchingRows({
      onboarding: null,
      skills: [],
      experiences: [],
      preferences: null,
      goals: [],
      roles: [],
      locations: [],
    });

    expect(result.onboarding).toBeNull();
  });

  it("should transform snake_case priorities to camelCase", () => {
    const rawPreferences: RawPreferencesRow = {
      remote: true,
      hybrid: true,
      onsite: false,
      full_time: true,
      part_time: false,
      contract: false,
      travel_tolerance: 50,
      priorities: {
        salary: 8,
        work_life_balance: 7,
        career_growth: 9,
        location: 6,
        remote_flexibility: 8,
        culture: 7,
        stability: 6,
        benefits: 7,
        mission: 5,
        learning: 9,
      },
    };

    const result = transformUserMatchingRows({
      onboarding: null,
      skills: [],
      experiences: [],
      preferences: rawPreferences,
      goals: [],
      roles: [],
      locations: [],
    });

    expect(result.preferences?.priorities.workLifeBalance).toBe(7);
    expect(result.preferences?.priorities.careerGrowth).toBe(9);
    expect(result.preferences?.priorities.remoteFlexibility).toBe(8);
  });

  it("should handle multiple skills with different proficiencies", () => {
    const rawSkills: RawSkillRow[] = [
      {
        id: "skill-1",
        user_id: "user-1",
        skill_id: "s1",
        skill_name: "Leadership",
        proficiency: "strong",
        years: 3,
      },
      {
        id: "skill-2",
        user_id: "user-1",
        skill_id: null,
        skill_name: "Safety",
        proficiency: "expert",
        years: 5,
      },
    ];

    const result = transformUserMatchingRows({
      onboarding: null,
      skills: rawSkills,
      experiences: [],
      preferences: null,
      goals: [],
      roles: [],
      locations: [],
    });

    expect(result.skills).toHaveLength(2);
    expect(result.skills[0].skill.name).toBe("Leadership");
    expect(result.skills[0].proficiency).toBe("strong");
    expect(result.skills[1].skill.name).toBe("Safety");
    expect(result.skills[1].proficiency).toBe("expert");
  });
});
