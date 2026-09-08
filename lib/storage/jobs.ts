/**
 * Job data storage
 * Loads jobs from Supabase with company details
 */

import { createClient } from "@/lib/supabase/client";
import type { Job } from "@/types";

/**
 * Load all jobs with company details
 * Jobs are publicly readable, no user filter needed
 *
 * @throws Error if the database query fails
 * @returns Array of jobs (may be empty if no jobs exist)
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
    throw new Error("Unable to load jobs. Please try again.");
  }

  return (data as Job[]) || [];
}

/**
 * Load a single job by ID with company details
 *
 * @throws Error if the database query fails
 * @returns Job if found, null if job doesn't exist
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
    .maybeSingle();

  if (error) {
    console.error("Failed to load job:", error);
    throw new Error("Unable to load job details. Please try again.");
  }

  return data as Job | null;
}

/**
 * Load multiple jobs by IDs with company details (batch query)
 * Preserves the requested order of job IDs
 *
 * @throws Error if the database query fails
 * @returns Object with jobs array (preserving order) and missingIds array
 */
export async function getJobsByIds(jobIds: string[]): Promise<{
  jobs: Job[];
  missingIds: string[];
}> {
  if (jobIds.length === 0) {
    return { jobs: [], missingIds: [] };
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      *,
      company:companies(*)
    `
    )
    .in("id", jobIds);

  if (error) {
    console.error("Failed to load jobs:", error);
    throw new Error("Unable to load selected jobs. Please try again.");
  }

  const loadedJobs = (data as Job[]) || [];

  // Preserve requested order and identify missing jobs
  const jobsMap = new Map(loadedJobs.map((job) => [job.id, job]));
  const orderedJobs: Job[] = [];
  const missingIds: string[] = [];

  for (const jobId of jobIds) {
    const job = jobsMap.get(jobId);
    if (job) {
      orderedJobs.push(job);
    } else {
      missingIds.push(jobId);
    }
  }

  return { jobs: orderedJobs, missingIds };
}
