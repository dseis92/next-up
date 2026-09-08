"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { OpportunitySwipeCard } from "./opportunity-swipe-card";
import { X, Heart, RotateCcw } from "lucide-react";
import {
  getDeckCandidates,
  getCurrentJob,
  isDeckExhausted,
  recordAction,
  undoLastAction,
  resetDeck,
  type DeckCandidates,
} from "@/lib/explore/deck-state";
import { saveJob, unsaveJob, passJob, undoPass } from "@/lib/storage/job-actions";
import type { JobMatch } from "@/types";

export interface OpportunityDeckProps {
  filteredMatches: JobMatch[];
  savedJobIds: Set<string>;
  passedJobIds: Set<string>;
  onSwitchToList: () => void;
  onSaved?: (jobId: string) => void;
  onPassed?: (jobId: string) => void;
  onUndoSaved?: (jobId: string) => void;
  onUndoPassed?: (jobId: string) => void;
}

export function OpportunityDeck({
  filteredMatches,
  savedJobIds,
  passedJobIds,
  onSwitchToList,
  onSaved,
  onPassed,
  onUndoSaved,
  onUndoPassed,
}: OpportunityDeckProps) {
  const router = useRouter();

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Derive candidates from filteredMatches only (memoized)
  // Do NOT include savedJobIds/passedJobIds in dependencies
  // The Deck session maintains its own reviewed state via lastAction
  const initialCandidates = useMemo(
    () => getDeckCandidates(filteredMatches, savedJobIds, passedJobIds),
    [filteredMatches, savedJobIds, passedJobIds]
  );

  // Deck state (independent session state)
  const [deckState, setDeckState] = useState<DeckCandidates>(() =>
    resetDeck(initialCandidates)
  );

  // Action state
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);

  // Reset deck ONLY when filteredMatches changes (filter/search changes)
  // Do NOT reset when savedJobIds/passedJobIds change from our own actions
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setDeckState(resetDeck(getDeckCandidates(filteredMatches, savedJobIds, passedJobIds)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredMatches]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Hide undo toast after 5 seconds
  useEffect(() => {
    if (showUndoToast) {
      const timer = setTimeout(() => setShowUndoToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showUndoToast]);

  const currentMatch = getCurrentJob(deckState);
  const nextMatch = deckState.jobs[deckState.currentIndex + 1] || null;

  // Persist save action and synchronize Set immediately
  // For swipes: keeps actionPending locked (caller must release after animation)
  // For buttons: releases lock in finally
  const persistSave = async (jobId: string, fromSwipe: boolean): Promise<boolean> => {
    if (actionPending) return false;

    setActionPending(true);
    try {
      await saveJob(jobId);

      // Synchronize Set immediately after successful persistence
      onSaved?.(jobId);
      return true;
    } catch (error) {
      console.error("Failed to save job:", error);
      setActionError("Failed to save job. Please try again.");
      setTimeout(() => setActionError(null), 5000);
      return false;
    } finally {
      // For button actions, release lock immediately
      // For swipe actions, keep locked until animation completes
      if (!fromSwipe) {
        setActionPending(false);
      }
    }
  };

  // Persist pass action and synchronize Set immediately
  // For swipes: keeps actionPending locked (caller must release after animation)
  // For buttons: releases lock in finally
  const persistPass = async (jobId: string, fromSwipe: boolean): Promise<boolean> => {
    if (actionPending) return false;

    setActionPending(true);
    try {
      await passJob(jobId);

      // Synchronize Set immediately after successful persistence
      onPassed?.(jobId);
      return true;
    } catch (error) {
      console.error("Failed to pass job:", error);
      setActionError("Failed to pass job. Please try again.");
      setTimeout(() => setActionError(null), 5000);
      return false;
    } finally {
      // For button actions, release lock immediately
      // For swipe actions, keep locked until animation completes
      if (!fromSwipe) {
        setActionPending(false);
      }
    }
  };

  // Finalize save action (after animation completes for swipes)
  // Set is already synchronized - just record action and release lock
  const finalizeSave = (jobId: string) => {
    setDeckState((prev) => recordAction(prev, jobId, "save"));
    setShowUndoToast(true);
    setActionPending(false); // Release lock after animation
  };

  // Finalize pass action (after animation completes for swipes)
  // Set is already synchronized - just record action and release lock
  const finalizePass = (jobId: string) => {
    setDeckState((prev) => recordAction(prev, jobId, "pass"));
    setShowUndoToast(true);
    setActionPending(false); // Release lock after animation
  };

  // Button action handlers (persist then immediately finalize)
  const handleSaveButton = async () => {
    if (!currentMatch) return;
    const success = await persistSave(currentMatch.job.id, false);
    if (success) {
      finalizeSave(currentMatch.job.id);
    }
  };

  const handlePassButton = async () => {
    if (!currentMatch) return;
    const success = await persistPass(currentMatch.job.id, false);
    if (success) {
      finalizePass(currentMatch.job.id);
    }
  };

  const handleUndo = async () => {
    if (!deckState.lastAction || actionPending) return;

    const { jobId, action } = deckState.lastAction;

    setActionPending(true);
    try {
      // Reverse the persisted action
      if (action === "save") {
        await unsaveJob(jobId);
        onUndoSaved?.(jobId);
      } else {
        await undoPass(jobId);
        onUndoPassed?.(jobId);
      }

      // Undo succeeded - go back to that job
      setDeckState((prev) => undoLastAction(prev, jobId));
      setShowUndoToast(false);
    } catch (error) {
      console.error("Failed to undo:", error);
      setActionError("Failed to undo. Please try again.");
      setTimeout(() => setActionError(null), 5000);
      // Keep toast visible for retry
    } finally {
      setActionPending(false);
    }
  };

  const handleDetails = () => {
    if (!currentMatch) return;
    router.push(`/jobs/${currentMatch.job.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only handle shortcuts when Deck region itself is focused
    // Ignore if any interactive element is focused
    const target = e.target;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLButtonElement ||
      target instanceof HTMLAnchorElement ||
      (target instanceof HTMLElement && target.isContentEditable)
    ) {
      return;
    }

    if (actionPending) return;

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        handlePassButton();
        break;
      case "ArrowRight":
        e.preventDefault();
        handleSaveButton();
        break;
      case "Enter":
        e.preventDefault();
        handleDetails();
        break;
    }
  };

  // Deck exhausted state
  if (isDeckExhausted(deckState)) {
    return (
      <div className="rounded-[var(--radius-lg)] bg-surface p-12 text-center">
        <h2 className="text-heading mb-2">Deck cleared</h2>
        <p className="text-foreground-secondary mb-6">
          You&apos;ve reviewed every opportunity matching these filters.
        </p>
        <Button variant="primary" onClick={onSwitchToList}>
          View all jobs
        </Button>
      </div>
    );
  }

  return (
    <div
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Opportunity deck. Use arrow keys to save or pass, Enter to view details"
      className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {/* Card Stack */}
      <div className="relative mb-6" style={{ minHeight: "500px" }}>
        {/* Next card (background) */}
        {nextMatch && !prefersReducedMotion && (
          <div
            className="absolute w-full"
            style={{
              transform: "scale(0.95) translateY(10px)",
              opacity: 0.5,
              zIndex: 0,
            }}
          >
            <OpportunitySwipeCard
              key={`next-${nextMatch.job.id}`}
              match={nextMatch}
              disabled
            />
          </div>
        )}

        {/* Current card */}
        {currentMatch && (
          <OpportunitySwipeCard
            key={currentMatch.job.id}
            match={currentMatch}
            onSwipeLeft={() => persistPass(currentMatch.job.id, true)}
            onSwipeRight={() => persistSave(currentMatch.job.id, true)}
            onSwipeLeftComplete={() => finalizePass(currentMatch.job.id)}
            onSwipeRightComplete={() => finalizeSave(currentMatch.job.id)}
            onDetails={handleDetails}
            disabled={actionPending}
            zIndex={1}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="secondary"
          size="lg"
          onClick={handlePassButton}
          disabled={actionPending || !currentMatch}
          className="flex h-16 w-16 items-center justify-center rounded-full"
          aria-label="Pass (ArrowLeft)"
        >
          <X className="h-6 w-6" />
        </Button>

        {deckState.lastAction && (
          <Button
            variant="ghost"
            size="lg"
            onClick={handleUndo}
            disabled={actionPending}
            className="flex h-12 w-12 items-center justify-center rounded-full"
            aria-label="Undo last action"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        )}

        <Button
          variant="primary"
          size="lg"
          onClick={handleSaveButton}
          disabled={actionPending || !currentMatch}
          className="flex h-16 w-16 items-center justify-center rounded-full"
          aria-label="Save (ArrowRight)"
        >
          <Heart className="h-6 w-6" />
        </Button>
      </div>

      {/* Progress */}
      {currentMatch && (
        <div className="mt-4 text-center">
          <p className="text-sm text-foreground-muted">
            {deckState.currentIndex + 1} of {deckState.jobs.length}
          </p>
        </div>
      )}

      {/* Undo Toast */}
      {deckState.lastAction && (
        <Toast
          visible={showUndoToast}
          message={`${deckState.lastAction.action === "save" ? "Saved" : "Passed"} opportunity`}
          action={{
            label: "Undo",
            onClick: handleUndo,
          }}
          onClose={() => setShowUndoToast(false)}
        />
      )}

      {/* Error Toast */}
      {actionError && (
        <Toast
          visible={!!actionError}
          message={actionError}
          onClose={() => setActionError(null)}
        />
      )}
    </div>
  );
}
