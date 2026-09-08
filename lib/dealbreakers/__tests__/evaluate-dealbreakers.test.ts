import { describe, it, expect } from "vitest";
import { evaluateDealbreakers } from "../evaluate-dealbreakers";
import type { DealbreakerPreferences, DealbreakerJobData } from "../types";

describe("Dealbreaker Engine - Core Evaluation", () => {
  describe("Overall Status", () => {
    it("should return 'inactive' when no rules are configured", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        requireSalaryDisclosure: false,
        allowedWorkArrangements: [],
        allowedEmploymentTypes: [],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "remote",
        employmentType: "full_time",
        salaryMin: 100000,
        salaryMax: 150000,
        salaryPeriod: "yearly",
      };

      const result = evaluateDealbreakers(preferences, job);

      expect(result.status).toBe("inactive");
      expect(result.conflictCount).toBe(0);
      expect(result.unknownCount).toBe(0);
      expect(result.passCount).toBe(0);
      expect(result.findings).toHaveLength(0);
    });

    it("should return 'clear' when all active rules pass", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        minimumSalary: 90000,
        requireSalaryDisclosure: true,
        allowedWorkArrangements: ["remote", "hybrid"],
        allowedEmploymentTypes: ["full_time"],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "remote",
        employmentType: "full_time",
        salaryMin: 100000,
        salaryMax: 150000,
        salaryPeriod: "yearly",
        salaryIsEstimated: false,
      };

      const result = evaluateDealbreakers(preferences, job);

      expect(result.status).toBe("clear");
      expect(result.conflictCount).toBe(0);
      expect(result.unknownCount).toBe(0);
      expect(result.passCount).toBe(4);
      expect(result.findings).toHaveLength(4);
      expect(result.findings.every((f) => f.outcome === "pass")).toBe(true);
    });

    it("should return 'conflict' when any rule conflicts", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        minimumSalary: 150000,
        requireSalaryDisclosure: false,
        allowedWorkArrangements: ["remote"],
        allowedEmploymentTypes: [],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "remote",
        employmentType: "full_time",
        salaryMin: 80000,
        salaryMax: 120000,
        salaryPeriod: "yearly",
      };

      const result = evaluateDealbreakers(preferences, job);

      expect(result.status).toBe("conflict");
      expect(result.conflictCount).toBe(1);
      expect(result.passCount).toBe(1);
    });

    it("should return 'unknown' when no conflicts but at least one unknown", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        minimumSalary: 100000,
        requireSalaryDisclosure: false,
        allowedWorkArrangements: [],
        allowedEmploymentTypes: [],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "remote",
        employmentType: "full_time",
        // No salary info
      };

      const result = evaluateDealbreakers(preferences, job);

      expect(result.status).toBe("unknown");
      expect(result.conflictCount).toBe(0);
      expect(result.unknownCount).toBe(1);
      expect(result.passCount).toBe(0);
    });
  });

  describe("Minimum Salary Rule", () => {
    it("should CONFLICT when job max is below user minimum", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        minimumSalary: 150000,
        requireSalaryDisclosure: false,
        allowedWorkArrangements: [],
        allowedEmploymentTypes: [],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "remote",
        employmentType: "full_time",
        salaryMin: 100000,
        salaryMax: 140000,
        salaryPeriod: "yearly",
      };

      const result = evaluateDealbreakers(preferences, job);

      expect(result.status).toBe("conflict");
      expect(result.findings[0].ruleType).toBe("minimum_salary");
      expect(result.findings[0].outcome).toBe("conflict");
      expect(result.findings[0].explanation).toContain("140,000");
      expect(result.findings[0].explanation).toContain("150,000");
    });

    it("should PASS when job min meets or exceeds user minimum", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        minimumSalary: 100000,
        requireSalaryDisclosure: false,
        allowedWorkArrangements: [],
        allowedEmploymentTypes: [],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "remote",
        employmentType: "full_time",
        salaryMin: 110000,
        salaryMax: 150000,
        salaryPeriod: "yearly",
      };

      const result = evaluateDealbreakers(preferences, job);

      expect(result.status).toBe("clear");
      expect(result.findings[0].ruleType).toBe("minimum_salary");
      expect(result.findings[0].outcome).toBe("pass");
    });

    it("should be UNKNOWN when range overlaps floor", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        minimumSalary: 120000,
        requireSalaryDisclosure: false,
        allowedWorkArrangements: [],
        allowedEmploymentTypes: [],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "remote",
        employmentType: "full_time",
        salaryMin: 100000,
        salaryMax: 150000,
        salaryPeriod: "yearly",
      };

      const result = evaluateDealbreakers(preferences, job);

      expect(result.status).toBe("unknown");
      expect(result.findings[0].ruleType).toBe("minimum_salary");
      expect(result.findings[0].outcome).toBe("unknown");
      expect(result.findings[0].explanation).toContain("overlaps");
    });

    it("should be UNKNOWN when salary is absent", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        minimumSalary: 100000,
        requireSalaryDisclosure: false,
        allowedWorkArrangements: [],
        allowedEmploymentTypes: [],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "remote",
        employmentType: "full_time",
      };

      const result = evaluateDealbreakers(preferences, job);

      expect(result.status).toBe("unknown");
      expect(result.findings[0].ruleType).toBe("minimum_salary");
      expect(result.findings[0].outcome).toBe("unknown");
    });

    it("should be UNKNOWN when salary period is hourly", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        minimumSalary: 100000,
        requireSalaryDisclosure: false,
        allowedWorkArrangements: [],
        allowedEmploymentTypes: [],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "remote",
        employmentType: "full_time",
        salaryMin: 50,
        salaryMax: 75,
        salaryPeriod: "hourly",
      };

      const result = evaluateDealbreakers(preferences, job);

      expect(result.status).toBe("unknown");
      expect(result.findings[0].outcome).toBe("unknown");
      expect(result.findings[0].explanation).toContain("different format");
    });
  });

  describe("Salary Disclosure Rule", () => {
    it("should CONFLICT when no salary is disclosed", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        requireSalaryDisclosure: true,
        allowedWorkArrangements: [],
        allowedEmploymentTypes: [],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "remote",
        employmentType: "full_time",
      };

      const result = evaluateDealbreakers(preferences, job);

      expect(result.status).toBe("conflict");
      expect(result.findings[0].ruleType).toBe("salary_disclosure");
      expect(result.findings[0].outcome).toBe("conflict");
      expect(result.findings[0].explanation).toContain("not listed");
    });

    it("should PASS when salary is disclosed", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        requireSalaryDisclosure: true,
        allowedWorkArrangements: [],
        allowedEmploymentTypes: [],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "remote",
        employmentType: "full_time",
        salaryMin: 100000,
        salaryMax: 150000,
        salaryPeriod: "yearly",
        salaryIsEstimated: false,
      };

      const result = evaluateDealbreakers(preferences, job);

      expect(result.status).toBe("clear");
      expect(result.findings[0].ruleType).toBe("salary_disclosure");
      expect(result.findings[0].outcome).toBe("pass");
    });
  });

  describe("Work Arrangement Rule", () => {
    it("should PASS when job arrangement is allowed", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        requireSalaryDisclosure: false,
        allowedWorkArrangements: ["remote", "hybrid"],
        allowedEmploymentTypes: [],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "remote",
        employmentType: "full_time",
      };

      const result = evaluateDealbreakers(preferences, job);

      expect(result.status).toBe("clear");
      expect(result.findings[0].ruleType).toBe("work_arrangement");
      expect(result.findings[0].outcome).toBe("pass");
      expect(result.findings[0].explanation).toContain("Remote");
    });

    it("should CONFLICT when job arrangement is not allowed", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        requireSalaryDisclosure: false,
        allowedWorkArrangements: ["remote"],
        allowedEmploymentTypes: [],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "onsite",
        employmentType: "full_time",
      };

      const result = evaluateDealbreakers(preferences, job);

      expect(result.status).toBe("conflict");
      expect(result.findings[0].ruleType).toBe("work_arrangement");
      expect(result.findings[0].outcome).toBe("conflict");
      expect(result.findings[0].explanation).toContain("on-site");
      expect(result.findings[0].explanation).toContain("outside");
    });

    it("should be UNKNOWN when job arrangement is missing", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        requireSalaryDisclosure: false,
        allowedWorkArrangements: ["remote"],
        allowedEmploymentTypes: [],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        workArrangement: "" as any, // Simulate missing data
        employmentType: "full_time",
      };

      const result = evaluateDealbreakers(preferences, job);

      expect(result.status).toBe("unknown");
      expect(result.findings[0].outcome).toBe("unknown");
    });
  });

  describe("Employment Type Rule", () => {
    it("should PASS when job type is allowed", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        requireSalaryDisclosure: false,
        allowedWorkArrangements: [],
        allowedEmploymentTypes: ["full_time", "contract"],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "remote",
        employmentType: "full_time",
      };

      const result = evaluateDealbreakers(preferences, job);

      expect(result.status).toBe("clear");
      expect(result.findings[0].ruleType).toBe("employment_type");
      expect(result.findings[0].outcome).toBe("pass");
      expect(result.findings[0].explanation).toContain("Full-time");
    });

    it("should CONFLICT when job type is not allowed", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        requireSalaryDisclosure: false,
        allowedWorkArrangements: [],
        allowedEmploymentTypes: ["full_time"],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "remote",
        employmentType: "contract",
      };

      const result = evaluateDealbreakers(preferences, job);

      expect(result.status).toBe("conflict");
      expect(result.findings[0].ruleType).toBe("employment_type");
      expect(result.findings[0].outcome).toBe("conflict");
      expect(result.findings[0].explanation).toContain("contract");
      expect(result.findings[0].explanation).toContain("outside");
    });
  });

  describe("Multi-Rule Scenarios", () => {
    it("should correctly count outcomes with mixed results", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        minimumSalary: 150000, // Will conflict
        requireSalaryDisclosure: true, // Will pass
        allowedWorkArrangements: ["remote"], // Will pass
        allowedEmploymentTypes: ["full_time"], // Will pass
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "remote",
        employmentType: "full_time",
        salaryMin: 100000,
        salaryMax: 140000,
        salaryPeriod: "yearly",
        salaryIsEstimated: false,
      };

      const result = evaluateDealbreakers(preferences, job);

      expect(result.status).toBe("conflict");
      expect(result.conflictCount).toBe(1);
      expect(result.passCount).toBe(3);
      expect(result.unknownCount).toBe(0);
      expect(result.findings).toHaveLength(4);
    });

    it("should handle all unknown scenario", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        minimumSalary: 100000,
        requireSalaryDisclosure: false,
        allowedWorkArrangements: [],
        allowedEmploymentTypes: [],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "remote",
        employmentType: "full_time",
        // No salary
      };

      const result = evaluateDealbreakers(preferences, job);

      expect(result.status).toBe("unknown");
      expect(result.conflictCount).toBe(0);
      expect(result.passCount).toBe(0);
      expect(result.unknownCount).toBe(1);
    });
  });

  describe("Deterministic Behavior", () => {
    it("should return identical results for same inputs", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        minimumSalary: 120000,
        requireSalaryDisclosure: true,
        allowedWorkArrangements: ["remote", "hybrid"],
        allowedEmploymentTypes: ["full_time", "contract"],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "remote",
        employmentType: "full_time",
        salaryMin: 130000,
        salaryMax: 180000,
        salaryPeriod: "yearly",
      };

      const result1 = evaluateDealbreakers(preferences, job);
      const result2 = evaluateDealbreakers(preferences, job);
      const result3 = evaluateDealbreakers(preferences, job);

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });
  });

  describe("Estimated Salary Handling", () => {
    it("should return UNKNOWN for minimum salary when salary is estimated", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        minimumSalary: 100000,
        requireSalaryDisclosure: false,
        allowedWorkArrangements: [],
        allowedEmploymentTypes: [],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "remote",
        employmentType: "full_time",
        salaryMin: 120000,
        salaryMax: 150000,
        salaryPeriod: "yearly",
        salaryIsEstimated: true,
      };

      const result = evaluateDealbreakers(preferences, job);
      const minSalaryFinding = result.findings.find(f => f.ruleType === "minimum_salary");

      expect(minSalaryFinding?.outcome).toBe("unknown");
      expect(minSalaryFinding?.explanation).toContain("estimated");
    });

    it("should return CONFLICT for salary disclosure when salary is estimated", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        requireSalaryDisclosure: true,
        allowedWorkArrangements: [],
        allowedEmploymentTypes: [],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "remote",
        employmentType: "full_time",
        salaryMin: 100000,
        salaryMax: 120000,
        salaryPeriod: "yearly",
        salaryIsEstimated: true,
      };

      const result = evaluateDealbreakers(preferences, job);
      const disclosureFinding = result.findings.find(f => f.ruleType === "salary_disclosure");

      expect(disclosureFinding?.outcome).toBe("conflict");
      expect(disclosureFinding?.explanation).toContain("estimated rather than disclosed");
    });

    it("should return PASS for salary disclosure when salary is not estimated", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        requireSalaryDisclosure: true,
        allowedWorkArrangements: [],
        allowedEmploymentTypes: [],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "remote",
        employmentType: "full_time",
        salaryMin: 100000,
        salaryMax: 120000,
        salaryPeriod: "yearly",
        salaryIsEstimated: false,
      };

      const result = evaluateDealbreakers(preferences, job);
      const disclosureFinding = result.findings.find(f => f.ruleType === "salary_disclosure");

      expect(disclosureFinding?.outcome).toBe("pass");
    });

    it("should return UNKNOWN for salary disclosure when estimate status is unknown", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        requireSalaryDisclosure: true,
        allowedWorkArrangements: [],
        allowedEmploymentTypes: [],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "remote",
        employmentType: "full_time",
        salaryMin: 100000,
        salaryMax: 120000,
        salaryPeriod: "yearly",
        salaryIsEstimated: null,
      };

      const result = evaluateDealbreakers(preferences, job);
      const disclosureFinding = result.findings.find(f => f.ruleType === "salary_disclosure");

      expect(disclosureFinding?.outcome).toBe("unknown");
    });
  });

  describe("Nullable Evidence Handling", () => {
    it("should return UNKNOWN when workArrangement is null", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        requireSalaryDisclosure: false,
        allowedWorkArrangements: ["remote"],
        allowedEmploymentTypes: [],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: null,
        employmentType: "full_time",
      };

      const result = evaluateDealbreakers(preferences, job);
      const arrangementFinding = result.findings.find(f => f.ruleType === "work_arrangement");

      expect(arrangementFinding?.outcome).toBe("unknown");
    });

    it("should return UNKNOWN when workArrangement is undefined", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        requireSalaryDisclosure: false,
        allowedWorkArrangements: ["remote"],
        allowedEmploymentTypes: [],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: undefined,
        employmentType: "full_time",
      };

      const result = evaluateDealbreakers(preferences, job);
      const arrangementFinding = result.findings.find(f => f.ruleType === "work_arrangement");

      expect(arrangementFinding?.outcome).toBe("unknown");
    });

    it("should return UNKNOWN when employmentType is null", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        requireSalaryDisclosure: false,
        allowedWorkArrangements: [],
        allowedEmploymentTypes: ["full_time"],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "remote",
        employmentType: null,
      };

      const result = evaluateDealbreakers(preferences, job);
      const typeFinding = result.findings.find(f => f.ruleType === "employment_type");

      expect(typeFinding?.outcome).toBe("unknown");
    });

    it("should return UNKNOWN when employmentType is undefined", () => {
      const preferences: DealbreakerPreferences = {
        userId: "user-1",
        requireSalaryDisclosure: false,
        allowedWorkArrangements: [],
        allowedEmploymentTypes: ["full_time"],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const job: DealbreakerJobData = {
        id: "job-1",
        title: "Software Engineer",
        workArrangement: "remote",
        employmentType: undefined,
      };

      const result = evaluateDealbreakers(preferences, job);
      const typeFinding = result.findings.find(f => f.ruleType === "employment_type");

      expect(typeFinding?.outcome).toBe("unknown");
    });
  });
});
