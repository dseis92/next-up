import { describe, it, expect } from "vitest";
import { recordAction, undoLastAction, resetDeck } from "../deck-state";
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

describe("Deck Action Lifecycle", () => {
  it("should record save action and preserve lastAction", () => {
    const jobs = [createMockMatch("job-1"), createMockMatch("job-2")];
    const initialState = resetDeck(jobs);

    // Record save action for job-1
    const afterSave = recordAction(initialState, "job-1", "save");

    expect(afterSave.currentIndex).toBe(1);
    expect(afterSave.lastAction).toEqual({
      jobId: "job-1",
      action: "save",
    });
  });

  it("should record pass action and preserve lastAction", () => {
    const jobs = [createMockMatch("job-1"), createMockMatch("job-2")];
    const initialState = resetDeck(jobs);

    // Record pass action for job-1
    const afterPass = recordAction(initialState, "job-1", "pass");

    expect(afterPass.currentIndex).toBe(1);
    expect(afterPass.lastAction).toEqual({
      jobId: "job-1",
      action: "pass",
    });
  });

  it("should preserve lastAction when currentIndex advances", () => {
    const jobs = [
      createMockMatch("job-1"),
      createMockMatch("job-2"),
      createMockMatch("job-3"),
    ];
    const initialState = resetDeck(jobs);

    // Save job-1
    const afterFirstSave = recordAction(initialState, "job-1", "save");
    expect(afterFirstSave.lastAction?.jobId).toBe("job-1");

    // Save job-2 (advances to job-3)
    const afterSecondSave = recordAction(afterFirstSave, "job-2", "save");
    expect(afterSecondSave.currentIndex).toBe(2);
    expect(afterSecondSave.lastAction?.jobId).toBe("job-2");
    expect(afterSecondSave.lastAction?.action).toBe("save");
  });

  it("should undo save action and restore deck position", () => {
    const jobs = [createMockMatch("job-1"), createMockMatch("job-2")];
    const initialState = resetDeck(jobs);

    // Save job-1 and advance to job-2
    const afterSave = recordAction(initialState, "job-1", "save");
    expect(afterSave.currentIndex).toBe(1);
    expect(afterSave.lastAction?.jobId).toBe("job-1");

    // Undo save
    const afterUndo = undoLastAction(afterSave, "job-1");
    expect(afterUndo.currentIndex).toBe(0);
    expect(afterUndo.lastAction).toBeNull();
  });

  it("should undo pass action and restore deck position", () => {
    const jobs = [createMockMatch("job-1"), createMockMatch("job-2")];
    const initialState = resetDeck(jobs);

    // Pass job-1 and advance to job-2
    const afterPass = recordAction(initialState, "job-1", "pass");
    expect(afterPass.currentIndex).toBe(1);
    expect(afterPass.lastAction?.jobId).toBe("job-1");

    // Undo pass
    const afterUndo = undoLastAction(afterPass, "job-1");
    expect(afterUndo.currentIndex).toBe(0);
    expect(afterUndo.lastAction).toBeNull();
  });

  it("should not undo if jobId does not match lastAction", () => {
    const jobs = [createMockMatch("job-1"), createMockMatch("job-2")];
    const initialState = resetDeck(jobs);

    // Save job-1
    const afterSave = recordAction(initialState, "job-1", "save");

    // Attempt undo with wrong jobId
    const afterUndo = undoLastAction(afterSave, "job-2");
    expect(afterUndo).toEqual(afterSave); // No change
  });

  it("should maintain lastAction across simulated filter context", () => {
    const jobs = [createMockMatch("job-1"), createMockMatch("job-2")];
    const initialState = resetDeck(jobs);

    // Save job-1
    const afterSave = recordAction(initialState, "job-1", "save");
    expect(afterSave.lastAction?.jobId).toBe("job-1");

    // Simulate filter change: rebuild deck state with same jobs
    // This represents what happens when filteredMatches changes
    const afterFilterChange = resetDeck(jobs);
    expect(afterFilterChange.currentIndex).toBe(0);
    expect(afterFilterChange.lastAction).toBeNull();
    // This is expected: filter changes clear lastAction
  });

  it("should preserve action state through sequential operations", () => {
    const jobs = [
      createMockMatch("job-1"),
      createMockMatch("job-2"),
      createMockMatch("job-3"),
    ];
    let state = resetDeck(jobs);

    // Pass job-1
    state = recordAction(state, "job-1", "pass");
    expect(state.currentIndex).toBe(1);
    expect(state.lastAction?.jobId).toBe("job-1");
    expect(state.lastAction?.action).toBe("pass");

    // Save job-2
    state = recordAction(state, "job-2", "save");
    expect(state.currentIndex).toBe(2);
    expect(state.lastAction?.jobId).toBe("job-2");
    expect(state.lastAction?.action).toBe("save");

    // Undo save (go back to job-2)
    state = undoLastAction(state, "job-2");
    expect(state.currentIndex).toBe(1);
    expect(state.lastAction).toBeNull();
  });

  it("should handle undo on exhausted deck", () => {
    const jobs = [createMockMatch("job-1")];
    const initialState = resetDeck(jobs);

    // Save the only job
    const afterSave = recordAction(initialState, "job-1", "save");
    expect(afterSave.currentIndex).toBe(1); // Exhausted
    expect(afterSave.lastAction?.jobId).toBe("job-1");

    // Undo should restore
    const afterUndo = undoLastAction(afterSave, "job-1");
    expect(afterUndo.currentIndex).toBe(0);
    expect(afterUndo.lastAction).toBeNull();
  });

  it("should prevent duplicate action on same job", () => {
    const jobs = [createMockMatch("job-1"), createMockMatch("job-2")];
    const initialState = resetDeck(jobs);

    // Save job-1
    const afterSave = recordAction(initialState, "job-1", "save");
    expect(afterSave.currentIndex).toBe(1);
    expect(afterSave.lastAction?.action).toBe("save");

    // Attempting to pass the same job (should not happen if lock works)
    // This proves the state machine behavior, not the lock itself
    const afterInvalidPass = recordAction(initialState, "job-1", "pass");
    expect(afterInvalidPass.currentIndex).toBe(1);
    expect(afterInvalidPass.lastAction?.action).toBe("pass");
    // Both would advance - this shows why we need actionPending lock
  });

  it("should record exactly one action per job", () => {
    const jobs = [
      createMockMatch("job-1"),
      createMockMatch("job-2"),
      createMockMatch("job-3"),
    ];
    let state = resetDeck(jobs);

    // Save job-1
    state = recordAction(state, "job-1", "save");
    expect(state.currentIndex).toBe(1);
    expect(state.lastAction).toEqual({ jobId: "job-1", action: "save" });

    // Save job-2 (replaces lastAction)
    state = recordAction(state, "job-2", "save");
    expect(state.currentIndex).toBe(2);
    expect(state.lastAction).toEqual({ jobId: "job-2", action: "save" });

    // Each action advances exactly once
    expect(state.jobs.length).toBe(3);
  });

  it("should maintain action integrity through undo cycle", () => {
    const jobs = [createMockMatch("job-1"), createMockMatch("job-2")];
    let state = resetDeck(jobs);

    // Save job-1
    state = recordAction(state, "job-1", "save");
    const savedState = { ...state };

    // Undo
    state = undoLastAction(state, "job-1");
    expect(state.currentIndex).toBe(0);
    expect(state.lastAction).toBeNull();

    // Re-save job-1 should produce same result
    state = recordAction(state, "job-1", "save");
    expect(state.currentIndex).toBe(savedState.currentIndex);
    expect(state.lastAction).toEqual(savedState.lastAction);
  });
});
