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
 * @returns Job or null if not found
 */
export async function getJobServer(
  supabase: SupabaseClient,
  jobId: string
): Promise<Job | null> {
  try {
    const { data: job, error } = await supabase
      .from("jobs")
      .select(`
        *,
        company:companies(*)
      `)
      .eq("id", jobId)
      .single();

    if (error) {
      console.error("Failed to load job:", error);
      return null;
    }

    return job as Job;
  } catch (error) {
    console.error("Unexpected error loading job:", error);
    return null;
  }
}
