/**
 * AI Job Explanation Context Builder Tests
 * Verifies safe context construction from deterministic MatchResult
 */

import { describe, it, expect } from "vitest";
import { buildJobExplanationContext } from "../job-explanation-context";
import type { MatchResult } from "@/lib/matching/types";
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
    description: "Leading construction company",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  title: "Project Engineer",
  description: "Seeking a Project Engineer",
  requirements: ["3+ years experience"],
  responsibilities: ["Manage projects"],
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

const baseMatchResult: MatchResult = {
  status: "scored",
  overallScore: 85,
  qualificationScore: 88,
  lifestyleScore: 82,
  breakdown: {
    skills: { score: 90, weight: 30, confidence: "high" },
    experience: { score: 85, weight: 25, confidence: "high" },
    careerGoals: { score: 92, weight: 20, confidence: "medium" },
    salary: { score: 80, weight: 15, confidence: "high" },
    location: { score: 75, weight: 10, confidence: "medium" },
    workArrangement: { score: 85, weight: 10, confidence: "high" },
    seniority: { score: 80, weight: 10, confidence: "medium" },
    userPriorities: { score: 85, weight: 5, confidence: "low" },
  },
  matchedSkills: ["leadership", "project management", "safety"],
  missingSkills: ["autocad"],
  reasonsFit: [
    { text: "Strong leadership experience", priority: 10, component: "skills" },
    { text: "Career goals align with role", priority: 8, component: "careerGoals" },
  ],
  reasonsConcern: [
    { text: "May need to develop CAD skills", priority: 3, component: "skills" },
  ],
  hardFailures: [],
};

describe("buildJobExplanationContext", () => {
  it("should build safe context from scored match result", () => {
    const context = buildJobExplanationContext(baseMatchResult, baseJob);

    expect(context).toBeDefined();
    expect(context?.jobTitle).toBe("Project Engineer");
    expect(context?.companyName).toBe("BuildCo");
    expect(context?.location).toBe("Milwaukee, WI");
    expect(context?.overallScore).toBe(85);
    expect(context?.qualificationScore).toBe(88);
    expect(context?.lifestyleScore).toBe(82);
  });

  it("should return null for incomplete profile", () => {
    const incompleteResult: MatchResult = {
      status: "incomplete_profile",
      overallScore: null,
      qualificationScore: null,
      lifestyleScore: null,
      breakdown: {
        skills: { score: 0, weight: 30, confidence: "unknown" },
        experience: { score: 0, weight: 25, confidence: "unknown" },
        careerGoals: { score: 0, weight: 20, confidence: "unknown" },
        salary: { score: 0, weight: 15, confidence: "unknown" },
        location: { score: 0, weight: 10, confidence: "unknown" },
        workArrangement: { score: 0, weight: 10, confidence: "unknown" },
        seniority: { score: 0, weight: 10, confidence: "unknown" },
        userPriorities: { score: 0, weight: 5, confidence: "unknown" },
      },
      matchedSkills: [],
      missingSkills: [],
      reasonsFit: [],
      reasonsConcern: [],
      hardFailures: [],
    };

    const context = buildJobExplanationContext(incompleteResult, baseJob);
    expect(context).toBeNull();
  });

  it("should include breakdown scores", () => {
    const context = buildJobExplanationContext(baseMatchResult, baseJob);

    expect(context?.skillsScore).toBe(90);
    expect(context?.experienceScore).toBe(85);
    expect(context?.careerGoalsScore).toBe(92);
    expect(context?.salaryScore).toBe(80);
    expect(context?.locationScore).toBe(75);
    expect(context?.workArrangementScore).toBe(85);
  });

  it("should include matched and missing skills", () => {
    const context = buildJobExplanationContext(baseMatchResult, baseJob);

    expect(context?.matchedSkills).toEqual(["leadership", "project management", "safety"]);
    expect(context?.missingSkills).toEqual(["autocad"]);
  });

  it("should include hard failures", () => {
    const resultWithFailures: MatchResult = {
      ...baseMatchResult,
      hardFailures: [
        { code: "security_clearance", severity: "hard", message: "Requires security clearance", component: "requirements" },
        { code: "relocation_required", severity: "hard", message: "Must relocate", component: "location" },
      ],
    };

    const context = buildJobExplanationContext(resultWithFailures, baseJob);
    expect(context?.hardFailures).toHaveLength(2);
    expect(context?.hardFailures[0]).toBe("Requires security clearance");
    expect(context?.hardFailures[1]).toBe("Must relocate");
  });

  it("should format salary range correctly", () => {
    const context = buildJobExplanationContext(baseMatchResult, baseJob);
    expect(context?.salaryRange).toBe("$80,000-$95,000/yearly");
  });

  it("should handle missing salary gracefully", () => {
    const jobWithoutSalary: Job = {
      ...baseJob,
      salary_min: undefined,
      salary_max: undefined,
    };

    const context = buildJobExplanationContext(baseMatchResult, jobWithoutSalary);
    expect(context?.salaryRange).toBeNull();
  });

  it("should include job metadata", () => {
    const context = buildJobExplanationContext(baseMatchResult, baseJob);

    expect(context?.workArrangement).toBe("hybrid");
    expect(context?.employmentType).toBe("full_time");
    expect(context?.experienceLevel).toBe("mid");
  });

  it("should mark incomplete profile as false for scored results", () => {
    const context = buildJobExplanationContext(baseMatchResult, baseJob);
    expect(context?.isIncompleteProfile).toBe(false);
  });

  it("should not expose sensitive user data", () => {
    const context = buildJobExplanationContext(baseMatchResult, baseJob);

    // Verify NO user IDs, emails, auth tokens
    const contextString = JSON.stringify(context);
    expect(contextString).not.toContain("user_id");
    expect(contextString).not.toContain("email");
    expect(contextString).not.toContain("auth");
    expect(contextString).not.toContain("token");
  });

  it("should not expose internal database IDs", () => {
    const context = buildJobExplanationContext(baseMatchResult, baseJob);

    // Job ID should not be in context (it's an internal reference)
    expect(context).not.toHaveProperty("jobId");
    expect(context).not.toHaveProperty("id");
  });

  it("should only include factual matching data from Phase 9 engine", () => {
    const context = buildJobExplanationContext(baseMatchResult, baseJob);

    // All scores must come from MatchResult
    expect(context?.overallScore).toBe(baseMatchResult.overallScore);
    expect(context?.qualificationScore).toBe(baseMatchResult.qualificationScore);
    expect(context?.lifestyleScore).toBe(baseMatchResult.lifestyleScore);
    expect(context?.skillsScore).toBe(baseMatchResult.breakdown.skills.score);
    expect(context?.matchedSkills).toEqual(baseMatchResult.matchedSkills);
  });
});
