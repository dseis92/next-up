/**
 * Job data storage
 * Loads jobs from Supabase with company details
 */

import { createClient } from "@/lib/supabase/client";
import type { Job } from "@/types";

/**
 * Load all jobs with company details
 * Jobs are publicly readable, no user filter needed
 */
export async function getJobs(): Promise<Job[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      *,
      company:companies(*)
    `
    )
    .order("posted_date", { ascending: false });

  if (error) {
    console.error("Failed to load jobs:", error);
    return [];
  }

  return (data as Job[]) || [];
}

/**
 * Load a single job by ID with company details
 */
export async function getJob(jobId: string): Promise<Job | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      *,
      company:companies(*)
    `
    )
    .eq("id", jobId)
    .single();

  if (error) {
    console.error("Failed to load job:", error);
    return null;
  }

  return data as Job;
}
