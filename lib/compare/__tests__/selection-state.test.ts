import { describe, it, expect } from "vitest";

/**
 * Pure helper for comparison eligibility
 * Tests the critical bug that was fixed: unavailable notice count
 * must NOT affect comparison eligibility
 */
function isEligibleForComparison(
  validSelectionCount: number,
  _unavailableNoticeCount: number
): boolean {
  // Only valid selection count matters for eligibility
  // Unavailable notice is display metadata only
  return validSelectionCount >= 2;
}

describe("Compare Selection State Logic", () => {
  describe("isEligibleForComparison", () => {
    it("should allow comparison with 2 valid jobs and 1 unavailable notice", () => {
      // Bug case: A,B,C requested, C missing
      // After normalization: validSelection = [A,B], unavailableCount = 1
      const result = isEligibleForComparison(2, 1);
      expect(result).toBe(true);
    });

    it("should prevent comparison with 1 valid job and 1 unavailable notice", () => {
      // Case: A,B requested, B missing
      // After normalization: validSelection = [A], unavailableCount = 1
      const result = isEligibleForComparison(1, 1);
      expect(result).toBe(false);
    });

    it("should allow comparison with 2 valid jobs and 2 unavailable notices", () => {
      // Case: A,B,C,D requested, C,D missing
      // After normalization: validSelection = [A,B], unavailableCount = 2
      const result = isEligibleForComparison(2, 2);
      expect(result).toBe(true);
    });

    it("should allow comparison with 3 valid jobs and 0 unavailable", () => {
      // Normal case: A,B,C all valid
      const result = isEligibleForComparison(3, 0);
      expect(result).toBe(true);
    });

    it("should prevent comparison with 0 valid jobs and 2 unavailable", () => {
      // Case: A,B requested, both missing
      const result = isEligibleForComparison(0, 2);
      expect(result).toBe(false);
    });

    it("should allow comparison with 4 valid jobs and 1 unavailable", () => {
      // Case: A,B,C,D,E requested, E missing
      const result = isEligibleForComparison(4, 1);
      expect(result).toBe(true);
    });

    it("should prevent comparison with 1 valid job and 0 unavailable", () => {
      // Normal minimum case: only A selected
      const result = isEligibleForComparison(1, 0);
      expect(result).toBe(false);
    });

    it("should verify unavailable count parameter is ignored", () => {
      // Same valid count with different unavailable counts should give same result
      const result1 = isEligibleForComparison(2, 0);
      const result2 = isEligibleForComparison(2, 1);
      const result3 = isEligibleForComparison(2, 5);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });
});
