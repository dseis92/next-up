/**
 * POST /api/ai/job-explanation
 *
 * Server-side only AI job match explanation
 * Grounded in deterministic Phase 9 match results
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildJobExplanationContext } from "@/lib/ai/job-explanation-context";
import { calculatePersonalizedMatch } from "@/lib/matching/integration";
import { getJobs } from "@/lib/storage/jobs";
import { createClient } from "@/lib/supabase/server";

/**
 * Request body schema
 */
interface JobExplanationRequest {
  jobId: string;
}

/**
 * Response schema
 */
interface JobExplanationResponse {
  explanation: string;
}

/**
 * Error response schema
 */
interface ErrorResponse {
  error: string;
  details?: string;
}

/**
 * Build grounded AI prompt from factual match context
 */
function buildExplanationPrompt(context: ReturnType<typeof buildJobExplanationContext>): string {
  if (!context) {
    throw new Error("Cannot build prompt for incomplete profile");
  }

  return `You are NextUp's career advisor. Explain this job match to a user in a warm, conversational tone.

**Job Details:**
- Title: ${context.jobTitle}
- Company: ${context.companyName}
- Location: ${context.location}
- Work Arrangement: ${context.workArrangement}
- Employment Type: ${context.employmentType}
- Experience Level: ${context.experienceLevel}
${context.salaryRange ? `- Salary: ${context.salaryRange}` : ""}

**Match Analysis (Deterministic Scores):**
- Overall Match: ${context.overallScore}%
- Qualification Score: ${context.qualificationScore}%
- Lifestyle Score: ${context.lifestyleScore}%

**Breakdown:**
- Skills Match: ${context.skillsScore}/100
- Experience Match: ${context.experienceScore}/100
- Career Goals Alignment: ${context.careerGoalsScore}/100
- Salary Fit: ${context.salaryScore}/100
- Location Fit: ${context.locationScore}/100
- Work Arrangement Fit: ${context.workArrangementScore}/100

**Skills:**
- Matched: ${context.matchedSkills.length > 0 ? context.matchedSkills.join(", ") : "None"}
- Missing: ${context.missingSkills.length > 0 ? context.missingSkills.join(", ") : "None"}

${context.hardFailures.length > 0 ? `**Dealbreakers:** ${context.hardFailures.join(", ")}` : ""}

**Your Task:**
Write a 2-3 paragraph personalized explanation of why this job scored ${context.overallScore}%. Focus on:

1. **Why it's a match** (or why it's not): Highlight the strongest alignment areas based on the scores above.
2. **Key considerations**: What should the user think about? (e.g., missing skills they'd need to develop, salary fit, location/commute, work arrangement preferences)
3. **Actionable insight**: One concrete takeaway to help them decide (e.g., "This could be a great stepping stone if you're willing to learn X" or "The salary might be below your target, but the career growth potential is strong")

**Important Guidelines:**
- DO NOT invent qualifications, skills, or experience the user doesn't have
- DO NOT manufacture fake "pros and cons" - stay grounded in the scores
- DO NOT mention score numbers explicitly (e.g., don't say "72% match") - interpret them naturally
- DO NOT add generic career advice unrelated to this specific match
- Keep it warm, honest, and conversational (like a trusted advisor)
- If there are dealbreakers, acknowledge them clearly but constructively

Write the explanation now:`;
}

/**
 * POST handler for AI job explanation
 */
export async function POST(request: NextRequest): Promise<NextResponse<JobExplanationResponse | ErrorResponse>> {
  try {
    // 1. Verify OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY not configured");
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    // 2. Parse and validate request
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

    // 3. Verify authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 4. Load job data
    const jobs = await getJobs();
    const job = jobs.find((j) => j.id === jobId);

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // 5. Calculate deterministic match result
    const matchResult = await calculatePersonalizedMatch(user.id, job);

    // 6. Build safe AI context
    const context = buildJobExplanationContext(matchResult, job);

    if (!context) {
      return NextResponse.json(
        { error: "Cannot explain incomplete profile", details: "Complete your profile to see AI explanations" },
        { status: 422 }
      );
    }

    // 7. Build grounded prompt
    const prompt = buildExplanationPrompt(context);

    // 8. Call OpenAI
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are NextUp's career advisor. Provide warm, honest, grounded career guidance based on factual match data. Never invent qualifications or experience.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const explanation = completion.choices[0]?.message?.content?.trim();

    if (!explanation) {
      throw new Error("OpenAI returned empty response");
    }

    // 9. Return explanation
    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("AI job explanation error:", error);
    return NextResponse.json(
      { error: "Failed to generate explanation", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
