/**
 * E4 Opportunity Radar — Salary Format Tests
 */

import { describe, it, expect } from "vitest";
import { formatRadarSalary } from "../salary-format";
import type { Job } from "@/types";

// Helper to create minimal Job with salary fields
function createJobWithSalary(overrides: Partial<Job> = {}): Job {
  return {
    id: "job-1",
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
    location: "San Francisco, CA",
    ...overrides,
  };
}

describe("formatRadarSalary", () => {
  it("should format disclosed yearly range", () => {
    const job = createJobWithSalary({
      salary_min: 120000,
      salary_max: 160000,
      salary_period: "yearly",
      salary_is_estimated: false,
    });

    expect(formatRadarSalary(job)).toBe("$120K–$160K/year");
  });

  it("should format disclosed yearly minimum only", () => {
    const job = createJobWithSalary({
      salary_min: 120000,
      salary_max: undefined,
      salary_period: "yearly",
      salary_is_estimated: false,
    });

    expect(formatRadarSalary(job)).toBe("$120K+/year");
  });

  it("should format disclosed yearly with same min/max as minimum only", () => {
    const job = createJobWithSalary({
      salary_min: 120000,
      salary_max: 120000,
      salary_period: "yearly",
      salary_is_estimated: false,
    });

    expect(formatRadarSalary(job)).toBe("$120K+/year");
  });

  it("should format estimated yearly range with label", () => {
    const job = createJobWithSalary({
      salary_min: 120000,
      salary_max: 160000,
      salary_period: "yearly",
      salary_is_estimated: true,
    });

    expect(formatRadarSalary(job)).toBe("~$120K–$160K/year (Estimated)");
  });

  it("should format estimated yearly minimum only with label", () => {
    const job = createJobWithSalary({
      salary_min: 120000,
      salary_max: undefined,
      salary_period: "yearly",
      salary_is_estimated: true,
    });

    expect(formatRadarSalary(job)).toBe("~$120K+/year (Estimated)");
  });

  it("should format hourly range", () => {
    const job = createJobWithSalary({
      salary_min: 50,
      salary_max: 60,
      salary_period: "hourly",
      salary_is_estimated: false,
    });

    expect(formatRadarSalary(job)).toBe("$50/hr–$60/hr");
  });

  it("should format hourly minimum only", () => {
    const job = createJobWithSalary({
      salary_min: 50,
      salary_max: undefined,
      salary_period: "hourly",
      salary_is_estimated: false,
    });

    expect(formatRadarSalary(job)).toBe("$50/hr+");
  });

  it("should format estimated hourly with label", () => {
    const job = createJobWithSalary({
      salary_min: 50,
      salary_max: 60,
      salary_period: "hourly",
      salary_is_estimated: true,
    });

    expect(formatRadarSalary(job)).toBe("~$50/hr–$60/hr (Estimated)");
  });

  it("should show 'Salary not disclosed' when salary_min is missing", () => {
    const job = createJobWithSalary({
      salary_min: undefined,
      salary_max: undefined,
      salary_period: "yearly",
    });

    expect(formatRadarSalary(job)).toBe("Salary not disclosed");
  });

  it("should show 'Salary not disclosed' when salary_min is 0", () => {
    const job = createJobWithSalary({
      salary_min: 0,
      salary_max: undefined,
      salary_period: "yearly",
    });

    expect(formatRadarSalary(job)).toBe("Salary not disclosed");
  });

  it("should default to yearly when salary_period is missing", () => {
    const job = createJobWithSalary({
      salary_min: 120000,
      salary_max: 160000,
      salary_period: undefined,
      salary_is_estimated: false,
    });

    expect(formatRadarSalary(job)).toBe("$120K–$160K/year");
  });

  it("should handle amounts under 1000 for yearly", () => {
    const job = createJobWithSalary({
      salary_min: 500,
      salary_max: 800,
      salary_period: "yearly",
      salary_is_estimated: false,
    });

    expect(formatRadarSalary(job)).toBe("$500–$800/year");
  });
});
