"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getUserDealbreakers } from "@/lib/storage/dealbreakers";
import { evaluateDealbreakers } from "@/lib/dealbreakers/evaluate-dealbreakers";
import { adaptJobForDealbreakers } from "@/lib/dealbreakers/job-adapter";
import type { Job } from "@/types";
import type { DealbreakerPreferences, DealbreakerEvaluation } from "@/lib/dealbreakers/types";

/**
 * Hook to load user's dealbreaker preferences
 * Returns preferences and loading state
 */
export function useDealbreakerPreferences() {
  const [preferences, setPreferences] = useState<DealbreakerPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadPreferences() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const prefs = await getUserDealbreakers(user.id);
        setPreferences(prefs);
        setError(false);
      } catch (err) {
        console.error("Failed to load dealbreaker preferences:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, []);

  return { preferences, loading, error };
}

/**
 * Evaluate a single job against dealbreaker preferences
 * Returns null if no preferences are set
 */
export function evaluateJobDealbreakers(
  preferences: DealbreakerPreferences | null,
  job: Job
): DealbreakerEvaluation | null {
  if (!preferences) {
    return null;
  }

  const jobData = adaptJobForDealbreakers(job);
  return evaluateDealbreakers(preferences, jobData);
}

/**
 * Evaluate multiple jobs against dealbreaker preferences
 * Returns a Map of job ID to evaluation
 */
export function evaluateJobsDealbreakers(
  preferences: DealbreakerPreferences | null,
  jobs: Job[]
): Map<string, DealbreakerEvaluation> {
  const results = new Map<string, DealbreakerEvaluation>();

  if (!preferences) {
    return results;
  }

  for (const job of jobs) {
    const evaluation = evaluateJobDealbreakers(preferences, job);
    if (evaluation) {
      results.set(job.id, evaluation);
    }
  }

  return results;
}
