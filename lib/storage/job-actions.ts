/**
 * Job actions storage
 * Uses Supabase for persistence
 */

import { createClient } from "@/lib/supabase/client";

export interface PassedJob {
  jobId: string;
  passedAt: string;
  reason?: string;
}

// Saved Jobs
export async function getSavedJobs(): Promise<string[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("saved_jobs")
    .select("job_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data?.map((row) => row.job_id) || [];
}

export async function saveJob(jobId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("saved_jobs").upsert({
    user_id: user.id,
    job_id: jobId,
  });
}

export async function unsaveJob(jobId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("saved_jobs")
    .delete()
    .eq("user_id", user.id)
    .eq("job_id", jobId);
}

export async function isJobSaved(jobId: string): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("saved_jobs")
    .select("id")
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .single();

  return !!data;
}

// Passed Jobs
export async function getPassedJobs(): Promise<PassedJob[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("passed_jobs")
    .select("job_id, reason, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    data?.map((row) => ({
      jobId: row.job_id,
      passedAt: row.created_at,
      reason: row.reason,
    })) || []
  );
}

export async function passJob(jobId: string, reason?: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("passed_jobs").upsert({
    user_id: user.id,
    job_id: jobId,
    reason,
  });
}

export async function undoPass(jobId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("passed_jobs")
    .delete()
    .eq("user_id", user.id)
    .eq("job_id", jobId);
}

export async function isJobPassed(jobId: string): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("passed_jobs")
    .select("id")
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .single();

  return !!data;
}

export async function getPassedJobIds(): Promise<string[]> {
  const passedJobs = await getPassedJobs();
  return passedJobs.map((p) => p.jobId);
}

// Daily Progress
export interface DailyProgressData {
  date: string;
  reviewed: number;
}

// Note: Daily progress tracking will be implemented with analytics in a future phase
// For now, we'll use client-side state only (not persisted)
export function getDailyProgress(): DailyProgressData {
  if (typeof window === "undefined") {
    return { date: new Date().toDateString(), reviewed: 0 };
  }

  const today = new Date().toDateString();
  const stored = sessionStorage.getItem("dailyProgress");

  if (stored) {
    const data = JSON.parse(stored);
    if (data.date === today) {
      return data;
    }
  }

  // Reset for new day
  return { date: today, reviewed: 0 };
}

export function incrementDailyProgress(): void {
  const progress = getDailyProgress();
  const newProgress = {
    date: progress.date,
    reviewed: progress.reviewed + 1,
  };
  sessionStorage.setItem("dailyProgress", JSON.stringify(newProgress));
}
