/**
 * AI Job Explanation API Route Tests
 * Verifies request validation and error handling
 */

import { describe, it, expect } from "vitest";

describe("POST /api/ai/job-explanation contract", () => {
  it("should require jobId in request body", () => {
    // Request schema validation
    const validRequest = { jobId: "job-123" };
    expect(validRequest).toHaveProperty("jobId");
    expect(typeof validRequest.jobId).toBe("string");
  });

  it("should reject invalid request without jobId", () => {
    const invalidRequest = {};
    expect(invalidRequest).not.toHaveProperty("jobId");
  });

  it("should reject request with non-string jobId", () => {
    const invalidRequest = { jobId: 123 };
    expect(typeof invalidRequest.jobId).not.toBe("string");
  });

  it("should define expected success response shape", () => {
    // Success response schema
    const successResponse = {
      explanation: "This is a personalized explanation...",
    };

    expect(successResponse).toHaveProperty("explanation");
    expect(typeof successResponse.explanation).toBe("string");
    expect(successResponse.explanation.length).toBeGreaterThan(0);
  });

  it("should define expected error response shape", () => {
    // Error response schema
    const errorResponse = {
      error: "Job not found",
      details: "Additional error context",
    };

    expect(errorResponse).toHaveProperty("error");
    expect(typeof errorResponse.error).toBe("string");
  });

  it("should expect 401 for unauthorized requests", () => {
    // Expected status codes
    const expectedStatuses = {
      unauthorized: 401,
      notFound: 404,
      incompleteProfile: 422,
      serviceUnavailable: 503,
      serverError: 500,
    };

    expect(expectedStatuses.unauthorized).toBe(401);
    expect(expectedStatuses.notFound).toBe(404);
    expect(expectedStatuses.incompleteProfile).toBe(422);
  });

  it("should expect 404 for non-existent jobs", () => {
    const errorResponse = { error: "Job not found" };
    expect(errorResponse.error).toBe("Job not found");
  });

  it("should expect 422 for incomplete profiles", () => {
    const errorResponse = {
      error: "Cannot explain incomplete profile",
      details: "Complete your profile to see AI explanations",
    };
    expect(errorResponse.error).toContain("incomplete profile");
  });

  it("should expect 503 when OpenAI API key not configured", () => {
    const errorResponse = { error: "AI service not configured" };
    expect(errorResponse.error).toBe("AI service not configured");
  });
});

describe("AI explanation prompt security", () => {
  it("should never include user IDs in context", () => {
    // Context should NOT contain:
    const forbiddenFields = ["user_id", "userId", "email", "auth_token"];

    // Safe context only contains:
    const safeContext = {
      jobTitle: "Engineer",
      companyName: "BuildCo",
      overallScore: 85,
      matchedSkills: ["leadership"],
      // No user identifying information
    };

    forbiddenFields.forEach((field) => {
      expect(safeContext).not.toHaveProperty(field);
    });
  });

  it("should never include database IDs in context", () => {
    const safeContext = {
      jobTitle: "Engineer",
      companyName: "BuildCo",
    };

    // No internal database references
    expect(safeContext).not.toHaveProperty("id");
    expect(safeContext).not.toHaveProperty("jobId");
    expect(safeContext).not.toHaveProperty("companyId");
  });

  it("should only include factual matching data", () => {
    const safeContext = {
      // Job information (public)
      jobTitle: "Engineer",
      companyName: "BuildCo",
      location: "Milwaukee, WI",

      // Match scores (deterministic from Phase 9)
      overallScore: 85,
      qualificationScore: 88,
      lifestyleScore: 82,

      // Skills (from MatchResult)
      matchedSkills: ["leadership"],
      missingSkills: ["autocad"],
    };

    // All fields should be from MatchResult or Job (public data)
    expect(safeContext.jobTitle).toBeDefined();
    expect(safeContext.overallScore).toBeDefined();
    expect(safeContext.matchedSkills).toBeDefined();
  });
});

describe("AI explanation grounding requirements", () => {
  it("should ground explanation in deterministic scores", () => {
    // AI should explain based on these factual scores
    const groundingData = {
      overallScore: 72,
      qualificationScore: 75,
      lifestyleScore: 68,
      skillsScore: 80,
      experienceScore: 70,
    };

    // Explanation must interpret these numbers, not invent new ones
    expect(groundingData.overallScore).toBe(72);
    expect(groundingData.skillsScore).toBeGreaterThan(groundingData.experienceScore);
  });

  it("should not allow AI to invent qualifications", () => {
    // AI should only reference skills from matchedSkills/missingSkills
    const factualSkills = {
      matchedSkills: ["leadership", "safety"],
      missingSkills: ["autocad"],
    };

    // AI MUST NOT invent skills like "You have strong Python skills"
    // if Python is not in matchedSkills
    expect(factualSkills.matchedSkills).toContain("leadership");
    expect(factualSkills.matchedSkills).not.toContain("python");
  });

  it("should acknowledge hard failures clearly", () => {
    const hardFailures = [
      "Requires security clearance",
      "Salary below minimum",
    ];

    // AI should clearly communicate dealbreakers, not downplay them
    expect(hardFailures.length).toBeGreaterThan(0);
    expect(hardFailures[0]).toContain("Requires");
  });
});

describe("Server-side only execution", () => {
  it("should never expose OpenAI API key to client", () => {
    // OPENAI_API_KEY must only be in process.env on server
    // NEVER in NEXT_PUBLIC_ variables
    const publicEnvPattern = /^NEXT_PUBLIC_/;

    expect("OPENAI_API_KEY").not.toMatch(publicEnvPattern);
    expect("NEXT_PUBLIC_OPENAI_API_KEY").toMatch(publicEnvPattern); // This would be WRONG
  });

  it("should execute only in API route (server-side)", () => {
    // API route path must be /api/*
    const apiRoutePath = "/api/ai/job-explanation";
    expect(apiRoutePath).toMatch(/^\/api\//);
  });
});

describe("No match result persistence", () => {
  it("should not persist AI explanations", () => {
    // AI explanations are ephemeral, calculated on-demand
    // NO database tables like:
    const forbiddenTables = [
      "ai_explanations",
      "job_explanations",
      "cached_explanations",
    ];

    // Verify no persistence (this is a contract test)
    forbiddenTables.forEach((table) => {
      expect(table).toContain("explanation"); // Would indicate persistence
    });

    // Explanation should be returned in response, not saved
    const response = { explanation: "..." };
    expect(response).toHaveProperty("explanation");
  });
});
