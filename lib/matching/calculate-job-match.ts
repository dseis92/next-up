/**
 * NextUp Deterministic Matching Engine - Main Calculator
 *
 * This is the core matching engine that calculates how well a job matches a user's profile.
 *
 * CORE PRINCIPLES:
 * - Pure function: same inputs always produce same outputs
 * - No AI, no embeddings, no randomness
 * - No network calls, no database queries
 * - Deterministic and testable
 * - Explainable results
 *
 * The engine returns structured data that can be used by:
 * - Job discovery UI
 * - Job detail pages
 * - Applications tracking
 * - Future AI explanation layers
 */

import type {
  MatchProfile,
  MatchJob,
  MatchResult,
  ComponentScore,
  HardFailure,
  MatchReason,
  SeniorityLevel,
  ExperienceRequirement,
  TransferableRole,
} from "./types";
import {
  COMPONENT_WEIGHTS,
  QUALIFICATION_COMPONENTS,
  LIFESTYLE_COMPONENTS,
  HARD_FAILURE_SCORE_CAP,
  SKILL_WEIGHTS,
  EXPERIENCE_WEIGHTS,
  SENIORITY_WEIGHTS,
  SALARY_WEIGHTS,
  WORK_ARRANGEMENT_WEIGHTS,
  LOCATION_WEIGHTS,
  CAREER_GOALS_WEIGHTS,
  MINIMUM_PROFILE_REQUIREMENTS,
  NORMALIZATION,
} from "./weights";
import {
  normalizeSkillList,
  findMatchingSkills,
  findMissingSkills,
  extractSkillsFromText,
} from "./skill-aliases";
import {
  generateFitReasons as centralizedFitReasons,
  generateConcernReasons as centralizedConcernReasons,
} from "./reasons";

/**
 * Main entry point: Calculate how well a job matches a user profile
 */
export function calculateJobMatch(
  profile: MatchProfile,
  job: MatchJob
): MatchResult {
  // Check if profile is complete enough to score
  const profileCheck = checkProfileCompleteness(profile);
  if (!profileCheck.isComplete) {
    return {
      status: "incomplete_profile",
      overallScore: null,
      qualificationScore: null,
      lifestyleScore: null,
      breakdown: createEmptyBreakdown(),
      matchedSkills: [],
      missingSkills: [],
      hardFailures: [],
      reasonsFit: [],
      reasonsConcern: [],
      missingProfileFields: profileCheck.missingFields,
    };
  }

  // Calculate all component scores (except user priorities which needs breakdown)
  const skillsScore = calculateSkillsScore(profile, job);
  const experienceScore = calculateExperienceScore(profile, job);
  const seniorityScore = calculateSeniorityScore(profile, job);
  const salaryScore = calculateSalaryScore(profile, job);
  const workArrangementScore = calculateWorkArrangementScore(profile, job);
  const locationScore = calculateLocationScore(profile, job);
  const careerGoalsScore = calculateCareerGoalsScore(profile, job);

  // Create partial breakdown for user priorities calculation
  const partialBreakdown = {
    skills: skillsScore,
    experience: experienceScore,
    seniority: seniorityScore,
    salary: salaryScore,
    workArrangement: workArrangementScore,
    location: locationScore,
    careerGoals: careerGoalsScore,
    userPriorities: { score: 0, weight: COMPONENT_WEIGHTS.userPriorities, confidence: "low" as const },
  };

  // Calculate user priorities with component scores
  const userPrioritiesScore = calculateUserPrioritiesScore(profile, job, partialBreakdown);

  // Create final breakdown
  const breakdown = {
    ...partialBreakdown,
    userPriorities: userPrioritiesScore,
  };

  // Detect hard failures
  const hardFailures = detectHardFailures(profile, job, breakdown);

  // Calculate qualification and lifestyle scores
  const qualificationScore = calculateQualificationScore(breakdown);
  const lifestyleScore = calculateLifestyleScore(breakdown);

  // Calculate overall score
  let overallScore = calculateOverallScore(breakdown);

  // Apply hard failure cap if needed
  if (hardFailures.length > 0 && overallScore > HARD_FAILURE_SCORE_CAP) {
    overallScore = HARD_FAILURE_SCORE_CAP;
  }

  // Generate reasons using centralized reason generation
  const matched = skillsScore.metadata?.matched as string[] || [];
  const missing = skillsScore.metadata?.missing as string[] || [];

  const reasonsFit = centralizedFitReasons(matched, breakdown, job);
  const reasonsConcern = centralizedConcernReasons(missing, breakdown, hardFailures);

  return {
    status: "scored",
    overallScore: normalizeScore(overallScore),
    qualificationScore: normalizeScore(qualificationScore),
    lifestyleScore: normalizeScore(lifestyleScore),
    breakdown,
    matchedSkills: skillsScore.metadata?.matched as string[] || [],
    missingSkills: skillsScore.metadata?.missing as string[] || [],
    hardFailures,
    reasonsFit,
    reasonsConcern,
  };
}

/**
 * Check if profile has minimum required data for scoring
 */
function checkProfileCompleteness(profile: MatchProfile): {
  isComplete: boolean;
  missingFields: string[];
} {
  const missing: string[] = [];

  // Experience indicator
  if (MINIMUM_PROFILE_REQUIREMENTS.requireExperienceIndicator) {
    const hasExperience =
      (profile.yearsExperience !== undefined && profile.yearsExperience >= 0) ||
      (profile.experiences && profile.experiences.length > 0);

    if (!hasExperience) {
      missing.push("experience");
    }
  }

  // Minimum skills
  const skillCount = profile.skills?.length || 0;
  if (skillCount < MINIMUM_PROFILE_REQUIREMENTS.minSkills) {
    missing.push("skills");
  }

  // Career direction
  if (MINIMUM_PROFILE_REQUIREMENTS.requireCareerDirection) {
    const hasDirection =
      (profile.targetRoles && profile.targetRoles.length > 0) ||
      (profile.goals && profile.goals.length > 0);

    if (!hasDirection) {
      missing.push("career_goals");
    }
  }

  // Work preference
  if (MINIMUM_PROFILE_REQUIREMENTS.requireWorkPreference) {
    const hasWorkPref =
      profile.workPreferences &&
      (profile.workPreferences.remote ||
        profile.workPreferences.hybrid ||
        profile.workPreferences.onsite);

    if (!hasWorkPref) {
      missing.push("work_preferences");
    }
  }

  return {
    isComplete: missing.length === 0,
    missingFields: missing,
  };
}

/**
 * Calculate skills component score
 */
function calculateSkillsScore(
  profile: MatchProfile,
  job: MatchJob
): ComponentScore {
  const userSkillNames = profile.skills.map((s) => s.name);

  // Extract skills from job requirements
  let jobSkills: string[] = [];

  if (job.requirements) {
    for (const req of job.requirements) {
      jobSkills.push(...extractSkillsFromText(req));
    }
  }

  // Also extract from description
  jobSkills.push(...extractSkillsFromText(job.description));

  // Deduplicate
  jobSkills = normalizeSkillList(jobSkills);

  // Find matches and missing
  const matched = findMatchingSkills(userSkillNames, jobSkills);
  const missing = findMissingSkills(userSkillNames, jobSkills);

  // Calculate score
  let score = 0;
  const totalJobSkills = jobSkills.length;

  if (totalJobSkills === 0) {
    // No specific skills identified - use neutral score with low confidence
    score = 60;
    return {
      score,
      weight: COMPONENT_WEIGHTS.skills,
      confidence: "low",
      metadata: { matched: [], missing: [], totalJobSkills: 0 },
    };
  }

  // Base score from match ratio
  const matchRatio = matched.length / totalJobSkills;
  score = matchRatio * 100;

  // Apply penalty for missing skills (up to max)
  const missingCount = Math.min(
    missing.length,
    SKILL_WEIGHTS.maxMissingSkillsPenalized
  );
  const penalty = missingCount * SKILL_WEIGHTS.missingSkillPenalty;
  score = Math.max(0, score - penalty);

  // Apply proficiency weighting for matched skills
  let proficiencyBonus = 0;
  for (const matchedSkill of matched) {
    const userSkill = profile.skills.find((s) =>
      normalizeSkillList([s.name]).includes(matchedSkill)
    );
    if (userSkill) {
      const multiplier = SKILL_WEIGHTS.proficiencyMultiplier[userSkill.proficiency];
      proficiencyBonus += (multiplier - 0.5) * 5; // Up to +2.5 per skill for expert
    }
  }

  score = Math.min(100, score + proficiencyBonus);

  return {
    score: Math.max(0, score),
    weight: COMPONENT_WEIGHTS.skills,
    confidence: totalJobSkills >= 3 ? "high" : "medium",
    metadata: {
      matched,
      missing,
      totalJobSkills,
      matchRatio,
    },
  };
}

/**
 * Parse years of experience from requirement text
 */
function parseExperienceRequirement(text: string): ExperienceRequirement | null {
  if (!text) return null;

  // Patterns like "3+ years", "3-5 years", "minimum 5 years", "at least 2 years"
  // IMPORTANT: Order matters - check more specific patterns before generic ones
  const patterns = [
    /(\d+)\s*-\s*(\d+)\s*years?/i, // "3-5 years" - must come before generic
    /minimum\s+(\d+)\s*years?/i, // "minimum 5 years"
    /at\s+least\s+(\d+)\s*years?/i, // "at least 2 years"
    /(\d+)\+\s*years?/i, // "3+ years" - explicit plus
    /(\d+)\s+years?/i, // "3 years" - generic, must be last
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const minYears = parseInt(match[1], 10);
      const maxYears = match[2] ? parseInt(match[2], 10) : undefined;

      return {
        minYears,
        maxYears,
        confidence: "high",
      };
    }
  }

  return null;
}

/**
 * Calculate experience component score
 * Incorporates transferable role relevance as a qualification factor
 */
function calculateExperienceScore(
  profile: MatchProfile,
  job: MatchJob
): ComponentScore {
  const userYears = profile.yearsExperience || 0;

  // Try to parse required years from job requirements
  let requiredYears: ExperienceRequirement | null = null;

  if (job.requirements) {
    for (const req of job.requirements) {
      const parsed = parseExperienceRequirement(req);
      if (parsed) {
        requiredYears = parsed;
        break;
      }
    }
  }

  // If we couldn't parse years, use experience level as proxy
  if (!requiredYears && job.experienceLevel) {
    const levelYears = seniorityToYearsEstimate(job.experienceLevel);
    requiredYears = {
      minYears: levelYears,
      confidence: "medium",
    };
  }

  // Calculate base score from years
  let baseScore = 70; // Default neutral score
  let confidence: "high" | "medium" | "low" = "medium";

  if (requiredYears) {
    confidence = requiredYears.confidence;

    if (userYears >= requiredYears.minYears) {
      // Meets or exceeds requirement
      baseScore = 100 * EXPERIENCE_WEIGHTS.perfectMatchYears;
    } else {
      // Below requirement
      const yearsDifference = requiredYears.minYears - userYears;
      const penalizedYears = Math.min(
        yearsDifference,
        EXPERIENCE_WEIGHTS.maxYearsPenalty
      );

      baseScore =
        100 *
        EXPERIENCE_WEIGHTS.partialMatchYears *
        (1 - penalizedYears * EXPERIENCE_WEIGHTS.underQualifiedPenalty);
    }
  }

  // Check for transferable role relevance
  let transferabilityBonus = 0;
  let isTransferable = false;
  let transferPath: TransferableRole | null = null;

  if (profile.currentRole) {
    // Check if user's current role transfers to this job title
    transferPath = findTransferableMatch(profile.currentRole, job.title);

    if (transferPath) {
      isTransferable = true;
      // Apply transferability credit as a bonus to base score
      // This recognizes that transferable field experience is valuable
      // even if not exact-match experience
      transferabilityBonus =
        (100 - baseScore) *
        transferPath.transferabilityScore *
        EXPERIENCE_WEIGHTS.transferableExperienceCredit;
    }
  }

  const finalScore = Math.max(0, Math.min(100, baseScore + transferabilityBonus));

  return {
    score: finalScore,
    weight: COMPONENT_WEIGHTS.experience,
    confidence,
    metadata: {
      userYears,
      requiredYears: requiredYears?.minYears,
      isTransferable,
      transferabilityBonus: isTransferable ? Math.round(transferabilityBonus) : undefined,
    },
  };
}

/**
 * Normalize seniority level from various inputs
 */
function normalizeSeniority(input: string): SeniorityLevel | null {
  const normalized = input.toLowerCase().trim();

  // Direct matches
  const seniorityMap: Record<string, SeniorityLevel> = {
    entry: "entry",
    junior: "junior",
    mid: "mid",
    "mid-level": "mid",
    senior: "senior",
    lead: "lead",
    supervisor: "supervisor",
    foreman: "supervisor",
    manager: "manager",
    director: "director",
    executive: "executive",
  };

  if (seniorityMap[normalized]) {
    return seniorityMap[normalized];
  }

  // Title-based inference
  if (normalized.includes("director")) return "director";
  if (normalized.includes("executive") || normalized.includes("vp")) return "executive";
  if (normalized.includes("manager")) return "manager";
  if (normalized.includes("lead") || normalized.includes("principal")) return "lead";
  if (normalized.includes("senior") || normalized.includes("sr")) return "senior";
  if (normalized.includes("foreman") || normalized.includes("supervisor")) return "supervisor";
  if (normalized.includes("junior") || normalized.includes("jr")) return "junior";
  if (
    normalized.includes("entry") ||
    normalized.includes("associate") ||
    normalized.includes("assistant")
  ) {
    return "entry";
  }

  // Default to mid for ambiguous cases
  return "mid";
}

/**
 * Get numeric level for seniority (for comparison)
 */
function getSeniorityLevel(seniority: SeniorityLevel): number {
  const levels: Record<SeniorityLevel, number> = {
    entry: 1,
    junior: 2,
    mid: 3,
    senior: 4,
    lead: 5,
    supervisor: 5,
    manager: 6,
    director: 7,
    executive: 8,
  };

  return levels[seniority];
}

/**
 * Estimate years of experience from seniority level
 */
function seniorityToYearsEstimate(level: string): number {
  const estimates: Record<string, number> = {
    entry: 0,
    junior: 1,
    mid: 3,
    senior: 6,
    lead: 8,
    supervisor: 5,
    manager: 8,
    director: 12,
    executive: 15,
  };

  return estimates[level] || 3;
}

/**
 * Calculate seniority component score
 */
function calculateSeniorityScore(
  profile: MatchProfile,
  job: MatchJob
): ComponentScore {
  // Normalize user seniority from current role
  const userSeniority = profile.currentRole
    ? normalizeSeniority(profile.currentRole)
    : null;

  // Normalize job seniority from experience level or title
  const jobSeniority =
    (job.experienceLevel && normalizeSeniority(job.experienceLevel)) ||
    normalizeSeniority(job.title);

  if (!userSeniority || !jobSeniority) {
    // Unknown seniority - neutral score
    return {
      score: SENIORITY_WEIGHTS.unknownSeniority * 100,
      weight: COMPONENT_WEIGHTS.seniority,
      confidence: "low",
      metadata: {
        userSeniority,
        jobSeniority,
      },
    };
  }

  const userLevel = getSeniorityLevel(userSeniority);
  const jobLevel = getSeniorityLevel(jobSeniority);
  const levelDifference = Math.abs(userLevel - jobLevel);

  let multiplier: number = SENIORITY_WEIGHTS.unknownSeniority;

  if (levelDifference === 0) {
    multiplier = SENIORITY_WEIGHTS.exactMatch;
  } else if (levelDifference === 1) {
    multiplier = SENIORITY_WEIGHTS.adjacentMatch;
  } else if (levelDifference === 2) {
    multiplier = SENIORITY_WEIGHTS.twoLevelsApart;
  } else {
    multiplier = SENIORITY_WEIGHTS.majorGap;
  }

  return {
    score: multiplier * 100,
    weight: COMPONENT_WEIGHTS.seniority,
    confidence: "high",
    metadata: {
      userSeniority,
      jobSeniority,
      levelDifference,
    },
  };
}

/**
 * Normalize salary to yearly amount
 */
function normalizeToYearly(amount: number, period?: string): number {
  if (!period || period === "yearly") {
    return amount;
  }

  if (period === "hourly") {
    return amount * SALARY_WEIGHTS.hoursPerYear;
  }

  return amount; // Default to treating as yearly
}

/**
 * Calculate salary component score
 */
function calculateSalaryScore(
  profile: MatchProfile,
  job: MatchJob
): ComponentScore {
  const userMin = profile.salaryMin;
  const userIdeal = profile.salaryIdeal;

  if (!userMin) {
    // No salary preference - neutral score
    return {
      score: SALARY_WEIGHTS.unknownSalary * 100,
      weight: COMPONENT_WEIGHTS.salary,
      confidence: "low",
      metadata: {},
    };
  }

  if (!job.salaryMin || !job.salaryMax) {
    // Job salary unknown - neutral score
    return {
      score: SALARY_WEIGHTS.unknownSalary * 100,
      weight: COMPONENT_WEIGHTS.salary,
      confidence: "low",
      metadata: {},
    };
  }

  // Normalize to yearly
  const jobMinYearly = normalizeToYearly(job.salaryMin, job.salaryPeriod);
  const jobMaxYearly = normalizeToYearly(job.salaryMax, job.salaryPeriod);

  let score = 0;
  let hardFailure = false;

  if (jobMaxYearly < userMin) {
    // Hard failure: job max below user minimum
    hardFailure = true;
    score = 0;
  } else if (jobMaxYearly >= (userIdeal || userMin)) {
    // Meets or exceeds ideal
    score = SALARY_WEIGHTS.meetsIdeal * 100;
  } else if (jobMaxYearly >= userMin) {
    // Meets minimum but below ideal
    score = SALARY_WEIGHTS.meetsMinimum * 100;
  } else if (jobMaxYearly >= userMin * 0.9) {
    // Close to minimum (within 10%)
    score = SALARY_WEIGHTS.nearMinimum * 100;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    weight: COMPONENT_WEIGHTS.salary,
    confidence: "high",
    metadata: {
      userMin,
      userIdeal,
      jobMin: jobMinYearly,
      jobMax: jobMaxYearly,
      hardFailure,
    },
  };
}

/**
 * Calculate work arrangement score
 */
function calculateWorkArrangementScore(
  profile: MatchProfile,
  job: MatchJob
): ComponentScore {
  if (!profile.workPreferences) {
    return {
      score: WORK_ARRANGEMENT_WEIGHTS.unknownArrangement * 100,
      weight: COMPONENT_WEIGHTS.workArrangement,
      confidence: "low",
      metadata: {},
    };
  }

  const prefs = profile.workPreferences;
  const jobArrangement = job.workArrangement;

  // Check if user accepts this arrangement
  const userAccepts =
    (jobArrangement === "remote" && prefs.remote) ||
    (jobArrangement === "hybrid" && prefs.hybrid) ||
    (jobArrangement === "onsite" && prefs.onsite);

  // Check if this is user's only preference (hard requirement)
  const preferencesCount =
    (prefs.remote ? 1 : 0) + (prefs.hybrid ? 1 : 0) + (prefs.onsite ? 1 : 0);

  const isOnlyPreference = preferencesCount === 1;

  let score = 0;
  let hardFailure = false;

  if (!userAccepts && isOnlyPreference) {
    // Hard conflict: user only accepts one type and this isn't it
    hardFailure = true;
    score = 0;
  } else if (userAccepts) {
    // User explicitly accepts this arrangement
    // All accepted arrangements are treated equally unless priorities indicate otherwise
    score = WORK_ARRANGEMENT_WEIGHTS.perfectMatch * 100;
  } else {
    // User didn't explicitly accept or reject
    score = WORK_ARRANGEMENT_WEIGHTS.notPreferred * 100;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    weight: COMPONENT_WEIGHTS.workArrangement,
    confidence: "high",
    metadata: {
      jobArrangement,
      userAccepts,
      hardFailure,
      preferencesCount,
    },
  };
}

/**
 * Normalize location string for comparison
 */
function normalizeLocation(location: string): string {
  return location.toLowerCase().trim().replace(/[,\s]+/g, " ");
}

/**
 * Check if two locations match (same city or state)
 */
function locationsMatch(loc1: string, loc2: string): boolean {
  const norm1 = normalizeLocation(loc1);
  const norm2 = normalizeLocation(loc2);

  // Exact match
  if (norm1 === norm2) return true;

  // Check if one contains the other (e.g., "Madison, WI" contains "Madison")
  if (norm1.includes(norm2) || norm2.includes(norm1)) return true;

  return false;
}

/**
 * Extract state from location string (simple heuristic)
 */
function extractState(location: string): string | null {
  // Look for two-letter state code at end
  const match = location.match(/\b([A-Z]{2})\b$/);
  return match ? match[1] : null;
}

/**
 * Check if locations are in same state
 */
function sameState(loc1: string, loc2: string): boolean {
  const state1 = extractState(loc1);
  const state2 = extractState(loc2);

  return state1 !== null && state2 !== null && state1 === state2;
}

/**
 * Calculate location component score
 */
function calculateLocationScore(
  profile: MatchProfile,
  job: MatchJob
): ComponentScore {
  // Remote jobs are generally location-compatible
  if (job.workArrangement === "remote") {
    return {
      score: LOCATION_WEIGHTS.remoteJob * 100,
      weight: COMPONENT_WEIGHTS.location,
      confidence: "high",
      metadata: { reason: "remote_job" },
    };
  }

  const jobLocation = job.location;

  if (!jobLocation) {
    return {
      score: LOCATION_WEIGHTS.unknownLocation * 100,
      weight: COMPONENT_WEIGHTS.location,
      confidence: "low",
      metadata: {},
    };
  }

  // Check against user's current location
  if (profile.location && locationsMatch(profile.location, jobLocation)) {
    return {
      score: LOCATION_WEIGHTS.exactLocationMatch * 100,
      weight: COMPONENT_WEIGHTS.location,
      confidence: "high",
      metadata: { reason: "exact_match" },
    };
  }

  // Check against preferred locations
  for (const preferredLoc of profile.preferredLocations) {
    if (locationsMatch(preferredLoc, jobLocation)) {
      return {
        score: LOCATION_WEIGHTS.exactLocationMatch * 100,
        weight: COMPONENT_WEIGHTS.location,
        confidence: "high",
        metadata: { reason: "preferred_location" },
      };
    }
  }

  // Check same state
  if (profile.location && sameState(profile.location, jobLocation)) {
    return {
      score: LOCATION_WEIGHTS.sameState * 100,
      weight: COMPONENT_WEIGHTS.location,
      confidence: "medium",
      metadata: { reason: "same_state" },
    };
  }

  // Check if willing to relocate
  if (profile.willingToRelocate) {
    return {
      score: LOCATION_WEIGHTS.willingToRelocate * 100,
      weight: COMPONENT_WEIGHTS.location,
      confidence: "medium",
      metadata: { reason: "willing_to_relocate" },
    };
  }

  // Incompatible location
  return {
    score: LOCATION_WEIGHTS.incompatibleLocation * 100,
    weight: COMPONENT_WEIGHTS.location,
    confidence: "high",
    metadata: { reason: "incompatible_location" },
  };
}

/**
 * Transferable role mappings
 * Defines which roles can transfer to which targets with what strength
 */
const TRANSFERABLE_ROLES: TransferableRole[] = [
  // Tower/field foreman → Project Engineer
  {
    fromRole: "tower foreman",
    toRole: "project engineer",
    transferabilityScore: 0.8,
    sharedDimensions: [
      "crew leadership",
      "field operations",
      "safety",
      "project documentation",
      "coordination",
    ],
  },
  {
    fromRole: "foreman",
    toRole: "project engineer",
    transferabilityScore: 0.75,
    sharedDimensions: [
      "crew management",
      "field coordination",
      "construction",
      "safety",
    ],
  },

  // Field supervisor → Assistant Project Manager
  {
    fromRole: "field supervisor",
    toRole: "assistant project manager",
    transferabilityScore: 0.8,
    sharedDimensions: [
      "supervision",
      "field operations",
      "coordination",
      "scheduling",
      "documentation",
    ],
  },
  {
    fromRole: "field supervisor",
    toRole: "project coordinator",
    transferabilityScore: 0.75,
    sharedDimensions: [
      "coordination",
      "field operations",
      "documentation",
      "scheduling",
    ],
  },

  // Crew lead → Operations Manager
  {
    fromRole: "crew lead",
    toRole: "operations manager",
    transferabilityScore: 0.7,
    sharedDimensions: [
      "crew leadership",
      "operations",
      "coordination",
      "scheduling",
    ],
  },
  {
    fromRole: "crew lead",
    toRole: "field operations manager",
    transferabilityScore: 0.75,
    sharedDimensions: [
      "field operations",
      "crew management",
      "coordination",
    ],
  },
];

/**
 * Normalize role for transferability matching
 */
function normalizeRole(role: string): string {
  return role.toLowerCase().trim();
}

/**
 * Find transferable role match
 */
function findTransferableMatch(
  fromRole: string,
  toRole: string
): TransferableRole | null {
  const normalizedFrom = normalizeRole(fromRole);
  const normalizedTo = normalizeRole(toRole);

  for (const mapping of TRANSFERABLE_ROLES) {
    if (
      normalizeRole(mapping.fromRole) === normalizedFrom &&
      normalizeRole(mapping.toRole) === normalizedTo
    ) {
      return mapping;
    }
  }

  return null;
}

/**
 * Calculate career goals component score
 */
function calculateCareerGoalsScore(
  profile: MatchProfile,
  job: MatchJob
): ComponentScore {
  if (!profile.targetRoles || profile.targetRoles.length === 0) {
    return {
      score: CAREER_GOALS_WEIGHTS.unknownGoals * 100,
      weight: COMPONENT_WEIGHTS.careerGoals,
      confidence: "low",
      metadata: {},
    };
  }

  const jobTitle = normalizeRole(job.title);
  let bestScore = 0;
  let matchType: "exact" | "transferable" | "none" = "none";

  // Check for exact target role match
  for (const targetRole of profile.targetRoles) {
    if (normalizeRole(targetRole) === jobTitle) {
      bestScore = CAREER_GOALS_WEIGHTS.exactTargetMatch * 100;
      matchType = "exact";
      break;
    }
  }

  // Check for transferable match
  if (matchType === "none" && profile.currentRole) {
    for (const targetRole of profile.targetRoles) {
      const transferable = findTransferableMatch(profile.currentRole, targetRole);
      if (transferable) {
        // Check if job title matches the target
        if (normalizeRole(targetRole) === jobTitle) {
          bestScore = CAREER_GOALS_WEIGHTS.transferableTargetMatch * 100;
          matchType = "transferable";
          break;
        }
      }
    }

    // Also check if job is a defined transferable next step from current role
    if (matchType === "none") {
      const directTransfer = findTransferableMatch(profile.currentRole, job.title);
      if (directTransfer) {
        bestScore =
          CAREER_GOALS_WEIGHTS.transferableTargetMatch *
          directTransfer.transferabilityScore *
          100;
        matchType = "transferable";
      }
    }
  }

  // Industry alignment bonus
  if (profile.industry && job.company.industry) {
    const sameIndustry =
      normalizeRole(profile.industry) === normalizeRole(job.company.industry);
    if (sameIndustry && bestScore > 0) {
      bestScore += CAREER_GOALS_WEIGHTS.industryAlignment * 100;
    }
  }

  // Default if no match
  if (bestScore === 0) {
    bestScore = CAREER_GOALS_WEIGHTS.noAlignment * 100;
  }

  return {
    score: Math.min(100, bestScore),
    weight: COMPONENT_WEIGHTS.careerGoals,
    confidence: matchType !== "none" ? "high" : "medium",
    metadata: {
      matchType,
    },
  };
}

/**
 * Calculate user priorities score
 * Weights component compatibility by what user values most
 * Only uses priorities with measurable job-match evidence
 */
function calculateUserPrioritiesScore(
  profile: MatchProfile,
  _job: MatchJob,
  breakdown?: MatchResult["breakdown"]
): ComponentScore {
  if (!profile.priorities || !breakdown) {
    return {
      score: 60, // Neutral when no priorities or no breakdown available
      weight: COMPONENT_WEIGHTS.userPriorities,
      confidence: "low",
      metadata: {},
    };
  }

  const priorities = profile.priorities;

  // Map priority dimensions to measurable components
  // Only include dimensions where we have actual job-match evidence
  const measurablePriorities: Array<{
    dimension: string;
    priorityValue: number;
    componentScore: number;
  }> = [];

  // Salary priority → salary component
  if (breakdown.salary && priorities.salary > 0) {
    measurablePriorities.push({
      dimension: "salary",
      priorityValue: priorities.salary,
      componentScore: breakdown.salary.score,
    });
  }

  // Location priority → location component
  if (breakdown.location && priorities.location > 0) {
    measurablePriorities.push({
      dimension: "location",
      priorityValue: priorities.location,
      componentScore: breakdown.location.score,
    });
  }

  // Remote flexibility → work arrangement component
  if (breakdown.workArrangement && priorities.remoteFlexibility > 0) {
    measurablePriorities.push({
      dimension: "remoteFlexibility",
      priorityValue: priorities.remoteFlexibility,
      componentScore: breakdown.workArrangement.score,
    });
  }

  // Career growth → career goals component
  if (breakdown.careerGoals && priorities.careerGrowth > 0) {
    measurablePriorities.push({
      dimension: "careerGrowth",
      priorityValue: priorities.careerGrowth,
      componentScore: breakdown.careerGoals.score,
    });
  }

  // Learning → also maps to career goals (advancement/learning opportunity)
  if (breakdown.careerGoals && priorities.learning > 0) {
    measurablePriorities.push({
      dimension: "learning",
      priorityValue: priorities.learning,
      componentScore: breakdown.careerGoals.score,
    });
  }

  // If no measurable priorities, return neutral
  if (measurablePriorities.length === 0) {
    return {
      score: 60,
      weight: COMPONENT_WEIGHTS.userPriorities,
      confidence: "low",
      metadata: {
        usedPriorities: [],
        unsupportedPriorities: [
          "culture",
          "mission",
          "benefits",
          "stability",
          "workLifeBalance",
        ],
      },
    };
  }

  // Calculate weighted priority compatibility
  let weightedSum = 0;
  let totalWeight = 0;

  for (const priority of measurablePriorities) {
    weightedSum += priority.priorityValue * priority.componentScore;
    totalWeight += priority.priorityValue;
  }

  const score = totalWeight > 0 ? weightedSum / totalWeight : 60;

  return {
    score: Math.max(0, Math.min(100, score)),
    weight: COMPONENT_WEIGHTS.userPriorities,
    confidence: measurablePriorities.length >= 3 ? "high" : "medium",
    metadata: {
      usedPriorities: measurablePriorities.map((p) => p.dimension),
      unsupportedPriorities: [
        "culture",
        "mission",
        "benefits",
        "stability",
        "workLifeBalance",
      ],
    },
  };
}

/**
 * Create empty breakdown (for incomplete profiles)
 */
function createEmptyBreakdown() {
  return {
    skills: { score: 0, weight: COMPONENT_WEIGHTS.skills, confidence: "unknown" as const },
    experience: { score: 0, weight: COMPONENT_WEIGHTS.experience, confidence: "unknown" as const },
    seniority: { score: 0, weight: COMPONENT_WEIGHTS.seniority, confidence: "unknown" as const },
    salary: { score: 0, weight: COMPONENT_WEIGHTS.salary, confidence: "unknown" as const },
    workArrangement: { score: 0, weight: COMPONENT_WEIGHTS.workArrangement, confidence: "unknown" as const },
    location: { score: 0, weight: COMPONENT_WEIGHTS.location, confidence: "unknown" as const },
    careerGoals: { score: 0, weight: COMPONENT_WEIGHTS.careerGoals, confidence: "unknown" as const },
    userPriorities: { score: 0, weight: COMPONENT_WEIGHTS.userPriorities, confidence: "unknown" as const },
  };
}

/**
 * Calculate qualification score (average of qualification components)
 */
function calculateQualificationScore(breakdown: MatchResult["breakdown"]): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const componentName of QUALIFICATION_COMPONENTS) {
    const component = breakdown[componentName];
    weightedSum += component.score * component.weight;
    totalWeight += component.weight;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Calculate lifestyle score (average of lifestyle components)
 */
function calculateLifestyleScore(breakdown: MatchResult["breakdown"]): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const componentName of LIFESTYLE_COMPONENTS) {
    const component = breakdown[componentName];
    weightedSum += component.score * component.weight;
    totalWeight += component.weight;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Calculate overall score (weighted average of all components)
 */
function calculateOverallScore(breakdown: MatchResult["breakdown"]): number {
  let weightedSum = 0;

  for (const component of Object.values(breakdown)) {
    weightedSum += component.score * component.weight;
  }

  // Weights sum to 100, so divide by 100
  return weightedSum / 100;
}

/**
 * Detect hard failures (incompatibilities that cap the score)
 */
function detectHardFailures(
  profile: MatchProfile,
  job: MatchJob,
  breakdown: MatchResult["breakdown"]
): HardFailure[] {
  const failures: HardFailure[] = [];

  // Salary hard failure
  if (breakdown.salary.metadata?.hardFailure) {
    failures.push({
      code: "salary_below_minimum",
      severity: "hard",
      message: `Job's maximum salary falls below your minimum requirement of $${profile.salaryMin?.toLocaleString()}`,
      component: "salary",
    });
  }

  // Work arrangement hard failure
  if (breakdown.workArrangement.metadata?.hardFailure) {
    failures.push({
      code: "work_arrangement_conflict",
      severity: "hard",
      message: `This ${job.workArrangement} position conflicts with your work arrangement preferences`,
      component: "workArrangement",
    });
  }

  // Relocation hard failure
  // Conservative rule: only create failure when data makes incompatibility clear
  if (
    profile.location &&
    job.location &&
    (job.workArrangement === "onsite" || job.workArrangement === "hybrid") &&
    profile.willingToRelocate === false
  ) {
    const userState = extractState(profile.location);
    const jobState = extractState(job.location);

    // Different states AND not in preferred locations
    if (
      userState &&
      jobState &&
      userState !== jobState &&
      !profile.preferredLocations.some((loc) => locationsMatch(loc, job.location!))
    ) {
      failures.push({
        code: "relocation_conflict",
        severity: "hard",
        message: `This position requires relocation to ${job.location}, but you indicated unwillingness to relocate`,
        component: "location",
      });
    }
  }

  return failures;
}

/**
 * Normalize score to bounded integer
 */
function normalizeScore(score: number): number {
  let normalized = score;

  // Clamp to bounds
  normalized = Math.max(NORMALIZATION.minScore, normalized);
  normalized = Math.min(NORMALIZATION.maxScore, normalized);

  // Round if configured
  if (NORMALIZATION.roundToInteger) {
    normalized = Math.round(normalized);
  }

  return normalized;
}
