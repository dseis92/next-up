import { describe, it, expect } from "vitest";
import {
  addCompareJob,
  removeCompareJob,
  clearCompareJobs,
  isCompareSelected,
  canAddCompareJob,
  normalizeCompareSelection,
} from "../compare-store";

describe("Compare Selection Store Helpers", () => {
  describe("addCompareJob", () => {
    it("should add first job", () => {
      const result = addCompareJob([], "job-1");
      expect(result).toEqual(["job-1"]);
    });

    it("should add second job", () => {
      const result = addCompareJob(["job-1"], "job-2");
      expect(result).toEqual(["job-1", "job-2"]);
    });

    it("should add up to 4 jobs", () => {
      let ids: string[] = [];
      ids = addCompareJob(ids, "job-1");
      ids = addCompareJob(ids, "job-2");
      ids = addCompareJob(ids, "job-3");
      ids = addCompareJob(ids, "job-4");
      expect(ids).toEqual(["job-1", "job-2", "job-3", "job-4"]);
    });

    it("should reject fifth job", () => {
      const full = ["job-1", "job-2", "job-3", "job-4"];
      const result = addCompareJob(full, "job-5");
      expect(result).toEqual(full);
      expect(result.length).toBe(4);
    });

    it("should prevent duplicate IDs", () => {
      const result = addCompareJob(["job-1", "job-2"], "job-1");
      expect(result).toEqual(["job-1", "job-2"]);
    });

    it("should preserve insertion order", () => {
      let ids: string[] = [];
      ids = addCompareJob(ids, "job-3");
      ids = addCompareJob(ids, "job-1");
      ids = addCompareJob(ids, "job-2");
      expect(ids).toEqual(["job-3", "job-1", "job-2"]);
    });
  });

  describe("removeCompareJob", () => {
    it("should remove selected job", () => {
      const result = removeCompareJob(["job-1", "job-2", "job-3"], "job-2");
      expect(result).toEqual(["job-1", "job-3"]);
    });

    it("should handle removing non-existent job", () => {
      const result = removeCompareJob(["job-1", "job-2"], "job-3");
      expect(result).toEqual(["job-1", "job-2"]);
    });

    it("should handle empty selection", () => {
      const result = removeCompareJob([], "job-1");
      expect(result).toEqual([]);
    });
  });

  describe("clearCompareJobs", () => {
    it("should clear all selections", () => {
      const result = clearCompareJobs();
      expect(result).toEqual([]);
    });
  });

  describe("isCompareSelected", () => {
    it("should return true for selected job", () => {
      expect(isCompareSelected(["job-1", "job-2"], "job-1")).toBe(true);
    });

    it("should return false for non-selected job", () => {
      expect(isCompareSelected(["job-1", "job-2"], "job-3")).toBe(false);
    });

    it("should return false for empty selection", () => {
      expect(isCompareSelected([], "job-1")).toBe(false);
    });
  });

  describe("canAddCompareJob", () => {
    it("should allow adding when less than 4", () => {
      expect(canAddCompareJob([])).toBe(true);
      expect(canAddCompareJob(["job-1"])).toBe(true);
      expect(canAddCompareJob(["job-1", "job-2"])).toBe(true);
      expect(canAddCompareJob(["job-1", "job-2", "job-3"])).toBe(true);
    });

    it("should reject when at max 4", () => {
      expect(canAddCompareJob(["job-1", "job-2", "job-3", "job-4"])).toBe(false);
    });
  });

  describe("normalizeCompareSelection", () => {
    it("should normalize with new IDs", () => {
      const result = normalizeCompareSelection(["job-a", "job-b"]);
      expect(result).toEqual(["job-a", "job-b"]);
    });

    it("should deduplicate IDs", () => {
      const result = normalizeCompareSelection(["job-1", "job-2", "job-1", "job-3"]);
      expect(result).toEqual(["job-1", "job-2", "job-3"]);
    });

    it("should enforce max 4", () => {
      const result = normalizeCompareSelection(["job-1", "job-2", "job-3", "job-4", "job-5"]);
      expect(result).toEqual(["job-1", "job-2", "job-3", "job-4"]);
      expect(result.length).toBe(4);
    });

    it("should preserve order", () => {
      const result = normalizeCompareSelection(["job-c", "job-a", "job-b"]);
      expect(result).toEqual(["job-c", "job-a", "job-b"]);
    });

    it("should handle empty array", () => {
      const result = normalizeCompareSelection([]);
      expect(result).toEqual([]);
    });
  });
});
