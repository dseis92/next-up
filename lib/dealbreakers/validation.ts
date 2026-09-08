/**
 * Dealbreaker salary input validation
 *
 * Validates minimum salary input from user, rejecting decimals and
 * enforcing PostgreSQL INTEGER constraints.
 */

/**
 * PostgreSQL signed INTEGER maximum
 */
const POSTGRES_INT_MAX = 2_147_483_647;

/**
 * Validation result types
 */
export type ValidationSuccess = {
  ok: true;
  value: number | undefined;
};

export type ValidationFailure = {
  ok: false;
  error: string;
};

export type ValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Parse and validate minimum salary input
 *
 * Rules:
 * - Empty/whitespace → undefined (valid)
 * - Must be finite integer
 * - Must be >= 0
 * - Must be <= 2,147,483,647 (PostgreSQL INTEGER max)
 * - Decimals are rejected (no silent truncation)
 *
 * @param value - Raw string input from user
 * @returns Validation result with parsed value or error message
 */
export function parseMinimumSalaryInput(value: string): ValidationResult {
  const trimmed = value.trim();

  // Empty is valid undefined
  if (trimmed === "") {
    return { ok: true, value: undefined };
  }

  // Parse as number
  const parsed = Number(trimmed);

  // Must be finite
  if (!Number.isFinite(parsed)) {
    return { ok: false, error: "Minimum salary must be a valid number." };
  }

  // Must be integer (no decimals)
  if (!Number.isInteger(parsed)) {
    return { ok: false, error: "Minimum salary must be a whole number (no decimals)." };
  }

  // Must be non-negative
  if (parsed < 0) {
    return { ok: false, error: "Minimum salary cannot be negative." };
  }

  // Must not exceed PostgreSQL INTEGER max
  if (parsed > POSTGRES_INT_MAX) {
    return {
      ok: false,
      error: `Minimum salary exceeds maximum allowed value (${POSTGRES_INT_MAX.toLocaleString()}).`,
    };
  }

  return { ok: true, value: parsed };
}
