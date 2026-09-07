/**
 * Load error tests
 * Verifies that matching-data load failures are distinct from incomplete profiles
 */

import { describe, it, expect, vi } from "vitest";
import { calculatePersonalizedMatches, MatchingDataLoadError } from "../integration";
import * as userMatchingData from "../user-matching-data";
import type { Job } from "@/types";

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

describe("Load failure vs incomplete profile", () => {
  it("should return error status when loadUserMatchingData returns null", async () => {
    // Mock loadUserMatchingData to return null (load failure)
    vi.spyOn(userMatchingData, "loadUserMatchingData").mockResolvedValue(null);

    const result = await calculatePersonalizedMatches("user-1", [mockJob]);

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.error).toBeInstanceOf(MatchingDataLoadError);
      expect(result.error.message).toContain("Failed to load user matching data");
    }

    vi.restoreAllMocks();
  });

  it("should not return empty array on load failure", async () => {
    // Mock loadUserMatchingData to return null (load failure)
    vi.spyOn(userMatchingData, "loadUserMatchingData").mockResolvedValue(null);

    const result = await calculatePersonalizedMatches("user-1", [mockJob]);

    // Result should be error, NOT empty array
    expect(result.status).toBe("error");
    expect(Array.isArray(result)).toBe(false);

    vi.restoreAllMocks();
  });

  it("should distinguish load failure from incomplete profile", async () => {
    // Mock loadUserMatchingData to return minimal data (incomplete profile)
    vi.spyOn(userMatchingData, "loadUserMatchingData").mockResolvedValue({
      onboarding: null, // No onboarding data = incomplete
      skills: [],
      experiences: [],
      preferences: null,
      goals: [],
      targetRoles: [],
      preferredLocations: [],
    });

    const result = await calculatePersonalizedMatches("user-1", [mockJob]);

    // Should succeed with incomplete_profile results
    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.results).toHaveLength(1);
      expect(result.results[0].status).toBe("incomplete_profile");
    }

    vi.restoreAllMocks();
  });

  it("should return MatchingDataLoadError with proper structure", async () => {
    // Mock loadUserMatchingData to return null
    vi.spyOn(userMatchingData, "loadUserMatchingData").mockResolvedValue(null);

    const result = await calculatePersonalizedMatches("user-1", [mockJob]);

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.error.name).toBe("MatchingDataLoadError");
      expect(result.error.message).toBeTruthy();
      expect(result.error.cause).toBeDefined();
    }

    vi.restoreAllMocks();
  });
});
