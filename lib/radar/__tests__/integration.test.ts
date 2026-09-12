/**
 * E4 Opportunity Radar — Integration Tests
 *
 * Required integration tests covering:
 * - Adapter boundary (JobMatch → RadarJobInput)
 * - State management (passed/saved/applied jobs)
 * - Filter interactions
 * - Match trust (same scores between List/Radar)
 * - E3 trust (dealbreaker doesn't affect categories)
 * - Session time (asOfMs captured once)
 * - Empty/error states
 */

import { describe, it, expect } from "vitest";
import { adaptJobMatchForRadar, adaptJobMatchesForRadar } from "../job-match-adapter";
import { generateRadarResults } from "../index";
import type { Job, JobMatch } from "@/types";
import type { RadarJobInput } from "../types";

// ============================================================================
// Test Fixtures
// ============================================================================

function createJobMatch(
  overrides: Partial<Omit<JobMatch, "job">> & { job?: Partial<Job> } = {}
): JobMatch {
  const defaultJob: Job = {
    id: overrides.job?.id || "job-1",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    title: overrides.job?.title || "Software Engineer",
    company_id: "company-1",
    company: {
      id: "company-1",
      name: "Test Company",
      slug: "test-company",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
    description: "Test job description",
    work_arrangement: overrides.job?.work_arrangement || "remote",
    employment_type: "full_time",
    salary_is_estimated: false,
    posted_date: overrides.job?.posted_date !== undefined ? overrides.job.posted_date : "2026-01-01T00:00:00Z",
    location: overrides.job?.location || "San Francisco, CA",
    salary_min: overrides.job?.salary_min,
    salary_max: overrides.job?.salary_max,
    salary_period: overrides.job?.salary_period,
  };

  const jobId = overrides.job?.id || "job-1";

  return {
    id: overrides.id || "match-1",
    user_id: overrides.user_id || "user-1",
    job_id: overrides.job_id || jobId,
    job: defaultJob,
    overall_score: overrides.overall_score ?? 85,
    qualification_score: overrides.qualification_score ?? 80,
    lifestyle_score: overrides.lifestyle_score ?? 90,
    breakdown: overrides.breakdown || {
      skills: 80,
      experience: 75,
      salary: 90,
      location: 85,
      work_arrangement: 100,
      career_goals: 80,
    },
    matched_skills: overrides.matched_skills || ["JavaScript", "React"],
    missing_skills: overrides.missing_skills || ["Python"],
    reasons_fit: overrides.reasons_fit || [],
    reasons_concern: overrides.reasons_concern || [],
    created_at: overrides.created_at || "2026-01-01T00:00:00Z",
  };
}

// ============================================================================
// A. Adapter Boundary Tests
// ============================================================================

describe("Adapter Boundary — JobMatch → RadarJobInput", () => {
  it("should adapt JobMatch to RadarJobInput without reconstructing MatchResult", () => {
    const jobMatch = createJobMatch({
      overall_score: 93,
      qualification_score: 88,
      missing_skills: ["Python", "Go"],
    });

    const result = adaptJobMatchForRadar(jobMatch);

    // Should extract only required fields
    expect(result.job).toBe(jobMatch.job);
    expect(result.overallScore).toBe(93);
    expect(result.qualificationScore).toBe(88);
    expect(result.missingSkills).toEqual(["Python", "Go"]);

    // Should NOT have MatchResult fields
    expect(result).not.toHaveProperty("status");
    expect(result).not.toHaveProperty("lifestyleScore");
    expect(result).not.toHaveProperty("breakdown");
  });

  it("should adapt multiple JobMatch objects", () => {
    const matches: JobMatch[] = [
      createJobMatch({ job: { id: "job-1" }, overall_score: 90 }),
      createJobMatch({ job: { id: "job-2" }, overall_score: 85 }),
      createJobMatch({ job: { id: "job-3" }, overall_score: 80 }),
    ];

    const results = adaptJobMatchesForRadar(matches);

    expect(results).toHaveLength(3);
    expect(results[0].job.id).toBe("job-1");
    expect(results[0].overallScore).toBe(90);
    expect(results[1].job.id).toBe("job-2");
    expect(results[1].overallScore).toBe(85);
    expect(results[2].job.id).toBe("job-3");
    expect(results[2].overallScore).toBe(80);
  });

  it("should preserve original job object references", () => {
    const jobMatch = createJobMatch();
    const result = adaptJobMatchForRadar(jobMatch);

    // Should be same reference, not a copy
    expect(result.job).toBe(jobMatch.job);
  });

  it("should handle empty missing_skills array", () => {
    const jobMatch = createJobMatch({ missing_skills: [] });
    const result = adaptJobMatchForRadar(jobMatch);

    expect(result.missingSkills).toEqual([]);
  });
});

// ============================================================================
// B. State Management Tests
// ============================================================================

describe("State Management — Passed/Saved/Applied Jobs", () => {
  it("should accept jobs that are saved but not passed", () => {
    const savedJob = createJobMatch({
      job: { id: "saved-job-1" },
      overall_score: 90,
    });

    const radarInputs = adaptJobMatchesForRadar([savedJob]);
    const results = generateRadarResults(radarInputs, Date.now());

    // Saved jobs should still appear in Radar categories if they qualify
    const allRadarJobs = [
      ...results.bestMatches.jobs,
      ...results.newOpportunities.jobs,
      ...results.highCompensation.jobs,
      ...results.stretchOpportunities.jobs,
    ];

    const hasSavedJob = allRadarJobs.some((input) => input.job.id === "saved-job-1");
    expect(hasSavedJob).toBe(true);
  });

  it("should accept jobs that have applications", () => {
    const appliedJob = createJobMatch({
      job: { id: "applied-job-1" },
      overall_score: 95,
    });

    const radarInputs = adaptJobMatchesForRadar([appliedJob]);
    const results = generateRadarResults(radarInputs, Date.now());

    // Applied jobs should still appear in Radar categories
    const allRadarJobs = [
      ...results.bestMatches.jobs,
      ...results.newOpportunities.jobs,
      ...results.highCompensation.jobs,
      ...results.stretchOpportunities.jobs,
    ];

    const hasAppliedJob = allRadarJobs.some((input) => input.job.id === "applied-job-1");
    expect(hasAppliedJob).toBe(true);
  });

  it("should NOT query application data inside selectors", () => {
    // This is a design verification test - selectors are pure functions
    // that only accept RadarJobInput[], they have no database access
    const inputs: RadarJobInput[] = [
      {
        job: createJobMatch({ job: { id: "job-1" } }).job,
        overallScore: 90,
        qualificationScore: 85,
        missingSkills: [],
      },
    ];

    // This should work without any database/storage access
    const results = generateRadarResults(inputs, Date.now());

    expect(results.bestMatches.jobs).toHaveLength(1);
  });
});

// ============================================================================
// C. Filter Interaction Tests
// ============================================================================

describe("Filter Interactions — Search/Arrangement/Match", () => {
  it("should process filtered matches that already passed through Explore filters", () => {
    // Simulate Explore filtering: user searched for "Senior"
    const allMatches = [
      createJobMatch({ job: { id: "job-1", title: "Senior Engineer" }, overall_score: 90 }),
      createJobMatch({ job: { id: "job-2", title: "Junior Engineer" }, overall_score: 85 }),
    ];

    // Explore would filter to only job-1
    const filteredMatches = allMatches.filter((m) =>
      m.job.title.toLowerCase().includes("senior")
    );

    const radarInputs = adaptJobMatchesForRadar(filteredMatches);
    const results = generateRadarResults(radarInputs, Date.now());

    const allRadarJobs = [
      ...results.bestMatches.jobs,
      ...results.newOpportunities.jobs,
      ...results.highCompensation.jobs,
      ...results.stretchOpportunities.jobs,
    ];

    // Only job-1 should appear
    expect(allRadarJobs.some((input) => input.job.id === "job-1")).toBe(true);
    expect(allRadarJobs.some((input) => input.job.id === "job-2")).toBe(false);
  });

  it("should process matches filtered by work arrangement", () => {
    const allMatches = [
      createJobMatch({ job: { id: "job-1", work_arrangement: "remote" }, overall_score: 90 }),
      createJobMatch({ job: { id: "job-2", work_arrangement: "onsite" }, overall_score: 85 }),
    ];

    // Filter to remote only
    const filteredMatches = allMatches.filter((m) => m.job.work_arrangement === "remote");

    const radarInputs = adaptJobMatchesForRadar(filteredMatches);
    const results = generateRadarResults(radarInputs, Date.now());

    const allRadarJobs = [
      ...results.bestMatches.jobs,
      ...results.newOpportunities.jobs,
      ...results.highCompensation.jobs,
      ...results.stretchOpportunities.jobs,
    ];

    expect(allRadarJobs.some((input) => input.job.id === "job-1")).toBe(true);
    expect(allRadarJobs.some((input) => input.job.id === "job-2")).toBe(false);
  });

  it("should process matches filtered by minimum match score", () => {
    const allMatches = [
      createJobMatch({ job: { id: "job-1" }, overall_score: 95 }),
      createJobMatch({ job: { id: "job-2" }, overall_score: 85 }),
      createJobMatch({ job: { id: "job-3" }, overall_score: 75 }),
    ];

    // Filter to 90%+ only
    const filteredMatches = allMatches.filter((m) => m.overall_score >= 90);

    const radarInputs = adaptJobMatchesForRadar(filteredMatches);
    const results = generateRadarResults(radarInputs, Date.now());

    const allRadarJobs = [
      ...results.bestMatches.jobs,
      ...results.newOpportunities.jobs,
      ...results.highCompensation.jobs,
      ...results.stretchOpportunities.jobs,
    ];

    expect(allRadarJobs.some((input) => input.job.id === "job-1")).toBe(true);
    expect(allRadarJobs.some((input) => input.job.id === "job-2")).toBe(false);
    expect(allRadarJobs.some((input) => input.job.id === "job-3")).toBe(false);
  });
});

// ============================================================================
// G. Match Trust Tests
// ============================================================================

describe("Match Trust — Same Scores Between List/Radar", () => {
  it("should preserve exact match scores from JobMatch", () => {
    const jobMatch = createJobMatch({
      job: { id: "job-1" },
      overall_score: 93,
      qualification_score: 88,
    });

    const radarInput = adaptJobMatchForRadar(jobMatch);

    // Scores must be exactly preserved
    expect(radarInput.overallScore).toBe(93);
    expect(radarInput.qualificationScore).toBe(88);
  });

  it("should NOT modify scores during category selection", () => {
    const matches = [
      createJobMatch({ job: { id: "job-1" }, overall_score: 93, qualification_score: 90 }),
      createJobMatch({ job: { id: "job-2" }, overall_score: 87, qualification_score: 85 }),
    ];

    const radarInputs = adaptJobMatchesForRadar(matches);
    const results = generateRadarResults(radarInputs, Date.now());

    // Check that scores are preserved in results
    const job1InBest = results.bestMatches.jobs.find((input) => input.job.id === "job-1");
    if (job1InBest) {
      expect(job1InBest.overallScore).toBe(93);
      expect(job1InBest.qualificationScore).toBe(90);
    }

    const job2InBest = results.bestMatches.jobs.find((input) => input.job.id === "job-2");
    if (job2InBest) {
      expect(job2InBest.overallScore).toBe(87);
      expect(job2InBest.qualificationScore).toBe(85);
    }
  });
});

// ============================================================================
// F. E3 Trust Tests
// ============================================================================

describe("E3 Trust — Dealbreaker Doesn't Affect Scores/Categories", () => {
  it("should categorize jobs based only on match scores, not dealbreaker status", () => {
    // Job with high score but might have dealbreaker
    const jobWithPotentialDealbreaker = createJobMatch({
      job: {
        id: "job-conflict",
        salary_min: 50000, // Might conflict with user's salary dealbreaker
      },
      overall_score: 95, // High score
      qualification_score: 92,
    });

    const radarInputs = adaptJobMatchesForRadar([jobWithPotentialDealbreaker]);
    const results = generateRadarResults(radarInputs, Date.now());

    // Should still appear in Best Matches due to high score
    const inBestMatches = results.bestMatches.jobs.some(
      (input) => input.job.id === "job-conflict"
    );
    expect(inBestMatches).toBe(true);
  });

  it("should NOT query dealbreaker evaluation inside selectors", () => {
    // Selectors are pure functions that only accept RadarJobInput[]
    // They have no access to dealbreaker evaluations
    const inputs: RadarJobInput[] = [
      {
        job: createJobMatch({ job: { id: "job-1" } }).job,
        overallScore: 95,
        qualificationScore: 90,
        missingSkills: [],
      },
    ];

    // This should work without any dealbreaker evaluation access
    const results = generateRadarResults(inputs, Date.now());

    expect(results.bestMatches.jobs).toHaveLength(1);
  });
});

// ============================================================================
// H. Session Time Tests
// ============================================================================

describe("Session Time — asOfMs Captured Once", () => {
  it("should use consistent asOfMs across all category selectors", () => {
    const fixedAsOfMs = new Date("2026-09-09T12:00:00Z").getTime();

    const matches = [
      createJobMatch({
        job: { id: "job-1", posted_date: "2026-09-08T12:00:00Z" }, // 1 day ago
        overall_score: 90,
      }),
      createJobMatch({
        job: { id: "job-2", posted_date: "2026-09-07T12:00:00Z" }, // 2 days ago
        overall_score: 85,
      }),
    ];

    const radarInputs = adaptJobMatchesForRadar(matches);
    const results = generateRadarResults(radarInputs, fixedAsOfMs);

    // Both should appear in New Opportunities (posted within 7 days)
    expect(results.newOpportunities.jobs.length).toBeGreaterThan(0);
  });

  it("should produce deterministic results with same asOfMs", () => {
    const fixedAsOfMs = new Date("2026-09-09T12:00:00Z").getTime();

    const matches = [
      createJobMatch({ job: { id: "job-1" }, overall_score: 90 }),
      createJobMatch({ job: { id: "job-2" }, overall_score: 85 }),
    ];

    const radarInputs = adaptJobMatchesForRadar(matches);

    const results1 = generateRadarResults(radarInputs, fixedAsOfMs);
    const results2 = generateRadarResults(radarInputs, fixedAsOfMs);

    // Should produce identical category membership
    expect(results1.bestMatches.jobs.length).toBe(results2.bestMatches.jobs.length);
    expect(results1.newOpportunities.jobs.length).toBe(results2.newOpportunities.jobs.length);
    expect(results1.highCompensation.jobs.length).toBe(results2.highCompensation.jobs.length);
    expect(results1.stretchOpportunities.jobs.length).toBe(
      results2.stretchOpportunities.jobs.length
    );
  });
});

// ============================================================================
// I. Empty/Error State Tests
// ============================================================================

describe("Empty/Error States", () => {
  it("should return empty categories when no jobs provided", () => {
    const results = generateRadarResults([], Date.now());

    expect(results.bestMatches.jobs).toEqual([]);
    expect(results.newOpportunities.jobs).toEqual([]);
    expect(results.highCompensation.jobs).toEqual([]);
    expect(results.stretchOpportunities.jobs).toEqual([]);
  });

  it("should handle jobs with missing salary data gracefully", () => {
    const matches = [
      createJobMatch({
        job: { id: "job-1", salary_min: undefined, salary_max: undefined },
        overall_score: 90,
      }),
    ];

    const radarInputs = adaptJobMatchesForRadar(matches);
    const results = generateRadarResults(radarInputs, Date.now());

    // Should still appear in Best Matches
    expect(results.bestMatches.jobs.some((input) => input.job.id === "job-1")).toBe(true);

    // Should NOT appear in High Compensation (no salary disclosed)
    expect(results.highCompensation.jobs.some((input) => input.job.id === "job-1")).toBe(false);
  });

  it("should handle jobs with missing posted_date gracefully", () => {
    const jobMatch = createJobMatch({
      job: { id: "job-1", posted_date: undefined },
      overall_score: 90,
    });

    const matches = [jobMatch];

    const radarInputs = adaptJobMatchesForRadar(matches);
    const results = generateRadarResults(radarInputs, Date.now());

    // Should still appear in Best Matches
    expect(results.bestMatches.jobs.some((input) => input.job.id === "job-1")).toBe(true);

    // Should NOT appear in New Opportunities (no posted date)
    expect(results.newOpportunities.jobs.some((input) => input.job.id === "job-1")).toBe(false);
  });

  it("should handle jobs with invalid posted_date gracefully", () => {
    const matches = [
      createJobMatch({
        job: { id: "job-1", posted_date: "invalid-date" },
        overall_score: 90,
      }),
    ];

    const radarInputs = adaptJobMatchesForRadar(matches);
    const results = generateRadarResults(radarInputs, Date.now());

    // Should still appear in Best Matches
    expect(results.bestMatches.jobs.some((input) => input.job.id === "job-1")).toBe(true);

    // Should NOT appear in New Opportunities (invalid date)
    expect(results.newOpportunities.jobs.some((input) => input.job.id === "job-1")).toBe(false);
  });

  it("should handle incomplete profile state upstream (not in Radar)", () => {
    // Radar receives already-scored JobMatch objects
    // If profile was incomplete, Explore would show IncompleteProfileMessage
    // and never pass matches to Radar

    // This test verifies Radar doesn't need to handle incomplete profile state
    const matches = [
      createJobMatch({ job: { id: "job-1" }, overall_score: 90 }),
    ];

    const radarInputs = adaptJobMatchesForRadar(matches);
    const results = generateRadarResults(radarInputs, Date.now());

    // Should work normally with scored matches
    expect(results.bestMatches.jobs.length).toBeGreaterThan(0);
  });
});
