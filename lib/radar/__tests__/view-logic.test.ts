/**
 * E4 Opportunity Radar — View Logic Tests
 *
 * Tests for view mode parsing, URL building, and state management
 */

import { describe, it, expect } from "vitest";

/**
 * Parse view parameter from URL search params
 */
export function parseExploreView(searchParams: URLSearchParams): "list" | "deck" | "radar" {
  const view = searchParams.get("view");
  if (view === "radar" || view === "deck") return view;
  return "list";
}

/**
 * Build Explore view URL preserving query parameters
 */
export function buildExploreViewUrl(
  currentParams: URLSearchParams,
  newView: "list" | "deck" | "radar"
): string {
  const params = new URLSearchParams(currentParams.toString());

  if (newView === "list") {
    params.delete("view");
  } else {
    params.set("view", newView);
  }

  return params.toString() ? `/explore?${params}` : "/explore";
}

/**
 * Determine if CompareTray should be shown
 */
export function shouldShowCompareTray(viewMode: "list" | "deck" | "radar"): boolean {
  return viewMode === "list" || viewMode === "radar";
}

/**
 * Filter Radar candidates (exclude passed jobs)
 */
export function filterRadarCandidates<T extends { job: { id: string } }>(
  filteredMatches: readonly T[],
  passedJobIds: Set<string>
): T[] {
  return filteredMatches.filter((match) => !passedJobIds.has(match.job.id));
}

describe("parseExploreView", () => {
  it("should return 'list' when view parameter is missing", () => {
    const params = new URLSearchParams("");
    expect(parseExploreView(params)).toBe("list");
  });

  it("should return 'list' when view parameter is invalid", () => {
    const params = new URLSearchParams("view=invalid");
    expect(parseExploreView(params)).toBe("list");
  });

  it("should return 'list' when view=list", () => {
    const params = new URLSearchParams("view=list");
    expect(parseExploreView(params)).toBe("list");
  });

  it("should return 'deck' when view=deck", () => {
    const params = new URLSearchParams("view=deck");
    expect(parseExploreView(params)).toBe("deck");
  });

  it("should return 'radar' when view=radar", () => {
    const params = new URLSearchParams("view=radar");
    expect(parseExploreView(params)).toBe("radar");
  });
});

describe("buildExploreViewUrl", () => {
  it("should remove view parameter when changing to list", () => {
    const current = new URLSearchParams("view=radar&search=engineer");
    const url = buildExploreViewUrl(current, "list");

    expect(url).toBe("/explore?search=engineer");
  });

  it("should set view=deck when changing to deck", () => {
    const current = new URLSearchParams("search=engineer");
    const url = buildExploreViewUrl(current, "deck");

    expect(url).toBe("/explore?search=engineer&view=deck");
  });

  it("should set view=radar when changing to radar", () => {
    const current = new URLSearchParams("search=engineer");
    const url = buildExploreViewUrl(current, "radar");

    expect(url).toBe("/explore?search=engineer&view=radar");
  });

  it("should preserve unrelated query parameters", () => {
    const current = new URLSearchParams("search=engineer&minMatch=80&arrangement=remote");
    const url = buildExploreViewUrl(current, "radar");

    expect(url).toContain("search=engineer");
    expect(url).toContain("minMatch=80");
    expect(url).toContain("arrangement=remote");
    expect(url).toContain("view=radar");
  });

  it("should return /explore when no parameters and list view", () => {
    const current = new URLSearchParams("");
    const url = buildExploreViewUrl(current, "list");

    expect(url).toBe("/explore");
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
    const filteredMatches = [
      createMatch("job-1"),
      createMatch("job-2"),
    ];
    const passedJobIds = new Set<string>();

    const result = filterRadarCandidates(filteredMatches, passedJobIds);

    expect(result).toHaveLength(2);
  });

  it("should return empty array when all jobs are passed", () => {
    const filteredMatches = [
      createMatch("job-1"),
      createMatch("job-2"),
    ];
    const passedJobIds = new Set(["job-1", "job-2"]);

    const result = filterRadarCandidates(filteredMatches, passedJobIds);

    expect(result).toHaveLength(0);
  });

  it("should not exclude saved jobs", () => {
    // Saved job IDs are NOT in passedJobIds
    const filteredMatches = [
      createMatch("saved-job-1"),
      createMatch("job-2"),
    ];
    const passedJobIds = new Set<string>(); // Saved jobs not passed

    const result = filterRadarCandidates(filteredMatches, passedJobIds);

    expect(result).toHaveLength(2);
    expect(result.some((m) => m.job.id === "saved-job-1")).toBe(true);
  });

  it("should not exclude applied jobs", () => {
    // Applied jobs are not automatically excluded from Radar
    const filteredMatches = [
      createMatch("applied-job-1"),
      createMatch("job-2"),
    ];
    const passedJobIds = new Set<string>(); // Applied jobs not automatically passed

    const result = filterRadarCandidates(filteredMatches, passedJobIds);

    expect(result).toHaveLength(2);
    expect(result.some((m) => m.job.id === "applied-job-1")).toBe(true);
  });
});
