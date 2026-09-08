"use client";

import { useState, useEffect, useMemo, Suspense } from "react";

export const dynamic = "force-dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { IncompleteProfileMessage } from "@/components/jobs/incomplete-profile-message";
import { CompareMatrix } from "@/components/compare/compare-matrix";
import { CompareHeader } from "@/components/compare/compare-header";
import { ArrowLeft, Search } from "lucide-react";
import { parseCompareJobIds } from "@/lib/compare/query";
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

  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [hasIncompleteProfile, setHasIncompleteProfile] = useState(false);
  const [missingJobCount, setMissingJobCount] = useState(0);

  const [differencesOnly, setDifferencesOnly] = useState(false);
  const [selectedLens, setSelectedLens] = useState<ComparisonLens>("balanced");

  // Parse job IDs from URL
  const jobIds = useMemo(() => {
    const jobsParam = searchParams.get("jobs");
    return parseCompareJobIds(jobsParam);
  }, [searchParams]);

  // Load comparison data
  useEffect(() => {
    const loadComparison = async () => {
      if (jobIds.length === 0) {
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
          setLoading(false);
          return;
        }

        // Load selected jobs (batch query)
        const { jobs, missingIds } = await getJobsByIds(jobIds);

        if (missingIds.length > 0) {
          setMissingJobCount(missingIds.length);
        }

        if (jobs.length < 2) {
          // Not enough valid jobs for comparison
          setLoading(false);
          return;
        }

        // Calculate personalized matches (single profile hydration)
        const matchResult = await calculatePersonalizedMatches(user.id, jobs);

        if (matchResult.status === "error") {
          console.error("Failed to load matching data:", matchResult.error);
          setLoadError(true);
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
          }

          // Skip incomplete profiles
          if (result.status === "incomplete_profile") {
            continue;
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
        console.error("Failed to load comparison:", error);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    loadComparison();
  }, [jobIds]);

  const handleClear = () => {
    clearSelection();
    router.push("/explore");
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

  // Error state
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

  // Empty state (0-1 jobs)
  if (jobIds.length < 2 || matches.length < 2) {
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

          {missingJobCount > 0 && matches.length >= 1 && (
            <div className="mb-4 rounded-lg bg-surface-secondary p-4">
              <p className="text-foreground-secondary text-sm">
                {missingJobCount === 1
                  ? "One opportunity is no longer available."
                  : `${missingJobCount} opportunities are no longer available.`}
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

        {missingJobCount > 0 && (
          <div className="mb-4 rounded-lg bg-surface-secondary p-4">
            <p className="text-foreground-secondary text-sm">
              {missingJobCount === 1
                ? "One opportunity is no longer available."
                : `${missingJobCount} opportunities are no longer available.`}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          {/* Difference Mode */}
          <div className="flex gap-2">
            <Badge
              variant={!differencesOnly ? "brand" : "default"}
              className="cursor-pointer"
              onClick={() => setDifferencesOnly(false)}
            >
              All details
            </Badge>
            <Badge
              variant={differencesOnly ? "brand" : "default"}
              className="cursor-pointer"
              onClick={() => setDifferencesOnly(true)}
            >
              Differences only
            </Badge>
          </div>

          {/* Lens Selector */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedLens === "balanced" ? "brand" : "default"}
              className="cursor-pointer"
              onClick={() => setSelectedLens("balanced")}
            >
              Balanced
            </Badge>
            <Badge
              variant={selectedLens === "compensation" ? "brand" : "default"}
              className="cursor-pointer"
              onClick={() => setSelectedLens("compensation")}
            >
              Compensation
            </Badge>
            <Badge
              variant={selectedLens === "lifestyle" ? "brand" : "default"}
              className="cursor-pointer"
              onClick={() => setSelectedLens("lifestyle")}
            >
              Lifestyle
            </Badge>
            <Badge
              variant={selectedLens === "qualification" ? "brand" : "default"}
              className="cursor-pointer"
              onClick={() => setSelectedLens("qualification")}
            >
              Qualification
            </Badge>
          </div>
        </div>

        {/* Comparison Matrix */}
        <CompareMatrix
          matches={matches}
          differencesOnly={differencesOnly}
          lens={selectedLens}
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
