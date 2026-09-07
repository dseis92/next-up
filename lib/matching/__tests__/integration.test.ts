/**
 * Integration tests for Phase 10 matching integration
 * Verifies canonical adapters and cross-surface consistency
 */

import { describe, it, expect } from "vitest";
import { buildMatchProfile, adaptJobForMatching } from "../adapters";
import { calculateJobMatch } from "../calculate-job-match";
import {
  calculateMatchFromUserData,
  calculateMatchesFromUserData,
} from "../integration";
import type { UserMatchingData } from "../adapters";
import type { Job } from "@/types";

const mockUserData: UserMatchingData = {
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
      id: "skill-2",
      user_id: "user-1",
      skill_id: "s2",
      skill: { id: "s2", name: "Safety", category: "Technical" },
      proficiency: "expert",
      years: 4,
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
    {
      id: "exp-2",
      user_id: "user-1",
      company: "Previous Co",
      title: "Crew Lead",
      start_date: "2018-01-01",
      end_date: "2019-12-31",
      current: false,
      description: "Led construction crews",
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

const mockJob: Job = {
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

describe("Cross-surface consistency", () => {
  it("should produce identical results for same user/job via adapter path", () => {
    // Build MatchProfile and MatchJob
    const matchProfile = buildMatchProfile(mockUserData);
    const matchJob = adaptJobForMatching(mockJob);

    // Calculate match twice
    const result1 = calculateJobMatch(matchProfile, matchJob);
    const result2 = calculateJobMatch(matchProfile, matchJob);

    // Results must be identical (deterministic)
    expect(result1.overallScore).toBe(result2.overallScore);
    expect(result1.qualificationScore).toBe(result2.qualificationScore);
    expect(result1.lifestyleScore).toBe(result2.lifestyleScore);
    expect(result1.breakdown.skills.score).toBe(result2.breakdown.skills.score);
    expect(result1.breakdown.experience.score).toBe(
      result2.breakdown.experience.score
    );
  });

  it("should use canonical adapter transformations", () => {
    const matchProfile = buildMatchProfile(mockUserData);
    const matchJob = adaptJobForMatching(mockJob);

    // Verify adapters performed canonical transformations
    expect(matchProfile.currentRole).toBe("Tower Foreman");
    expect(matchProfile.yearsExperience).toBe(4);
    expect(matchProfile.goals).toEqual(["Move into project management"]);
    expect(matchProfile.targetRoles).toEqual(["Project Engineer"]);

    expect(matchJob.title).toBe("Project Engineer");
    expect(matchJob.company.name).toBe("BuildCo");
    expect(matchJob.company.industry).toBe("Construction");
  });

  it("should produce complete MatchResult structure", () => {
    const matchProfile = buildMatchProfile(mockUserData);
    const matchJob = adaptJobForMatching(mockJob);

    const result = calculateJobMatch(matchProfile, matchJob);

    // Verify complete result structure
    expect(result.status).toBe("scored");
    expect(result.overallScore).toBeGreaterThan(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.qualificationScore).toBeGreaterThan(0);
    expect(result.lifestyleScore).toBeGreaterThan(0);

    // Verify breakdown
    expect(result.breakdown.skills).toBeDefined();
    expect(result.breakdown.experience).toBeDefined();
    expect(result.breakdown.salary).toBeDefined();
    expect(result.breakdown.location).toBeDefined();
    expect(result.breakdown.workArrangement).toBeDefined();
    expect(result.breakdown.careerGoals).toBeDefined();

    // Verify arrays
    expect(Array.isArray(result.matchedSkills)).toBe(true);
    expect(Array.isArray(result.missingSkills)).toBe(true);
    expect(Array.isArray(result.reasonsFit)).toBe(true);
    expect(Array.isArray(result.reasonsConcern)).toBe(true);
  });

  it("should not mutate input data", () => {
    const originalUserData = JSON.parse(JSON.stringify(mockUserData));
    const originalJob = JSON.parse(JSON.stringify(mockJob));

    const matchProfile = buildMatchProfile(mockUserData);
    const matchJob = adaptJobForMatching(mockJob);
    calculateJobMatch(matchProfile, matchJob);

    expect(mockUserData).toEqual(originalUserData);
    expect(mockJob).toEqual(originalJob);
  });
});

describe("Integration helpers", () => {
  it("calculateMatchFromUserData should produce correct result", () => {
    const result = calculateMatchFromUserData(mockUserData, mockJob);

    // Verify this matches the manual adapter path
    const matchProfile = buildMatchProfile(mockUserData);
    const matchJob = adaptJobForMatching(mockJob);
    const directResult = calculateJobMatch(matchProfile, matchJob);

    expect(result.overallScore).toBe(directResult.overallScore);
    expect(result.qualificationScore).toBe(directResult.qualificationScore);
    expect(result.lifestyleScore).toBe(directResult.lifestyleScore);
    expect(result.status).toBe(directResult.status);
  });

  it("calculateMatchesFromUserData should produce N results for N jobs", () => {
    const job2: Job = { ...mockJob, id: "job-2", title: "Senior Engineer" };
    const job3: Job = { ...mockJob, id: "job-3", title: "Lead Engineer" };
    const jobs = [mockJob, job2, job3];

    const results = calculateMatchesFromUserData(mockUserData, jobs);

    expect(results).toHaveLength(3);
    expect(results[0].status).toBe("scored");
    expect(results[1].status).toBe("scored");
    expect(results[2].status).toBe("scored");
  });

  it("calculateMatchesFromUserData should use same profile for all jobs", () => {
    const job2: Job = { ...mockJob, id: "job-2" };
    const jobs = [mockJob, job2];

    const results = calculateMatchesFromUserData(mockUserData, jobs);

    // Both should be scored (same complete profile)
    expect(results[0].status).toBe("scored");
    expect(results[1].status).toBe("scored");
  });

  it("calculateMatchFromUserData should return identical result for same input", () => {
    const result1 = calculateMatchFromUserData(mockUserData, mockJob);
    const result2 = calculateMatchFromUserData(mockUserData, mockJob);

    expect(result1.overallScore).toBe(result2.overallScore);
    expect(result1.qualificationScore).toBe(result2.qualificationScore);
    expect(result1.lifestyleScore).toBe(result2.lifestyleScore);
  });
});
