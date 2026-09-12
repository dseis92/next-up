/**
 * E4 Opportunity Radar — Salary Formatting
 *
 * Radar-specific salary presentation that distinguishes:
 * - Disclosed salaries
 * - Estimated salaries (visibly labeled)
 * - Missing salaries
 */

import type { Job } from "@/types";

/**
 * Format salary for Radar card display
 *
 * Handles disclosed vs estimated distinction without changing
 * High Compensation eligibility logic.
 *
 * @param job - Job with salary fields
 * @returns Formatted salary string or "Salary not disclosed"
 */
export function formatRadarSalary(job: Job): string {
  const { salary_min, salary_max, salary_period, salary_is_estimated } = job;

  // No salary data
  if (!salary_min) {
    return "Salary not disclosed";
  }

  const isEstimated = salary_is_estimated === true;
  const period = salary_period || "yearly";

  // Format amount
  const formatAmount = (amount: number): string => {
    if (period === "hourly") {
      return `$${amount}/hr`;
    }
    // Yearly amounts
    if (amount >= 1000) {
      return `$${Math.round(amount / 1000)}K`;
    }
    return `$${amount}`;
  };

  // Build salary string
  let salaryStr: string;
  if (salary_max && salary_max !== salary_min) {
    // Range
    salaryStr = `${formatAmount(salary_min)}–${formatAmount(salary_max)}${period === "yearly" ? "/year" : ""}`;
  } else {
    // Minimum only
    salaryStr = `${formatAmount(salary_min)}+${period === "yearly" ? "/year" : ""}`;
  }

  // Add estimated label if needed
  if (isEstimated) {
    return `~${salaryStr} (Estimated)`;
  }

  return salaryStr;
}
