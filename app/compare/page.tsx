"use client";

import { useState, useEffect, useMemo, Suspense, useRef } from "react";

export const dynamic = "force-dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IncompleteProfileMessage } from "@/components/jobs/incomplete-profile-message";
import { CompareMatrix } from "@/components/compare/compare-matrix";
import { CompareHeader } from "@/components/compare/compare-header";
import { ArrowLeft, Search } from "lucide-react";
import { parseCompareJobIds, buildCompareUrl } from "@/lib/compare/query";
import { getJobsByIds } from "@/lib/storage/jobs";
import { calculatePersonalizedMatches } from "@/lib/matching/integration";
import { createClient } from "@/lib/supabase/client";
import { useCompareStore } from "@/store/compare-store";
import type { JobMatch } from "@/types";
import type { ComparisonLens } from "@/lib/compare/comparison";

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearSelection = useCompareStore((state) => state.clearSelection);
  const replaceSelection = useCompareStore((state) => state.replaceSelection);
  const removeJobId = useCompareStore((state) => state.removeJobId);

  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [hasIncompleteProfile, setHasIncompleteProfile] = useState(false);
  const [missingJobIds, setMissingJobIds] = useState<string[]>([]);

  const [differencesOnly, setDifferencesOnly] = useState(false);
  const [selectedLens, setSelectedLens] = useState<ComparisonLens>("balanced");

  // Stale request protection: track request generation
  const requestGenRef = useRef(0);

  // Parse job IDs from URL
  const jobIds = useMemo(() => {
    const jobsParam = searchParams.get("jobs");
    return parseCompareJobIds(jobsParam);
  }, [searchParams]);

  // Synchronize store with URL on mount/URL change
  useEffect(() => {
    if (jobIds.length > 0) {
      replaceSelection(jobIds);
    }
  }, [jobIds, replaceSelection]);

  // Load comparison data
  useEffect(() => {
    // Increment request generation (invalidate previous requests)
    const currentRequest = ++requestGenRef.current;

    const loadComparison = async () => {
      // Reset transient state for new request
      setLoading(true);
      setLoadError(false);
      setMissingJobIds([]);
      setHasIncompleteProfile(false);

      if (jobIds.length === 0) {
        setMatches([]);
        setLoading(false);
        return;
      }

      try {
        // Get current user
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setMatches([]);
          setLoading(false);
          return;
        }

        // Load selected jobs (batch query)
        const { jobs, missingIds } = await getJobsByIds(jobIds);

        // Check if request is stale (newer request started)
        if (currentRequest !== requestGenRef.current) {
          return; // Ignore stale results
        }

        // Track missing jobs
        if (missingIds.length > 0) {
          setMissingJobIds(missingIds);
        }

        // Check minimum valid jobs (distinguish missing from query error)
        if (jobs.length < 2) {
          // Not enough valid jobs for comparison
          setMatches([]);
          setLoading(false);
          return;
        }

        // Calculate personalized matches (single profile hydration)
        const matchResult = await calculatePersonalizedMatches(user.id, jobs);

        // Check if request is stale again
        if (currentRequest !== requestGenRef.current) {
          return;
        }

        if (matchResult.status === "error") {
          console.error("Failed to load matching data:", matchResult.error);
          setLoadError(true);
          setMatches([]);
          setLoading(false);
          return;
        }

        const matchResults = matchResult.results;

        // Build JobMatch objects
        const jobMatches: JobMatch[] = [];
        let hasIncomplete = false;

        for (let i = 0; i < jobs.length; i++) {
          const job = jobs[i];
          const result = matchResults[i];

          if (result.status === "incomplete_profile") {
            hasIncomplete = true;
            continue; // Skip incomplete profiles
          }

          jobMatches.push({
            id: `${job.id}-match`,
            user_id: user.id,
            job_id: job.id,
            job,
            overall_score: result.overallScore!,
            qualification_score: result.qualificationScore!,
            lifestyle_score: result.lifestyleScore!,
            breakdown: {
              skills: result.breakdown.skills.score,
              experience: result.breakdown.experience.score,
              salary: result.breakdown.salary.score,
              location: result.breakdown.location.score,
              work_arrangement: result.breakdown.workArrangement.score,
              career_goals: result.breakdown.careerGoals.score,
            },
            matched_skills: result.matchedSkills,
            missing_skills: result.missingSkills,
            reasons_fit: result.reasonsFit.map((r) => r.text),
            reasons_concern: result.reasonsConcern.map((r) => r.text),
            created_at: new Date().toISOString(),
          });
        }

        setHasIncompleteProfile(hasIncomplete);
        setMatches(jobMatches);
      } catch (error) {
        // Check if request is stale
        if (currentRequest !== requestGenRef.current) {
          return;
        }

        console.error("Failed to load comparison:", error);
        setLoadError(true);
        setMatches([]);
      } finally {
        // Only update loading if this is still the current request
        if (currentRequest === requestGenRef.current) {
          setLoading(false);
        }
      }
    };

    loadComparison();
  }, [jobIds]);

  const handleClear = () => {
    clearSelection();
    router.push("/explore");
  };

  const handleRemoveJob = (jobId: string) => {
    // Remove from store
    removeJobId(jobId);

    // Update URL with remaining jobs
    const remaining = jobIds.filter((id) => id !== jobId);
    if (remaining.length === 0) {
      router.push("/compare");
    } else {
      router.push(buildCompareUrl(remaining));
    }
  };

  // Loading state
  if (loading) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center p-4">
          <p className="text-foreground-secondary">Loading comparison...</p>
        </div>
      </AppShell>
    );
  }

  // Error state (database/query failure)
  if (loadError) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center p-4">
          <div className="text-center">
            <p className="text-foreground mb-2">
              Unable to load comparison right now.
            </p>
            <p className="text-foreground-secondary text-sm mb-4">
              Please try again later.
            </p>
            <Button variant="primary" onClick={handleClear}>
              Return to Explore
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  // Missing-job minimum state (distinguish from database failure)
  const validJobCount = jobIds.length - missingJobIds.length;
  const showMinimumState = validJobCount < 2;

  if (showMinimumState) {
    return (
      <AppShell>
        <div className="mx-auto w-full max-w-4xl px-4 py-6 md:py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/explore")}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Explore
            </Button>
            <h1 className="text-heading-lg mb-2">Compare opportunities</h1>
          </div>

          {missingJobIds.length > 0 && (
            <div className="mb-4 rounded-lg bg-surface-secondary p-4">
              <p className="text-foreground mb-2 font-medium">
                {missingJobIds.length === 1
                  ? "1 opportunity is no longer available"
                  : `${missingJobIds.length} opportunities are no longer available`}
              </p>
              <p className="text-foreground-secondary text-sm">
                At least 2 available opportunities are required for comparison.
              </p>
            </div>
          )}

          {hasIncompleteProfile && matches.length === 0 ? (
            <IncompleteProfileMessage />
          ) : (
            <EmptyState
              icon={<Search className="h-6 w-6" />}
              title="Choose at least two opportunities to compare"
              description="Select jobs from Explore or Saved to see how they stack up"
              action={{
                label: "Explore jobs",
                onClick: () => router.push("/explore"),
              }}
            />
          )}
        </div>
      </AppShell>
    );
  }

  // Comparison view
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:py-8">
        <CompareHeader
          matchCount={matches.length}
          onBack={() => router.push("/explore")}
          onClear={handleClear}
        />

        {missingJobIds.length > 0 && (
          <div className="mb-4 rounded-lg bg-surface-secondary p-4">
            <p className="text-foreground-secondary text-sm">
              {missingJobIds.length === 1
                ? "1 opportunity is no longer available"
                : `${missingJobIds.length} opportunities are no longer available`}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          {/* Difference Mode */}
          <div className="flex gap-2" role="group" aria-label="View mode">
            <Button
              variant={!differencesOnly ? "primary" : "secondary"}
              size="sm"
              onClick={() => setDifferencesOnly(false)}
              aria-pressed={!differencesOnly}
            >
              All details
            </Button>
            <Button
              variant={differencesOnly ? "primary" : "secondary"}
              size="sm"
              onClick={() => setDifferencesOnly(true)}
              aria-pressed={differencesOnly}
            >
              Differences only
            </Button>
          </div>

          {/* Lens Selector */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Comparison lens">
            <Button
              variant={selectedLens === "balanced" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setSelectedLens("balanced")}
              aria-pressed={selectedLens === "balanced"}
            >
              Balanced
            </Button>
            <Button
              variant={selectedLens === "compensation" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setSelectedLens("compensation")}
              aria-pressed={selectedLens === "compensation"}
            >
              Compensation
            </Button>
            <Button
              variant={selectedLens === "lifestyle" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setSelectedLens("lifestyle")}
              aria-pressed={selectedLens === "lifestyle"}
            >
              Lifestyle
            </Button>
            <Button
              variant={selectedLens === "qualification" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setSelectedLens("qualification")}
              aria-pressed={selectedLens === "qualification"}
            >
              Qualification
            </Button>
          </div>
        </div>

        {/* Comparison Matrix */}
        <CompareMatrix
          matches={matches}
          differencesOnly={differencesOnly}
          lens={selectedLens}
          onRemoveJob={handleRemoveJob}
        />
      </div>
    </AppShell>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="flex min-h-[50vh] items-center justify-center">
            <p className="text-foreground-secondary">Loading comparison...</p>
          </div>
        </AppShell>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
