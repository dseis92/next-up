import { describe, it, expect } from "vitest";
import type { JobMatch } from "@/types";
import {
  getOverallMatchLeader,
  getQualificationLeader,
  getLifestyleLeader,
  getHighestSalaryLeader,
  getMostMatchedSkillsLeader,
  getFewestMissingSkillsLeader,
  areValuesEquivalent,
  allJobsHaveSameValue,
  getSectionOrder,
  getSkillStatus,
  allJobsHaveSameSkillStatus,
} from "../comparison";

// Mock JobMatch helper
const createMockMatch = (
  jobId: string,
  overallScore: number,
  qualificationScore: number,
  lifestyleScore: number,
  salaryMax?: number,
  matchedSkills: string[] = [],
  missingSkills: string[] = []
): JobMatch => ({
  id: `${jobId}-match`,
  user_id: "test-user",
  job_id: jobId,
  job: {
    id: jobId,
    company_id: "test-company",
    title: `Job ${jobId}`,
    company: {
      id: "test-company",
      name: `Company ${jobId}`,
      slug: "test-company",
      industry: undefined,
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    },
    location: "Remote",
    work_arrangement: "remote",
    employment_type: "full_time",
    experience_level: undefined,
    description: "Test",
    requirements: [],
    responsibilities: [],
    salary_min: salaryMax ? salaryMax - 20000 : undefined,
    salary_max: salaryMax,
    salary_period: salaryMax ? "yearly" : undefined,
    salary_is_estimated: false,
    created_at: "2026-01-01",
    posted_date: "2026-01-01",
    updated_at: "2026-01-01",
    external_url: undefined,
  },
  overall_score: overallScore,
  qualification_score: qualificationScore,
  lifestyle_score: lifestyleScore,
  breakdown: {
    skills: 85,
    experience: 80,
    salary: 90,
    location: 88,
    work_arrangement: 95,
    career_goals: 75,
  },
  matched_skills: matchedSkills,
  missing_skills: missingSkills,
  reasons_fit: ["Good fit"],
  reasons_concern: [],
  created_at: "2026-01-01",
});

describe("Comparison Logic", () => {
  describe("getOverallMatchLeader", () => {
    it("should identify highest overall match", () => {
      const matches = [
        createMockMatch("job-1", 85, 80, 90),
        createMockMatch("job-2", 93, 85, 92),
        createMockMatch("job-3", 88, 82, 89),
      ];
      const result = getOverallMatchLeader(matches);
      expect(result.jobIds).toEqual(["job-2"]);
      expect(result.isTie).toBe(false);
    });

    it("should handle tie", () => {
      const matches = [
        createMockMatch("job-1", 90, 80, 85),
        createMockMatch("job-2", 90, 75, 92),
      ];
      const result = getOverallMatchLeader(matches);
      expect(result.jobIds).toEqual(["job-1", "job-2"]);
      expect(result.isTie).toBe(true);
    });

    it("should handle empty array", () => {
      const result = getOverallMatchLeader([]);
      expect(result.jobIds).toEqual([]);
      expect(result.isTie).toBe(false);
    });
  });

  describe("getQualificationLeader", () => {
    it("should identify highest qualification", () => {
      const matches = [
        createMockMatch("job-1", 85, 88, 80),
        createMockMatch("job-2", 90, 95, 85),
        createMockMatch("job-3", 87, 92, 83),
      ];
      const result = getQualificationLeader(matches);
      expect(result.jobIds).toEqual(["job-2"]);
    });
  });

  describe("getLifestyleLeader", () => {
    it("should identify highest lifestyle", () => {
      const matches = [
        createMockMatch("job-1", 85, 88, 92),
        createMockMatch("job-2", 90, 95, 85),
        createMockMatch("job-3", 87, 92, 96),
      ];
      const result = getLifestyleLeader(matches);
      expect(result.jobIds).toEqual(["job-3"]);
    });
  });

  describe("getHighestSalaryLeader", () => {
    it("should identify highest listed salary", () => {
      const matches = [
        createMockMatch("job-1", 85, 80, 90, 120000),
        createMockMatch("job-2", 90, 85, 92, 150000),
        createMockMatch("job-3", 88, 82, 89, 130000),
      ];
      const result = getHighestSalaryLeader(matches);
      expect(result.jobIds).toEqual(["job-2"]);
      expect(result.isTie).toBe(false);
    });

    it("should treat missing salary as undefined (not zero)", () => {
      const matches = [
        createMockMatch("job-1", 85, 80, 90, 100000),
        createMockMatch("job-2", 90, 85, 92), // no salary
      ];
      const result = getHighestSalaryLeader(matches);
      expect(result.jobIds).toEqual(["job-1"]);
    });

    it("should return empty when all missing salary", () => {
      const matches = [
        createMockMatch("job-1", 85, 80, 90),
        createMockMatch("job-2", 90, 85, 92),
      ];
      const result = getHighestSalaryLeader(matches);
      expect(result.jobIds).toEqual([]);
    });
  });

  describe("getMostMatchedSkillsLeader", () => {
    it("should identify most matched skills", () => {
      const matches = [
        createMockMatch("job-1", 85, 80, 90, undefined, ["JS", "React"]),
        createMockMatch("job-2", 90, 85, 92, undefined, ["JS", "React", "TS", "Node"]),
        createMockMatch("job-3", 88, 82, 89, undefined, ["JS"]),
      ];
      const result = getMostMatchedSkillsLeader(matches);
      expect(result.jobIds).toEqual(["job-2"]);
    });
  });

  describe("getFewestMissingSkillsLeader", () => {
    it("should identify fewest missing skills", () => {
      const matches = [
        createMockMatch("job-1", 85, 80, 90, undefined, [], ["Go", "Rust"]),
        createMockMatch("job-2", 90, 85, 92, undefined, [], ["Go"]),
        createMockMatch("job-3", 88, 82, 89, undefined, [], []),
      ];
      const result = getFewestMissingSkillsLeader(matches);
      expect(result.jobIds).toEqual(["job-3"]);
    });
  });

  describe("areValuesEquivalent", () => {
    it("should compare strings", () => {
      expect(areValuesEquivalent("remote", "remote")).toBe(true);
      expect(areValuesEquivalent("remote", "onsite")).toBe(false);
    });

    it("should compare numbers", () => {
      expect(areValuesEquivalent(90, 90)).toBe(true);
      expect(areValuesEquivalent(90, 85)).toBe(false);
    });

    it("should compare booleans", () => {
      expect(areValuesEquivalent(true, true)).toBe(true);
      expect(areValuesEquivalent(true, false)).toBe(false);
    });

    it("should treat null and undefined as equivalent", () => {
      expect(areValuesEquivalent(null, undefined)).toBe(true);
      expect(areValuesEquivalent(undefined, null)).toBe(true);
      expect(areValuesEquivalent(null, null)).toBe(true);
      expect(areValuesEquivalent(undefined, undefined)).toBe(true);
    });

    it("should not treat null/undefined as equivalent to other values", () => {
      expect(areValuesEquivalent(null, 0)).toBe(false);
      expect(areValuesEquivalent(undefined, "")).toBe(false);
      expect(areValuesEquivalent(null, false)).toBe(false);
    });
  });

  describe("allJobsHaveSameValue", () => {
    it("should return true when all values identical", () => {
      const items = [
        { arrangement: "remote" },
        { arrangement: "remote" },
        { arrangement: "remote" },
      ];
      expect(allJobsHaveSameValue(items, (item) => item.arrangement)).toBe(true);
    });

    it("should return false when values differ", () => {
      const items = [
        { arrangement: "remote" },
        { arrangement: "hybrid" },
        { arrangement: "remote" },
      ];
      expect(allJobsHaveSameValue(items, (item) => item.arrangement)).toBe(false);
    });

    it("should handle empty array", () => {
      expect(allJobsHaveSameValue<{ value: string }>([], (item) => item.value)).toBe(true);
    });

    it("should handle null/undefined equivalence", () => {
      const items = [{ val: null }, { val: undefined }, { val: null }];
      expect(allJobsHaveSameValue(items, (item) => item.val)).toBe(true);
    });
  });

  describe("getSectionOrder", () => {
    it("should return balanced order", () => {
      const result = getSectionOrder("balanced");
      expect(result).toEqual(["match", "compensation", "lifestyle", "skills", "strengths"]);
    });

    it("should return compensation order", () => {
      const result = getSectionOrder("compensation");
      expect(result).toEqual(["compensation", "match", "lifestyle", "skills", "strengths"]);
    });

    it("should return lifestyle order", () => {
      const result = getSectionOrder("lifestyle");
      expect(result).toEqual(["lifestyle", "match", "compensation", "skills", "strengths"]);
    });

    it("should return qualification order", () => {
      const result = getSectionOrder("qualification");
      expect(result).toEqual(["match", "skills", "strengths", "compensation", "lifestyle"]);
    });

    it("should default to balanced for unknown lens", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = getSectionOrder("unknown" as any);
      expect(result).toEqual(["match", "compensation", "lifestyle", "skills", "strengths"]);
    });
  });

  describe("getSkillStatus", () => {
    it("should return matched for matched skills", () => {
      const match = { matched_skills: ["TypeScript", "React"], missing_skills: ["Go"] };
      expect(getSkillStatus(match, "TypeScript")).toBe("matched");
      expect(getSkillStatus(match, "React")).toBe("matched");
    });

    it("should return missing for missing skills", () => {
      const match = { matched_skills: ["TypeScript"], missing_skills: ["Go", "Rust"] };
      expect(getSkillStatus(match, "Go")).toBe("missing");
      expect(getSkillStatus(match, "Rust")).toBe("missing");
    });

    it("should return not-required for unlisted skills", () => {
      const match = { matched_skills: ["TypeScript"], missing_skills: ["Go"] };
      expect(getSkillStatus(match, "Python")).toBe("not-required");
    });
  });

  describe("allJobsHaveSameSkillStatus", () => {
    it("should return true when all jobs have skill matched", () => {
      const matches = [
        { matched_skills: ["TypeScript"], missing_skills: [] },
        { matched_skills: ["TypeScript"], missing_skills: [] },
        { matched_skills: ["TypeScript"], missing_skills: [] },
      ];
      expect(allJobsHaveSameSkillStatus(matches, "TypeScript")).toBe(true);
    });

    it("should return true when all jobs are missing skill", () => {
      const matches = [
        { matched_skills: [], missing_skills: ["Go"] },
        { matched_skills: [], missing_skills: ["Go"] },
        { matched_skills: [], missing_skills: ["Go"] },
      ];
      expect(allJobsHaveSameSkillStatus(matches, "Go")).toBe(true);
    });

    it("should return true when all jobs consider skill not-required", () => {
      const matches = [
        { matched_skills: ["TypeScript"], missing_skills: ["Go"] },
        { matched_skills: ["React"], missing_skills: ["Rust"] },
        { matched_skills: ["Node"], missing_skills: ["Python"] },
      ];
      expect(allJobsHaveSameSkillStatus(matches, "Java")).toBe(true);
    });

    it("should return false when jobs have different skill statuses", () => {
      const matches = [
        { matched_skills: ["TypeScript"], missing_skills: [] },
        { matched_skills: [], missing_skills: ["TypeScript"] },
        { matched_skills: ["React"], missing_skills: ["Go"] },
      ];
      expect(allJobsHaveSameSkillStatus(matches, "TypeScript")).toBe(false);
    });

    it("should return false when mixed matched/not-required", () => {
      const matches = [
        { matched_skills: ["TypeScript"], missing_skills: [] },
        { matched_skills: ["React"], missing_skills: ["Go"] },
      ];
      expect(allJobsHaveSameSkillStatus(matches, "TypeScript")).toBe(false);
    });

    it("should return false when mixed missing/not-required", () => {
      const matches = [
        { matched_skills: [], missing_skills: ["Go"] },
        { matched_skills: ["TypeScript"], missing_skills: [] },
      ];
      expect(allJobsHaveSameSkillStatus(matches, "Go")).toBe(false);
    });

    it("should handle empty matches array", () => {
      expect(allJobsHaveSameSkillStatus([], "TypeScript")).toBe(true);
    });
  });
});
