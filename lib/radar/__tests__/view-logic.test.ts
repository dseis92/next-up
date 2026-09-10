/**
 * E4 Opportunity Radar — View Logic Tests
 *
 * Tests for production view mode helpers including URL parsing,
 * URL building, CompareTray visibility, and Radar candidate filtering.
 */

import { describe, it, expect } from "vitest";
import {
  type ExploreViewMode,
  parseExploreView,
  buildExploreViewUrl,
  shouldShowCompareTray,
  filterRadarCandidates,
} from "../view-logic";

describe("parseExploreView", () => {
  it("should return 'list' when view parameter is null", () => {
    expect(parseExploreView(null)).toBe("list");
  });

  it("should return 'list' when view parameter is empty string", () => {
    expect(parseExploreView("")).toBe("list");
  });

  it("should return 'list' when view parameter is invalid", () => {
    expect(parseExploreView("invalid")).toBe("list");
  });

  it("should return 'list' when view=list", () => {
    expect(parseExploreView("list")).toBe("list");
  });

  it("should return 'deck' when view=deck", () => {
    expect(parseExploreView("deck")).toBe("deck");
  });

  it("should return 'radar' when view=radar", () => {
    expect(parseExploreView("radar")).toBe("radar");
  });
});

describe("buildExploreViewUrl", () => {
  it("should remove view parameter when changing to list", () => {
    const url = buildExploreViewUrl("view=radar&search=engineer", "list");
    expect(url).toBe("/explore?search=engineer");
  });

  it("should set view=deck when changing to deck", () => {
    const url = buildExploreViewUrl("search=engineer", "deck");
    expect(url).toBe("/explore?search=engineer&view=deck");
  });

  it("should set view=radar when changing to radar", () => {
    const url = buildExploreViewUrl("search=engineer", "radar");
    expect(url).toBe("/explore?search=engineer&view=radar");
  });

  it("should preserve unrelated query parameters", () => {
    const url = buildExploreViewUrl("search=engineer&minMatch=80&arrangement=remote", "radar");

    expect(url).toContain("search=engineer");
    expect(url).toContain("minMatch=80");
    expect(url).toContain("arrangement=remote");
    expect(url).toContain("view=radar");
  });

  it("should return /explore when no parameters and list view", () => {
    const url = buildExploreViewUrl("", "list");
    expect(url).toBe("/explore");
  });

  it("should replace existing view parameter", () => {
    const url = buildExploreViewUrl("view=deck", "radar");
    expect(url).toBe("/explore?view=radar");
  });
});

describe("shouldShowCompareTray", () => {
  it("should show CompareTray in list mode", () => {
    expect(shouldShowCompareTray("list")).toBe(true);
  });

  it("should show CompareTray in radar mode", () => {
    expect(shouldShowCompareTray("radar")).toBe(true);
  });

  it("should NOT show CompareTray in deck mode", () => {
    expect(shouldShowCompareTray("deck")).toBe(false);
  });
});

describe("filterRadarCandidates", () => {
  const createMatch = (id: string) => ({
    job: { id },
    overall_score: 85,
    qualification_score: 80,
    lifestyle_score: 90,
    matched_skills: [],
    missing_skills: [],
  });

  it("should exclude passed jobs from Radar candidates", () => {
    const filteredMatches = [
      createMatch("job-1"),
      createMatch("job-2"),
      createMatch("job-3"),
    ];
    const passedJobIds = new Set(["job-2"]);

    const result = filterRadarCandidates(filteredMatches, passedJobIds);

    expect(result).toHaveLength(2);
    expect(result.map((m) => m.job.id)).toEqual(["job-1", "job-3"]);
  });

  it("should include all jobs when no jobs are passed", () => {
    const filteredMatches = [createMatch("job-1"), createMatch("job-2")];
    const passedJobIds = new Set<string>();

    const result = filterRadarCandidates(filteredMatches, passedJobIds);

    expect(result).toHaveLength(2);
  });

  it("should return empty array when all jobs are passed", () => {
    const filteredMatches = [createMatch("job-1"), createMatch("job-2")];
    const passedJobIds = new Set(["job-1", "job-2"]);

    const result = filterRadarCandidates(filteredMatches, passedJobIds);

    expect(result).toHaveLength(0);
  });

  it("should not exclude saved jobs (unless also passed)", () => {
    // Saved job IDs are NOT in passedJobIds
    const filteredMatches = [createMatch("saved-job-1"), createMatch("job-2")];
    const passedJobIds = new Set<string>(); // Saved jobs not passed

    const result = filterRadarCandidates(filteredMatches, passedJobIds);

    expect(result).toHaveLength(2);
    expect(result.some((m) => m.job.id === "saved-job-1")).toBe(true);
  });

  it("should not exclude applied jobs (unless also passed)", () => {
    // Applied jobs are not automatically excluded from Radar
    const filteredMatches = [createMatch("applied-job-1"), createMatch("job-2")];
    const passedJobIds = new Set<string>(); // Applied jobs not automatically passed

    const result = filterRadarCandidates(filteredMatches, passedJobIds);

    expect(result).toHaveLength(2);
    expect(result.some((m) => m.job.id === "applied-job-1")).toBe(true);
  });

  it("should preserve input order", () => {
    const filteredMatches = [
      createMatch("job-3"),
      createMatch("job-1"),
      createMatch("job-2"),
    ];
    const passedJobIds = new Set<string>();

    const result = filterRadarCandidates(filteredMatches, passedJobIds);

    expect(result.map((m) => m.job.id)).toEqual(["job-3", "job-1", "job-2"]);
  });
});
