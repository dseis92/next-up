/**
 * AI Job Explanation Structured Output Schema
 *
 * Strict Zod schema for validating AI-generated job explanations.
 * Prevents AI from returning scores or unstructured prose.
 */

import { z } from "zod";

/**
 * Individual strength item
 */
const StrengthSchema = z.object({
  title: z.string().min(5).max(80),
  explanation: z.string().min(10).max(300),
}).strict();

/**
 * Individual concern item
 */
const ConcernSchema = z.object({
  title: z.string().min(5).max(80),
  explanation: z.string().min(10).max(300),
}).strict();

/**
 * Individual next step item
 */
const NextStepSchema = z.object({
  title: z.string().min(5).max(80),
  explanation: z.string().min(10).max(300),
}).strict();

/**
 * Complete AI job explanation structure
 *
 * FORBIDDEN FIELDS (will fail validation):
 * - matchScore, fitScore, confidenceScore
 * - qualificationPercentage, hiringProbability
 * - Any numeric scoring fields
 *
 * AI must interpret deterministic scores, not create new ones.
 */
export const AIJobExplanationSchema = z.object({
  headline: z.string().min(10).max(120).describe("Single-sentence summary of why this job matches (or doesn't)"),
  summary: z.string().min(50).max(500).describe("2-3 sentence overview interpreting the match quality"),

  strengths: z.array(StrengthSchema)
    .max(3)
    .describe("Top reasons this job aligns with user's profile (max 3)"),

  concerns: z.array(ConcernSchema)
    .max(3)
    .describe("Key considerations or gaps to think about (max 3)"),

  nextSteps: z.array(NextStepSchema)
    .min(1)
    .max(3)
    .describe("Actionable recommendations (1-3 steps)"),

  limitations: z.array(z.string().min(10).max(200))
    .max(3)
    .describe("Important caveats or missing information (max 3, optional)"),
}).strict();

/**
 * Validated AI job explanation type
 */
export type AIJobExplanation = z.infer<typeof AIJobExplanationSchema>;

/**
 * Validate AI response against schema
 * Throws ZodError if validation fails
 */
export function validateAIExplanation(data: unknown): AIJobExplanation {
  return AIJobExplanationSchema.parse(data);
}
