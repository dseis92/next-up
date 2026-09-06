/**
 * NextUp Matching Engine - Comprehensive Test Suite
 *
 * Tests the deterministic matching engine with various scenarios.
 * All tests must pass for Phase 9 to be considered complete.
 */

import { describe, it, expect } from "vitest";
import { calculateJobMatch } from "../calculate-job-match";
import type { MatchProfile, MatchJob } from "../types";
import { HARD_FAILURE_SCORE_CAP } from "../weights";

/**
 * Test fixtures
 */

// Base profile: Tower Foreman with transferable skills
const towerForemanProfile: MatchProfile = {
  currentRole: "Tower Foreman",
  yearsExperience: 4,
  industry: "Telecommunications",
  goals: ["Move into project management", "Career advancement"],
  targetRoles: ["Project Engineer", "Assistant Project Manager"],
  skills: [
    { name: "Crew Leadership", proficiency: "strong" },
    { name: "Telecommunications", proficiency: "strong" },
    { name: "Construction", proficiency: "strong" },
    { name: "Safety", proficiency: "expert" },
    { name: "Scheduling", proficiency: "comfortable" },
    { name: "Documentation", proficiency: "comfortable" },
    { name: "Material Coordination", proficiency: "comfortable" },
    { name: "Quality Control", proficiency: "comfortable" },
  ],
  experiences: [
    {
      title: "Tower Foreman",
      company: "Telecom Construction Co",
      startDate: "2020-01-01",
      current: true,
      description: "Lead tower construction crews",
    },
  ],
  salaryMin: 65000,
  salaryIdeal: 80000,
  workPreferences: {
    remote: false,
    hybrid: true,
    onsite: true,
    fullTime: true,
    partTime: false,
    contract: false,
  },
  location: "Madison, WI",
  preferredLocations: ["Madison, WI", "Milwaukee, WI"],
  willingToRelocate: false,
  maxCommute: 30,
  priorities: {
    salary: 8,
    workLifeBalance: 7,
    careerGrowth: 9,
    location: 6,
    remoteFlexibility: 4,
    culture: 7,
    stability: 8,
    benefits: 7,
    mission: 5,
    learning: 8,
  },
};

// Project Engineer job (good transferable match)
const projectEngineerJob: MatchJob = {
  id: "job-1",
  title: "Project Engineer",
  description:
    "Seeking an experienced Project Engineer to lead field operations and coordinate construction projects. Ideal candidate has strong leadership background in telecommunications or construction.",
  requirements: [
    "3+ years field construction experience",
    "Strong leadership and crew management",
    "Safety certification (OSHA 30)",
    "Project documentation experience",
    "Valid driver's license",
  ],
  responsibilities: [
    "Manage day-to-day field operations",
    "Coordinate with project managers and contractors",
    "Ensure safety compliance",
    "Maintain project documentation",
    "Supervise field crews",
  ],
  workArrangement: "hybrid",
  employmentType: "full_time",
  experienceLevel: "mid",
  salaryMin: 70000,
  salaryMax: 90000,
  salaryPeriod: "yearly",
  location: "Madison, WI",
  company: {
    name: "Acme Construction",
    industry: "Construction",
  },
};

// Entry-level profile (minimal experience)
const entryLevelProfile: MatchProfile = {
  currentRole: "Construction Assistant",
  yearsExperience: 1,
  goals: ["Learn construction management"],
  targetRoles: ["Project Coordinator", "Field Engineer"],
  skills: [
    { name: "Safety", proficiency: "learning" },
    { name: "Construction", proficiency: "comfortable" },
  ],
  experiences: [
    {
      title: "Construction Assistant",
      company: "BuildCo",
      startDate: "2023-01-01",
      current: true,
    },
  ],
  salaryMin: 45000,
  salaryIdeal: 55000,
  workPreferences: {
    remote: false,
    hybrid: true,
    onsite: true,
    fullTime: true,
    partTime: false,
    contract: false,
  },
  location: "Madison, WI",
  preferredLocations: ["Madison, WI"],
  willingToRelocate: false,
};

// Senior manager job (significant seniority gap for entry profile)
const seniorManagerJob: MatchJob = {
  id: "job-2",
  title: "Senior Construction Manager",
  description: "Lead multiple construction projects across the region",
  requirements: [
    "10+ years construction management experience",
    "P&L responsibility",
    "Team leadership",
  ],
  workArrangement: "hybrid",
  employmentType: "full_time",
  experienceLevel: "senior",
  salaryMin: 110000,
  salaryMax: 140000,
  salaryPeriod: "yearly",
  location: "Madison, WI",
  company: {
    name: "BuildRight Solutions",
    industry: "Construction",
  },
};

// Remote-only profile
const remoteOnlyProfile: MatchProfile = {
  ...towerForemanProfile,
  workPreferences: {
    remote: true,
    hybrid: false,
    onsite: false,
    fullTime: true,
    partTime: false,
    contract: false,
  },
};

// Onsite-only job
const onsiteOnlyJob: MatchJob = {
  ...projectEngineerJob,
  workArrangement: "onsite",
};

// Incomplete profile (missing required fields)
const incompleteProfile: MatchProfile = {
  goals: [],
  targetRoles: [],
  skills: [],
  experiences: [],
  salaryMin: undefined,
  workPreferences: undefined,
  location: undefined,
  preferredLocations: [],
  willingToRelocate: false,
};

describe("NextUp Matching Engine", () => {
  describe("Profile Completeness", () => {
    it("should return incomplete_profile status for profiles missing required fields", () => {
      const result = calculateJobMatch(incompleteProfile, projectEngineerJob);

      expect(result.status).toBe("incomplete_profile");
      expect(result.overallScore).toBeNull();
      expect(result.qualificationScore).toBeNull();
      expect(result.lifestyleScore).toBeNull();
      expect(result.missingProfileFields).toBeDefined();
      expect(result.missingProfileFields!.length).toBeGreaterThan(0);
    });

    it("should return scored status for complete profiles", () => {
      const result = calculateJobMatch(towerForemanProfile, projectEngineerJob);

      expect(result.status).toBe("scored");
      expect(result.overallScore).not.toBeNull();
      expect(result.qualificationScore).not.toBeNull();
      expect(result.lifestyleScore).not.toBeNull();
    });
  });

  describe("Skills Matching", () => {
    it("should identify matched skills correctly", () => {
      const result = calculateJobMatch(towerForemanProfile, projectEngineerJob);

      expect(result.matchedSkills).toBeDefined();
      expect(result.matchedSkills.length).toBeGreaterThan(0);
      expect(result.matchedSkills).toContain("leadership");
      expect(result.matchedSkills).toContain("safety");
    });

    it("should identify missing skills correctly", () => {
      const profileWithoutBIM: MatchProfile = {
        ...towerForemanProfile,
        skills: towerForemanProfile.skills.filter(
          (s) => !s.name.toLowerCase().includes("bim")
        ),
      };

      const jobRequiringBIM: MatchJob = {
        ...projectEngineerJob,
        requirements: [...(projectEngineerJob.requirements || []), "BIM experience required"],
      };

      const result = calculateJobMatch(profileWithoutBIM, jobRequiringBIM);

      expect(result.missingSkills).toBeDefined();
      expect(result.missingSkills).toContain("bim"); // Canonical normalized form
    });

    it("should handle skill aliases correctly", () => {
      const profileWithAlias: MatchProfile = {
        ...towerForemanProfile,
        skills: [
          { name: "Team Leadership", proficiency: "strong" }, // Alias for "leadership"
          { name: "Safety Management", proficiency: "expert" }, // Alias for "safety"
        ],
      };

      const result = calculateJobMatch(profileWithAlias, projectEngineerJob);

      // Should match through aliases
      expect(result.matchedSkills.length).toBeGreaterThan(0);
    });

    it("should not match unrelated skills", () => {
      const profileWithUnrelatedSkills: MatchProfile = {
        ...towerForemanProfile,
        skills: [
          { name: "Cooking", proficiency: "expert" },
          { name: "Gardening", proficiency: "strong" },
        ],
      };

      const result = calculateJobMatch(profileWithUnrelatedSkills, projectEngineerJob);

      expect(result.breakdown.skills.score).toBeLessThan(50);
    });

    it("should reward high-proficiency skills more than low-proficiency", () => {
      const expertProfile: MatchProfile = {
        ...towerForemanProfile,
        skills: towerForemanProfile.skills.map((s) => ({
          ...s,
          proficiency: "expert" as const,
        })),
      };

      const learningProfile: MatchProfile = {
        ...towerForemanProfile,
        skills: towerForemanProfile.skills.map((s) => ({
          ...s,
          proficiency: "learning" as const,
        })),
      };

      const expertResult = calculateJobMatch(expertProfile, projectEngineerJob);
      const learningResult = calculateJobMatch(learningProfile, projectEngineerJob);

      expect(expertResult.breakdown.skills.score).toBeGreaterThan(
        learningResult.breakdown.skills.score
      );
    });

    it("should handle duplicate skills without inflating score", () => {
      const profileWithDuplicates: MatchProfile = {
        ...towerForemanProfile,
        skills: [
          { name: "Leadership", proficiency: "strong" },
          { name: "Team Leadership", proficiency: "strong" }, // Alias - duplicate
          { name: "LEADERSHIP", proficiency: "strong" }, // Case variation - duplicate
        ],
      };

      const profileWithSingleSkill: MatchProfile = {
        ...towerForemanProfile,
        skills: [
          { name: "Leadership", proficiency: "strong" },
          { name: "Safety", proficiency: "strong" }, // Need multiple skills to meet min requirements
        ],
      };

      const resultDuplicate = calculateJobMatch(profileWithDuplicates, projectEngineerJob);
      const resultSingle = calculateJobMatch(profileWithSingleSkill, projectEngineerJob);

      // Duplicates should normalize to same matched skills
      // Both should identify "leadership" as canonical matched skill exactly once
      const dupMatched = resultDuplicate.matchedSkills.filter((s) => s === "leadership");
      const singleMatched = resultSingle.matchedSkills.filter((s) => s === "leadership");

      expect(dupMatched.length).toBe(1); // Only one instance despite 3 aliases
      expect(singleMatched.length).toBe(1); // Same as single instance
    });
  });

  describe("Experience Scoring", () => {
    it("should score high when user meets experience requirement", () => {
      const result = calculateJobMatch(towerForemanProfile, projectEngineerJob);

      // Profile has 4 years, job requires 3+
      expect(result.breakdown.experience.score).toBeGreaterThanOrEqual(70);
    });

    it("should penalize when user is below experience requirement", () => {
      const result = calculateJobMatch(entryLevelProfile, projectEngineerJob);

      // Entry-level (1 year) vs 3+ years required
      expect(result.breakdown.experience.score).toBeLessThan(70);
    });

    it("should parse experience requirements from text", () => {
      const jobWith5Years: MatchJob = {
        ...projectEngineerJob,
        requirements: ["5+ years construction experience", "Safety certification"],
      };

      const profileWith6Years: MatchProfile = {
        ...towerForemanProfile,
        yearsExperience: 6,
      };

      const profileWith3Years: MatchProfile = {
        ...towerForemanProfile,
        yearsExperience: 3,
      };

      const result6 = calculateJobMatch(profileWith6Years, jobWith5Years);
      const result3 = calculateJobMatch(profileWith3Years, jobWith5Years);

      expect(result6.breakdown.experience.score).toBeGreaterThan(
        result3.breakdown.experience.score
      );
    });

    it("should parse range requirements like 3-5 years", () => {
      const jobWithRange: MatchJob = {
        ...projectEngineerJob,
        requirements: ["3-5 years experience required"],
      };

      const result = calculateJobMatch(towerForemanProfile, jobWithRange);

      expect(result.status).toBe("scored");
      // Should parse minYears correctly from range
      expect(result.breakdown.experience.metadata?.requiredYears).toBe(3);
      // User has 4 years, should meet 3+ requirement
      expect(result.breakdown.experience.score).toBeGreaterThan(80);
    });
  });

  describe("Transferable Career Paths", () => {
    it("should recognize Tower Foreman → Project Engineer as transferable in experience", () => {
      // Use profile WITHOUT Project Engineer in targetRoles to test transferability
      // Also use less experience to ensure bonus is visible
      const towerForemanWithoutTargetRole: MatchProfile = {
        ...towerForemanProfile,
        targetRoles: ["Construction Manager", "Operations Manager"], // Different targets
        yearsExperience: 2, // Below the 3+ requirement, so transferability bonus applies
      };

      const result = calculateJobMatch(towerForemanWithoutTargetRole, projectEngineerJob);

      // Should receive transferability credit in experience component
      expect(result.breakdown.experience.metadata?.isTransferable).toBe(true);
      // Transferability bonus increases score for below-requirement candidates
      expect(result.breakdown.experience.score).toBeGreaterThan(40);
    });

    it("should recognize Field Supervisor → Assistant Project Manager", () => {
      const fieldSupervisorProfile: MatchProfile = {
        ...towerForemanProfile,
        currentRole: "Field Supervisor",
        targetRoles: ["Operations Supervisor", "Site Manager"], // NOT including APM
      };

      const apmJob: MatchJob = {
        ...projectEngineerJob,
        title: "Assistant Project Manager",
      };

      const result = calculateJobMatch(fieldSupervisorProfile, apmJob);

      // Should show transferability in experience
      expect(result.breakdown.experience.metadata?.isTransferable).toBe(true);
    });

    it("should recognize Crew Lead → Operations Manager", () => {
      const crewLeadProfile: MatchProfile = {
        ...towerForemanProfile,
        currentRole: "Crew Lead",
        targetRoles: ["Site Supervisor", "Field Manager"], // NOT including Ops Manager
      };

      const opsManagerJob: MatchJob = {
        ...projectEngineerJob,
        title: "Operations Manager",
      };

      const result = calculateJobMatch(crewLeadProfile, opsManagerJob);

      // Should show transferability in experience
      expect(result.breakdown.experience.metadata?.isTransferable).toBe(true);
    });

    it("should NOT give transferability credit for unrelated roles", () => {
      const chefProfile: MatchProfile = {
        ...towerForemanProfile,
        currentRole: "Executive Chef",
        targetRoles: ["Restaurant Manager", "Culinary Director"],
      };

      const result = calculateJobMatch(chefProfile, projectEngineerJob);

      // Should NOT show transferability
      expect(result.breakdown.experience.metadata?.isTransferable).not.toBe(true);
    });

    it("should score exact target role match higher than transferable", () => {
      const exactMatchProfile: MatchProfile = {
        ...towerForemanProfile,
        currentRole: "Project Engineer",
        targetRoles: ["Project Engineer", "Senior Project Engineer"],
      };

      const transferableProfile: MatchProfile = {
        ...towerForemanProfile,
        targetRoles: ["Construction Manager"], // NOT Project Engineer
      };

      const exactResult = calculateJobMatch(exactMatchProfile, projectEngineerJob);
      const transferableResult = calculateJobMatch(transferableProfile, projectEngineerJob);

      // Exact target match should score higher in career goals
      expect(exactResult.breakdown.careerGoals.score).toBeGreaterThan(
        transferableResult.breakdown.careerGoals.score
      );
    });
  });

  describe("Seniority Matching", () => {
    it("should not over-penalize adjacent seniority levels", () => {
      const midLevelProfile: MatchProfile = {
        ...towerForemanProfile,
        currentRole: "Mid-Level Engineer",
        yearsExperience: 4,
      };

      const seniorJob: MatchJob = {
        ...projectEngineerJob,
        title: "Senior Project Engineer",
        experienceLevel: "senior",
      };

      const result = calculateJobMatch(midLevelProfile, seniorJob);

      // Adjacent levels should still get reasonable score
      expect(result.breakdown.seniority.score).toBeGreaterThan(60);
    });

    it("should heavily penalize large seniority gaps", () => {
      const result = calculateJobMatch(entryLevelProfile, seniorManagerJob);

      // Entry vs Director/Executive should be heavily penalized
      expect(result.breakdown.seniority.score).toBeLessThan(50);
    });

    it("should normalize seniority from job titles", () => {
      const foremanProfile: MatchProfile = {
        ...towerForemanProfile,
        currentRole: "Foreman",
      };

      const supervisorJob: MatchJob = {
        ...projectEngineerJob,
        title: "Site Supervisor",
        experienceLevel: undefined,
      };

      const result = calculateJobMatch(foremanProfile, supervisorJob);

      // Foreman and Supervisor should be similar seniority levels
      expect(result.breakdown.seniority.score).toBeGreaterThan(70);
    });
  });

  describe("Salary Scoring", () => {
    it("should score high when job meets ideal salary", () => {
      const result = calculateJobMatch(towerForemanProfile, projectEngineerJob);

      // Job max ($90k) > ideal ($80k)
      expect(result.breakdown.salary.score).toBeGreaterThan(85);
    });

    it("should score partial when job meets minimum but not ideal", () => {
      const highExpectationProfile: MatchProfile = {
        ...towerForemanProfile,
        salaryMin: 70000,
        salaryIdeal: 100000,
      };

      const result = calculateJobMatch(highExpectationProfile, projectEngineerJob);

      // Job max ($90k) between min ($70k) and ideal ($100k)
      expect(result.breakdown.salary.score).toBeGreaterThan(50);
      expect(result.breakdown.salary.score).toBeLessThan(85);
    });

    it("should create hard failure when job max below user minimum", () => {
      const highMinimumProfile: MatchProfile = {
        ...towerForemanProfile,
        salaryMin: 100000,
        salaryIdeal: 120000,
      };

      const result = calculateJobMatch(highMinimumProfile, projectEngineerJob);

      // Job max ($90k) < user min ($100k)
      expect(result.hardFailures.length).toBeGreaterThan(0);
      expect(result.hardFailures.some((f) => f.code === "salary_below_minimum")).toBe(true);
      expect(result.breakdown.salary.score).toBe(0);
    });

    it("should handle unknown salary neutrally", () => {
      const jobWithoutSalary: MatchJob = {
        ...projectEngineerJob,
        salaryMin: undefined,
        salaryMax: undefined,
      };

      const result = calculateJobMatch(towerForemanProfile, jobWithoutSalary);

      // Unknown salary should be neutral, not failure
      expect(result.breakdown.salary.score).toBeGreaterThan(40);
      expect(result.breakdown.salary.score).toBeLessThan(80);
      expect(result.breakdown.salary.confidence).toBe("low");
    });

    it("should convert hourly to yearly salary correctly", () => {
      const hourlyJob: MatchJob = {
        ...projectEngineerJob,
        salaryMin: 35,
        salaryMax: 45,
        salaryPeriod: "hourly",
      };

      const result = calculateJobMatch(towerForemanProfile, hourlyJob);

      // $45/hour * 2080 hours = $93,600/year (above ideal)
      expect(result.breakdown.salary.score).toBeGreaterThan(80);
    });
  });

  describe("Work Arrangement Scoring", () => {
    it("should score high for matching work arrangement", () => {
      const result = calculateJobMatch(towerForemanProfile, projectEngineerJob);

      // Profile accepts hybrid, job is hybrid
      expect(result.breakdown.workArrangement.score).toBeGreaterThan(75);
    });

    it("should create hard failure for exclusive conflicts", () => {
      const result = calculateJobMatch(remoteOnlyProfile, onsiteOnlyJob);

      // Remote-only vs onsite-only
      expect(result.hardFailures.length).toBeGreaterThan(0);
      expect(
        result.hardFailures.some((f) => f.code === "work_arrangement_conflict")
      ).toBe(true);
    });

    it("should score well for remote jobs with any preference", () => {
      const remoteJob: MatchJob = {
        ...projectEngineerJob,
        workArrangement: "remote",
      };

      const result = calculateJobMatch(towerForemanProfile, remoteJob);

      // Most people find remote acceptable
      expect(result.breakdown.workArrangement.score).toBeGreaterThan(0);
    });

    it("should not arbitrarily rank accepted work arrangements", () => {
      const profileAcceptingBoth: MatchProfile = {
        ...towerForemanProfile,
        workPreferences: {
          remote: false,
          hybrid: true,
          onsite: true,
          fullTime: true,
          partTime: false,
          contract: false,
        },
      };

      const hybridJob: MatchJob = {
        ...projectEngineerJob,
        workArrangement: "hybrid",
      };

      const onsiteJob: MatchJob = {
        ...projectEngineerJob,
        workArrangement: "onsite",
      };

      const hybridResult = calculateJobMatch(profileAcceptingBoth, hybridJob);
      const onsiteResult = calculateJobMatch(profileAcceptingBoth, onsiteJob);

      // Both accepted arrangements should score equally
      expect(hybridResult.breakdown.workArrangement.score).toBe(
        onsiteResult.breakdown.workArrangement.score
      );
    });
  });

  describe("Location Scoring", () => {
    it("should score high for exact location match", () => {
      const result = calculateJobMatch(towerForemanProfile, projectEngineerJob);

      // Both in Madison, WI
      expect(result.breakdown.location.score).toBeGreaterThan(85);
    });

    it("should score high for remote jobs", () => {
      const remoteJob: MatchJob = {
        ...projectEngineerJob,
        workArrangement: "remote",
        location: "San Francisco, CA",
      };

      const result = calculateJobMatch(towerForemanProfile, remoteJob);

      // Remote jobs are location-flexible
      expect(result.breakdown.location.score).toBeGreaterThan(90);
    });

    it("should score well when job is in preferred location", () => {
      const milwaukeeJob: MatchJob = {
        ...projectEngineerJob,
        location: "Milwaukee, WI",
      };

      const result = calculateJobMatch(towerForemanProfile, milwaukeeJob);

      // Milwaukee is in preferred locations
      expect(result.breakdown.location.score).toBeGreaterThan(85);
    });

    it("should score moderately for same state", () => {
      const greenBayJob: MatchJob = {
        ...projectEngineerJob,
        location: "Green Bay, WI",
      };

      const result = calculateJobMatch(towerForemanProfile, greenBayJob);

      // Same state but not preferred city
      expect(result.breakdown.location.score).toBeGreaterThan(50);
      expect(result.breakdown.location.score).toBeLessThan(90);
    });

    it("should handle relocation willingness", () => {
      const relocatingProfile: MatchProfile = {
        ...towerForemanProfile,
        willingToRelocate: true,
      };

      const distantJob: MatchJob = {
        ...projectEngineerJob,
        location: "Denver, CO",
      };

      const result = calculateJobMatch(relocatingProfile, distantJob);

      // Willing to relocate helps
      expect(result.breakdown.location.score).toBeGreaterThan(60);
    });

    it("should create hard failure for relocation conflicts", () => {
      const unwillingProfile: MatchProfile = {
        ...towerForemanProfile,
        location: "Madison, WI",
        preferredLocations: ["Madison, WI", "Milwaukee, WI"],
        willingToRelocate: false,
      };

      const distantOnsiteJob: MatchJob = {
        ...projectEngineerJob,
        location: "Denver, CO", // Different state
        workArrangement: "onsite",
      };

      const result = calculateJobMatch(unwillingProfile, distantOnsiteJob);

      // Should detect relocation conflict
      expect(result.hardFailures.some((f) => f.code === "relocation_conflict")).toBe(true);
    });
  });

  describe("Score Boundaries", () => {
    it("should never return score below 0", () => {
      const result = calculateJobMatch(entryLevelProfile, seniorManagerJob);

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.qualificationScore).toBeGreaterThanOrEqual(0);
      expect(result.lifestyleScore).toBeGreaterThanOrEqual(0);

      Object.values(result.breakdown).forEach((component) => {
        expect(component.score).toBeGreaterThanOrEqual(0);
      });
    });

    it("should never return score above 100", () => {
      const perfectProfile: MatchProfile = {
        ...towerForemanProfile,
        skills: [
          ...towerForemanProfile.skills.map((s) => ({
            ...s,
            proficiency: "expert" as const,
          })),
        ],
        yearsExperience: 10,
      };

      const result = calculateJobMatch(perfectProfile, projectEngineerJob);

      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.qualificationScore).toBeLessThanOrEqual(100);
      expect(result.lifestyleScore).toBeLessThanOrEqual(100);

      Object.values(result.breakdown).forEach((component) => {
        expect(component.score).toBeLessThanOrEqual(100);
      });
    });

    it("should round scores to integers", () => {
      const result = calculateJobMatch(towerForemanProfile, projectEngineerJob);

      expect(result.overallScore! % 1).toBe(0);
      expect(result.qualificationScore! % 1).toBe(0);
      expect(result.lifestyleScore! % 1).toBe(0);
    });
  });

  describe("Hard Failure Score Cap", () => {
    it("should cap score when hard failures exist", () => {
      const profileWithHardFailures: MatchProfile = {
        ...towerForemanProfile,
        salaryMin: 150000, // Will create hard failure
        workPreferences: {
          remote: true,
          hybrid: false,
          onsite: false,
          fullTime: true,
          partTime: false,
          contract: false,
        },
      };

      const result = calculateJobMatch(profileWithHardFailures, onsiteOnlyJob);

      expect(result.hardFailures.length).toBeGreaterThan(0);
      expect(result.overallScore).toBeLessThanOrEqual(HARD_FAILURE_SCORE_CAP);
    });
  });

  describe("Determinism", () => {
    it("should return identical results for identical inputs", () => {
      const result1 = calculateJobMatch(towerForemanProfile, projectEngineerJob);
      const result2 = calculateJobMatch(towerForemanProfile, projectEngineerJob);

      expect(result1.overallScore).toBe(result2.overallScore);
      expect(result1.qualificationScore).toBe(result2.qualificationScore);
      expect(result1.lifestyleScore).toBe(result2.lifestyleScore);
      expect(result1.matchedSkills).toEqual(result2.matchedSkills);
      expect(result1.missingSkills).toEqual(result2.missingSkills);
      expect(result1.hardFailures).toEqual(result2.hardFailures);
    });

    it("should not mutate input objects", () => {
      const profileCopy = JSON.parse(JSON.stringify(towerForemanProfile));
      const jobCopy = JSON.parse(JSON.stringify(projectEngineerJob));

      calculateJobMatch(towerForemanProfile, projectEngineerJob);

      expect(towerForemanProfile).toEqual(profileCopy);
      expect(projectEngineerJob).toEqual(jobCopy);
    });
  });

  describe("Match Quality Differentiation", () => {
    it("should score excellent matches significantly higher than poor matches", () => {
      const excellentResult = calculateJobMatch(towerForemanProfile, projectEngineerJob);

      const poorProfile: MatchProfile = {
        ...towerForemanProfile,
        currentRole: "Chef",
        skills: [
          { name: "Cooking", proficiency: "expert" },
          { name: "Food Safety", proficiency: "strong" },
        ],
        targetRoles: ["Executive Chef", "Restaurant Manager"],
        yearsExperience: 2,
        salaryMin: 45000,
      };

      const poorResult = calculateJobMatch(poorProfile, projectEngineerJob);

      expect(excellentResult.overallScore!).toBeGreaterThan(poorResult.overallScore! + 20);
    });
  });

  describe("Reason Generation", () => {
    it("should generate fit reasons for good matches", () => {
      const result = calculateJobMatch(towerForemanProfile, projectEngineerJob);

      expect(result.reasonsFit.length).toBeGreaterThan(0);
      expect(result.reasonsFit.length).toBeLessThanOrEqual(4);
    });

    it("should generate concern reasons for issues", () => {
      const result = calculateJobMatch(entryLevelProfile, seniorManagerJob);

      expect(result.reasonsConcern.length).toBeGreaterThan(0);
      expect(result.reasonsConcern.length).toBeLessThanOrEqual(3);
    });

    it("should prioritize hard failures in concerns", () => {
      const profileWithFailure: MatchProfile = {
        ...towerForemanProfile,
        salaryMin: 150000,
      };

      const result = calculateJobMatch(profileWithFailure, projectEngineerJob);

      if (result.hardFailures.length > 0) {
        expect(result.reasonsConcern.length).toBeGreaterThan(0);
        // First concern should be about hard failure
        expect(result.reasonsConcern[0].priority).toBe(100);
      }
    });

    it("should not have duplicate reasons", () => {
      const result = calculateJobMatch(towerForemanProfile, projectEngineerJob);

      const allReasons = [
        ...result.reasonsFit.map((r) => r.text),
        ...result.reasonsConcern.map((r) => r.text),
      ];

      const uniqueReasons = new Set(allReasons);

      expect(allReasons.length).toBe(uniqueReasons.size);
    });
  });

  describe("Case Normalization", () => {
    it("should match skills regardless of case", () => {
      const upperCaseProfile: MatchProfile = {
        ...towerForemanProfile,
        skills: [
          { name: "PROJECT MANAGEMENT", proficiency: "strong" },
          { name: "LEADERSHIP", proficiency: "expert" },
        ],
      };

      const lowerCaseJob: MatchJob = {
        ...projectEngineerJob,
        requirements: ["project management experience", "leadership skills"],
      };

      const result = calculateJobMatch(upperCaseProfile, lowerCaseJob);

      expect(result.matchedSkills.length).toBeGreaterThan(0);
    });
  });

  describe("User Priorities", () => {
    it("should affect score when priorities differ for measurable dimensions", () => {
      // Create job with weaker salary match to differentiate priority impact
      const moderateSalaryJob: MatchJob = {
        ...projectEngineerJob,
        salaryMin: 60000,
        salaryMax: 75000, // Below ideal, will score around 70
      };

      const highSalaryPriorityProfile: MatchProfile = {
        ...towerForemanProfile,
        priorities: {
          salary: 10, // High salary priority
          workLifeBalance: 1,
          careerGrowth: 1,
          location: 1,
          remoteFlexibility: 1,
          culture: 1,
          stability: 1,
          benefits: 1,
          mission: 1,
          learning: 1,
        },
      };

      const lowSalaryPriorityProfile: MatchProfile = {
        ...towerForemanProfile,
        priorities: {
          salary: 1, // Low salary priority
          workLifeBalance: 1,
          careerGrowth: 10, // High career growth priority
          location: 10,
          remoteFlexibility: 10,
          culture: 1,
          stability: 1,
          benefits: 1,
          mission: 1,
          learning: 10,
        },
      };

      const highSalaryResult = calculateJobMatch(highSalaryPriorityProfile, moderateSalaryJob);
      const lowSalaryResult = calculateJobMatch(lowSalaryPriorityProfile, moderateSalaryJob);

      // Different priorities should affect userPriorities score
      // High salary priority with mediocre salary match should score lower
      expect(highSalaryResult.breakdown.userPriorities.score).not.toBe(
        lowSalaryResult.breakdown.userPriorities.score
      );
    });

    it("should use only measurable priority dimensions", () => {
      const result = calculateJobMatch(towerForemanProfile, projectEngineerJob);

      const usedPriorities = result.breakdown.userPriorities.metadata?.usedPriorities as
        | string[]
        | undefined;
      const unsupportedPriorities = result.breakdown.userPriorities.metadata
        ?.unsupportedPriorities as string[] | undefined;

      // Should identify which priorities are measurable vs not
      expect(usedPriorities).toBeDefined();
      expect(unsupportedPriorities).toBeDefined();

      // Unsupported should include non-measurable dimensions
      expect(unsupportedPriorities).toContain("culture");
      expect(unsupportedPriorities).toContain("mission");
    });
  });
});
