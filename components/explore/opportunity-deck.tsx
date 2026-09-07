"use client";

import { useState, useEffect } from "react";
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
  type DeckAction,
} from "@/lib/explore/deck-state";
import { saveJob, unsaveJob, passJob, undoPass } from "@/lib/storage/job-actions";
import type { JobMatch } from "@/types";

export interface OpportunityDeckProps {
  filteredMatches: JobMatch[];
  savedJobIds: Set<string>;
  passedJobIds: Set<string>;
  onSwitchToList: () => void;
}

export function OpportunityDeck({
  filteredMatches,
  savedJobIds,
  passedJobIds,
  onSwitchToList,
}: OpportunityDeckProps) {
  const router = useRouter();

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Deck state
  const [deckState, setDeckState] = useState<DeckCandidates>(() =>
    resetDeck(getDeckCandidates(filteredMatches, savedJobIds, passedJobIds))
  );

  // Action state
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);

  // Update deck when filters change
  useEffect(() => {
    const candidates = getDeckCandidates(filteredMatches, savedJobIds, passedJobIds);
    setDeckState(resetDeck(candidates));
  }, [filteredMatches, savedJobIds, passedJobIds]);

  // Hide undo toast after 5 seconds
  useEffect(() => {
    if (showUndoToast) {
      const timer = setTimeout(() => setShowUndoToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showUndoToast]);

  const currentMatch = getCurrentJob(deckState);
  const nextMatch = deckState.jobs[deckState.currentIndex + 1] || null;

  const handlePass = async () => {
    if (!currentMatch || actionPending) return;

    setActionPending(true);
    try {
      await passJob(currentMatch.job.id);

      // Action succeeded - record and advance
      setDeckState((prev) => recordAction(prev, currentMatch.job.id, "pass"));
      setShowUndoToast(true);
    } catch (error) {
      console.error("Failed to pass job:", error);
      setActionError("Failed to pass job. Please try again.");
      setTimeout(() => setActionError(null), 5000);
    } finally {
      setActionPending(false);
    }
  };

  const handleSave = async () => {
    if (!currentMatch || actionPending) return;

    setActionPending(true);
    try {
      await saveJob(currentMatch.job.id);

      // Action succeeded - record and advance
      setDeckState((prev) => recordAction(prev, currentMatch.job.id, "save"));
      setShowUndoToast(true);
    } catch (error) {
      console.error("Failed to save job:", error);
      setActionError("Failed to save job. Please try again.");
      setTimeout(() => setActionError(null), 5000);
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
      } else {
        await undoPass(jobId);
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
    // Prevent keyboard shortcuts if input is focused
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
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
          You've reviewed every opportunity matching these filters.
        </p>
        <Button variant="primary" onClick={onSwitchToList}>
          View all jobs
        </Button>
      </div>
    );
  }

  return (
    <div onKeyDown={handleKeyDown} tabIndex={-1}>
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
