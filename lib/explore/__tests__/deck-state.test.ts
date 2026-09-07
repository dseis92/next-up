import { describe, it, expect } from "vitest";
import {
  getDeckCandidates,
  getCurrentJob,
  isDeckExhausted,
  recordAction,
  undoLastAction,
  resetDeck,
} from "../deck-state";
import type { JobMatch } from "@/types";

// Test fixtures
const createMockMatch = (id: string, jobId: string, overallScore: number): JobMatch => ({
  id,
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
    description: "Test description",
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
  overall_score: overallScore,
  qualification_score: 80,
  lifestyle_score: 85,
  breakdown: {
    skills: 75,
    experience: 80,
    salary: 85,
    location: 90,
    work_arrangement: 95,
    career_goals: 70,
  },
  matched_skills: ["JavaScript", "TypeScript"],
  missing_skills: ["Python"],
  reasons_fit: ["Strong technical match"],
  reasons_concern: [],
  created_at: "2026-01-01",
});

describe("getDeckCandidates", () => {
  it("should exclude saved jobs", () => {
    const matches = [
      createMockMatch("match-1", "job-1", 90),
      createMockMatch("match-2", "job-2", 85),
      createMockMatch("match-3", "job-3", 80),
    ];

    const saved = new Set(["job-2"]);
    const passed = new Set<string>();

    const candidates = getDeckCandidates(matches, saved, passed);

    expect(candidates).toHaveLength(2);
    expect(candidates.find((m) => m.job.id === "job-1")).toBeDefined();
    expect(candidates.find((m) => m.job.id === "job-3")).toBeDefined();
    expect(candidates.find((m) => m.job.id === "job-2")).toBeUndefined();
  });

  it("should exclude passed jobs", () => {
    const matches = [
      createMockMatch("match-1", "job-1", 90),
      createMockMatch("match-2", "job-2", 85),
    ];

    const saved = new Set<string>();
    const passed = new Set(["job-1"]);

    const candidates = getDeckCandidates(matches, saved, passed);

    expect(candidates).toHaveLength(1);
    expect(candidates[0].job.id).toBe("job-2");
  });

  it("should exclude both saved and passed jobs", () => {
    const matches = [
      createMockMatch("match-1", "job-1", 90),
      createMockMatch("match-2", "job-2", 85),
      createMockMatch("match-3", "job-3", 80),
      createMockMatch("match-4", "job-4", 75),
    ];

    const saved = new Set(["job-1", "job-3"]);
    const passed = new Set(["job-2"]);

    const candidates = getDeckCandidates(matches, saved, passed);

    expect(candidates).toHaveLength(1);
    expect(candidates[0].job.id).toBe("job-4");
  });

  it("should include unreviewed jobs", () => {
    const matches = [
      createMockMatch("match-1", "job-1", 90),
      createMockMatch("match-2", "job-2", 85),
    ];

    const saved = new Set<string>();
    const passed = new Set<string>();

    const candidates = getDeckCandidates(matches, saved, passed);

    expect(candidates).toHaveLength(2);
  });

  it("should return empty array when all jobs are reviewed", () => {
    const matches = [
      createMockMatch("match-1", "job-1", 90),
      createMockMatch("match-2", "job-2", 85),
    ];

    const saved = new Set(["job-1"]);
    const passed = new Set(["job-2"]);

    const candidates = getDeckCandidates(matches, saved, passed);

    expect(candidates).toHaveLength(0);
  });
});

describe("getCurrentJob", () => {
  it("should return current job at index", () => {
    const matches = [
      createMockMatch("match-1", "job-1", 90),
      createMockMatch("match-2", "job-2", 85),
    ];

    const state = resetDeck(matches);

    const current = getCurrentJob(state);

    expect(current).toBeDefined();
    expect(current?.job.id).toBe("job-1");
  });

  it("should return null when deck is exhausted", () => {
    const matches = [createMockMatch("match-1", "job-1", 90)];

    const state = { jobs: matches, currentIndex: 1, lastAction: null };

    const current = getCurrentJob(state);

    expect(current).toBeNull();
  });
});

describe("isDeckExhausted", () => {
  it("should return false when jobs remain", () => {
    const matches = [createMockMatch("match-1", "job-1", 90)];
    const state = resetDeck(matches);

    expect(isDeckExhausted(state)).toBe(false);
  });

  it("should return true when index exceeds jobs", () => {
    const matches = [createMockMatch("match-1", "job-1", 90)];
    const state = { jobs: matches, currentIndex: 1, lastAction: null };

    expect(isDeckExhausted(state)).toBe(true);
  });
});

describe("recordAction", () => {
  it("should advance index on save", () => {
    const matches = [
      createMockMatch("match-1", "job-1", 90),
      createMockMatch("match-2", "job-2", 85),
    ];

    const state = resetDeck(matches);
    const newState = recordAction(state, "job-1", "save");

    expect(newState.currentIndex).toBe(1);
    expect(newState.lastAction).toEqual({ jobId: "job-1", action: "save" });
  });

  it("should advance index on pass", () => {
    const matches = [
      createMockMatch("match-1", "job-1", 90),
      createMockMatch("match-2", "job-2", 85),
    ];

    const state = resetDeck(matches);
    const newState = recordAction(state, "job-1", "pass");

    expect(newState.currentIndex).toBe(1);
    expect(newState.lastAction).toEqual({ jobId: "job-1", action: "pass" });
  });

  it("should not mutate original state", () => {
    const matches = [createMockMatch("match-1", "job-1", 90)];
    const state = resetDeck(matches);
    const originalIndex = state.currentIndex;

    recordAction(state, "job-1", "save");

    expect(state.currentIndex).toBe(originalIndex);
    expect(state.lastAction).toBeNull();
  });
});

describe("undoLastAction", () => {
  it("should restore index to last action job", () => {
    const matches = [
      createMockMatch("match-1", "job-1", 90),
      createMockMatch("match-2", "job-2", 85),
    ];

    const state = resetDeck(matches);
    const afterAction = recordAction(state, "job-1", "save");
    const afterUndo = undoLastAction(afterAction, "job-1");

    expect(afterUndo.currentIndex).toBe(0);
    expect(afterUndo.lastAction).toBeNull();
  });

  it("should not undo if job ID does not match", () => {
    const matches = [
      createMockMatch("match-1", "job-1", 90),
      createMockMatch("match-2", "job-2", 85),
    ];

    const state = resetDeck(matches);
    const afterAction = recordAction(state, "job-1", "save");
    const afterUndo = undoLastAction(afterAction, "job-wrong");

    expect(afterUndo.currentIndex).toBe(1);
    expect(afterUndo.lastAction).toEqual({ jobId: "job-1", action: "save" });
  });

  it("should not undo if no last action", () => {
    const matches = [createMockMatch("match-1", "job-1", 90)];
    const state = resetDeck(matches);

    const afterUndo = undoLastAction(state, "job-1");

    expect(afterUndo).toEqual(state);
  });

  it("should handle job not in deck gracefully", () => {
    const matches = [createMockMatch("match-1", "job-1", 90)];
    const state = {
      jobs: matches,
      currentIndex: 1,
      lastAction: { jobId: "job-missing", action: "save" as const },
    };

    const afterUndo = undoLastAction(state, "job-missing");

    // Should not crash, return unchanged state
    expect(afterUndo.currentIndex).toBe(1);
    expect(afterUndo.lastAction).toEqual({ jobId: "job-missing", action: "save" });
  });
});

describe("resetDeck", () => {
  it("should create fresh state from candidates", () => {
    const matches = [
      createMockMatch("match-1", "job-1", 90),
      createMockMatch("match-2", "job-2", 85),
    ];

    const state = resetDeck(matches);

    expect(state.jobs).toBe(matches);
    expect(state.currentIndex).toBe(0);
    expect(state.lastAction).toBeNull();
  });

  it("should handle empty candidates", () => {
    const state = resetDeck([]);

    expect(state.jobs).toEqual([]);
    expect(state.currentIndex).toBe(0);
    expect(state.lastAction).toBeNull();
  });
});

describe("deck state integration", () => {
  it("should filter then record save then undo", () => {
    const allMatches = [
      createMockMatch("match-1", "job-1", 90),
      createMockMatch("match-2", "job-2", 85),
      createMockMatch("match-3", "job-3", 80),
    ];

    // Initial state: job-2 already saved
    const saved = new Set(["job-2"]);
    const passed = new Set<string>();

    // Get deck candidates (excludes job-2)
    const candidates = getDeckCandidates(allMatches, saved, passed);
    expect(candidates).toHaveLength(2);

    // Start deck
    let deckState = resetDeck(candidates);
    expect(getCurrentJob(deckState)?.job.id).toBe("job-1");

    // Save job-1
    deckState = recordAction(deckState, "job-1", "save");
    expect(deckState.currentIndex).toBe(1);
    expect(getCurrentJob(deckState)?.job.id).toBe("job-3");

    // Undo save
    deckState = undoLastAction(deckState, "job-1");
    expect(deckState.currentIndex).toBe(0);
    expect(getCurrentJob(deckState)?.job.id).toBe("job-1");
  });

  it("should handle pass then undo pass", () => {
    const matches = [createMockMatch("match-1", "job-1", 90)];
    const saved = new Set<string>();
    const passed = new Set<string>();

    const candidates = getDeckCandidates(matches, saved, passed);
    let deckState = resetDeck(candidates);

    // Pass the job
    deckState = recordAction(deckState, "job-1", "pass");
    expect(isDeckExhausted(deckState)).toBe(true);

    // Undo pass
    deckState = undoLastAction(deckState, "job-1");
    expect(isDeckExhausted(deckState)).toBe(false);
    expect(getCurrentJob(deckState)?.job.id).toBe("job-1");
  });
});
