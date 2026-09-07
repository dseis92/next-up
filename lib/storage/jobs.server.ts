/**
 * Server-side job data loader
 * Uses server Supabase client (NO browser client dependency)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Job } from "@/types";

/**
 * Load a single job by ID using server Supabase client
 *
 * @param supabase - Server Supabase client (from createClient in app/api)
 * @param jobId - Job ID to load
 * @throws Error if the database query fails
 * @returns Job if found, null if job doesn't exist
 */
export async function getJobServer(
  supabase: SupabaseClient,
  jobId: string
): Promise<Job | null> {
  const { data: job, error } = await supabase
    .from("jobs")
    .select(`
      *,
      company:companies(*)
    `)
    .eq("id", jobId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load job:", error);
    throw new Error("Unable to load job details. Please try again.");
  }

  return job as Job | null;
}
