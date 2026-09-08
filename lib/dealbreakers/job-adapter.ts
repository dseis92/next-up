/**
 * NextUp Dealbreaker Engine - Job Adapter
 *
 * Adapts full Job objects to the minimal DealbreakerJobData
 * needed for dealbreaker evaluation.
 */

import type { Job } from "@/types";
import type { DealbreakerJobData } from "./types";

/**
 * Adapt a full Job to DealbreakerJobData
 *
 * Extracts only the fields needed for dealbreaker evaluation.
 */
export function adaptJobForDealbreakers(job: Job): DealbreakerJobData {
  return {
    id: job.id,
    title: job.title,
    workArrangement: job.work_arrangement,
    employmentType: job.employment_type,
    salaryMin: job.salary_min,
    salaryMax: job.salary_max,
    salaryPeriod: job.salary_period,
  };
}

/**
 * Adapt multiple jobs for dealbreaker evaluation
 */
export function adaptJobsForDealbreakers(jobs: Job[]): DealbreakerJobData[] {
  return jobs.map(adaptJobForDealbreakers);
}
