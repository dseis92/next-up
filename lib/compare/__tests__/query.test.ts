import { describe, it, expect } from "vitest";
import { parseCompareJobIds, buildCompareUrl } from "../query";

describe("Compare URL Query Parsing", () => {
  describe("parseCompareJobIds", () => {
    // Valid UUID examples
    const validUUID1 = "550e8400-e29b-41d4-a716-446655440000";
    const validUUID2 = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    const validUUID3 = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
    const validUUID4 = "8f3c2f1e-4c5a-4b9e-8a3d-9e1c4f5a6b7c";

    it("should parse 2 valid UUIDs", () => {
      const result = parseCompareJobIds(`${validUUID1},${validUUID2}`);
      expect(result).toEqual([validUUID1, validUUID2]);
    });

    it("should parse 4 valid UUIDs", () => {
      const result = parseCompareJobIds(`${validUUID1},${validUUID2},${validUUID3},${validUUID4}`);
      expect(result).toEqual([validUUID1, validUUID2, validUUID3, validUUID4]);
    });

    it("should deduplicate valid UUIDs", () => {
      const result = parseCompareJobIds(`${validUUID1},${validUUID2},${validUUID1},${validUUID3}`);
      expect(result).toEqual([validUUID1, validUUID2, validUUID3]);
    });

    it("should reject malformed UUIDs", () => {
      const result = parseCompareJobIds("id1,id2,malformed,invalid-uuid");
      expect(result).toEqual([]);
    });

    it("should filter malformed UUIDs and keep valid ones", () => {
      const result = parseCompareJobIds(`${validUUID1},bad-id,${validUUID2},malformed`);
      expect(result).toEqual([validUUID1, validUUID2]);
    });

    it("should handle >4 valid UUIDs and take first 4", () => {
      const uuid5 = "1234567-89ab-cdef-0123-456789abcdef";
      const uuid6 = "fedcba98-7654-3210-fedc-ba9876543210";
      const result = parseCompareJobIds(
        `${validUUID1},${validUUID2},${validUUID3},${validUUID4},${uuid5},${uuid6}`
      );
      expect(result).toEqual([validUUID1, validUUID2, validUUID3, validUUID4]);
      expect(result.length).toBe(4);
    });

    it("should handle zero IDs", () => {
      const result = parseCompareJobIds("");
      expect(result).toEqual([]);
    });

    it("should handle one valid UUID", () => {
      const result = parseCompareJobIds(validUUID1);
      expect(result).toEqual([validUUID1]);
    });

    it("should handle null input", () => {
      const result = parseCompareJobIds(null);
      expect(result).toEqual([]);
    });

    it("should handle undefined input", () => {
      const result = parseCompareJobIds(undefined);
      expect(result).toEqual([]);
    });

    it("should trim whitespace from valid UUIDs", () => {
      const result = parseCompareJobIds(` ${validUUID1} , ${validUUID2} , ${validUUID3} `);
      expect(result).toEqual([validUUID1, validUUID2, validUUID3]);
    });

    it("should filter empty strings", () => {
      const result = parseCompareJobIds(`${validUUID1},,${validUUID2},,,${validUUID3}`);
      expect(result).toEqual([validUUID1, validUUID2, validUUID3]);
    });

    it("should preserve order of valid UUIDs", () => {
      const result = parseCompareJobIds(`${validUUID3},${validUUID1},${validUUID4},${validUUID2}`);
      expect(result).toEqual([validUUID3, validUUID1, validUUID4, validUUID2]);
    });

    it("should reject non-UUID strings safely", () => {
      const result = parseCompareJobIds("not-a-uuid,also-invalid,123");
      expect(result).toEqual([]);
    });

    it("should reject partial UUIDs", () => {
      const result = parseCompareJobIds("550e8400-e29b-41d4,short-uuid");
      expect(result).toEqual([]);
    });
  });

  describe("buildCompareUrl", () => {
    const validUUID1 = "550e8400-e29b-41d4-a716-446655440000";
    const validUUID2 = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    const validUUID3 = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
    const validUUID4 = "8f3c2f1e-4c5a-4b9e-8a3d-9e1c4f5a6b7c";
    const validUUID5 = "1234567-89ab-cdef-0123-456789abcdef";

    it("should build URL with UUIDs", () => {
      const result = buildCompareUrl([validUUID1, validUUID2, validUUID3]);
      expect(result).toBe(`/compare?jobs=${validUUID1},${validUUID2},${validUUID3}`);
    });

    it("should handle empty array", () => {
      const result = buildCompareUrl([]);
      expect(result).toBe("/compare");
    });

    it("should deduplicate UUIDs", () => {
      const result = buildCompareUrl([validUUID1, validUUID2, validUUID1, validUUID3]);
      expect(result).toBe(`/compare?jobs=${validUUID1},${validUUID2},${validUUID3}`);
    });

    it("should limit to max 4 UUIDs", () => {
      const result = buildCompareUrl([validUUID1, validUUID2, validUUID3, validUUID4, validUUID5]);
      expect(result).toBe(`/compare?jobs=${validUUID1},${validUUID2},${validUUID3},${validUUID4}`);
    });

    it("should preserve order", () => {
      const result = buildCompareUrl([validUUID3, validUUID1, validUUID2]);
      expect(result).toBe(`/compare?jobs=${validUUID3},${validUUID1},${validUUID2}`);
    });
  });
});
