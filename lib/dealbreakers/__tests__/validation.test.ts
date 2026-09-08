import { describe, it, expect } from "vitest";
import { parseMinimumSalaryInput } from "../validation";

describe("parseMinimumSalaryInput", () => {
  describe("valid inputs", () => {
    it("should accept empty string as undefined", () => {
      const result = parseMinimumSalaryInput("");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeUndefined();
      }
    });

    it("should accept whitespace as undefined", () => {
      const result = parseMinimumSalaryInput("   ");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeUndefined();
      }
    });

    it("should accept zero", () => {
      const result = parseMinimumSalaryInput("0");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(0);
      }
    });

    it("should accept positive integer", () => {
      const result = parseMinimumSalaryInput("100000");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(100000);
      }
    });

    it("should accept PostgreSQL INTEGER max", () => {
      const result = parseMinimumSalaryInput("2147483647");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(2147483647);
      }
    });

    it("should trim whitespace and accept valid number", () => {
      const result = parseMinimumSalaryInput("  150000  ");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(150000);
      }
    });
  });

  describe("invalid inputs", () => {
    it("should reject negative number", () => {
      const result = parseMinimumSalaryInput("-1");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe("Minimum salary cannot be negative.");
      }
    });

    it("should accept decimal with trailing .0 (JavaScript treats as integer)", () => {
      const result = parseMinimumSalaryInput("100000.0");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(100000);
      }
    });

    it("should reject decimal with fraction", () => {
      const result = parseMinimumSalaryInput("100000.5");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("whole number");
      }
    });

    it("should reject decimal with large fraction", () => {
      const result = parseMinimumSalaryInput("100000.75");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("whole number");
      }
    });

    it("should reject non-numeric string", () => {
      const result = parseMinimumSalaryInput("100k");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe("Minimum salary must be a valid number.");
      }
    });

    it("should reject letters", () => {
      const result = parseMinimumSalaryInput("abc");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe("Minimum salary must be a valid number.");
      }
    });

    it("should reject Infinity", () => {
      const result = parseMinimumSalaryInput("Infinity");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe("Minimum salary must be a valid number.");
      }
    });

    it("should reject value above PostgreSQL INTEGER max", () => {
      const result = parseMinimumSalaryInput("2147483648");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("exceeds maximum allowed value");
        expect(result.error).toContain("2,147,483,647");
      }
    });

    it("should reject very large value", () => {
      const result = parseMinimumSalaryInput("99999999999");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("exceeds maximum allowed value");
      }
    });
  });

  describe("edge cases", () => {
    it("should reject NaN", () => {
      const result = parseMinimumSalaryInput("NaN");
      expect(result.ok).toBe(false);
    });

    it("should accept negative zero string (JavaScript -0)", () => {
      const result = parseMinimumSalaryInput("-0");
      expect(result.ok).toBe(true);
      if (result.ok) {
        // JavaScript preserves -0 as distinct from +0
        expect(result.value).toBe(-0);
        expect(Object.is(result.value, -0)).toBe(true);
      }
    });

    it("should handle scientific notation as integer if valid", () => {
      const result = parseMinimumSalaryInput("1e5");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(100000);
      }
    });

    it("should accept scientific notation that produces integer", () => {
      const result = parseMinimumSalaryInput("1.5e5");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(150000);
      }
    });
  });
});
