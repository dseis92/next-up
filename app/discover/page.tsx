"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { JobDiscoveryCard } from "@/components/jobs/job-discovery-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { mockJobMatches } from "@/lib/data/mock-jobs";
import { Flame } from "lucide-react";

export default function DiscoverPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches] = useState(mockJobMatches);
  const [dailyProgress] = useState({ reviewed: 3, target: 5 });
  const [streak] = useState(6);

  const currentMatch = matches[currentIndex];
  const hasMore = currentIndex < matches.length - 1;

  const handleSave = () => {
    console.log("Saved job:", currentMatch.job.title);
    if (hasMore) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePass = () => {
    console.log("Passed on job:", currentMatch.job.title);
    if (hasMore) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleViewDetails = () => {
    console.log("Viewing details for:", currentMatch.job.title);
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-heading-lg mb-2">Hey there!</h1>
          <p className="text-foreground-secondary">
            {matches.length - currentIndex} fresh opportunities
          </p>
        </div>

        {/* Daily Progress */}
        <div className="mb-6 rounded-[var(--radius-lg)] bg-surface p-4">
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
        <div className="relative">
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
        {matches.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-foreground-muted">
              {currentIndex + 1} of {matches.length}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
