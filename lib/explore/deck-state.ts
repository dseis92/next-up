/**
 * Opportunity Deck State Management
 *
 * Pure state logic for the swipe-card deck experience in Explore.
 */

import type { JobMatch } from "@/types";

export type DeckAction = "save" | "pass";

export interface DeckLastAction {
  jobId: string;
  action: DeckAction;
}

export interface DeckCandidates {
  /**
   * Jobs available in the deck (not saved, not passed)
   */
  jobs: JobMatch[];
  /**
   * Current index in the deck
   */
  currentIndex: number;
  /**
   * Last action taken (for undo)
   */
  lastAction: DeckLastAction | null;
}

/**
 * Get deck candidates from filtered matches
 *
 * Excludes jobs that are already saved or passed
 */
export function getDeckCandidates(
  filteredMatches: JobMatch[],
  savedJobIds: Set<string>,
  passedJobIds: Set<string>
): JobMatch[] {
  return filteredMatches.filter(
    (match) =>
      !savedJobIds.has(match.job.id) && !passedJobIds.has(match.job.id)
  );
}

/**
 * Get the current job from deck state
 */
export function getCurrentJob(state: DeckCandidates): JobMatch | null {
  if (state.currentIndex >= state.jobs.length) {
    return null;
  }
  return state.jobs[state.currentIndex];
}

/**
 * Check if deck is exhausted
 */
export function isDeckExhausted(state: DeckCandidates): boolean {
  return state.currentIndex >= state.jobs.length;
}

/**
 * Record an action and advance the deck
 */
export function recordAction(
  state: DeckCandidates,
  jobId: string,
  action: DeckAction
): DeckCandidates {
  return {
    ...state,
    currentIndex: state.currentIndex + 1,
    lastAction: { jobId, action },
  };
}

/**
 * Undo the last action and go back one step
 */
export function undoLastAction(
  state: DeckCandidates,
  lastActionJobId: string
): DeckCandidates {
  // Only undo if the job matches the last action
  if (!state.lastAction || state.lastAction.jobId !== lastActionJobId) {
    return state;
  }

  // Go back to where that job was
  const jobIndex = state.jobs.findIndex((match) => match.job.id === lastActionJobId);

  if (jobIndex === -1) {
    // Job not in deck (shouldn't happen)
    return state;
  }

  return {
    ...state,
    currentIndex: jobIndex,
    lastAction: null, // Clear after undo
  };
}

/**
 * Reset deck state when filters change
 */
export function resetDeck(candidates: JobMatch[]): DeckCandidates {
  return {
    jobs: candidates,
    currentIndex: 0,
    lastAction: null,
  };
}
