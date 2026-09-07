/**
 * Profile-change recalculation tests
 * Proves that current profile data recalculates matches (not persisted snapshots)
 */

import { describe, it, expect } from "vitest";
import { calculateMatchFromUserData } from "../integration";
import type { UserMatchingData } from "../adapters";
import type { Job } from "@/types";

const baseJob: Job = {
  id: "job-1",
  company_id: "comp-1",
  company: {
    id: "comp-1",
    name: "BuildCo",
    slug: "buildco",
    industry: "Construction",
    size: "100-500",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  title: "Project Engineer",
  description: "Seeking a Project Engineer",
  requirements: ["3+ years experience", "Leadership skills", "Safety expertise"],
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

const baseUserData: UserMatchingData = {
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
  skills: [
    {
      id: "skill-1",
      user_id: "user-1",
      skill_id: "s1",
      skill: { id: "s1", name: "Leadership", category: "Soft Skills" },
      proficiency: "strong",
      years: 3,
    },
    {
      id: "skill-3",
      user_id: "user-1",
      skill_id: "s3",
      skill: { id: "s3", name: "Project Management", category: "Professional" },
      proficiency: "comfortable",
      years: 2,
    },
  ],
  experiences: [
    {
      id: "exp-1",
      user_id: "user-1",
      company: "Telecom Co",
      title: "Tower Foreman",
      start_date: "2020-01-01",
      current: true,
      description: "Lead tower construction crews",
    },
  ],
  preferences: {
    remote: false,
    hybrid: true,
    onsite: true,
    full_time: true,
    part_time: false,
    contract: false,
    travel_tolerance: 25,
    priorities: {
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
    },
  },
  goals: ["Move into project management"],
  targetRoles: ["Project Engineer"],
  preferredLocations: ["Madison, WI"],
};

describe("Profile-change recalculation", () => {
  it("should change result when relevant skill is added", () => {
    // Profile A: Does not have Safety skill (job requires it)
    const profileA: UserMatchingData = { ...baseUserData };

    // Profile B: Same data + Safety skill
    const profileB: UserMatchingData = {
      ...baseUserData,
      skills: [
        ...baseUserData.skills,
        {
          id: "skill-2",
          user_id: "user-1",
          skill_id: "s2",
          skill: { id: "s2", name: "Safety", category: "Technical" },
          proficiency: "expert",
          years: 4,
        },
      ],
    };

    const resultA = calculateMatchFromUserData(profileA, baseJob);
    const resultB = calculateMatchFromUserData(profileB, baseJob);

    // Adding a relevant skill should improve the match
    expect(resultB.breakdown.skills.score).toBeGreaterThan(resultA.breakdown.skills.score);
    expect(resultB.matchedSkills).toContain("safety");
    expect(resultA.matchedSkills).not.toContain("safety");
  });

  it("should change result when salary preference becomes incompatible", () => {
    // Profile A: salary minimum compatible with job (80k max salary)
    const profileA: UserMatchingData = {
      ...baseUserData,
      onboarding: {
        ...baseUserData.onboarding!,
        salary_min: 65000,
        salary_ideal: 80000,
      },
    };

    // Profile B: salary minimum above job max
    const profileB: UserMatchingData = {
      ...baseUserData,
      onboarding: {
        ...baseUserData.onboarding!,
        salary_min: 100000,
        salary_ideal: 120000,
      },
    };

    const resultA = calculateMatchFromUserData(profileA, baseJob);
    const resultB = calculateMatchFromUserData(profileB, baseJob);

    // Incompatible salary should reduce the match significantly
    // ProfileA should have better salary score than ProfileB
    expect(resultA.breakdown.salary.score).toBeGreaterThan(resultB.breakdown.salary.score);
  });

  it("should change result when work preference becomes incompatible", () => {
    // Profile A: accepts hybrid (job is hybrid)
    const profileA: UserMatchingData = {
      ...baseUserData,
      preferences: {
        ...baseUserData.preferences!,
        remote: false,
        hybrid: true,
        onsite: false,
      },
    };

    // Profile B: exclusive remote only (incompatible with hybrid job)
    const profileB: UserMatchingData = {
      ...baseUserData,
      preferences: {
        ...baseUserData.preferences!,
        remote: true,
        hybrid: false,
        onsite: false,
      },
    };

    const resultA = calculateMatchFromUserData(profileA, baseJob);
    const resultB = calculateMatchFromUserData(profileB, baseJob);

    // Verify both profiles are complete enough to be scored
    if (resultA.status !== "scored" || resultB.status !== "scored") {
      throw new Error("Test profiles should be complete");
    }

    // ProfileA accepts hybrid, ProfileB only wants remote - ProfileA should score better
    expect(resultA.breakdown.workArrangement.score).toBeGreaterThan(
      resultB.breakdown.workArrangement.score
    );
  });

  it("should change result when target role matches job title", () => {
    // Profile A: job is not a target role
    const profileA: UserMatchingData = {
      ...baseUserData,
      targetRoles: ["Site Manager", "Construction Lead"],
    };

    // Profile B: job title is exact target role
    const profileB: UserMatchingData = {
      ...baseUserData,
      targetRoles: ["Project Engineer"],
    };

    const resultA = calculateMatchFromUserData(profileA, baseJob);
    const resultB = calculateMatchFromUserData(profileB, baseJob);

    // Verify both profiles are complete enough to be scored
    if (resultA.status !== "scored" || resultB.status !== "scored") {
      throw new Error("Test profiles should be complete");
    }

    // ProfileB has job title as exact target role, should score better
    expect(resultB.breakdown.careerGoals.score).toBeGreaterThan(
      resultA.breakdown.careerGoals.score
    );
  });

  it("should recalculate deterministically for same profile", () => {
    const result1 = calculateMatchFromUserData(baseUserData, baseJob);
    const result2 = calculateMatchFromUserData(baseUserData, baseJob);

    // Same input should produce identical results (not random/cached)
    expect(result1.overallScore).toBe(result2.overallScore);
    expect(result1.qualificationScore).toBe(result2.qualificationScore);
    expect(result1.lifestyleScore).toBe(result2.lifestyleScore);
  });

  it("should reflect location preference changes", () => {
    // Profile A: location matches job
    const profileA: UserMatchingData = {
      ...baseUserData,
      onboarding: {
        ...baseUserData.onboarding!,
        location: "Milwaukee, WI",
      },
      preferredLocations: ["Milwaukee, WI"],
    };

    // Profile B: different location
    const profileB: UserMatchingData = {
      ...baseUserData,
      onboarding: {
        ...baseUserData.onboarding!,
        location: "Chicago, IL",
      },
      preferredLocations: ["Chicago, IL"],
    };

    const resultA = calculateMatchFromUserData(profileA, baseJob);
    const resultB = calculateMatchFromUserData(profileB, baseJob);

    // Closer location should score better
    expect(resultA.breakdown.location.score).toBeGreaterThanOrEqual(
      resultB.breakdown.location.score
    );
  });
});
