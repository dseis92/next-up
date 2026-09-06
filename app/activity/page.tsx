"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getDailyProgress, getSavedJobs } from "@/lib/storage/job-actions";
import { Flame, CheckCircle2, Circle, TrendingUp, Target } from "lucide-react";

interface Mission {
  id: string;
  label: string;
  completed: number;
  target: number;
}

export default function ActivityPage() {
  const [streak] = useState(6);
  const [dailyMissions, setDailyMissions] = useState<Mission[]>([
    {
      id: "review",
      label: "Review 5 opportunities",
      completed: 0,
      target: 5,
    },
    {
      id: "save",
      label: "Save 2 promising roles",
      completed: 0,
      target: 2,
    },
    { id: "apply", label: "Submit 1 application", completed: 0, target: 1 },
    {
      id: "activity",
      label: "Complete 1 career activity",
      completed: 0,
      target: 1,
    },
  ]);

  // Load progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      const progress = getDailyProgress();
      const savedIds = await getSavedJobs();

      setDailyMissions([
        {
          id: "review",
          label: "Review 5 opportunities",
          completed: Math.min(progress.reviewed || 0, 5),
          target: 5,
        },
        {
          id: "save",
          label: "Save 2 promising roles",
          completed: Math.min(savedIds.length, 2),
          target: 2,
        },
        { id: "apply", label: "Submit 1 application", completed: 0, target: 1 },
        {
          id: "activity",
          label: "Complete 1 career activity",
          completed: 0,
          target: 1,
        },
      ]);
    };

    loadProgress();
  }, []);

  const totalCompleted = dailyMissions.filter(
    (m) => m.completed >= m.target
  ).length;
  const totalMissions = dailyMissions.length;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-heading-lg mb-2">Your activity</h1>
          <p className="text-foreground-secondary">
            Track your progress and build momentum
          </p>
        </div>

        {/* Streak Card */}
        <Card variant="elevated" className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-br from-brand/10 to-accent/5 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground">
                <Flame className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-display mb-1 text-brand">{streak} days</h2>
                <p className="text-sm text-foreground-secondary">
                  Current momentum streak
                </p>
                <p className="mt-1 text-xs text-foreground-muted">
                  Keep it going! Active {streak} days in a row.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Daily Missions */}
        <Card className="mb-6 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-brand" />
              <h2 className="text-heading">Today&apos;s missions</h2>
            </div>
            <Badge variant="brand" size="sm">
              {totalCompleted}/{totalMissions}
            </Badge>
          </div>

          <div className="mb-4">
            <Progress
              value={totalCompleted}
              max={totalMissions}
              size="md"
              barClassName="bg-brand"
            />
          </div>

          <div className="space-y-3">
            {dailyMissions.map((mission) => {
              const isComplete = mission.completed >= mission.target;
              const progress = (mission.completed / mission.target) * 100;

              return (
                <div key={mission.id} className="flex items-center gap-3">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      isComplete
                        ? "bg-brand text-brand-foreground"
                        : "bg-surface-muted text-foreground-muted"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <p
                        className={`text-sm font-medium ${
                          isComplete
                            ? "text-foreground line-through"
                            : "text-foreground"
                        }`}
                      >
                        {mission.label}
                      </p>
                      <span className="text-xs text-foreground-muted">
                        {mission.completed}/{mission.target}
                      </span>
                    </div>
                    {!isComplete && (
                      <Progress value={progress} max={100} size="sm" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* This Week */}
        <Card className="mb-6 p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand" />
            <h2 className="text-heading">This week</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-surface-muted p-4">
              <p className="mb-1 text-2xl font-bold text-foreground">12</p>
              <p className="text-sm text-foreground-muted">Jobs reviewed</p>
            </div>
            <div className="rounded-lg bg-surface-muted p-4">
              <p className="mb-1 text-2xl font-bold text-foreground">3</p>
              <p className="text-sm text-foreground-muted">Jobs saved</p>
            </div>
            <div className="rounded-lg bg-surface-muted p-4">
              <p className="mb-1 text-2xl font-bold text-foreground">1</p>
              <p className="text-sm text-foreground-muted">Applications</p>
            </div>
          </div>
        </Card>

        {/* Insights */}
        <Card className="p-6">
          <h2 className="text-heading mb-4">Insights</h2>
          <div className="space-y-3">
            <div className="rounded-lg bg-brand/5 p-3">
              <p className="text-sm text-foreground-secondary">
                You applied to 4 highly matched roles this week. Keep up the
                momentum!
              </p>
            </div>
            <div className="rounded-lg bg-surface-muted p-3">
              <p className="text-sm text-foreground-secondary">
                Your average match score is 89% — you&apos;re targeting roles that
                fit your profile well.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
