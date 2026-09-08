import { describe, it, expect, vi, beforeEach } from "vitest";
import { evaluateJobDealbreakers, evaluateJobsDealbreakers } from "../use-dealbreaker-preferences";
import type { DealbreakerPreferences } from "@/lib/dealbreakers/types";
import type { Job } from "@/types";

// Mock the evaluateDealbreakers function
vi.mock("@/lib/dealbreakers", () => ({
  evaluateDealbreakers: vi.fn(() => ({
    status: "clear" as const,
    conflictCount: 0,
    unknownCount: 0,
    passCount: 4,
    findings: [],
  })),
}));

describe("Dealbreaker Integration Helpers", () => {
  const mockPreferences: DealbreakerPreferences = {
    userId: "user-1",
    minimumSalary: 100000,
    requireSalaryDisclosure: true,
    allowedWorkArrangements: ["remote"],
    allowedEmploymentTypes: ["full_time"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  const createMockJob = (id: string): Job => ({
    id,
    company_id: "company-1",
    company: {
      id: "company-1",
      name: "Test Company",
      slug: "test-company",
      description: "A test company",
      industry: "Technology",
      size: "100-500",
      locations: ["San Francisco, CA"],
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    },
    title: `Job ${id}`,
    description: "Test job description",
    location: "San Francisco, CA",
    work_arrangement: "remote",
    employment_type: "full_time",
    salary_min: 120000,
    salary_max: 150000,
    salary_period: "yearly" as const,
    salary_is_estimated: false,
    posted_date: "2024-01-01",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("evaluateJobDealbreakers", () => {
    it("should evaluate a single job", () => {
      const job = createMockJob("job-1");

      const result = evaluateJobDealbreakers(mockPreferences, job);

      expect(result).toBeDefined();
      if (!result) throw new Error("Expected result to be defined");
      expect(result.status).toBe("clear");
    });

    it("should use job ID for consistent mapping", () => {
      const job = createMockJob("job-123");

      const result = evaluateJobDealbreakers(mockPreferences, job);

      expect(result).toBeDefined();
      if (!result) throw new Error("Expected result to be defined");
      // The evaluation should be deterministic for the same job
      const result2 = evaluateJobDealbreakers(mockPreferences, job);
      expect(result).toEqual(result2);
    });
  });

  describe("evaluateJobsDealbreakers", () => {
    it("should evaluate multiple jobs and return Map keyed by job ID", () => {
      const jobs = [
        createMockJob("job-1"),
        createMockJob("job-2"),
        createMockJob("job-3"),
      ];

      const results = evaluateJobsDealbreakers(mockPreferences, jobs);

      expect(results).toBeInstanceOf(Map);
      expect(results.size).toBe(3);
      expect(results.has("job-1")).toBe(true);
      expect(results.has("job-2")).toBe(true);
      expect(results.has("job-3")).toBe(true);
    });

    it("should handle empty job array", () => {
      const results = evaluateJobsDealbreakers(mockPreferences, []);

      expect(results).toBeInstanceOf(Map);
      expect(results.size).toBe(0);
    });

    it("should preserve job ID mapping correctly", () => {
      const jobs = [
        createMockJob("abc-123"),
        createMockJob("xyz-789"),
      ];

      const results = evaluateJobsDealbreakers(mockPreferences, jobs);

      expect(results.get("abc-123")).toBeDefined();
      expect(results.get("xyz-789")).toBeDefined();
      expect(results.get("wrong-id")).toBeUndefined();
    });

    it("should not mutate input jobs array", () => {
      const jobs = [
        createMockJob("job-1"),
        createMockJob("job-2"),
      ];
      const originalLength = jobs.length;
      const originalFirstId = jobs[0].id;

      evaluateJobsDealbreakers(mockPreferences, jobs);

      expect(jobs.length).toBe(originalLength);
      expect(jobs[0].id).toBe(originalFirstId);
    });
  });

  describe("Batch Local Evaluation", () => {
    it("should evaluate 100 jobs locally using one supplied preferences object", () => {
      const manyJobs = Array.from({ length: 100 }, (_, i) =>
        createMockJob(`job-${i}`)
      );

      const results = evaluateJobsDealbreakers(mockPreferences, manyJobs);

      expect(results.size).toBe(100);
      // This test verifies batch local evaluation uses one supplied preferences object
      // Manual browser QA is responsible for verifying actual network request count
    });
  });
});
