import { describe, it, expect } from "vitest";
import { parseCompareJobIds, buildCompareUrl } from "../query";

describe("Compare URL Query Parsing", () => {
  describe("parseCompareJobIds", () => {
    it("should parse 2 IDs", () => {
      const result = parseCompareJobIds("id1,id2");
      expect(result).toEqual(["id1", "id2"]);
    });

    it("should parse 4 IDs", () => {
      const result = parseCompareJobIds("id1,id2,id3,id4");
      expect(result).toEqual(["id1", "id2", "id3", "id4"]);
    });

    it("should deduplicate IDs", () => {
      const result = parseCompareJobIds("id1,id2,id1,id3");
      expect(result).toEqual(["id1", "id2", "id3"]);
    });

    it("should handle >4 IDs and take first 4", () => {
      const result = parseCompareJobIds("id1,id2,id3,id4,id5,id6");
      expect(result).toEqual(["id1", "id2", "id3", "id4"]);
      expect(result.length).toBe(4);
    });

    it("should handle zero IDs", () => {
      const result = parseCompareJobIds("");
      expect(result).toEqual([]);
    });

    it("should handle one ID", () => {
      const result = parseCompareJobIds("id1");
      expect(result).toEqual(["id1"]);
    });

    it("should handle null input", () => {
      const result = parseCompareJobIds(null);
      expect(result).toEqual([]);
    });

    it("should handle undefined input", () => {
      const result = parseCompareJobIds(undefined);
      expect(result).toEqual([]);
    });

    it("should trim whitespace", () => {
      const result = parseCompareJobIds(" id1 , id2 , id3 ");
      expect(result).toEqual(["id1", "id2", "id3"]);
    });

    it("should filter empty strings", () => {
      const result = parseCompareJobIds("id1,,id2,,,id3");
      expect(result).toEqual(["id1", "id2", "id3"]);
    });

    it("should preserve order", () => {
      const result = parseCompareJobIds("id3,id1,id4,id2");
      expect(result).toEqual(["id3", "id1", "id4", "id2"]);
    });
  });

  describe("buildCompareUrl", () => {
    it("should build URL with IDs", () => {
      const result = buildCompareUrl(["id1", "id2", "id3"]);
      expect(result).toBe("/compare?jobs=id1,id2,id3");
    });

    it("should handle empty array", () => {
      const result = buildCompareUrl([]);
      expect(result).toBe("/compare");
    });

    it("should deduplicate IDs", () => {
      const result = buildCompareUrl(["id1", "id2", "id1", "id3"]);
      expect(result).toBe("/compare?jobs=id1,id2,id3");
    });

    it("should limit to max 4 IDs", () => {
      const result = buildCompareUrl(["id1", "id2", "id3", "id4", "id5"]);
      expect(result).toBe("/compare?jobs=id1,id2,id3,id4");
    });

    it("should preserve order", () => {
      const result = buildCompareUrl(["id3", "id1", "id2"]);
      expect(result).toBe("/compare?jobs=id3,id1,id2");
    });
  });
});
