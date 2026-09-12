"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { IncompleteProfileMessage } from "@/components/jobs/incomplete-profile-message";
import { OpportunityDeck } from "@/components/explore/opportunity-deck";
import { OpportunityRadar } from "@/components/radar/opportunity-radar";
import { RadarErrorBoundary } from "@/components/radar/radar-error-boundary";
import { CompareToggle } from "@/components/compare/compare-toggle";
import { CompareTray } from "@/components/compare/compare-tray";
import { Search, MapPin, ArrowRight, SlidersHorizontal, List, LayoutGrid, Layers } from "lucide-react";
import { getJobs } from "@/lib/storage/jobs";
import { calculatePersonalizedMatches } from "@/lib/matching/integration";
import { getSavedJobs, getPassedJobIds } from "@/lib/storage/job-actions";
import { createClient } from "@/lib/supabase/client";
import { formatSalary } from "@/lib/utils";
import type { JobMatch } from "@/types";
import { useDealbreakerPreferences, evaluateJobsDealbreakers } from "@/hooks/use-dealbreaker-preferences";
import { DealbreakerBadge } from "@/components/dealbreakers/dealbreaker-badge";
import type { DealbreakerEvaluation } from "@/lib/dealbreakers/types";
import {
  type ExploreViewMode,
  parseExploreView,
  buildExploreViewUrl,
  shouldShowCompareTray,
  filterRadarCandidates,
} from "@/lib/radar/view-logic";

// Force dynamic rendering since we use searchParams
export const dynamic = "force-dynamic";

function ExplorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive view mode from URL parameter
  const viewMode: ExploreViewMode = useMemo(() => {
    return parseExploreView(searchParams.get("view"));
  }, [searchParams]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArrangement, setSelectedArrangement] = useState<string | null>(
    null
  );
  const [minMatch, setMinMatch] = useState(0);

  // Load personalized job matches
  const [allMatches, setAllMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasIncompleteProfile, setHasIncompleteProfile] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Deck mode persistence state
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [passedJobIds, setPassedJobIds] = useState<Set<string>>(new Set());
  const [deckStateError, setDeckStateError] = useState(false);
  const [deckPending, setDeckPending] = useState(false);

  // Load dealbreaker preferences once
  const { preferences: dealbreakerPreferences } = useDealbreakerPreferences();

  // Evaluate dealbreakers for all jobs (single-flight)
  const dealbreakerEvaluations = useMemo(() => {
    if (!dealbreakerPreferences || allMatches.length === 0) {
      return new Map<string, DealbreakerEvaluation>();
    }
    const jobs = allMatches.map(m => m.job);
    return evaluateJobsDealbreakers(dealbreakerPreferences, jobs);
  }, [dealbreakerPreferences, allMatches]);

  // Update URL when view mode button is clicked
  // Use native History API to preserve React filter state while updating URL
  const handleViewModeChange = (newMode: ExploreViewMode) => {
    const newUrl = buildExploreViewUrl(searchParams.toString(), newMode);
    window.history.pushState(null, "", newUrl);
  };

  useEffect(() => {
    const loadMatches = async () => {
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

        // Load jobs
        const jobs = await getJobs();

        // Calculate personalized matches
        const matchResult = await calculatePersonalizedMatches(user.id, jobs);

        // Handle load failure
        if (matchResult.status === "error") {
          console.error("Failed to load matching data:", matchResult.error);
          setLoadError(true);
          setLoading(false);
          return;
        }

        const matchResults = matchResult.results;

        // Build JobMatch objects with real match scores
        const jobMatches: JobMatch[] = [];
        let hasIncomplete = false;

        for (let i = 0; i < jobs.length; i++) {
          const job = jobs[i];
          const result = matchResults[i];

          // Track if user has incomplete profile
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
        setAllMatches(jobMatches);

        // Load saved/passed for Deck mode
        try {
          const savedIds = await getSavedJobs();
          const passedIds = await getPassedJobIds();
          setSavedJobIds(new Set(savedIds));
          setPassedJobIds(new Set(passedIds));
          setDeckStateError(false);
        } catch (error) {
          console.error("Failed to load saved/passed jobs:", error);
          setDeckStateError(true);
        }
      } catch (error) {
        console.error("Failed to load personalized matches:", error);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };
    loadMatches();
  }, []);

  // Set synchronization callbacks
  const handleSaved = (jobId: string) => {
    setSavedJobIds((prev) => new Set(prev).add(jobId));
  };

  const handlePassed = (jobId: string) => {
    setPassedJobIds((prev) => new Set(prev).add(jobId));
  };

  const handleUndoSaved = (jobId: string) => {
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      next.delete(jobId);
      return next;
    });
  };

  const handleUndoPassed = (jobId: string) => {
    setPassedJobIds((prev) => {
      const next = new Set(prev);
      next.delete(jobId);
      return next;
    });
  };

  const filteredJobs = useMemo(() => {
    return allMatches.filter((match) => {
      const { job, overall_score } = match;

      // Search filter
      const matchesSearch =
        !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchQuery.toLowerCase());

      // Work arrangement filter
      const matchesArrangement =
        !selectedArrangement || job.work_arrangement === selectedArrangement;

      // Match score filter
      const matchesScore = overall_score >= minMatch;

      return matchesSearch && matchesArrangement && matchesScore;
    });
  }, [allMatches, searchQuery, selectedArrangement, minMatch]);

  // Radar candidates: filtered jobs excluding passed jobs
  const radarMatches = useMemo(() => {
    return filterRadarCandidates(filteredJobs, passedJobIds);
  }, [filteredJobs, passedJobIds]);

  const arrangements = [
    { value: "remote", label: "Remote" },
    { value: "hybrid", label: "Hybrid" },
    { value: "onsite", label: "On-site" },
  ];

  const matchFilters = [
    { value: 90, label: "90%+" },
    { value: 80, label: "80%+" },
    { value: 70, label: "70%+" },
    { value: 0, label: "All" },
  ];

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center p-4">
          <p className="text-foreground-secondary">Loading opportunities...</p>
        </div>
      </AppShell>
    );
  }

  if (loadError) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center p-4">
          <div className="text-center">
            <p className="text-foreground mb-2">
              Unable to load your personalized matches right now.
            </p>
            <p className="text-foreground-secondary text-sm">
              Please try again later.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-heading-lg mb-2">Explore jobs</h1>
            <p className="text-foreground-secondary">
              {viewMode === "list"
                ? "Search and filter through all opportunities"
                : viewMode === "deck"
                ? "Swipe to review opportunities"
                : "Browse opportunities by category"}
            </p>
          </div>

          {/* View Mode Selector */}
          <div className="flex gap-2" role="group" aria-label="View mode selection">
            <Button
              variant={viewMode === "list" ? "primary" : "secondary"}
              size="sm"
              onClick={() => handleViewModeChange("list")}
              disabled={deckPending}
              className="gap-2 min-h-[44px]"
              aria-label="Switch to List view"
              aria-pressed={viewMode === "list"}
            >
              <List className="h-4 w-4" aria-hidden="true" />
              List
            </Button>
            <Button
              variant={viewMode === "deck" ? "primary" : "secondary"}
              size="sm"
              onClick={() => handleViewModeChange("deck")}
              disabled={deckPending}
              className="gap-2 min-h-[44px]"
              aria-label="Switch to Deck view"
              aria-pressed={viewMode === "deck"}
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              Deck
            </Button>
            <Button
              variant={viewMode === "radar" ? "primary" : "secondary"}
              size="sm"
              onClick={() => handleViewModeChange("radar")}
              disabled={deckPending}
              className="gap-2 min-h-[44px]"
              aria-label="Switch to Radar view"
              aria-pressed={viewMode === "radar"}
            >
              <Layers className="h-4 w-4" aria-hidden="true" />
              Radar
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" />
            <Input
              type="text"
              placeholder="Search by title, company, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={deckPending}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-3">
          {/* Work Arrangement */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-foreground-muted">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="font-medium">Work arrangement</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {arrangements.map((arr) => (
                <Badge
                  key={arr.value}
                  variant={
                    selectedArrangement === arr.value ? "brand" : "default"
                  }
                  className={deckPending ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                  onClick={() => {
                    if (!deckPending) {
                      setSelectedArrangement(
                        selectedArrangement === arr.value ? null : arr.value
                      );
                    }
                  }}
                >
                  {arr.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Match Score */}
          <div>
            <div className="mb-2 text-sm font-medium text-foreground-muted">
              Minimum match
            </div>
            <div className="flex flex-wrap gap-2">
              {matchFilters.map((filter) => (
                <Badge
                  key={filter.value}
                  variant={minMatch === filter.value ? "brand" : "default"}
                  className={deckPending ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                  onClick={() => {
                    if (!deckPending) {
                      setMinMatch(filter.value);
                    }
                  }}
                >
                  {filter.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* List Mode Results */}
        {viewMode === "list" && (
          <>
            {/* Results Count */}
            <div className="mb-4 text-sm text-foreground-secondary">
              {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"}{" "}
              found
            </div>

            {/* Results */}
            {filteredJobs.length === 0 ? (
              hasIncompleteProfile && allMatches.length === 0 ? (
                <IncompleteProfileMessage />
              ) : (
                <EmptyState
                  icon={<Search className="h-6 w-6" />}
                  title="No jobs found"
                  description="Try adjusting your filters or search terms"
                />
              )
            ) : (
              <div className="space-y-3">
                {filteredJobs.map((match) => {
                  const { job, overall_score, matched_skills } = match;
                  const dealbreakerEval = dealbreakerEvaluations.get(job.id);

                  return (
                    <Card
                      key={job.id}
                      variant="elevated"
                      className="cursor-pointer p-4 transition-all hover:shadow-lg"
                      onClick={() => router.push(`/jobs/${job.id}`)}
                    >
                      <div className="flex gap-3">
                        <Avatar
                          name={job.company.name}
                          size="lg"
                          className="shrink-0 bg-gradient-to-br from-blue-500 to-blue-600"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-start justify-between gap-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {job.title}
                            </h3>
                            <div className="flex shrink-0 gap-1.5">
                              <Badge
                                variant={overall_score >= 90 ? "success" : "brand"}
                                size="sm"
                              >
                                {overall_score}%
                              </Badge>
                              {dealbreakerEval && <DealbreakerBadge evaluation={dealbreakerEval} size="sm" />}
                            </div>
                          </div>
                          <p className="mb-2 text-sm text-foreground-secondary">
                            {job.company.name}
                          </p>
                          <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-foreground-muted">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{job.location}</span>
                            </div>
                            <span>•</span>
                            <span className="capitalize">
                              {job.work_arrangement.replace("_", " ")}
                            </span>
                            <span>•</span>
                            <span className="capitalize">
                              {job.employment_type.replace("_", " ")}
                            </span>
                          </div>
                          {job.salary_min && (
                            <p className="mb-2 text-lg font-bold text-foreground">
                              {formatSalary(
                                job.salary_min,
                                job.salary_max,
                                job.salary_period
                              )}
                            </p>
                          )}
                          <div className="mb-3 flex flex-wrap gap-1.5">
                            {matched_skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="muted" size="sm">
                                {skill}
                              </Badge>
                            ))}
                            {matched_skills.length > 3 && (
                              <Badge variant="muted" size="sm">
                                +{matched_skills.length - 3}
                              </Badge>
                            )}
                          </div>

                          {/* Compare Toggle */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex gap-2"
                          >
                            <CompareToggle jobId={job.id} className="gap-2" />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/jobs/${job.id}`);
                          }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Deck Mode */}
        {viewMode === "deck" && (
          <>
            {deckStateError ? (
              <div className="rounded-[var(--radius-lg)] bg-surface p-12 text-center">
                <p className="text-foreground mb-4">
                  Unable to load your Opportunity Deck right now.
                </p>
                <Button variant="primary" onClick={() => handleViewModeChange("list")}>
                  Return to List
                </Button>
              </div>
            ) : hasIncompleteProfile && allMatches.length === 0 ? (
              <IncompleteProfileMessage />
            ) : filteredJobs.length === 0 ? (
              <EmptyState
                icon={<Search className="h-6 w-6" />}
                title="No jobs found"
                description="Try adjusting your filters or search terms"
              />
            ) : (
              <OpportunityDeck
                filteredMatches={filteredJobs}
                savedJobIds={savedJobIds}
                passedJobIds={passedJobIds}
                onSwitchToList={() => handleViewModeChange("list")}
                onSaved={handleSaved}
                onPassed={handlePassed}
                onUndoSaved={handleUndoSaved}
                onUndoPassed={handleUndoPassed}
                onPendingChange={setDeckPending}
              />
            )}
          </>
        )}

        {/* Radar Mode */}
        {viewMode === "radar" && (
          <>
            {deckStateError ? (
              <div className="rounded-[var(--radius-lg)] bg-surface p-12 text-center">
                <p className="text-foreground mb-4">
                  Unable to load Opportunity Radar right now.
                </p>
                <Button variant="primary" onClick={() => handleViewModeChange("list")}>
                  Return to List
                </Button>
              </div>
            ) : hasIncompleteProfile && allMatches.length === 0 ? (
              <IncompleteProfileMessage />
            ) : (
              <RadarErrorBoundary onReturnToList={() => handleViewModeChange("list")}>
                <OpportunityRadar
                  allMatches={radarMatches}
                  dealbreakerEvaluations={dealbreakerEvaluations}
                />
              </RadarErrorBoundary>
            )}
          </>
        )}
      </div>

      {/* Compare Tray (List and Radar modes) */}
      {shouldShowCompareTray(viewMode) && <CompareTray />}
    </AppShell>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="flex h-full items-center justify-center p-4">
            <p className="text-foreground-secondary">Loading...</p>
          </div>
        </AppShell>
      }
    >
      <ExplorePageContent />
    </Suspense>
  );
}
