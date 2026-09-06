/**
 * Generate actual Tower Foreman → Project Engineer MatchResult
 * This script uses the real test fixtures to show the actual output
 * from the committed matching engine code.
 */

import { calculateJobMatch } from "../lib/matching/calculate-job-match";
import type { MatchProfile, MatchJob } from "../lib/matching/types";

// Tower Foreman profile from test fixtures
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
    location: 7,
    remoteFlexibility: 5,
    careerGrowth: 9,
    learning: 8,
    culture: 6,
    mission: 5,
    benefits: 6,
    stability: 7,
    workLifeBalance: 6,
  },
  seniority: "mid",
};

// Project Engineer job from test fixtures
const projectEngineerJob: MatchJob = {
  id: "job-pe-001",
  title: "Project Engineer",
  company: "BuildCo",
  location: "Milwaukee, WI",
  description:
    "We're seeking a Project Engineer to coordinate telecommunications construction projects",
  salaryMin: 80000,
  salaryMax: 95000,
  workArrangement: "hybrid",
  employmentType: "full-time",
  requirements: [
    "3+ years field construction experience",
    "Strong leadership and team coordination skills",
    "Experience with telecommunications or infrastructure projects",
    "Proficiency in project documentation and scheduling",
    "Safety management experience",
  ],
  seniority: "mid",
};

// Generate the actual match result
const result = calculateJobMatch(towerForemanProfile, projectEngineerJob);

// Output the result as formatted JSON
console.log(JSON.stringify(result, null, 2));
