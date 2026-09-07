/**
 * Deterministic Protection Tests
 * Proves AI generation does not mutate or override Phase 9 match results
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
  hardFailures: [
    { code: "clearance_req", severity: "hard", message: "Requires security clearance", component: "requirements" },
  ],
};

describe("Deterministic protection", () => {
  it("should not mutate MatchResult when building context", () => {
    const originalMatchResult = { ...baseMatchResult };

    buildJobExplanationContext(baseMatchResult, baseJob);

    // MatchResult should be completely unchanged
    expect(baseMatchResult).toEqual(originalMatchResult);
  });

  it("should preserve overallScore", () => {
    const context = buildJobExplanationContext(baseMatchResult, baseJob);

    expect(context?.overallScore).toBe(85);
    expect(baseMatchResult.overallScore).toBe(85);
  });

  it("should preserve qualificationScore", () => {
    const context = buildJobExplanationContext(baseMatchResult, baseJob);

    expect(context?.qualificationScore).toBe(88);
    expect(baseMatchResult.qualificationScore).toBe(88);
  });

  it("should preserve lifestyleScore", () => {
    const context = buildJobExplanationContext(baseMatchResult, baseJob);

    expect(context?.lifestyleScore).toBe(82);
    expect(baseMatchResult.lifestyleScore).toBe(82);
  });

  it("should preserve breakdown scores", () => {
    const context = buildJobExplanationContext(baseMatchResult, baseJob);

    expect(context?.skillsScore).toBe(90);
    expect(context?.experienceScore).toBe(85);
    expect(context?.careerGoalsScore).toBe(92);
    expect(context?.salaryScore).toBe(80);
    expect(context?.locationScore).toBe(75);
    expect(context?.workArrangementScore).toBe(85);

    // Original unchanged
    expect(baseMatchResult.breakdown.skills.score).toBe(90);
    expect(baseMatchResult.breakdown.experience.score).toBe(85);
  });

  it("should preserve hardFailures", () => {
    const context = buildJobExplanationContext(baseMatchResult, baseJob);

    // Context extracts messages (transformed)
    expect(context?.hardFailures).toEqual(["Requires security clearance"]);

    // Original HardFailure objects unchanged
    expect(baseMatchResult.hardFailures).toHaveLength(1);
    expect(baseMatchResult.hardFailures[0].message).toBe("Requires security clearance");
    expect(baseMatchResult.hardFailures[0].code).toBe("clearance_req");
  });

  it("should preserve reasonsFit", () => {
    const context = buildJobExplanationContext(baseMatchResult, baseJob);

    // Context includes reasons (transformed to simpler shape)
    expect(context?.reasonsFit).toHaveLength(2);
    expect(context?.reasonsFit[0].text).toBe("Strong leadership experience");
    expect(context?.reasonsFit[0].priority).toBe(10);

    // Original unchanged
    expect(baseMatchResult.reasonsFit).toHaveLength(2);
    expect(baseMatchResult.reasonsFit[0].text).toBe("Strong leadership experience");
    expect(baseMatchResult.reasonsFit[0].priority).toBe(10);
    expect(baseMatchResult.reasonsFit[0].component).toBe("skills");
  });

  it("should preserve reasonsConcern", () => {
    const context = buildJobExplanationContext(baseMatchResult, baseJob);

    // Context includes concerns (transformed)
    expect(context?.reasonsConcern).toHaveLength(1);
    expect(context?.reasonsConcern[0].text).toBe("May need to develop CAD skills");
    expect(context?.reasonsConcern[0].priority).toBe(3);

    // Original unchanged
    expect(baseMatchResult.reasonsConcern).toHaveLength(1);
    expect(baseMatchResult.reasonsConcern[0].text).toBe("May need to develop CAD skills");
    expect(baseMatchResult.reasonsConcern[0].component).toBe("skills");
  });

  it("should not add scores to context that don't exist in MatchResult", () => {
    const context = buildJobExplanationContext(baseMatchResult, baseJob);

    // These forbidden fields should NOT exist in context
    expect(context).not.toHaveProperty("matchScore");
    expect(context).not.toHaveProperty("fitScore");
    expect(context).not.toHaveProperty("confidenceScore");
    expect(context).not.toHaveProperty("hiringProbability");
  });

  it("should derive context from MatchResult only (not create new scoring)", () => {
    const context = buildJobExplanationContext(baseMatchResult, baseJob);

    // Every score in context must come from MatchResult
    expect(context?.overallScore).toBe(baseMatchResult.overallScore);
    expect(context?.qualificationScore).toBe(baseMatchResult.qualificationScore);
    expect(context?.lifestyleScore).toBe(baseMatchResult.lifestyleScore);
    expect(context?.skillsScore).toBe(baseMatchResult.breakdown.skills.score);
    expect(context?.experienceScore).toBe(baseMatchResult.breakdown.experience.score);
    expect(context?.careerGoalsScore).toBe(baseMatchResult.breakdown.careerGoals.score);
  });

  it("should preserve matchedSkills array", () => {
    const context = buildJobExplanationContext(baseMatchResult, baseJob);

    expect(context?.matchedSkills).toEqual(["leadership", "project management", "safety"]);
    expect(baseMatchResult.matchedSkills).toEqual(["leadership", "project management", "safety"]);
  });

  it("should preserve missingSkills array", () => {
    const context = buildJobExplanationContext(baseMatchResult, baseJob);

    expect(context?.missingSkills).toEqual(["autocad"]);
    expect(baseMatchResult.missingSkills).toEqual(["autocad"]);
  });

  it("should be idempotent (multiple calls produce same context)", () => {
    const context1 = buildJobExplanationContext(baseMatchResult, baseJob);
    const context2 = buildJobExplanationContext(baseMatchResult, baseJob);

    expect(context1).toEqual(context2);
  });

  it("should not modify Job object", () => {
    const originalJob = { ...baseJob };

    buildJobExplanationContext(baseMatchResult, baseJob);

    expect(baseJob).toEqual(originalJob);
  });
});
