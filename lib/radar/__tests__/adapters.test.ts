/**
 * E4 Opportunity Radar — Adapter Tests
 */

import { describe, it, expect } from "vitest";
import { adaptJobForRadar, adaptJobsForRadar } from "../adapters";
import type { Job } from "@/types";
import type { MatchResult } from "@/lib/matching/types";

// Helper to create minimal Job
function createJob(id: string): Job {
  return {
    id,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    title: "Test Job",
    company_id: "company-1",
    company: {
      id: "company-1",
      name: "Test Company",
      slug: "test-company",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
    description: "Test job description",
    work_arrangement: "remote",
    employment_type: "full_time",
    salary_is_estimated: false,
    posted_date: "2026-01-01T00:00:00Z",
  };
}

// Helper to create minimal scored MatchResult
function createScoredMatchResult(overrides: Partial<MatchResult> = {}): MatchResult {
  return {
    status: "scored",
    overallScore: overrides.overallScore ?? 75,
    qualificationScore: overrides.qualificationScore ?? 70,
    lifestyleScore: overrides.lifestyleScore ?? 80,
    breakdown: {
      skills: { score: 80, weight: 25, confidence: "high" },
      experience: { score: 70, weight: 20, confidence: "high" },
      salary: { score: 90, weight: 15, confidence: "high" },
      location: { score: 75, weight: 10, confidence: "high" },
      workArrangement: { score: 100, weight: 10, confidence: "high" },
      careerGoals: { score: 80, weight: 10, confidence: "high" },
      seniority: { score: 70, weight: 5, confidence: "high" },
      userPriorities: { score: 85, weight: 5, confidence: "high" },
    },
    matchedSkills: overrides.matchedSkills || ["JavaScript", "React"],
    missingSkills: overrides.missingSkills || ["TypeScript"],
    hardFailures: [],
    reasonsFit: [],
    reasonsConcern: [],
    ...overrides,
  };
}

describe("adaptJobForRadar", () => {
  it("should adapt scored MatchResult correctly", () => {
    const job = createJob("job-1");
    const matchResult = createScoredMatchResult({
      overallScore: 85,
      qualificationScore: 80,
      missingSkills: ["Python", "Go"],
    });

    const result = adaptJobForRadar(job, matchResult);

    expect(result.job).toBe(job);
    expect(result.overallScore).toBe(85);
    expect(result.qualificationScore).toBe(80);
    expect(result.missingSkills).toEqual(["Python", "Go"]);
  });

  it("should throw error for incomplete profile", () => {
    const job = createJob("job-1");
    const incompleteResult: MatchResult = {
      status: "incomplete_profile",
      overallScore: null,
      qualificationScore: null,
      lifestyleScore: null,
      breakdown: {
        skills: { score: 0, weight: 25, confidence: "unknown" as const },
        experience: { score: 0, weight: 20, confidence: "unknown" as const },
        salary: { score: 0, weight: 15, confidence: "unknown" as const },
        location: { score: 0, weight: 10, confidence: "unknown" as const },
        workArrangement: { score: 0, weight: 10, confidence: "unknown" as const },
        careerGoals: { score: 0, weight: 10, confidence: "unknown" as const },
        seniority: { score: 0, weight: 5, confidence: "unknown" as const },
        userPriorities: { score: 0, weight: 5, confidence: "unknown" as const },
      },
      matchedSkills: [],
      missingSkills: [],
      hardFailures: [],
      reasonsFit: [],
      reasonsConcern: [],
      missingProfileFields: ["skills", "experience"],
    };

    expect(() => adaptJobForRadar(job, incompleteResult)).toThrow(
      /Cannot adapt incomplete profile/
    );
  });

  it("should preserve original job object", () => {
    const job = createJob("job-1");
    const matchResult = createScoredMatchResult();

    const result = adaptJobForRadar(job, matchResult);

    expect(result.job).toBe(job);
    expect(Object.isFrozen(result.job)).toBe(false); // Not frozen, but not mutated
  });
});

describe("adaptJobsForRadar", () => {
  it("should adapt multiple jobs correctly", () => {
    const jobs = [createJob("job-1"), createJob("job-2")];
    const matchResults = [
      createScoredMatchResult({ overallScore: 80 }),
      createScoredMatchResult({ overallScore: 90 }),
    ];

    const result = adaptJobsForRadar(jobs, matchResults);

    expect(result).toHaveLength(2);
    expect(result[0].job.id).toBe("job-1");
    expect(result[0].overallScore).toBe(80);
    expect(result[1].job.id).toBe("job-2");
    expect(result[1].overallScore).toBe(90);
  });

  it("should filter out incomplete profiles automatically", () => {
    const jobs = [createJob("job-1"), createJob("job-2"), createJob("job-3")];
    const matchResults = [
      createScoredMatchResult({ overallScore: 80 }),
      {
        status: "incomplete_profile" as const,
        overallScore: null,
        qualificationScore: null,
        lifestyleScore: null,
        breakdown: {
          skills: { score: 0, weight: 25, confidence: "unknown" as const },
          experience: { score: 0, weight: 20, confidence: "unknown" as const },
          salary: { score: 0, weight: 15, confidence: "unknown" as const },
          location: { score: 0, weight: 10, confidence: "unknown" as const },
          workArrangement: { score: 0, weight: 10, confidence: "unknown" as const },
          careerGoals: { score: 0, weight: 10, confidence: "unknown" as const },
          seniority: { score: 0, weight: 5, confidence: "unknown" as const },
          userPriorities: { score: 0, weight: 5, confidence: "unknown" as const },
        },
        matchedSkills: [],
        missingSkills: [],
        hardFailures: [],
        reasonsFit: [],
        reasonsConcern: [],
        missingProfileFields: ["skills"],
      },
      createScoredMatchResult({ overallScore: 90 }),
    ];

    const result = adaptJobsForRadar(jobs, matchResults);

    expect(result).toHaveLength(2);
    expect(result[0].job.id).toBe("job-1");
    expect(result[1].job.id).toBe("job-3");
  });

  it("should throw error if lengths mismatch", () => {
    const jobs = [createJob("job-1"), createJob("job-2")];
    const matchResults = [createScoredMatchResult()];

    expect(() => adaptJobsForRadar(jobs, matchResults)).toThrow(
      /length mismatch/
    );
  });

  it("should handle empty arrays", () => {
    const result = adaptJobsForRadar([], []);

    expect(result).toEqual([]);
  });

  it("should preserve missingSkills as readonly array", () => {
    const jobs = [createJob("job-1")];
    const matchResults = [
      createScoredMatchResult({ missingSkills: ["Python", "Go"] }),
    ];

    const result = adaptJobsForRadar(jobs, matchResults);

    expect(result[0].missingSkills).toEqual(["Python", "Go"]);
    // TypeScript should enforce readonly, but at runtime it's still a regular array
  });
});
