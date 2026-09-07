/**
 * AI Job Explanation Schema Validation Tests
 * Proves strict schema enforcement
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect } from "vitest";
import { AIJobExplanationSchema, validateAIExplanation } from "../job-explanation-schema";

describe("AIJobExplanationSchema validation", () => {
  const validExplanation = {
    headline: "Strong match for your skills",
    summary: "This role aligns well with your experience and career goals in project management.",
    strengths: [
      {
        title: "Leadership Experience",
        explanation: "Your leadership background makes you a strong candidate for this role.",
      },
    ],
    concerns: [
      {
        title: "Industry Change",
        explanation: "Transitioning industries may require some adaptation.",
      },
    ],
    nextSteps: [
      {
        title: "Research the Company",
        explanation: "Learn about their project management approach.",
      },
    ],
    limitations: ["Limited salary data available"],
  };

  it("should validate valid explanation", () => {
    expect(() => validateAIExplanation(validExplanation)).not.toThrow();
    const result = validateAIExplanation(validExplanation);
    expect(result.headline).toBe("Strong match for your skills");
  });

  it("should reject missing required field (headline)", () => {
    const invalid = { ...validExplanation };
    delete (invalid as any).headline;

    expect(() => validateAIExplanation(invalid)).toThrow();
  });

  it("should reject missing required field (summary)", () => {
    const invalid = { ...validExplanation };
    delete (invalid as any).summary;

    expect(() => validateAIExplanation(invalid)).toThrow();
  });

  it("should reject missing required field (strengths)", () => {
    const invalid = { ...validExplanation };
    delete (invalid as any).strengths;

    expect(() => validateAIExplanation(invalid)).toThrow();
  });

  it("should reject missing required field (concerns)", () => {
    const invalid = { ...validExplanation };
    delete (invalid as any).concerns;

    expect(() => validateAIExplanation(invalid)).toThrow();
  });

  it("should reject missing required field (nextSteps)", () => {
    const invalid = { ...validExplanation };
    delete (invalid as any).nextSteps;

    expect(() => validateAIExplanation(invalid)).toThrow();
  });

  it("should reject extra field due to strict schema", () => {
    const invalid = {
      ...validExplanation,
      extraField: "not allowed",
    };

    expect(() => validateAIExplanation(invalid)).toThrow();
  });

  it("should reject matchScore field (forbidden)", () => {
    const invalid = {
      ...validExplanation,
      matchScore: 85,
    };

    expect(() => validateAIExplanation(invalid)).toThrow();
  });

  it("should reject fitScore field (forbidden)", () => {
    const invalid = {
      ...validExplanation,
      fitScore: 90,
    };

    expect(() => validateAIExplanation(invalid)).toThrow();
  });

  it("should reject confidenceScore field (forbidden)", () => {
    const invalid = {
      ...validExplanation,
      confidenceScore: 75,
    };

    expect(() => validateAIExplanation(invalid)).toThrow();
  });

  it("should reject qualificationPercentage field (forbidden)", () => {
    const invalid = {
      ...validExplanation,
      qualificationPercentage: 88,
    };

    expect(() => validateAIExplanation(invalid)).toThrow();
  });

  it("should reject hiringProbability field (forbidden)", () => {
    const invalid = {
      ...validExplanation,
      hiringProbability: 0.75,
    };

    expect(() => validateAIExplanation(invalid)).toThrow();
  });

  it("should reject strengths > max (3)", () => {
    const invalid = {
      ...validExplanation,
      strengths: [
        { title: "Strength 1", explanation: "Explanation 1" },
        { title: "Strength 2", explanation: "Explanation 2" },
        { title: "Strength 3", explanation: "Explanation 3" },
        { title: "Strength 4", explanation: "Explanation 4" },
      ],
    };

    expect(() => validateAIExplanation(invalid)).toThrow();
  });

  it("should reject concerns > max (3)", () => {
    const invalid = {
      ...validExplanation,
      concerns: [
        { title: "Concern 1", explanation: "Explanation 1" },
        { title: "Concern 2", explanation: "Explanation 2" },
        { title: "Concern 3", explanation: "Explanation 3" },
        { title: "Concern 4", explanation: "Explanation 4" },
      ],
    };

    expect(() => validateAIExplanation(invalid)).toThrow();
  });

  it("should reject nextSteps empty (requires min 1)", () => {
    const invalid = {
      ...validExplanation,
      nextSteps: [],
    };

    expect(() => validateAIExplanation(invalid)).toThrow();
  });

  it("should reject nextSteps > max (3)", () => {
    const invalid = {
      ...validExplanation,
      nextSteps: [
        { title: "Step 1", explanation: "Explanation 1" },
        { title: "Step 2", explanation: "Explanation 2" },
        { title: "Step 3", explanation: "Explanation 3" },
        { title: "Step 4", explanation: "Explanation 4" },
      ],
    };

    expect(() => validateAIExplanation(invalid)).toThrow();
  });

  it("should reject limitations > max (3)", () => {
    const invalid = {
      ...validExplanation,
      limitations: [
        "Limitation 1",
        "Limitation 2",
        "Limitation 3",
        "Limitation 4",
      ],
    };

    expect(() => validateAIExplanation(invalid)).toThrow();
  });

  it("should reject headline too short (< 10 chars)", () => {
    const invalid = {
      ...validExplanation,
      headline: "Short",
    };

    expect(() => validateAIExplanation(invalid)).toThrow();
  });

  it("should reject headline too long (> 120 chars)", () => {
    const invalid = {
      ...validExplanation,
      headline: "A".repeat(121),
    };

    expect(() => validateAIExplanation(invalid)).toThrow();
  });

  it("should reject summary too short (< 50 chars)", () => {
    const invalid = {
      ...validExplanation,
      summary: "Too short",
    };

    expect(() => validateAIExplanation(invalid)).toThrow();
  });

  it("should reject summary too long (> 500 chars)", () => {
    const invalid = {
      ...validExplanation,
      summary: "A".repeat(501),
    };

    expect(() => validateAIExplanation(invalid)).toThrow();
  });

  it("should accept valid empty strengths array", () => {
    const valid = {
      ...validExplanation,
      strengths: [],
    };

    expect(() => validateAIExplanation(valid)).not.toThrow();
  });

  it("should accept valid empty concerns array", () => {
    const valid = {
      ...validExplanation,
      concerns: [],
    };

    expect(() => validateAIExplanation(valid)).not.toThrow();
  });

  it("should accept valid empty limitations array", () => {
    const valid = {
      ...validExplanation,
      limitations: [],
    };

    expect(() => validateAIExplanation(valid)).not.toThrow();
  });

  it("should reject strength with extra field (strict)", () => {
    const invalid = {
      ...validExplanation,
      strengths: [
        {
          title: "Leadership",
          explanation: "Strong leadership skills",
          extraField: "not allowed",
        },
      ],
    };

    expect(() => validateAIExplanation(invalid)).toThrow();
  });

  it("should reject concern with missing explanation", () => {
    const invalid = {
      ...validExplanation,
      concerns: [
        {
          title: "Industry Change",
        },
      ],
    };

    expect(() => validateAIExplanation(invalid)).toThrow();
  });

  it("should reject nextStep with title too short", () => {
    const invalid = {
      ...validExplanation,
      nextSteps: [
        {
          title: "Go",
          explanation: "This explanation is long enough",
        },
      ],
    };

    expect(() => validateAIExplanation(invalid)).toThrow();
  });

  it("should parse with AIJobExplanationSchema directly", () => {
    const result = AIJobExplanationSchema.parse(validExplanation);
    expect(result.headline).toBe("Strong match for your skills");
    expect(result.strengths).toHaveLength(1);
    expect(result.concerns).toHaveLength(1);
    expect(result.nextSteps).toHaveLength(1);
    expect(result.limitations).toHaveLength(1);
  });
});
