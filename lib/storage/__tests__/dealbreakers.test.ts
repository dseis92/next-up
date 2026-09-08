import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserDealbreakers, saveUserDealbreakers, clearUserDealbreakers } from "../dealbreakers";

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

describe("Dealbreaker Storage", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSelect: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockFrom: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockEq: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockMaybeSingle: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockUpsert: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDelete: any;

  beforeEach(async () => {
    // Reset mocks
    mockMaybeSingle = vi.fn();
    mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
    mockSelect = vi.fn(() => ({ eq: mockEq }));
    mockUpsert = vi.fn();
    mockDelete = vi.fn(() => ({ eq: mockEq }));
    mockFrom = vi.fn((table: string) => {
      if (table === "user_dealbreakers") {
        return {
          select: mockSelect,
          upsert: mockUpsert,
          delete: mockDelete,
        };
      }
      return {};
    });

    mockSupabase = {
      from: mockFrom,
    };

    // Mock the createClient function
    const { createClient } = await import("@/lib/supabase/client");
    vi.mocked(createClient).mockReturnValue(mockSupabase);
  });

  describe("getUserDealbreakers", () => {
    it("should return null when user has no saved preferences", async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });

      const result = await getUserDealbreakers("user-1");

      expect(result).toBeNull();
      expect(mockFrom).toHaveBeenCalledWith("user_dealbreakers");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("user_id", "user-1");
    });

    it("should return preferences when they exist", async () => {
      const mockRow = {
        user_id: "user-1",
        minimum_salary: 120000,
        require_salary_disclosure: true,
        allowed_work_arrangements: ["remote", "hybrid"],
        allowed_employment_types: ["full_time"],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      mockMaybeSingle.mockResolvedValue({ data: mockRow, error: null });

      const result = await getUserDealbreakers("user-1");

      expect(result).toEqual({
        userId: "user-1",
        minimumSalary: 120000,
        requireSalaryDisclosure: true,
        allowedWorkArrangements: ["remote", "hybrid"],
        allowedEmploymentTypes: ["full_time"],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      });
    });

    it("should handle null minimum_salary correctly", async () => {
      const mockRow = {
        user_id: "user-1",
        minimum_salary: null,
        require_salary_disclosure: false,
        allowed_work_arrangements: [],
        allowed_employment_types: [],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      mockMaybeSingle.mockResolvedValue({ data: mockRow, error: null });

      const result = await getUserDealbreakers("user-1");

      expect(result).toEqual({
        userId: "user-1",
        minimumSalary: undefined,
        requireSalaryDisclosure: false,
        allowedWorkArrangements: [],
        allowedEmploymentTypes: [],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      });
    });

    it("should throw error when query fails", async () => {
      mockMaybeSingle.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(getUserDealbreakers("user-1")).rejects.toThrow(
        "Unable to load dealbreaker preferences"
      );
    });
  });

  describe("saveUserDealbreakers", () => {
    it("should save preferences successfully", async () => {
      mockUpsert.mockResolvedValue({ error: null });

      const preferences = {
        userId: "user-1",
        minimumSalary: 100000,
        requireSalaryDisclosure: true,
        allowedWorkArrangements: ["remote"] as ("remote" | "hybrid" | "onsite")[],
        allowedEmploymentTypes: ["full_time"] as (
          | "full_time"
          | "part_time"
          | "contract"
          | "temporary"
        )[],
      };

      await saveUserDealbreakers(preferences);

      expect(mockUpsert).toHaveBeenCalledWith(
        {
          user_id: "user-1",
          minimum_salary: 100000,
          require_salary_disclosure: true,
          allowed_work_arrangements: ["remote"],
          allowed_employment_types: ["full_time"],
        },
        { onConflict: "user_id" }
      );
    });

    it("should handle undefined minimumSalary by converting to null", async () => {
      mockUpsert.mockResolvedValue({ error: null });

      const preferences = {
        userId: "user-1",
        minimumSalary: undefined,
        requireSalaryDisclosure: false,
        allowedWorkArrangements: [] as ("remote" | "hybrid" | "onsite")[],
        allowedEmploymentTypes: [] as (
          | "full_time"
          | "part_time"
          | "contract"
          | "temporary"
        )[],
      };

      await saveUserDealbreakers(preferences);

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          minimum_salary: null,
        }),
        { onConflict: "user_id" }
      );
    });

    it("should throw error when save fails", async () => {
      mockUpsert.mockResolvedValue({ error: { message: "Database error" } });

      const preferences = {
        userId: "user-1",
        minimumSalary: 100000,
        requireSalaryDisclosure: false,
        allowedWorkArrangements: [] as ("remote" | "hybrid" | "onsite")[],
        allowedEmploymentTypes: [] as (
          | "full_time"
          | "part_time"
          | "contract"
          | "temporary"
        )[],
      };

      await expect(saveUserDealbreakers(preferences)).rejects.toThrow(
        "Unable to save dealbreaker preferences"
      );
    });
  });

  describe("clearUserDealbreakers", () => {
    it("should clear preferences successfully", async () => {
      mockEq.mockReturnValue({ error: null });

      await clearUserDealbreakers("user-1");

      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("user_id", "user-1");
    });

    it("should throw error when clear fails", async () => {
      mockEq.mockReturnValue({ error: { message: "Database error" } });

      await expect(clearUserDealbreakers("user-1")).rejects.toThrow(
        "Unable to clear dealbreaker preferences"
      );
    });
  });
});
