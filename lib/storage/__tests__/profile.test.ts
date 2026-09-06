import { describe, it, expect } from "vitest";
import { calculateProfileStrength } from "../profile";

describe("calculateProfileStrength", () => {
  it("should return 0 for empty profile", () => {
    const score = calculateProfileStrength({}, {});
    expect(score).toBe(0);
  });

  it("should award points for basic identity", () => {
    const score = calculateProfileStrength({}, { name: "John Doe" });
    expect(score).toBe(10);
  });

  it("should award points for current role", () => {
    const score = calculateProfileStrength({ currentTitle: "Engineer" }, {});
    expect(score).toBe(10);
  });

  it("should award points for skills", () => {
    const score = calculateProfileStrength(
      {
        skills: [
          { name: "JavaScript", proficiency: "expert" },
          { name: "React", proficiency: "strong" },
        ],
      },
      {}
    );
    expect(score).toBe(8); // 2 skills * 4 points each
  });

  it("should cap skills points at 20", () => {
    const skills = Array(10)
      .fill(null)
      .map((_, i) => ({
        name: `Skill ${i}`,
        proficiency: "comfortable" as const,
      }));

    const score = calculateProfileStrength({ skills }, {});
    expect(score).toBe(20); // Capped at 20
  });

  it("should calculate complete profile strength", () => {
    const score = calculateProfileStrength(
      {
        currentTitle: "Senior Engineer",
        yearsExperience: 5,
        experiences: [{ title: "Engineer", company: "Acme", startDate: "2020", endDate: "2025", current: true }],
        skills: [
          { name: "JavaScript", proficiency: "expert" },
          { name: "React", proficiency: "strong" },
        ],
        goals: ["Lead a team"],
        targetRoles: ["Engineering Manager"],
        salaryMin: 100000,
        workPreferences: {
          remote: true,
          hybrid: false,
          onsite: false,
          fullTime: true,
          partTime: false,
          contract: false,
        },
        location: "San Francisco",
      },
      { name: "John Doe", about: "Experienced engineer" }
    );

    // 10 (name) + 10 (role) + 10 (years) + 10 (experience) + 8 (skills)
    // + 10 (goals) + 10 (target roles) + 5 (salary) + 5 (work prefs)
    // + 5 (location) + 5 (about) = 88
    expect(score).toBe(88);
  });

  it("should not exceed 100", () => {
    const skills = Array(30)
      .fill(null)
      .map((_, i) => ({ name: `Skill ${i}`, proficiency: "expert" as const }));

    const score = calculateProfileStrength(
      {
        currentTitle: "Senior Engineer",
        yearsExperience: 10,
        experiences: [{ title: "Engineer", company: "Acme", startDate: "2015", endDate: "2025", current: true }],
        skills,
        goals: ["Goal 1", "Goal 2"],
        targetRoles: ["Role 1", "Role 2"],
        salaryMin: 150000,
        workPreferences: {
          remote: true,
          hybrid: false,
          onsite: false,
          fullTime: true,
          partTime: false,
          contract: false,
        },
        location: "San Francisco",
      },
      { name: "John Doe", about: "Experienced engineer" }
    );

    expect(score).toBe(100);
  });
});
