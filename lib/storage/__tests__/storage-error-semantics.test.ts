/**
 * Storage Error Semantics Tests
 *
 * Proves that storage read helpers correctly distinguish:
 * - Successful empty/null results
 * - Database/query failures
 *
 * These tests prevent regressions where query failures are collapsed into
 * legitimate empty states (e.g., "No jobs found" when the query actually failed).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createClient } from "@/lib/supabase/client";

// Mock Supabase client
vi.mock("@/lib/supabase/client");

describe("Storage Error Semantics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getJobs", () => {
    it("should return empty array for successful zero rows", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getJobs } = await import("../jobs");
      const result = await getJobs();

      expect(result).toEqual([]);
    });

    it("should throw on query failure, not return empty array", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Database connection failed" },
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getJobs } = await import("../jobs");

      await expect(getJobs()).rejects.toThrow("Unable to load jobs");
    });
  });

  describe("getJob", () => {
    it("should return null for successful missing row", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getJob } = await import("../jobs");
      const result = await getJob("nonexistent-id");

      expect(result).toBeNull();
    });

    it("should throw on query failure, not return null", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Database connection failed" },
              }),
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getJob } = await import("../jobs");

      await expect(getJob("job-id")).rejects.toThrow("Unable to load job details");
    });
  });

  describe("getSavedJobs", () => {
    it("should return empty array for successful zero saved jobs", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getSavedJobs } = await import("../job-actions");
      const result = await getSavedJobs();

      expect(result).toEqual([]);
    });

    it("should throw on query failure, not return empty array", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Database connection failed" },
              }),
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getSavedJobs } = await import("../job-actions");

      await expect(getSavedJobs()).rejects.toThrow("Unable to load saved jobs");
    });
  });

  describe("isJobSaved", () => {
    it("should return false for successful no matching row", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { isJobSaved } = await import("../job-actions");
      const result = await isJobSaved("job-id");

      expect(result).toBe(false);
    });

    it("should throw on query failure, not return false", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Database connection failed" },
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { isJobSaved } = await import("../job-actions");

      await expect(isJobSaved("job-id")).rejects.toThrow("Unable to check save status");
    });
  });

  describe("getApplications", () => {
    it("should return empty array for successful zero applications", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getApplications } = await import("../applications");
      const result = await getApplications();

      expect(result).toEqual([]);
    });

    it("should throw on query failure, not return empty array", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Database connection failed" },
              }),
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getApplications } = await import("../applications");

      await expect(getApplications()).rejects.toThrow("Unable to load applications");
    });
  });

  describe("getPassedJobs", () => {
    it("should return empty array for successful zero passed jobs", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getPassedJobs } = await import("../job-actions");
      const result = await getPassedJobs();

      expect(result).toEqual([]);
    });

    it("should throw on query failure, not return empty array", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Database connection failed" },
              }),
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getPassedJobs } = await import("../job-actions");

      await expect(getPassedJobs()).rejects.toThrow("Unable to load passed jobs");
    });
  });

  describe("isJobPassed", () => {
    it("should return false for successful no matching row", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { isJobPassed } = await import("../job-actions");
      const result = await isJobPassed("job-id");

      expect(result).toBe(false);
    });

    it("should throw on query failure, not return false", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Database connection failed" },
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { isJobPassed } = await import("../job-actions");

      await expect(isJobPassed("job-id")).rejects.toThrow("Unable to check pass status");
    });
  });

  describe("getApplicationById", () => {
    it("should return null for successful missing row", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getApplicationById } = await import("../applications");
      const result = await getApplicationById("app-id");

      expect(result).toBeNull();
    });

    it("should throw on query failure, not return null", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Database connection failed" },
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getApplicationById } = await import("../applications");

      await expect(getApplicationById("app-id")).rejects.toThrow("Unable to load application details");
    });
  });

  describe("getApplicationByJobId", () => {
    it("should return null for successful missing row", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getApplicationByJobId } = await import("../applications");
      const result = await getApplicationByJobId("job-id");

      expect(result).toBeNull();
    });

    it("should throw on query failure, not return null", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Database connection failed" },
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getApplicationByJobId } = await import("../applications");

      await expect(getApplicationByJobId("job-id")).rejects.toThrow("Unable to load application");
    });
  });

  describe("getApplicationEvents", () => {
    it("should return empty array for successful zero events", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getApplicationEvents } = await import("../applications");
      const result = await getApplicationEvents("app-id");

      expect(result).toEqual([]);
    });

    it("should throw on query failure, not return empty array", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Database connection failed" },
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getApplicationEvents } = await import("../applications");

      await expect(getApplicationEvents("app-id")).rejects.toThrow("Unable to load application timeline");
    });
  });

  describe("getApplicationNotes", () => {
    it("should return empty array for successful zero notes", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getApplicationNotes } = await import("../applications");
      const result = await getApplicationNotes("app-id");

      expect(result).toEqual([]);
    });

    it("should throw on query failure, not return empty array", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Database connection failed" },
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getApplicationNotes } = await import("../applications");

      await expect(getApplicationNotes("app-id")).rejects.toThrow("Unable to load application notes");
    });
  });

  describe("getJobsByIds", () => {
    it("should return empty arrays for empty input", async () => {
      const mockSupabase = {
        from: vi.fn(),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getJobsByIds } = await import("../jobs");
      const result = await getJobsByIds([]);

      expect(result).toEqual({ jobs: [], missingIds: [] });
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it("should return jobs in requested order and identify missing IDs", async () => {
      const job1 = { id: "job-1", title: "Engineer", company: { id: "c1", name: "Acme" } };
      const job3 = { id: "job-3", title: "Designer", company: { id: "c2", name: "Corp" } };

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({
              data: [job3, job1], // Returned in different order
              error: null,
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getJobsByIds } = await import("../jobs");
      const result = await getJobsByIds(["job-1", "job-2", "job-3"]);

      expect(result.jobs).toEqual([job1, job3]); // Reordered to match request
      expect(result.missingIds).toEqual(["job-2"]);
    });

    it("should return all jobs when none are missing", async () => {
      const job1 = { id: "job-1", title: "Engineer", company: { id: "c1", name: "Acme" } };
      const job2 = { id: "job-2", title: "Manager", company: { id: "c2", name: "Corp" } };

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({
              data: [job2, job1],
              error: null,
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getJobsByIds } = await import("../jobs");
      const result = await getJobsByIds(["job-1", "job-2"]);

      expect(result.jobs).toEqual([job1, job2]);
      expect(result.missingIds).toEqual([]);
    });

    it("should return all missing IDs when no jobs found", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getJobsByIds } = await import("../jobs");
      const result = await getJobsByIds(["job-1", "job-2", "job-3"]);

      expect(result.jobs).toEqual([]);
      expect(result.missingIds).toEqual(["job-1", "job-2", "job-3"]);
    });

    it("should throw on query failure, not return empty result", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Database connection failed" },
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getJobsByIds } = await import("../jobs");

      await expect(getJobsByIds(["job-1"])).rejects.toThrow("Unable to load selected jobs");
    });

    it("should preserve order with mixed found and missing jobs", async () => {
      const job2 = { id: "job-2", title: "Engineer", company: { id: "c1", name: "Acme" } };
      const job4 = { id: "job-4", title: "Designer", company: { id: "c2", name: "Corp" } };

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({
              data: [job4, job2],
              error: null,
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);

      const { getJobsByIds } = await import("../jobs");
      const result = await getJobsByIds(["job-1", "job-2", "job-3", "job-4", "job-5"]);

      expect(result.jobs).toEqual([job2, job4]); // Ordered as requested
      expect(result.missingIds).toEqual(["job-1", "job-3", "job-5"]); // Ordered as requested
    });
  });
});
