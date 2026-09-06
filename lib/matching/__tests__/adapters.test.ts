/**
 * Tests for Phase 10 matching adapters
 * Verifies canonical transformations from NextUp data → Phase 9 matching types
 */

import { describe, it, expect } from "vitest";
import { buildMatchProfile, adaptJobForMatching } from "../adapters";
import type { UserMatchingData } from "../adapters";
import type {
  UserProfile,
  UserSkill,
  WorkExperience,
  UserPreferences,
  Job,
  Company,
} from "@/types";

describe("buildMatchProfile", () => {
  const mockProfile: UserProfile = {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    current_title: "Tower Foreman",
    years_experience: 4,
    location: "Madison, WI",
    profile_strength: 85,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  const mockSkills: UserSkill[] = [
    {
      id: "skill-1",
      user_id: "user-1",
      skill_id: "s1",
      skill: { id: "s1", name: "Leadership", category: "Soft Skills" },
      proficiency: "strong",
      years: 3,
    },
    {
      id: "skill-2",
      user_id: "user-1",
      skill_id: "s2",
      skill: { id: "s2", name: "Safety", category: "Technical" },
      proficiency: "expert",
      years: 4,
    },
  ];

  const mockExperiences: WorkExperience[] = [
    {
      id: "exp-1",
      user_id: "user-1",
      company: "Telecom Co",
      title: "Tower Foreman",
      start_date: "2020-01-01",
      current: true,
      description: "Lead tower construction crews",
    },
  ];

  const mockPreferences: UserPreferences = {
    id: "pref-1",
    user_id: "user-1",
    salary_min: 65000,
    salary_ideal: 80000,
    remote: false,
    hybrid: true,
    onsite: true,
    willing_to_relocate: false,
    preferred_locations: ["Madison, WI", "Milwaukee, WI"],
    max_commute_minutes: 30,
    full_time: true,
    part_time: false,
    contract: false,
    priorities: {
      salary: 8,
      work_life_balance: 6,
      career_growth: 9,
      location: 7,
      remote_flexibility: 5,
      culture: 6,
      stability: 7,
      benefits: 6,
      mission: 5,
      learning: 8,
    },
  };

  it("should map current title correctly", () => {
    const data: UserMatchingData = {
      profile: mockProfile,
      skills: [],
      experiences: [],
      preferences: null,
      goals: [],
      targetRoles: [],
    };

    const result = buildMatchProfile(data);

    expect(result.currentRole).toBe("Tower Foreman");
  });

  it("should map years experience correctly", () => {
    const data: UserMatchingData = {
      profile: mockProfile,
      skills: [],
      experiences: [],
      preferences: null,
      goals: [],
      targetRoles: [],
    };

    const result = buildMatchProfile(data);

    expect(result.yearsExperience).toBe(4);
  });

  it("should map skills with proficiency correctly", () => {
    const data: UserMatchingData = {
      profile: mockProfile,
      skills: mockSkills,
      experiences: [],
      preferences: null,
      goals: [],
      targetRoles: [],
    };

    const result = buildMatchProfile(data);

    expect(result.skills).toHaveLength(2);
    expect(result.skills[0].name).toBe("Leadership");
    expect(result.skills[0].proficiency).toBe("strong");
    expect(result.skills[1].name).toBe("Safety");
    expect(result.skills[1].proficiency).toBe("expert");
  });

  it("should map work experiences correctly", () => {
    const data: UserMatchingData = {
      profile: mockProfile,
      skills: [],
      experiences: mockExperiences,
      preferences: null,
      goals: [],
      targetRoles: [],
    };

    const result = buildMatchProfile(data);

    expect(result.experiences).toHaveLength(1);
    expect(result.experiences[0].title).toBe("Tower Foreman");
    expect(result.experiences[0].company).toBe("Telecom Co");
    expect(result.experiences[0].startDate).toBe("2020-01-01");
    expect(result.experiences[0].current).toBe(true);
  });

  it("should map goals correctly", () => {
    const data: UserMatchingData = {
      profile: mockProfile,
      skills: [],
      experiences: [],
      preferences: null,
      goals: ["Move into project management", "Career advancement"],
      targetRoles: [],
    };

    const result = buildMatchProfile(data);

    expect(result.goals).toEqual(["Move into project management", "Career advancement"]);
  });

  it("should map target roles correctly", () => {
    const data: UserMatchingData = {
      profile: mockProfile,
      skills: [],
      experiences: [],
      preferences: null,
      goals: [],
      targetRoles: ["Project Engineer", "Assistant Project Manager"],
    };

    const result = buildMatchProfile(data);

    expect(result.targetRoles).toEqual(["Project Engineer", "Assistant Project Manager"]);
  });

  it("should map salary minimum correctly", () => {
    const data: UserMatchingData = {
      profile: mockProfile,
      skills: [],
      experiences: [],
      preferences: mockPreferences,
      goals: [],
      targetRoles: [],
    };

    const result = buildMatchProfile(data);

    expect(result.salaryMin).toBe(65000);
  });

  it("should map salary ideal correctly", () => {
    const data: UserMatchingData = {
      profile: mockProfile,
      skills: [],
      experiences: [],
      preferences: mockPreferences,
      goals: [],
      targetRoles: [],
    };

    const result = buildMatchProfile(data);

    expect(result.salaryIdeal).toBe(80000);
  });

  it("should map work arrangements correctly", () => {
    const data: UserMatchingData = {
      profile: mockProfile,
      skills: [],
      experiences: [],
      preferences: mockPreferences,
      goals: [],
      targetRoles: [],
    };

    const result = buildMatchProfile(data);

    expect(result.workPreferences).toEqual({
      remote: false,
      hybrid: true,
      onsite: true,
      fullTime: true,
      partTime: false,
      contract: false,
    });
  });

  it("should map current location correctly", () => {
    const data: UserMatchingData = {
      profile: mockProfile,
      skills: [],
      experiences: [],
      preferences: null,
      goals: [],
      targetRoles: [],
    };

    const result = buildMatchProfile(data);

    expect(result.location).toBe("Madison, WI");
  });

  it("should map preferred locations correctly", () => {
    const data: UserMatchingData = {
      profile: mockProfile,
      skills: [],
      experiences: [],
      preferences: mockPreferences,
      goals: [],
      targetRoles: [],
    };

    const result = buildMatchProfile(data);

    expect(result.preferredLocations).toEqual(["Madison, WI", "Milwaukee, WI"]);
  });

  it("should map relocation willingness correctly", () => {
    const data: UserMatchingData = {
      profile: mockProfile,
      skills: [],
      experiences: [],
      preferences: mockPreferences,
      goals: [],
      targetRoles: [],
    };

    const result = buildMatchProfile(data);

    expect(result.willingToRelocate).toBe(false);
  });

  it("should map priorities correctly", () => {
    const data: UserMatchingData = {
      profile: mockProfile,
      skills: [],
      experiences: [],
      preferences: mockPreferences,
      goals: [],
      targetRoles: [],
    };

    const result = buildMatchProfile(data);

    expect(result.priorities).toEqual({
      salary: 8,
      workLifeBalance: 6,
      careerGrowth: 9,
      location: 7,
      remoteFlexibility: 5,
      culture: 6,
      stability: 7,
      benefits: 6,
      mission: 5,
      learning: 8,
    });
  });

  it("should handle missing preferences gracefully", () => {
    const data: UserMatchingData = {
      profile: mockProfile,
      skills: [],
      experiences: [],
      preferences: null,
      goals: [],
      targetRoles: [],
    };

    const result = buildMatchProfile(data);

    expect(result.salaryMin).toBeUndefined();
    expect(result.salaryIdeal).toBeUndefined();
    expect(result.workPreferences).toBeUndefined();
    expect(result.priorities).toBeUndefined();
    expect(result.preferredLocations).toEqual([]);
    expect(result.willingToRelocate).toBe(false);
  });

  it("should not mutate input data", () => {
    const data: UserMatchingData = {
      profile: { ...mockProfile },
      skills: [...mockSkills],
      experiences: [...mockExperiences],
      preferences: mockPreferences,
      goals: ["Goal 1"],
      targetRoles: ["Role 1"],
    };

    const originalData = JSON.parse(JSON.stringify(data));

    buildMatchProfile(data);

    expect(data).toEqual(originalData);
  });
});

describe("adaptJobForMatching", () => {
  const mockCompany: Company = {
    id: "comp-1",
    name: "BuildCo",
    slug: "buildco",
    industry: "Construction",
    size: "100-500",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  const mockJob: Job = {
    id: "job-1",
    company_id: "comp-1",
    company: mockCompany,
    title: "Project Engineer",
    description: "Seeking a Project Engineer",
    requirements: ["3+ years experience", "Leadership skills"],
    responsibilities: ["Manage projects", "Lead teams"],
    benefits: ["Health insurance"],
    location: "Milwaukee, WI",
    work_arrangement: "hybrid",
    employment_type: "full_time",
    experience_level: "mid",
    salary_min: 80000,
    salary_max: 95000,
    salary_period: "yearly",
    salary_is_estimated: false,
    posted_date: "2024-01-01",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  it("should map company correctly", () => {
    const result = adaptJobForMatching(mockJob);

    expect(result.company.name).toBe("BuildCo");
    expect(result.company.industry).toBe("Construction");
  });

  it("should map title correctly", () => {
    const result = adaptJobForMatching(mockJob);

    expect(result.title).toBe("Project Engineer");
  });

  it("should map description correctly", () => {
    const result = adaptJobForMatching(mockJob);

    expect(result.description).toBe("Seeking a Project Engineer");
  });

  it("should map requirements correctly", () => {
    const result = adaptJobForMatching(mockJob);

    expect(result.requirements).toEqual(["3+ years experience", "Leadership skills"]);
  });

  it("should map responsibilities correctly", () => {
    const result = adaptJobForMatching(mockJob);

    expect(result.responsibilities).toEqual(["Manage projects", "Lead teams"]);
  });

  it("should map work arrangement correctly", () => {
    const result = adaptJobForMatching(mockJob);

    expect(result.workArrangement).toBe("hybrid");
  });

  it("should map employment type correctly", () => {
    const result = adaptJobForMatching(mockJob);

    expect(result.employmentType).toBe("full_time");
  });

  it("should map experience level correctly", () => {
    const result = adaptJobForMatching(mockJob);

    expect(result.experienceLevel).toBe("mid");
  });

  it("should map salary fields correctly", () => {
    const result = adaptJobForMatching(mockJob);

    expect(result.salaryMin).toBe(80000);
    expect(result.salaryMax).toBe(95000);
    expect(result.salaryPeriod).toBe("yearly");
  });

  it("should map location correctly", () => {
    const result = adaptJobForMatching(mockJob);

    expect(result.location).toBe("Milwaukee, WI");
  });

  it("should not mutate input job", () => {
    const originalJob = JSON.parse(JSON.stringify(mockJob));

    adaptJobForMatching(mockJob);

    expect(mockJob).toEqual(originalJob);
  });
});
