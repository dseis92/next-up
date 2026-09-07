/**
 * POST /api/ai/job-explanation
 *
 * Server-side only AI job match explanation
 * Grounded in deterministic Phase 9 match results
 *
 * Uses:
 * - Server Supabase client (NO browser client dependency)
 * - OpenAI Responses API with structured output
 * - Strict Zod validation
 * - Prompt-injection defense
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { buildJobExplanationContext } from "@/lib/ai/job-explanation-context";
import { AIJobExplanationSchema, validateAIExplanation, type AIJobExplanation } from "@/lib/ai/job-explanation-schema";
import { buildSystemInstructions, buildUserPrompt } from "@/lib/ai/job-explanation-prompt";
import { getJobServer } from "@/lib/storage/jobs.server";
import { loadUserMatchingDataServer } from "@/lib/matching/user-matching-data.server";
import { calculateMatchFromUserData } from "@/lib/matching/integration";
import { createClient } from "@/lib/supabase/server";

/**
 * Request body schema
 */
interface JobExplanationRequest {
  jobId: string;
}

/**
 * Success response
 */
interface JobExplanationResponse {
  explanation: AIJobExplanation;
}

/**
 * Safe error response (no raw provider errors)
 */
interface ErrorResponse {
  error: string;
}


/**
 * POST handler for AI job explanation
 */
export async function POST(request: NextRequest): Promise<NextResponse<JobExplanationResponse | ErrorResponse>> {
  try {
    // 1. Parse and validate request body
    let body: JobExplanationRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { jobId } = body;
    if (!jobId || typeof jobId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid jobId" },
        { status: 400 }
      );
    }

    // 2. Authenticate user (before checking provider config)
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 3. Load job data using server-safe loader
    const job = await getJobServer(supabase, jobId);

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // 4. Load user matching data using server-safe loader
    const userData = await loadUserMatchingDataServer(supabase, user.id);

    if (!userData) {
      return NextResponse.json(
        { error: "Unable to load your profile data right now." },
        { status: 500 }
      );
    }

    // 5. Calculate deterministic match result (pure function, no Supabase)
    const matchResult = calculateMatchFromUserData(userData, job);

    // 6. Build safe AI context
    const context = buildJobExplanationContext(matchResult, job);

    if (!context) {
      return NextResponse.json(
        { error: "Cannot explain incomplete profile" },
        { status: 422 }
      );
    }

    // 7. Verify OpenAI API key configured (after authentication)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY not configured");
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    // 8. Build grounded prompt with injection defense
    const systemInstructions = buildSystemInstructions();
    const userPrompt = buildUserPrompt(context);

    // 9. Call OpenAI Responses API with structured output
    const model = process.env.OPENAI_MODEL || "gpt-5.6-luna";
    const openai = new OpenAI({ apiKey });

    let response;
    try {
      response = await openai.responses.parse({
        model,
        input: [
          {
            role: "system",
            content: systemInstructions,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        text: {
          format: zodTextFormat(AIJobExplanationSchema, "job_explanation"),
        },
        store: false,
      });
    } catch (error) {
      // Safe error handling - no raw provider errors to client
      console.error("OpenAI Responses API error:", error);
      return NextResponse.json(
        { error: "Unable to generate your explanation right now." },
        { status: 500 }
      );
    }

    const explanation = response.output_parsed;

    if (!explanation) {
      console.error("OpenAI Responses API returned empty parsed output");
      return NextResponse.json(
        { error: "Unable to generate your explanation right now." },
        { status: 500 }
      );
    }

    // 10. Validate with Zod (belt-and-suspenders)
    let validatedExplanation: AIJobExplanation;
    try {
      validatedExplanation = validateAIExplanation(explanation);
    } catch (error) {
      console.error("AI response validation failed:", error);
      return NextResponse.json(
        { error: "Unable to generate your explanation right now." },
        { status: 500 }
      );
    }

    // 11. Return validated structured explanation
    return NextResponse.json({ explanation: validatedExplanation });
  } catch (error) {
    // Catch-all safe error handling
    console.error("AI job explanation error:", error);
    return NextResponse.json(
      { error: "Unable to generate your explanation right now." },
      { status: 500 }
    );
  }
}
