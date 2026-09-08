/**
 * NextUp Dealbreaker Engine - Pure Deterministic Evaluator
 *
 * This is a pure function that evaluates user dealbreaker preferences
 * against job data. It never modifies MatchResult or creates scores.
 *
 * Same preferences + same job = same evaluation every time.
 * No AI, no network, no randomness, no side effects.
 */

import type {
  DealbreakerPreferences,
  DealbreakerJobData,
  DealbreakerEvaluation,
  DealbreakerFinding,
  DealbreakerStatus,
} from "./types";

/**
 * Evaluate a job against user's dealbreaker preferences
 *
 * Returns a complete evaluation with status and individual findings.
 * UNKNOWN means insufficient job data, not a conflict.
 */
export function evaluateDealbreakers(
  preferences: DealbreakerPreferences,
  job: DealbreakerJobData
): DealbreakerEvaluation {
  const findings: DealbreakerFinding[] = [];

  // Evaluate each active rule
  if (preferences.minimumSalary !== undefined && preferences.minimumSalary !== null) {
    findings.push(evaluateMinimumSalary(preferences.minimumSalary, job));
  }

  if (preferences.requireSalaryDisclosure) {
    findings.push(evaluateSalaryDisclosure(job));
  }

  if (preferences.allowedWorkArrangements.length > 0) {
    findings.push(evaluateWorkArrangement(preferences.allowedWorkArrangements, job));
  }

  if (preferences.allowedEmploymentTypes.length > 0) {
    findings.push(evaluateEmploymentType(preferences.allowedEmploymentTypes, job));
  }

  // Calculate counts
  const conflictCount = findings.filter((f) => f.outcome === "conflict").length;
  const unknownCount = findings.filter((f) => f.outcome === "unknown").length;
  const passCount = findings.filter((f) => f.outcome === "pass").length;

  // Determine overall status
  const status = determineStatus(findings);

  return {
    status,
    conflictCount,
    unknownCount,
    passCount,
    findings,
  };
}

/**
 * Determine overall dealbreaker status from findings
 */
function determineStatus(findings: DealbreakerFinding[]): DealbreakerStatus {
  // No active rules
  if (findings.length === 0) {
    return "inactive";
  }

  // Any conflict means overall conflict
  const hasConflict = findings.some((f) => f.outcome === "conflict");
  if (hasConflict) {
    return "conflict";
  }

  // No conflicts but at least one unknown
  const hasUnknown = findings.some((f) => f.outcome === "unknown");
  if (hasUnknown) {
    return "unknown";
  }

  // All active rules pass
  return "clear";
}

/**
 * Evaluate minimum salary requirement
 *
 * Conservative logic:
 * - Job max < user min: CONFLICT
 * - Job min >= user min: PASS
 * - Range overlaps floor: UNKNOWN (range includes acceptable and unacceptable)
 * - Salary absent: UNKNOWN
 * - Different periods: UNKNOWN (no conversion in E3 V1)
 */
function evaluateMinimumSalary(
  minimumSalary: number,
  job: DealbreakerJobData
): DealbreakerFinding {
  const { salaryMin, salaryMax, salaryPeriod } = job;

  // No salary data available
  if (salaryMin === undefined && salaryMax === undefined) {
    return {
      ruleType: "minimum_salary",
      outcome: "unknown",
      title: "Salary minimum",
      explanation: "Compensation information is not available, so this preference can't be verified.",
    };
  }

  // For E3 V1, we only handle yearly salaries
  // If period is hourly or missing, return unknown
  if (salaryPeriod !== "yearly") {
    return {
      ruleType: "minimum_salary",
      outcome: "unknown",
      title: "Salary minimum",
      explanation:
        "Salary is listed in a different format, so this preference can't be verified.",
    };
  }

  // Job maximum is below user's minimum - clear conflict
  if (salaryMax !== undefined && salaryMax < minimumSalary) {
    return {
      ruleType: "minimum_salary",
      outcome: "conflict",
      title: "Salary minimum",
      explanation: `Listed maximum of $${salaryMax.toLocaleString()} is below your $${minimumSalary.toLocaleString()} minimum.`,
    };
  }

  // Job minimum meets or exceeds user's minimum - clear pass
  if (salaryMin !== undefined && salaryMin >= minimumSalary) {
    return {
      ruleType: "minimum_salary",
      outcome: "pass",
      title: "Salary minimum",
      explanation: `Listed minimum of $${salaryMin.toLocaleString()} meets your $${minimumSalary.toLocaleString()} minimum.`,
    };
  }

  // Range overlaps the floor - unknown
  // Example: min $80k, max $120k, user wants $90k
  // This could be acceptable or not depending on actual offer
  if (
    salaryMin !== undefined &&
    salaryMax !== undefined &&
    salaryMin < minimumSalary &&
    salaryMax >= minimumSalary
  ) {
    return {
      ruleType: "minimum_salary",
      outcome: "unknown",
      title: "Salary minimum",
      explanation: `Listed range of $${salaryMin.toLocaleString()}–$${salaryMax.toLocaleString()} overlaps your $${minimumSalary.toLocaleString()} minimum.`,
    };
  }

  // Fallback unknown for any other case
  return {
    ruleType: "minimum_salary",
    outcome: "unknown",
    title: "Salary minimum",
    explanation: "Salary information is incomplete, so this preference can't be fully verified.",
  };
}

/**
 * Evaluate salary disclosure requirement
 *
 * Simple logic:
 * - No salary min AND no salary max: CONFLICT
 * - Salary information available: PASS
 */
function evaluateSalaryDisclosure(job: DealbreakerJobData): DealbreakerFinding {
  const { salaryMin, salaryMax } = job;

  // No salary disclosed
  if (salaryMin === undefined && salaryMax === undefined) {
    return {
      ruleType: "salary_disclosure",
      outcome: "conflict",
      title: "Salary disclosure",
      explanation: "Compensation is not listed.",
    };
  }

  // Salary disclosed
  return {
    ruleType: "salary_disclosure",
    outcome: "pass",
    title: "Salary disclosure",
    explanation: "Compensation is disclosed.",
  };
}

/**
 * Evaluate work arrangement restriction
 *
 * Logic:
 * - Job arrangement is in allowed list: PASS
 * - Job arrangement is not in allowed list: CONFLICT
 * - Job arrangement is missing/unknown: UNKNOWN
 */
function evaluateWorkArrangement(
  allowedArrangements: ("remote" | "hybrid" | "onsite")[],
  job: DealbreakerJobData
): DealbreakerFinding {
  const { workArrangement } = job;

  // Job arrangement is unknown
  if (!workArrangement) {
    return {
      ruleType: "work_arrangement",
      outcome: "unknown",
      title: "Work arrangement",
      explanation: "Work arrangement is not specified, so this preference can't be verified.",
    };
  }

  // Job arrangement is allowed
  if (allowedArrangements.includes(workArrangement)) {
    const arrangementLabel =
      workArrangement === "remote"
        ? "Remote"
        : workArrangement === "hybrid"
          ? "Hybrid"
          : "On-site";

    return {
      ruleType: "work_arrangement",
      outcome: "pass",
      title: "Work arrangement",
      explanation: `${arrangementLabel} is one of your selected work arrangements.`,
    };
  }

  // Job arrangement is not allowed
  const arrangementLabel =
    workArrangement === "remote"
      ? "remote"
      : workArrangement === "hybrid"
        ? "hybrid"
        : "on-site";

  return {
    ruleType: "work_arrangement",
    outcome: "conflict",
    title: "Work arrangement",
    explanation: `This role is ${arrangementLabel}, which is outside your selected work arrangements.`,
  };
}

/**
 * Evaluate employment type restriction
 *
 * Logic:
 * - Job type is in allowed list: PASS
 * - Job type is not in allowed list: CONFLICT
 * - Job type is missing/unknown: UNKNOWN
 */
function evaluateEmploymentType(
  allowedTypes: ("full_time" | "part_time" | "contract" | "temporary")[],
  job: DealbreakerJobData
): DealbreakerFinding {
  const { employmentType } = job;

  // Job type is unknown
  if (!employmentType) {
    return {
      ruleType: "employment_type",
      outcome: "unknown",
      title: "Employment type",
      explanation: "Employment type is not specified, so this preference can't be verified.",
    };
  }

  // Job type is allowed
  if (allowedTypes.includes(employmentType)) {
    const typeLabel =
      employmentType === "full_time"
        ? "Full-time"
        : employmentType === "part_time"
          ? "Part-time"
          : employmentType === "contract"
            ? "Contract"
            : "Temporary";

    return {
      ruleType: "employment_type",
      outcome: "pass",
      title: "Employment type",
      explanation: `${typeLabel} is one of your selected employment types.`,
    };
  }

  // Job type is not allowed
  const typeLabel =
    employmentType === "full_time"
      ? "full-time"
      : employmentType === "part_time"
        ? "part-time"
        : employmentType === "contract"
          ? "contract"
          : "temporary";

  return {
    ruleType: "employment_type",
    outcome: "conflict",
    title: "Employment type",
    explanation: `This role is ${typeLabel}, which is outside your selected employment types.`,
  };
}
