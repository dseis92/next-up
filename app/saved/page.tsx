"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { IncompleteProfileMessage } from "@/components/jobs/incomplete-profile-message";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Bookmark, MapPin, ArrowRight, X } from "lucide-react";
import { getJobs } from "@/lib/storage/jobs";
import { calculatePersonalizedMatches } from "@/lib/matching/integration";
import { createClient } from "@/lib/supabase/client";
import { formatSalary } from "@/lib/utils";
import { getSavedJobs, unsaveJob } from "@/lib/storage/job-actions";
import type { JobMatch } from "@/types";
import type { MatchResult } from "@/lib/matching/types";

export default function SavedPage() {
  const router = useRouter();
  const [savedMatches, setSavedMatches] = useState<JobMatch[]>([]);
  const [matchResults, setMatchResults] = useState<Map<string, MatchResult>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSavedJobs = async () => {
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

        // Get saved job IDs
        const savedIds = await getSavedJobs();

        if (savedIds.length === 0) {
          setLoading(false);
          return;
        }

        // Load all jobs
        const jobs = await getJobs();

        // Filter to saved jobs only
        const savedJobs = jobs.filter((job) => savedIds.includes(job.id));

        // Calculate current personalized matches for saved jobs
        const results = await calculatePersonalizedMatches(
          user.id,
          savedJobs
        );

        // Store match results separately
        const resultsMap = new Map<string, MatchResult>();
        for (let i = 0; i < savedJobs.length; i++) {
          resultsMap.set(savedJobs[i].id, results[i]);
        }
        setMatchResults(resultsMap);

        // Build JobMatch objects ONLY for scored results
        // Incomplete profiles will be shown via matchResults map
        const jobMatches: JobMatch[] = [];

        for (let i = 0; i < savedJobs.length; i++) {
          const job = savedJobs[i];
          const matchResult = results[i];

          // Only create JobMatch for scored results
          if (matchResult.status === "scored") {
            jobMatches.push({
              id: `${job.id}-match`,
              user_id: user.id,
              job_id: job.id,
              job,
              overall_score: matchResult.overallScore!,
              qualification_score: matchResult.qualificationScore!,
              lifestyle_score: matchResult.lifestyleScore!,
              breakdown: {
                skills: matchResult.breakdown.skills.score,
                experience: matchResult.breakdown.experience.score,
                salary: matchResult.breakdown.salary.score,
                location: matchResult.breakdown.location.score,
                work_arrangement: matchResult.breakdown.workArrangement.score,
                career_goals: matchResult.breakdown.careerGoals.score,
              },
              matched_skills: matchResult.matchedSkills,
              missing_skills: matchResult.missingSkills,
              reasons_fit: matchResult.reasonsFit.map((r) => r.text),
              reasons_concern: matchResult.reasonsConcern.map((r) => r.text),
              created_at: new Date().toISOString(),
            });
          } else {
            // For incomplete profiles, create a minimal JobMatch with just the job data
            jobMatches.push({
              id: `${job.id}-match`,
              user_id: user.id,
              job_id: job.id,
              job,
              overall_score: 0, // Will not be displayed
              qualification_score: 0,
              lifestyle_score: 0,
              breakdown: {
                skills: 0,
                experience: 0,
                salary: 0,
                location: 0,
                work_arrangement: 0,
                career_goals: 0,
              },
              matched_skills: [],
              missing_skills: [],
              reasons_fit: [],
              reasons_concern: [],
              created_at: new Date().toISOString(),
            });
          }
        }

        setSavedMatches(jobMatches);
      } catch (error) {
        console.error("Failed to load saved jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSavedJobs();
  }, []);

  const handleRemove = async (jobId: string) => {
    await unsaveJob(jobId);
    setSavedMatches(savedMatches.filter((m) => m.job.id !== jobId));
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center p-4">
          <p className="text-foreground-secondary">Loading saved jobs...</p>
        </div>
      </AppShell>
    );
  }

  if (savedMatches.length === 0) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center">
          <EmptyState
            icon={<Bookmark className="h-6 w-6" />}
            title="Nothing saved yet"
            description="Save opportunities you might want to revisit."
            action={{
              label: "Discover jobs",
              onClick: () => router.push("/discover"),
            }}
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-heading-lg mb-2">Saved jobs</h1>
          <p className="text-foreground-secondary">
            {savedMatches.length} {savedMatches.length === 1 ? "opportunity" : "opportunities"} saved
          </p>
        </div>

        <div className="space-y-4">
          {savedMatches.map((match) => {
            const { job, overall_score, matched_skills } = match;
            const matchResult = matchResults.get(job.id);
            const isIncomplete = matchResult?.status === "incomplete_profile";

            return (
              <Card key={job.id} variant="elevated" className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <Avatar
                      name={job.company.name}
                      size="lg"
                      className="shrink-0 bg-gradient-to-br from-blue-500 to-blue-600"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 truncate text-lg font-semibold text-foreground">
                        {job.title}
                      </h3>
                      <p className="mb-2 truncate text-sm text-foreground-secondary">
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
                      </div>
                      {job.salary_min && (
                        <p className="mb-2 text-xl font-bold text-foreground">
                          {formatSalary(
                            job.salary_min,
                            job.salary_max,
                            job.salary_period
                          )}
                        </p>
                      )}
                      {isIncomplete ? (
                        <div className="mt-2">
                          <IncompleteProfileMessage variant="inline" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={overall_score >= 90 ? "success" : "brand"}
                            size="sm"
                          >
                            {overall_score}% match
                          </Badge>
                          {matched_skills.slice(0, 2).map((skill) => (
                            <Badge key={skill} variant="muted" size="sm">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 sm:flex-col">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRemove(job.id)}
                      className="flex-1 gap-2 sm:flex-none"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => router.push(`/jobs/${job.id}`)}
                      className="flex-1 gap-2 sm:flex-none"
                    >
                      View
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
