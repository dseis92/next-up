"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { getApplications } from "@/lib/storage/applications";
import { formatSalary, formatRelativeDate } from "@/lib/utils";
import { Briefcase, MapPin, ArrowRight } from "lucide-react";
import type { Application, ApplicationStage } from "@/types";

// Simplified stage groups for mobile
const STAGE_GROUPS = {
  preparing: { label: "Preparing", stages: ["saved", "preparing"] },
  applied: { label: "Applied", stages: ["applied"] },
  interviewing: {
    label: "Interviewing",
    stages: ["recruiter_screen", "interview", "final_interview"],
  },
  offer: { label: "Offer", stages: ["offer", "accepted"] },
  closed: { label: "Closed", stages: ["rejected", "withdrawn"] },
} as const;

type StageGroup = keyof typeof STAGE_GROUPS;

function getStageGroup(stage: ApplicationStage): StageGroup {
  for (const [group, config] of Object.entries(STAGE_GROUPS)) {
    if ((config.stages as readonly ApplicationStage[]).includes(stage)) {
      return group as StageGroup;
    }
  }
  return "applied";
}

function getStageLabel(stage: ApplicationStage): string {
  const labels: Record<ApplicationStage, string> = {
    saved: "Saved",
    preparing: "Preparing",
    applied: "Applied",
    recruiter_screen: "Recruiter screen",
    interview: "Interview",
    final_interview: "Final interview",
    offer: "Offer",
    accepted: "Accepted",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
  };
  return labels[stage];
}

function getNextAction(app: Application): string {
  if (app.next_action) return app.next_action;

  const defaults: Record<ApplicationStage, string> = {
    saved: "Review job details",
    preparing: "Submit application",
    applied: "Wait for response",
    recruiter_screen: "Prepare for recruiter call",
    interview: "Prepare for interview",
    final_interview: "Prepare for final interview",
    offer: "Review offer details",
    accepted: "Prepare for start date",
    rejected: "Keep searching",
    withdrawn: "Keep searching",
  };

  return defaults[app.stage] || "Review application";
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [grouped, setGrouped] = useState<Record<StageGroup, Application[]>>({
    preparing: [],
    applied: [],
    interviewing: [],
    offer: [],
    closed: [],
  });

  useEffect(() => {
    const loadApplications = async () => {
      const apps = await getApplications();
      setApplications(apps);

      // Group by stage
      const groups: Record<StageGroup, Application[]> = {
        preparing: [],
        applied: [],
        interviewing: [],
        offer: [],
        closed: [],
      };

      apps.forEach((app) => {
        const group = getStageGroup(app.stage);
        groups[group].push(app);
      });

      setGrouped(groups);
    };

    loadApplications();
  }, []);

  if (applications.length === 0) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center">
          <EmptyState
            icon={<Briefcase className="h-6 w-6" />}
            title="No applications yet"
            description="When you apply to a role, we'll help you keep track of what happens next."
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
          <h1 className="text-heading-lg mb-2">Applications</h1>
          <p className="text-foreground-secondary">
            {applications.length}{" "}
            {applications.length === 1 ? "application" : "applications"}
          </p>
        </div>

        <div className="space-y-8">
          {Object.entries(STAGE_GROUPS).map(([groupKey, config]) => {
            const group = groupKey as StageGroup;
            const apps = grouped[group];

            if (apps.length === 0) return null;

            return (
              <div key={group}>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-heading text-foreground">{config.label}</h2>
                  <Badge variant="muted" size="sm">
                    {apps.length}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {apps.map((app) => (
                    <Card
                      key={app.id}
                      variant="elevated"
                      className="cursor-pointer p-4 transition-all hover:shadow-lg"
                      onClick={() => router.push(`/applications/${app.id}`)}
                    >
                      <div className="flex gap-3">
                        <Avatar
                          name={app.job.company.name}
                          size="lg"
                          className="shrink-0 bg-gradient-to-br from-blue-500 to-blue-600"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-start justify-between gap-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {app.job.title}
                            </h3>
                            <ArrowRight className="h-5 w-5 shrink-0 text-foreground-muted" />
                          </div>
                          <p className="mb-2 text-sm text-foreground-secondary">
                            {app.job.company.name}
                          </p>

                          <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-foreground-muted">
                            <Badge
                              variant={
                                group === "offer"
                                  ? "success"
                                  : group === "closed"
                                    ? "muted"
                                    : "brand"
                              }
                              size="sm"
                            >
                              {getStageLabel(app.stage)}
                            </Badge>
                            <span>•</span>
                            <span>
                              Applied {formatRelativeDate(new Date(app.applied_date || app.created_at))}
                            </span>
                          </div>

                          {app.job.salary_min && (
                            <p className="mb-2 text-base font-bold text-foreground">
                              {formatSalary(
                                app.job.salary_min,
                                app.job.salary_max,
                                app.job.salary_period
                              )}
                            </p>
                          )}

                          <p className="text-xs text-foreground-muted">
                            Next: {getNextAction(app)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
