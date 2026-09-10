/**
 * E4 Opportunity Radar — Selector Tests
 *
 * Tests for pure category selection logic.
 */

import { describe, it, expect } from "vitest";
import {
  selectBestMatches,
  selectNewOpportunities,
  selectHighCompensation,
  selectStretchOpportunities,
} from "../selectors";
import type { RadarJobInput } from "../types";
import type { Job } from "@/types";

// Helper to create minimal RadarJobInput
function createRadarInput(
  overrides: Partial<RadarJobInput["job"]> & { id: string },
  scores: { overall?: number; qualification?: number; missingSkills?: string[] } = {}
): RadarJobInput {
  const baseJob: Job = {
    id: overrides.id,
    created_at: overrides.created_at || "2026-01-01T00:00:00Z",
    updated_at: overrides.updated_at || "2026-01-01T00:00:00Z",
    title: overrides.title || "Test Job",
    company_id: "company-1",
    company: {
      id: "company-1",
      name: overrides.company?.name || "Test Company",
      slug: "test-company",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
    description: overrides.description || "Test job description",
    work_arrangement: overrides.work_arrangement || "remote",
    employment_type: overrides.employment_type || "full_time",
    salary_is_estimated: overrides.salary_is_estimated !== undefined ? overrides.salary_is_estimated : false,
    posted_date: overrides.posted_date || "2026-01-01T00:00:00Z",
    // Optional fields
    requirements: overrides.requirements,
    responsibilities: overrides.responsibilities,
    benefits: overrides.benefits,
    location: overrides.location,
    experience_level: overrides.experience_level,
    salary_min: overrides.salary_min,
    salary_max: overrides.salary_max,
    salary_period: overrides.salary_period,
    external_url: overrides.external_url,
    external_provider: overrides.external_provider,
    external_id: overrides.external_id,
  };

  return {
    job: baseJob,
    overallScore: scores.overall !== undefined ? scores.overall : 70,
    qualificationScore: scores.qualification !== undefined ? scores.qualification : 70,
    missingSkills: scores.missingSkills || [],
  };
}

describe("selectBestMatches", () => {
  it("should order by overallScore DESC", () => {
    const jobs: RadarJobInput[] = [
      createRadarInput({ id: "job-1" }, { overall: 60 }),
      createRadarInput({ id: "job-2" }, { overall: 90 }),
      createRadarInput({ id: "job-3" }, { overall: 75 }),
    ];

    const result = selectBestMatches(jobs);

    expect(result.jobs.map((j) => j.job.id)).toEqual(["job-2", "job-3", "job-1"]);
    expect(result.totalEligible).toBe(3);
  });

  it("should use posted_date DESC as tie-breaker", () => {
    const jobs: RadarJobInput[] = [
      createRadarInput(
        { id: "job-1", posted_date: "2026-01-01T00:00:00Z" },
        { overall: 80 }
      ),
      createRadarInput(
        { id: "job-2", posted_date: "2026-01-05T00:00:00Z" },
        { overall: 80 }
      ),
      createRadarInput(
        { id: "job-3", posted_date: "2026-01-03T00:00:00Z" },
        { overall: 80 }
      ),
    ];

    const result = selectBestMatches(jobs);

    expect(result.jobs.map((j) => j.job.id)).toEqual(["job-2", "job-3", "job-1"]);
  });

  it("should use job.id ASC as final tie-breaker", () => {
    const jobs: RadarJobInput[] = [
      createRadarInput({ id: "job-3", posted_date: "invalid-date" }, { overall: 80 }),
      createRadarInput({ id: "job-1", posted_date: "invalid-date" }, { overall: 80 }),
      createRadarInput({ id: "job-2", posted_date: "invalid-date" }, { overall: 80 }),
    ];

    const result = selectBestMatches(jobs);

    expect(result.jobs.map((j) => j.job.id)).toEqual(["job-1", "job-2", "job-3"]);
  });

  it("should limit to 20 jobs", () => {
    const jobs: RadarJobInput[] = Array.from({ length: 30 }, (_, i) =>
      createRadarInput({ id: `job-${i}` }, { overall: 70 - i })
    );

    const result = selectBestMatches(jobs);

    expect(result.jobs).toHaveLength(20);
    expect(result.totalEligible).toBe(30);
  });

  it("should handle invalid dates gracefully", () => {
    const jobs: RadarJobInput[] = [
      createRadarInput(
        { id: "job-1", posted_date: "invalid-date" },
        { overall: 80 }
      ),
      createRadarInput(
        { id: "job-2", posted_date: "2026-01-01T00:00:00Z" },
        { overall: 80 }
      ),
    ];

    const result = selectBestMatches(jobs);

    // Valid date should come first
    expect(result.jobs[0].job.id).toBe("job-2");
    expect(result.jobs[1].job.id).toBe("job-1");
  });
});

describe("selectNewOpportunities", () => {
  const NOW_MS = new Date("2026-01-08T12:00:00Z").getTime();

  it("should include jobs posted exactly 7 days ago", () => {
    const sevenDaysAgo = new Date(NOW_MS - 7 * 24 * 60 * 60 * 1000).toISOString();

    const jobs: RadarJobInput[] = [
      createRadarInput({ id: "job-1", posted_date: sevenDaysAgo }),
    ];

    const result = selectNewOpportunities(jobs, NOW_MS);

    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0].job.id).toBe("job-1");
  });

  it("should exclude jobs posted more than 7 days ago", () => {
    const eightDaysAgo = new Date(NOW_MS - 8 * 24 * 60 * 60 * 1000).toISOString();

    const jobs: RadarJobInput[] = [
      createRadarInput({ id: "job-1", posted_date: eightDaysAgo }),
    ];

    const result = selectNewOpportunities(jobs, NOW_MS);

    expect(result.jobs).toHaveLength(0);
    expect(result.totalEligible).toBe(0);
  });

  it("should exclude future-dated jobs", () => {
    const tomorrow = new Date(NOW_MS + 24 * 60 * 60 * 1000).toISOString();

    const jobs: RadarJobInput[] = [
      createRadarInput({ id: "job-1", posted_date: tomorrow }),
    ];

    const result = selectNewOpportunities(jobs, NOW_MS);

    expect(result.jobs).toHaveLength(0);
  });

  it("should exclude jobs with invalid posted_date", () => {
    const jobs: RadarJobInput[] = [
      createRadarInput({ id: "job-1", posted_date: "invalid-date" }),
    ];

    const result = selectNewOpportunities(jobs, NOW_MS);

    expect(result.jobs).toHaveLength(0);
  });

  it("should exclude jobs with missing posted_date", () => {
    const jobs: RadarJobInput[] = [
      createRadarInput({ id: "job-1", posted_date: undefined }),
    ];

    const result = selectNewOpportunities(jobs, NOW_MS);

    expect(result.jobs).toHaveLength(0);
  });

  it("should order by posted_date DESC (newest first)", () => {
    const oneDayAgo = new Date(NOW_MS - 1 * 24 * 60 * 60 * 1000).toISOString();
    const threeDaysAgo = new Date(NOW_MS - 3 * 24 * 60 * 60 * 1000).toISOString();
    const fiveDaysAgo = new Date(NOW_MS - 5 * 24 * 60 * 60 * 1000).toISOString();

    const jobs: RadarJobInput[] = [
      createRadarInput({ id: "job-1", posted_date: threeDaysAgo }),
      createRadarInput({ id: "job-2", posted_date: oneDayAgo }),
      createRadarInput({ id: "job-3", posted_date: fiveDaysAgo }),
    ];

    const result = selectNewOpportunities(jobs, NOW_MS);

    expect(result.jobs.map((j) => j.job.id)).toEqual(["job-2", "job-1", "job-3"]);
  });

  it("should use overallScore DESC as secondary ordering", () => {
    const oneDayAgo = new Date(NOW_MS - 1 * 24 * 60 * 60 * 1000).toISOString();

    const jobs: RadarJobInput[] = [
      createRadarInput({ id: "job-1", posted_date: oneDayAgo }, { overall: 70 }),
      createRadarInput({ id: "job-2", posted_date: oneDayAgo }, { overall: 90 }),
      createRadarInput({ id: "job-3", posted_date: oneDayAgo }, { overall: 80 }),
    ];

    const result = selectNewOpportunities(jobs, NOW_MS);

    expect(result.jobs.map((j) => j.job.id)).toEqual(["job-2", "job-3", "job-1"]);
  });

  it("should limit to 30 jobs", () => {
    const oneDayAgo = new Date(NOW_MS - 1 * 24 * 60 * 60 * 1000).toISOString();

    const jobs: RadarJobInput[] = Array.from({ length: 40 }, (_, i) =>
      createRadarInput({ id: `job-${i}`, posted_date: oneDayAgo })
    );

    const result = selectNewOpportunities(jobs, NOW_MS);

    expect(result.jobs).toHaveLength(30);
    expect(result.totalEligible).toBe(40);
  });

  it("should be deterministic with explicit asOfMs", () => {
    const jobs: RadarJobInput[] = [
      createRadarInput({
        id: "job-1",
        posted_date: "2026-01-01T12:00:00Z",
      }),
    ];

    const result1 = selectNewOpportunities(jobs, NOW_MS);
    const result2 = selectNewOpportunities(jobs, NOW_MS);

    expect(result1).toEqual(result2);
  });
});

describe("selectHighCompensation", () => {
  it("should include only yearly salaries", () => {
    const jobs: RadarJobInput[] = [
      createRadarInput({
        id: "job-1",
        salary_min: 100000,
        salary_period: "yearly",
        salary_is_estimated: false,
      }),
      createRadarInput({
        id: "job-2",
        salary_min: 50,
        salary_period: "hourly",
        salary_is_estimated: false,
      }),
    ];

    const result = selectHighCompensation(jobs);

    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0].job.id).toBe("job-1");
  });

  it("should exclude estimated salaries", () => {
    const jobs: RadarJobInput[] = [
      createRadarInput({
        id: "job-1",
        salary_min: 100000,
        salary_period: "yearly",
        salary_is_estimated: false,
      }),
      createRadarInput({
        id: "job-2",
        salary_min: 120000,
        salary_period: "yearly",
        salary_is_estimated: true,
      }),
    ];

    const result = selectHighCompensation(jobs);

    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0].job.id).toBe("job-1");
  });

  it("should exclude missing salary", () => {
    const jobs: RadarJobInput[] = [
      createRadarInput({
        id: "job-1",
        // salary_min intentionally undefined (missing)
        salary_period: "yearly",
        salary_is_estimated: false,
      }),
    ];

    const result = selectHighCompensation(jobs);

    expect(result.jobs).toHaveLength(0);
  });

  it("should return empty for n=0", () => {
    const jobs: RadarJobInput[] = [];

    const result = selectHighCompensation(jobs);

    expect(result.jobs).toHaveLength(0);
    expect(result.totalEligible).toBe(0);
  });

  it("should return single job for n=1", () => {
    const jobs: RadarJobInput[] = [
      createRadarInput({
        id: "job-1",
        salary_min: 100000,
        salary_period: "yearly",
        salary_is_estimated: false,
      }),
    ];

    const result = selectHighCompensation(jobs);

    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0].job.id).toBe("job-1");
  });

  it("should calculate 75th percentile correctly (nearest-rank)", () => {
    // Four salaries: 60k, 80k, 100k, 120k
    // n=4, ceil(0.75 * 4) - 1 = 3 - 1 = 2
    // sorted[2] = 100k
    // threshold = 100k
    // Include jobs >= 100k: 100k, 120k
    const jobs: RadarJobInput[] = [
      createRadarInput({
        id: "job-1",
        salary_min: 60000,
        salary_period: "yearly",
        salary_is_estimated: false,
      }),
      createRadarInput({
        id: "job-2",
        salary_min: 120000,
        salary_period: "yearly",
        salary_is_estimated: false,
      }),
      createRadarInput({
        id: "job-3",
        salary_min: 100000,
        salary_period: "yearly",
        salary_is_estimated: false,
      }),
      createRadarInput({
        id: "job-4",
        salary_min: 80000,
        salary_period: "yearly",
        salary_is_estimated: false,
      }),
    ];

    const result = selectHighCompensation(jobs);

    expect(result.jobs).toHaveLength(2);
    expect(result.jobs.map((j) => j.job.id).sort()).toEqual(["job-2", "job-3"]);
    expect(result.totalEligible).toBe(2);
  });

  it("should handle duplicate salary values", () => {
    const jobs: RadarJobInput[] = [
      createRadarInput({
        id: "job-1",
        salary_min: 100000,
        salary_period: "yearly",
        salary_is_estimated: false,
      }),
      createRadarInput({
        id: "job-2",
        salary_min: 100000,
        salary_period: "yearly",
        salary_is_estimated: false,
      }),
      createRadarInput({
        id: "job-3",
        salary_min: 100000,
        salary_period: "yearly",
        salary_is_estimated: false,
      }),
    ];

    const result = selectHighCompensation(jobs);

    // All have same salary at 75th percentile
    expect(result.jobs).toHaveLength(3);
  });

  it("should order by salary_min DESC", () => {
    // With 5 jobs, 75th percentile = ceil(0.75 * 5) - 1 = 4 - 1 = 3
    // Sorted: [100k, 110k, 120k, 130k, 150k]
    // Threshold = sorted[3] = 130k
    // Jobs >= 130k: 130k, 150k
    const jobs: RadarJobInput[] = [
      createRadarInput({
        id: "job-1",
        salary_min: 100000,
        salary_period: "yearly",
        salary_is_estimated: false,
      }),
      createRadarInput({
        id: "job-2",
        salary_min: 150000,
        salary_period: "yearly",
        salary_is_estimated: false,
      }),
      createRadarInput({
        id: "job-3",
        salary_min: 120000,
        salary_period: "yearly",
        salary_is_estimated: false,
      }),
      createRadarInput({
        id: "job-4",
        salary_min: 110000,
        salary_period: "yearly",
        salary_is_estimated: false,
      }),
      createRadarInput({
        id: "job-5",
        salary_min: 130000,
        salary_period: "yearly",
        salary_is_estimated: false,
      }),
    ];

    const result = selectHighCompensation(jobs);

    // Should return 2 jobs (130k and 150k), ordered by salary DESC
    expect(result.jobs.map((j) => j.job.id)).toEqual(["job-2", "job-5"]);
  });

  it("should use posted_date DESC as tie-breaker", () => {
    const jobs: RadarJobInput[] = [
      createRadarInput({
        id: "job-1",
        salary_min: 100000,
        salary_period: "yearly",
        salary_is_estimated: false,
        posted_date: "2026-01-01T00:00:00Z",
      }),
      createRadarInput({
        id: "job-2",
        salary_min: 100000,
        salary_period: "yearly",
        salary_is_estimated: false,
        posted_date: "2026-01-05T00:00:00Z",
      }),
    ];

    const result = selectHighCompensation(jobs);

    expect(result.jobs.map((j) => j.job.id)).toEqual(["job-2", "job-1"]);
  });

  it("should limit to 20 jobs", () => {
    // Create 100 jobs with incrementing salaries
    // This ensures we have enough jobs >= 75th percentile to test the limit
    const jobs: RadarJobInput[] = Array.from({ length: 100 }, (_, i) =>
      createRadarInput({
        id: `job-${i}`,
        salary_min: 100000 + i * 1000,
        salary_period: "yearly",
        salary_is_estimated: false,
      })
    );

    const result = selectHighCompensation(jobs);

    // With n=100, 75th percentile index = ceil(0.75 * 100) - 1 = 74
    // Threshold = sorted[74] = 100000 + 74*1000 = 174000
    // Jobs >= 174k: jobs 74-99 (26 jobs)
    // Limit to 20
    expect(result.jobs).toHaveLength(20);
    expect(result.totalEligible).toBe(26);
  });
});

describe("selectStretchOpportunities", () => {
  it("should include jobs with qualification 60 and missing skills", () => {
    const jobs: RadarJobInput[] = [
      createRadarInput(
        { id: "job-1" },
        { qualification: 60, missingSkills: ["TypeScript"] }
      ),
    ];

    const result = selectStretchOpportunities(jobs);

    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0].job.id).toBe("job-1");
  });

  it("should include jobs with qualification 85 and missing skills", () => {
    const jobs: RadarJobInput[] = [
      createRadarInput(
        { id: "job-1" },
        { qualification: 85, missingSkills: ["React"] }
      ),
    ];

    const result = selectStretchOpportunities(jobs);

    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0].job.id).toBe("job-1");
  });

  it("should exclude jobs with qualification 59", () => {
    const jobs: RadarJobInput[] = [
      createRadarInput(
        { id: "job-1" },
        { qualification: 59, missingSkills: ["TypeScript"] }
      ),
    ];

    const result = selectStretchOpportunities(jobs);

    expect(result.jobs).toHaveLength(0);
  });

  it("should exclude jobs with qualification 86", () => {
    const jobs: RadarJobInput[] = [
      createRadarInput(
        { id: "job-1" },
        { qualification: 86, missingSkills: ["React"] }
      ),
    ];

    const result = selectStretchOpportunities(jobs);

    expect(result.jobs).toHaveLength(0);
  });

  it("should exclude jobs with zero missing skills", () => {
    const jobs: RadarJobInput[] = [
      createRadarInput({ id: "job-1" }, { qualification: 70, missingSkills: [] }),
    ];

    const result = selectStretchOpportunities(jobs);

    expect(result.jobs).toHaveLength(0);
  });

  it("should order by overallScore DESC", () => {
    const jobs: RadarJobInput[] = [
      createRadarInput(
        { id: "job-1" },
        { overall: 70, qualification: 70, missingSkills: ["A"] }
      ),
      createRadarInput(
        { id: "job-2" },
        { overall: 85, qualification: 70, missingSkills: ["B"] }
      ),
      createRadarInput(
        { id: "job-3" },
        { overall: 75, qualification: 70, missingSkills: ["C"] }
      ),
    ];

    const result = selectStretchOpportunities(jobs);

    expect(result.jobs.map((j) => j.job.id)).toEqual(["job-2", "job-3", "job-1"]);
  });

  it("should use posted_date DESC as tie-breaker", () => {
    const jobs: RadarJobInput[] = [
      createRadarInput(
        { id: "job-1", posted_date: "2026-01-01T00:00:00Z" },
        { overall: 70, qualification: 70, missingSkills: ["A"] }
      ),
      createRadarInput(
        { id: "job-2", posted_date: "2026-01-05T00:00:00Z" },
        { overall: 70, qualification: 70, missingSkills: ["B"] }
      ),
    ];

    const result = selectStretchOpportunities(jobs);

    expect(result.jobs.map((j) => j.job.id)).toEqual(["job-2", "job-1"]);
  });

  it("should limit to 15 jobs", () => {
    const jobs: RadarJobInput[] = Array.from({ length: 25 }, (_, i) =>
      createRadarInput(
        { id: `job-${i}` },
        { qualification: 70, missingSkills: ["TypeScript"] }
      )
    );

    const result = selectStretchOpportunities(jobs);

    expect(result.jobs).toHaveLength(15);
    expect(result.totalEligible).toBe(25);
  });
});

describe("category overlap", () => {
  it("should allow jobs to appear in multiple categories", () => {
    // Job with: 90% overall, 75% qualification, missing skills, high salary, posted recently
    const job = createRadarInput(
      {
        id: "job-1",
        salary_min: 150000,
        salary_period: "yearly",
        salary_is_estimated: false,
        posted_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      { overall: 90, qualification: 75, missingSkills: ["Advanced Skill"] }
    );

    const jobs = [job];
    const nowMs = Date.now();

    const bestMatches = selectBestMatches(jobs);
    const newOps = selectNewOpportunities(jobs, nowMs);
    const highComp = selectHighCompensation(jobs);
    const stretch = selectStretchOpportunities(jobs);

    // Should appear in all categories
    expect(bestMatches.jobs).toHaveLength(1);
    expect(newOps.jobs).toHaveLength(1);
    expect(highComp.jobs).toHaveLength(1);
    expect(stretch.jobs).toHaveLength(1);
  });
});
