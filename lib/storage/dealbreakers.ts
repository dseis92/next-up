/**
 * Dealbreaker preferences storage
 * Loads and saves user-defined non-negotiable preferences
 */

import { createClient } from "@/lib/supabase/client";
import type { DealbreakerPreferences } from "@/lib/dealbreakers/types";

/**
 * Raw dealbreaker row from Supabase
 */
interface UserDealbreakerRow {
  user_id: string;
  minimum_salary: number | null;
  require_salary_disclosure: boolean;
  allowed_work_arrangements: string[];
  allowed_employment_types: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Get user's dealbreaker preferences
 *
 * @throws Error if the database query fails
 * @returns DealbreakerPreferences if saved, null if user has no saved preferences
 */
export async function getUserDealbreakers(
  userId: string
): Promise<DealbreakerPreferences | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_dealbreakers")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load dealbreaker preferences:", error);
    throw new Error("Unable to load dealbreaker preferences. Please try again.");
  }

  // No saved preferences
  if (!data) {
    return null;
  }

  // Adapt to application type
  return adaptDealbreakerRow(data as UserDealbreakerRow);
}

/**
 * Save or update user's dealbreaker preferences
 *
 * @throws Error if the database operation fails
 */
export async function saveUserDealbreakers(
  preferences: Omit<DealbreakerPreferences, "createdAt" | "updatedAt">
): Promise<void> {
  const supabase = createClient();

  const row = {
    user_id: preferences.userId,
    minimum_salary: preferences.minimumSalary ?? null,
    require_salary_disclosure: preferences.requireSalaryDisclosure,
    allowed_work_arrangements: preferences.allowedWorkArrangements,
    allowed_employment_types: preferences.allowedEmploymentTypes,
  };

  const { error } = await supabase.from("user_dealbreakers").upsert(row, {
    onConflict: "user_id",
  });

  if (error) {
    console.error("Failed to save dealbreaker preferences:", error);
    throw new Error("Unable to save dealbreaker preferences. Please try again.");
  }
}

/**
 * Clear/delete user's dealbreaker preferences
 *
 * @throws Error if the database operation fails
 */
export async function clearUserDealbreakers(userId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("user_dealbreakers")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to clear dealbreaker preferences:", error);
    throw new Error("Unable to clear dealbreaker preferences. Please try again.");
  }
}

/**
 * Adapt raw database row to application type
 */
function adaptDealbreakerRow(row: UserDealbreakerRow): DealbreakerPreferences {
  return {
    userId: row.user_id,
    minimumSalary: row.minimum_salary ?? undefined,
    requireSalaryDisclosure: row.require_salary_disclosure,
    allowedWorkArrangements: row.allowed_work_arrangements as (
      | "remote"
      | "hybrid"
      | "onsite"
    )[],
    allowedEmploymentTypes: row.allowed_employment_types as (
      | "full_time"
      | "part_time"
      | "contract"
      | "temporary"
    )[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
