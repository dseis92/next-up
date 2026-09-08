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

  // Derive candidates (memoized to prevent unnecessary recalculations)
  const candidates = useMemo(
    () => getDeckCandidates(filteredMatches, savedJobIds, passedJobIds),
    [filteredMatches, savedJobIds, passedJobIds]
  );

  // Deck state (reset when candidates change)
  const [deckState, setDeckState] = useState<DeckCandidates>(() =>
    resetDeck(candidates)
  );

  // Action state
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);

  // Reset deck when candidates change (from filter/Set updates)
  // This is intentional synchronization with external state
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setDeckState(resetDeck(candidates));
  }, [candidates]);
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

  const handlePass = async (): Promise<boolean> => {
    if (!currentMatch || actionPending) return false;

    setActionPending(true);
    try {
      await passJob(currentMatch.job.id);

      // Action succeeded - notify parent and record
      onPassed?.(currentMatch.job.id);
      setDeckState((prev) => recordAction(prev, currentMatch.job.id, "pass"));
      setShowUndoToast(true);
      return true;
    } catch (error) {
      console.error("Failed to pass job:", error);
      setActionError("Failed to pass job. Please try again.");
      setTimeout(() => setActionError(null), 5000);
      return false;
    } finally {
      setActionPending(false);
    }
  };

  const handleSave = async (): Promise<boolean> => {
    if (!currentMatch || actionPending) return false;

    setActionPending(true);
    try {
      await saveJob(currentMatch.job.id);

      // Action succeeded - notify parent and record
      onSaved?.(currentMatch.job.id);
      setDeckState((prev) => recordAction(prev, currentMatch.job.id, "save"));
      setShowUndoToast(true);
      return true;
    } catch (error) {
      console.error("Failed to save job:", error);
      setActionError("Failed to save job. Please try again.");
      setTimeout(() => setActionError(null), 5000);
      return false;
    } finally {
      setActionPending(false);
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
        handlePass();
        break;
      case "ArrowRight":
        e.preventDefault();
        handleSave();
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
      className="focus:outline-none"
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
            <OpportunitySwipeCard match={nextMatch} disabled />
          </div>
        )}

        {/* Current card */}
        {currentMatch && (
          <OpportunitySwipeCard
            match={currentMatch}
            onSwipeLeft={handlePass}
            onSwipeRight={handleSave}
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
          onClick={handlePass}
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
          onClick={handleSave}
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
