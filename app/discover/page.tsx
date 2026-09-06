"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { JobDiscoveryCard } from "@/components/jobs/job-discovery-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Toast } from "@/components/ui/toast";
import { mockJobMatches } from "@/lib/data/mock-jobs";
import {
  saveJob,
  passJob,
  undoPass,
  getPassedJobIds,
  getDailyProgress,
  incrementDailyProgress,
} from "@/lib/storage/job-actions";
import { Flame } from "lucide-react";
import type { JobMatch } from "@/types";

export default function DiscoverPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak] = useState(6);
  const [lastPassedJob, setLastPassedJob] = useState<{
    id: string;
    title: string;
    index: number;
  } | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Filter out passed jobs
  const [filteredMatches, setFilteredMatches] = useState<JobMatch[]>(mockJobMatches);

  useEffect(() => {
    const loadMatches = async () => {
      const passedIds = await getPassedJobIds();
      setFilteredMatches(
        mockJobMatches.filter((match) => !passedIds.includes(match.job.id))
      );
    };
    loadMatches();
  }, []);

  const currentMatch = filteredMatches[currentIndex];

  // Daily progress state
  const [dailyProgress, setDailyProgress] = useState(() => {
    const progress = getDailyProgress();
    return { reviewed: progress.reviewed, target: 5 };
  });

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleSave = async () => {
    if (currentMatch) {
      await saveJob(currentMatch.job.id);
      incrementDailyProgress();
      setDailyProgress((prev) => ({
        ...prev,
        reviewed: Math.min(prev.reviewed + 1, prev.target),
      }));
    }
    // Always advance
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePass = async () => {
    if (currentMatch) {
      await passJob(currentMatch.job.id);
      incrementDailyProgress();
      setDailyProgress((prev) => ({
        ...prev,
        reviewed: Math.min(prev.reviewed + 1, prev.target),
      }));

      // Show undo toast
      setLastPassedJob({
        id: currentMatch.job.id,
        title: currentMatch.job.title,
        index: currentIndex,
      });
      setShowToast(true);
    }
    // Always advance
    setCurrentIndex((prev) => prev + 1);
  };

  const handleUndo = async () => {
    if (lastPassedJob) {
      await undoPass(lastPassedJob.id);
      setShowToast(false);
      // Go back to that job
      setCurrentIndex(lastPassedJob.index);
      setLastPassedJob(null);
    }
  };

  const handleViewDetails = () => {
    incrementDailyProgress();
    setDailyProgress((prev) => ({
      ...prev,
      reviewed: Math.min(prev.reviewed + 1, prev.target),
    }));
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-heading-lg mb-1 md:mb-2">Hey there!</h1>
          <p className="text-foreground-secondary">
            {currentMatch
              ? `${filteredMatches.length - currentIndex} fresh ${filteredMatches.length - currentIndex === 1 ? "opportunity" : "opportunities"}`
              : "You're all caught up"}
          </p>
        </div>

        {/* Daily Progress */}
        <div className="mb-4 rounded-[var(--radius-lg)] bg-surface p-3 md:mb-6 md:p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                Today's momentum
              </span>
              <Badge variant="brand" size="sm">
                <Flame className="mr-1 h-3 w-3" />
                {streak} days
              </Badge>
            </div>
            <span className="text-sm text-foreground-muted">
              {dailyProgress.reviewed} of {dailyProgress.target}
            </span>
          </div>
          <Progress
            value={dailyProgress.reviewed}
            max={dailyProgress.target}
            size="md"
          />
        </div>

        {/* Job Cards */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {currentMatch ? (
              <JobDiscoveryCard
                key={currentMatch.id}
                match={currentMatch}
                onSave={handleSave}
                onPass={handlePass}
                onViewDetails={handleViewDetails}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-[var(--radius-lg)] bg-surface p-12 text-center"
              >
                <h2 className="text-heading mb-2">You're all caught up!</h2>
                <p className="text-foreground-secondary">
                  Check back later for more opportunities.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress indicator */}
        {currentMatch && (
          <div className="mt-4 text-center md:mt-6">
            <p className="text-sm text-foreground-muted">
              {currentIndex + 1} of {filteredMatches.length}
            </p>
          </div>
        )}
      </div>

      {/* Undo Toast */}
      {lastPassedJob && (
        <Toast
          visible={showToast}
          message={`Passed ${lastPassedJob.title}`}
          action={{
            label: "Undo",
            onClick: handleUndo,
          }}
          onClose={() => setShowToast(false)}
        />
      )}
    </AppShell>
  );
}
