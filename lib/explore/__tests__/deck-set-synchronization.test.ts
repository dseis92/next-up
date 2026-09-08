import { describe, it, expect } from "vitest";
import { getDeckCandidates, recordAction, resetDeck } from "../deck-state";
import type { JobMatch } from "@/types";

// Test fixture helper
const createMockMatch = (jobId: string): JobMatch => ({
  id: `match-${jobId}`,
  user_id: "test-user",
  job_id: jobId,
  job: {
    id: jobId,
    company_id: "test-company",
    title: `Job ${jobId}`,
    company: {
      id: "test-company",
      name: "Test Company",
      slug: "test-company",
      industry: undefined,
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    },
    location: "Remote",
    work_arrangement: "remote",
    employment_type: "full_time",
    experience_level: undefined,
    description: "Test",
    requirements: [],
    responsibilities: [],
    salary_min: undefined,
    salary_max: undefined,
    salary_period: undefined,
    salary_is_estimated: false,
    created_at: "2026-01-01",
    posted_date: "2026-01-01",
    updated_at: "2026-01-01",
    external_url: undefined,
  },
  overall_score: 85,
  qualification_score: 80,
  lifestyle_score: 90,
  breakdown: {
    skills: 75,
    experience: 80,
    salary: 85,
    location: 90,
    work_arrangement: 95,
    career_goals: 70,
  },
  matched_skills: ["JavaScript"],
  missing_skills: [],
  reasons_fit: ["Strong match"],
  reasons_concern: [],
  created_at: "2026-01-01",
});

describe("Deck Set Synchronization", () => {
  it("should exclude initial saved job", () => {
    const allMatches = [
      createMockMatch("job-1"),
      createMockMatch("job-2"),
      createMockMatch("job-3"),
    ];

    const savedIds = new Set(["job-2"]);
    const passedIds = new Set<string>();

    const candidates = getDeckCandidates(allMatches, savedIds, passedIds);

    expect(candidates).toHaveLength(2);
    expect(candidates.find((m) => m.job.id === "job-1")).toBeDefined();
    expect(candidates.find((m) => m.job.id === "job-3")).toBeDefined();
    expect(candidates.find((m) => m.job.id === "job-2")).toBeUndefined();
  });

  it("should exclude job after saving (simulates Set update)", () => {
    const allMatches = [
      createMockMatch("job-1"),
      createMockMatch("job-2"),
      createMockMatch("job-3"),
    ];

    // Initial state: nothing reviewed
    let savedIds = new Set<string>();
    const passedIds = new Set<string>();

    // Get initial candidates
    let candidates = getDeckCandidates(allMatches, savedIds, passedIds);
    expect(candidates).toHaveLength(3);

    // Simulate save action: update savedIds Set
    savedIds = new Set(savedIds).add("job-1");

    // Reset candidates with updated Set
    candidates = getDeckCandidates(allMatches, savedIds, passedIds);

    expect(candidates).toHaveLength(2);
    expect(candidates.find((m) => m.job.id === "job-1")).toBeUndefined();
    expect(candidates.find((m) => m.job.id === "job-2")).toBeDefined();
    expect(candidates.find((m) => m.job.id === "job-3")).toBeDefined();
  });

  it("should exclude job after passing (simulates Set update)", () => {
    const allMatches = [createMockMatch("job-1"), createMockMatch("job-2")];

    const savedIds = new Set<string>();
    const passedIds = new Set<string>().add("job-1");

    const candidates = getDeckCandidates(allMatches, savedIds, passedIds);

    expect(candidates).toHaveLength(1);
    expect(candidates[0].job.id).toBe("job-2");
  });

  it("should restore job after undo save (simulates Set removal)", () => {
    const allMatches = [
      createMockMatch("job-1"),
      createMockMatch("job-2"),
      createMockMatch("job-3"),
    ];

    let savedIds = new Set(["job-1"]);
    const passedIds = new Set<string>();

    // Initially job-1 excluded
    let candidates = getDeckCandidates(allMatches, savedIds, passedIds);
    expect(candidates).toHaveLength(2);

    // Undo save: remove from Set
    savedIds = new Set(savedIds);
    savedIds.delete("job-1");

    // job-1 returns to candidates
    candidates = getDeckCandidates(allMatches, savedIds, passedIds);
    expect(candidates).toHaveLength(3);
    expect(candidates.find((m) => m.job.id === "job-1")).toBeDefined();
  });

  it("should restore job after undo pass (simulates Set removal)", () => {
    const allMatches = [createMockMatch("job-1"), createMockMatch("job-2")];

    const savedIds = new Set<string>();
    let passedIds = new Set(["job-1"]);

    // Initially job-1 excluded
    let candidates = getDeckCandidates(allMatches, savedIds, passedIds);
    expect(candidates).toHaveLength(1);

    // Undo pass: remove from Set
    passedIds = new Set(passedIds);
    passedIds.delete("job-1");

    // job-1 returns
    candidates = getDeckCandidates(allMatches, savedIds, passedIds);
    expect(candidates).toHaveLength(2);
  });

  it("should maintain exclusions after filter/search changes", () => {
    const allMatches = [
      createMockMatch("job-1"),
      createMockMatch("job-2"),
      createMockMatch("job-3"),
      createMockMatch("job-4"),
    ];

    let savedIds = new Set(["job-1"]);
    const passedIds = new Set(["job-2"]);

    // Initial filter (all jobs)
    let candidates = getDeckCandidates(allMatches, savedIds, passedIds);
    expect(candidates).toHaveLength(2);
    expect(candidates.find((m) => m.job.id === "job-3")).toBeDefined();
    expect(candidates.find((m) => m.job.id === "job-4")).toBeDefined();

    // Simulate filter change: only job-3 and job-4 remain in filtered results
    const filteredMatches = [createMockMatch("job-3"), createMockMatch("job-4")];

    // Reviewed jobs already excluded, so candidates unchanged
    candidates = getDeckCandidates(filteredMatches, savedIds, passedIds);
    expect(candidates).toHaveLength(2);

    // Now save job-3
    savedIds = new Set(savedIds).add("job-3");

    // Another filter change - job-3 remains excluded
    candidates = getDeckCandidates(filteredMatches, savedIds, passedIds);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].job.id).toBe("job-4");
  });

  it("should handle mode toggle consistency", () => {
    const allMatches = [
      createMockMatch("job-1"),
      createMockMatch("job-2"),
      createMockMatch("job-3"),
    ];

    let savedIds = new Set<string>();
    const passedIds = new Set<string>();

    // Start Deck
    let candidates = getDeckCandidates(allMatches, savedIds, passedIds);
    let deckState = resetDeck(candidates);
    expect(deckState.jobs).toHaveLength(3);

    // Save job-1
    savedIds = new Set(savedIds).add("job-1");
    deckState = recordAction(deckState, "job-1", "save");

    // Switch to List, then back to Deck
    // Simulate mode toggle: re-derive candidates
    candidates = getDeckCandidates(allMatches, savedIds, passedIds);
    expect(candidates).toHaveLength(2);
    expect(candidates.find((m) => m.job.id === "job-1")).toBeUndefined();
  });

  it("should handle multiple actions and resets", () => {
    const allMatches = [
      createMockMatch("job-1"),
      createMockMatch("job-2"),
      createMockMatch("job-3"),
      createMockMatch("job-4"),
    ];

    let savedIds = new Set<string>();
    let passedIds = new Set<string>();

    // Save job-1
    savedIds = new Set(savedIds).add("job-1");

    // Pass job-2
    passedIds = new Set(passedIds).add("job-2");

    // Get candidates
    let candidates = getDeckCandidates(allMatches, savedIds, passedIds);
    expect(candidates).toHaveLength(2);
    expect(candidates.find((m) => m.job.id === "job-3")).toBeDefined();
    expect(candidates.find((m) => m.job.id === "job-4")).toBeDefined();

    // Undo save job-1
    savedIds = new Set(savedIds);
    savedIds.delete("job-1");

    // job-1 returns
    candidates = getDeckCandidates(allMatches, savedIds, passedIds);
    expect(candidates).toHaveLength(3);

    // Undo pass job-2
    passedIds = new Set(passedIds);
    passedIds.delete("job-2");

    // job-2 returns
    candidates = getDeckCandidates(allMatches, savedIds, passedIds);
    expect(candidates).toHaveLength(4);
  });
});
