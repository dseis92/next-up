/**
 * AI Job Explanation API Route - Service Tests
 *
 * Real service-level tests proving actual POST route behavior.
 * Mocks Supabase and OpenAI to avoid paid network calls.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

// Mock modules BEFORE imports
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/storage/jobs.server", () => ({
  getJobServer: vi.fn(),
}));

vi.mock("@/lib/matching/user-matching-data.server", () => ({
  loadUserMatchingDataServer: vi.fn(),
}));

vi.mock("openai", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      beta: {
        chat: {
          completions: {
            parse: vi.fn(),
          },
        },
      },
    })),
  };
});

// Import after mocks are set up
import { createClient } from "@/lib/supabase/server";
import { getJobServer } from "@/lib/storage/jobs.server";
import { loadUserMatchingDataServer } from "@/lib/matching/user-matching-data.server";
import OpenAI from "openai";

// Test fixtures
const mockJob = {
  id: "job-1",
  company_id: "comp-1",
  company: {
    id: "comp-1",
    name: "BuildCo",
    slug: "buildco",
    industry: "Construction",
    size: "100-500",
    description: "Leading construction company",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  title: "Project Engineer",
  description: "Seeking a Project Engineer",
  requirements: ["3+ years experience"],
  responsibilities: ["Manage projects"],
  benefits: ["Health insurance"],
  location: "Milwaukee, WI",
  work_arrangement: "hybrid" as const,
  employment_type: "full_time" as const,
  experience_level: "mid" as const,
  salary_min: 80000,
  salary_max: 95000,
  salary_period: "yearly" as const,
  salary_is_estimated: false,
  posted_date: "2024-01-01",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockUserData = {
  onboarding: {
    current_title: "Tower Foreman",
    industry: "Telecommunications",
    years_experience: 4,
    employment_status: "employed",
    location: "Madison, WI",
    max_commute: 30,
    willing_to_relocate: false,
    salary_min: 65000,
    salary_ideal: 80000,
  },
  skills: [
    {
      id: "skill-1",
      user_id: "user-1",
      skill_id: "s1",
      skill: { id: "s1", name: "Leadership", category: "Soft Skills" },
      proficiency: "strong" as const,
      years: 3,
    },
    {
      id: "skill-2",
      user_id: "user-1",
      skill_id: "s2",
      skill: { id: "s2", name: "Project Management", category: "Professional" },
      proficiency: "comfortable" as const,
      years: 2,
    },
  ],
  experiences: [
    {
      id: "exp-1",
      user_id: "user-1",
      company: "Telecom Co",
      title: "Tower Foreman",
      start_date: "2020-01-01",
      current: true,
      description: "Lead tower construction crews",
    },
  ],
  preferences: {
    remote: false,
    hybrid: true,
    onsite: true,
    full_time: true,
    part_time: false,
    contract: false,
    travel_tolerance: 25,
    priorities: {
      salary: 8,
      workLifeBalance: 6,
      careerGrowth: 9,
      location: 7,
      remoteFlexibility: 5,
      culture: 6,
      stability: 7,
      benefits: 6,
      mission: 5,
      learning: 8,
    },
  },
  goals: ["Move into project management"],
  targetRoles: ["Project Engineer"],
  preferredLocations: ["Madison, WI"],
};

const mockIncompleteUserData = {
  onboarding: null,
  skills: [],
  experiences: [],
  preferences: null,
  goals: [],
  targetRoles: [],
  preferredLocations: [],
};

const mockValidAIResponse = {
  headline: "Strong match with growth potential",
  summary: "This role aligns well with your leadership experience and career goals in project management.",
  strengths: [
    {
      title: "Leadership Experience",
      explanation: "Your 3 years of leadership experience as a Tower Foreman directly applies to managing construction projects.",
    },
  ],
  concerns: [
    {
      title: "Industry Transition",
      explanation: "Moving from telecommunications to construction requires adapting to different project types.",
    },
  ],
  nextSteps: [
    {
      title: "Research Construction Project Management",
      explanation: "Learn about construction-specific PM methodologies and certifications.",
    },
  ],
  limitations: [],
};

describe("POST /api/ai/job-explanation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set OPENAI_API_KEY for tests
    process.env.OPENAI_API_KEY = "sk-test-key";
    process.env.OPENAI_MODEL = "gpt-5.6-luna";
  });

  it("should return 400 for invalid request body", async () => {
    const request = new NextRequest("http://localhost/api/ai/job-explanation", {
      method: "POST",
      body: "invalid json",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe("Invalid request body");
  });

  it("should return 400 for missing jobId", async () => {
    const request = new NextRequest("http://localhost/api/ai/job-explanation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe("Missing or invalid jobId");
  });

  it("should return 401 for unauthenticated user", async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const request = new NextRequest("http://localhost/api/ai/job-explanation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: "job-1" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 404 for non-existent job", async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);
    vi.mocked(getJobServer).mockResolvedValue(null);

    const request = new NextRequest("http://localhost/api/ai/job-explanation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: "fake-job-id" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data.error).toBe("Job not found");
  });

  it("should return 422 for incomplete profile", async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);
    vi.mocked(getJobServer).mockResolvedValue(mockJob);
    vi.mocked(loadUserMatchingDataServer).mockResolvedValue(mockIncompleteUserData);

    const request = new NextRequest("http://localhost/api/ai/job-explanation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: "job-1" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(422);

    const data = await response.json();
    expect(data.error).toBe("Cannot explain incomplete profile");
  });

  it("should return 503 when OPENAI_API_KEY not configured (after auth)", async () => {
    delete process.env.OPENAI_API_KEY;

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);
    vi.mocked(getJobServer).mockResolvedValue(mockJob);
    vi.mocked(loadUserMatchingDataServer).mockResolvedValue(mockUserData);

    const request = new NextRequest("http://localhost/api/ai/job-explanation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: "job-1" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(503);

    const data = await response.json();
    expect(data.error).toBe("AI service not configured");

    // Restore for other tests
    process.env.OPENAI_API_KEY = "sk-test-key";
  });


  it("should use server-safe loaders with complete profile", async () => {
    // This test proves the flow works up to OpenAI call
    // OpenAI itself will fail (no real API key), but we verify loaders were called correctly

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);
    vi.mocked(getJobServer).mockResolvedValue(mockJob);
    vi.mocked(loadUserMatchingDataServer).mockResolvedValue(mockUserData);

    const request = new NextRequest("http://localhost/api/ai/job-explanation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: "job-1" }),
    });

    // Call will fail at OpenAI (expected), but we verify flow up to that point
    const response = await POST(request);

    // Verify server-safe loaders were called with server Supabase client
    expect(getJobServer).toHaveBeenCalledWith(mockSupabase, "job-1");
    expect(loadUserMatchingDataServer).toHaveBeenCalledWith(mockSupabase, "user-1");

    // Should fail at OpenAI provider (safe error returned)
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Unable to generate your explanation right now.");
  });


});
