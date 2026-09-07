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
/**
 * Get all saved job IDs for the current user
 *
 * @throws Error if the database query fails
 * @returns Array of saved job IDs (may be empty if no saved jobs)
 */
export async function getSavedJobs(): Promise<string[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("saved_jobs")
    .select("job_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load saved jobs:", error);
    throw new Error("Unable to load saved jobs. Please try again.");
  }

  return data?.map((row) => row.job_id) || [];
}

export async function saveJob(jobId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to save jobs");
  }

  const { error } = await supabase.from("saved_jobs").upsert(
    {
      user_id: user.id,
      job_id: jobId,
    },
    {
      onConflict: "user_id,job_id",
    }
  );

  if (error) {
    console.error("Failed to save job:", { jobId, error: error.message });
    throw new Error("Failed to save job");
  }
}

export async function unsaveJob(jobId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to unsave jobs");
  }

  const { error } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("user_id", user.id)
    .eq("job_id", jobId);

  if (error) {
    console.error("Failed to unsave job:", { jobId, error: error.message });
    throw new Error("Failed to unsave job");
  }
}

/**
 * Check if a job is saved
 *
 * @throws Error if the database query fails
 * @returns true if job is saved, false if not saved
 */
export async function isJobSaved(jobId: string): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("saved_jobs")
    .select("id")
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .maybeSingle();

  if (error) {
    console.error("Failed to check if job is saved:", error);
    throw new Error("Unable to check save status. Please try again.");
  }

  return !!data;
}

// Passed Jobs
/**
 * Get all passed jobs for the current user
 *
 * @throws Error if the database query fails
 * @returns Array of passed jobs (may be empty if no passed jobs)
 */
export async function getPassedJobs(): Promise<PassedJob[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("passed_jobs")
    .select("job_id, reason, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load passed jobs:", error);
    throw new Error("Unable to load passed jobs. Please try again.");
  }

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

  if (!user) {
    throw new Error("User must be authenticated to pass jobs");
  }

  const { error } = await supabase.from("passed_jobs").upsert(
    {
      user_id: user.id,
      job_id: jobId,
      reason,
    },
    {
      onConflict: "user_id,job_id",
    }
  );

  if (error) {
    console.error("Failed to pass job:", { jobId, error: error.message });
    throw new Error("Failed to pass job");
  }
}

export async function undoPass(jobId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to undo pass");
  }

  const { error } = await supabase
    .from("passed_jobs")
    .delete()
    .eq("user_id", user.id)
    .eq("job_id", jobId);

  if (error) {
    console.error("Failed to undo pass:", { jobId, error: error.message });
    throw new Error("Failed to undo pass");
  }
}

/**
 * Check if a job is passed
 *
 * @throws Error if the database query fails
 * @returns true if job is passed, false if not passed
 */
export async function isJobPassed(jobId: string): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("passed_jobs")
    .select("id")
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .maybeSingle();

  if (error) {
    console.error("Failed to check if job is passed:", error);
    throw new Error("Unable to check pass status. Please try again.");
  }

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
