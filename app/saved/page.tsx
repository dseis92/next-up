"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Bookmark, MapPin, ArrowRight, X } from "lucide-react";
import { mockJobMatches } from "@/lib/data/mock-jobs";
import { formatSalary } from "@/lib/utils";
import { getSavedJobs, unsaveJob } from "@/lib/storage/job-actions";
import type { JobMatch } from "@/types";

export default function SavedPage() {
  const router = useRouter();
  const [savedMatches, setSavedMatches] = useState<JobMatch[]>([]);

  useEffect(() => {
    const loadSavedJobs = async () => {
      const savedIds = await getSavedJobs();
      const matches = mockJobMatches.filter((m) => savedIds.includes(m.job.id));
      setSavedMatches(matches);
    };
    loadSavedJobs();
  }, []);

  const handleRemove = async (jobId: string) => {
    await unsaveJob(jobId);
    setSavedMatches(savedMatches.filter((m) => m.job.id !== jobId));
  };

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
