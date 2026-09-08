"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { MatchScore } from "@/components/jobs/match-score";
import { Progress } from "@/components/ui/progress";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Toast } from "@/components/ui/toast";
import { IncompleteProfileMessage } from "@/components/jobs/incomplete-profile-message";
import { CompareToggle } from "@/components/compare/compare-toggle";
import { formatSalary } from "@/lib/utils";
import { getJob } from "@/lib/storage/jobs";
import { calculatePersonalizedMatch } from "@/lib/matching/integration";
import { createClient } from "@/lib/supabase/client";
import { saveJob, unsaveJob, isJobSaved } from "@/lib/storage/job-actions";
import {
  createApplication,
  getApplicationByJobId,
} from "@/lib/storage/applications";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  MapPin,
  Briefcase,
  Building2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Loader2,
} from "lucide-react";
import type { JobMatch, Application } from "@/types";
import type { MatchResult } from "@/lib/matching/types";
import type { AIJobExplanation } from "@/lib/ai/job-explanation-schema";
import { useDealbreakerPreferences, evaluateJobDealbreakers } from "@/hooks/use-dealbreaker-preferences";
import { DealbreakerFindings } from "@/components/dealbreakers/dealbreaker-findings";
import { useMemo } from "react";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<import("@/types").Job | null>(null);
  const [match, setMatch] = useState<JobMatch | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<AIJobExplanation | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Load dealbreaker preferences once
  const { preferences: dealbreakerPreferences } = useDealbreakerPreferences();

  // Evaluate dealbreakers for this job
  const dealbreakerEvaluation = useMemo(() => {
    if (!dealbreakerPreferences || !job) {
      return null;
    }
    return evaluateJobDealbreakers(dealbreakerPreferences, job);
  }, [dealbreakerPreferences, job]);

  useEffect(() => {
    const loadJobData = async () => {
      try {
        // Get current user
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // Load the job
        const loadedJob = await getJob(jobId);

        if (!loadedJob) {
          setLoading(false);
          return;
        }

        // Store job separately from match data
        setJob(loadedJob);

        // Calculate personalized match
        try {
          const result = await calculatePersonalizedMatch(user.id, loadedJob);
          setMatchResult(result);

          // Only build JobMatch object if we have a scored result
          // For incomplete profiles, we keep matchResult but skip building legacy JobMatch
          if (result.status === "scored") {
            const jobMatch: JobMatch = {
              id: `${loadedJob.id}-match`,
              user_id: user.id,
              job_id: loadedJob.id,
              job: loadedJob,
              overall_score: result.overallScore!,
              qualification_score: result.qualificationScore!,
              lifestyle_score: result.lifestyleScore!,
              breakdown: {
                skills: result.breakdown.skills.score,
                experience: result.breakdown.experience.score,
                salary: result.breakdown.salary.score,
                location: result.breakdown.location.score,
                work_arrangement: result.breakdown.workArrangement.score,
                career_goals: result.breakdown.careerGoals.score,
              },
              matched_skills: result.matchedSkills,
              missing_skills: result.missingSkills,
              reasons_fit: result.reasonsFit.map((r) => r.text),
              reasons_concern: result.reasonsConcern.map((r) => r.text),
              created_at: new Date().toISOString(),
            };

            setMatch(jobMatch);
          }
        } catch (error) {
          // Matching data load failure - distinguish from job not found
          console.error("Failed to load matching data:", error);
          setLoadError(true);
        }

        // Check if saved
        setIsSaved(await isJobSaved(jobId));

        // Check if already applied
        const existingApp = await getApplicationByJobId(jobId);
        setApplication(existingApp);
      } catch (error) {
        console.error("Failed to load job data:", error);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    loadJobData();
  }, [jobId]);

  const handleSave = async () => {
    if (actionPending) return;

    setActionPending(true);
    try {
      if (isSaved) {
        await unsaveJob(jobId);
        setIsSaved(false);
      } else {
        await saveJob(jobId);
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Failed to save/unsave job:", error);
      setActionError("Failed to update saved status. Please try again.");
      setTimeout(() => setActionError(null), 5000);
    } finally {
      setActionPending(false);
    }
  };

  const handleApply = () => {
    if (application) {
      // Already applied, go to application detail
      router.push(`/applications/${application.id}`);
    } else if (job?.external_url) {
      // Has external URL, show confirmation
      setShowApplyDialog(true);
    } else {
      // Demo job without external URL
      handleConfirmApply();
    }
  };

  const handleConfirmApply = async () => {
    if (!job || actionPending) return;

    setActionPending(true);
    try {
      // Create application
      const newApp = await createApplication({
        jobId: job.id,
        job: job,
        stage: "applied",
        source: "nextup_job_detail",
      });

      setApplication(newApp);

      // If external URL exists, open it
      if (job.external_url) {
        window.open(job.external_url, "_blank", "noopener,noreferrer");
      }

      // Navigate to applications
      setTimeout(() => {
        router.push("/applications");
      }, 500);
    } catch (error) {
      console.error("Failed to create application:", error);
      setActionError("Failed to create application. Please try again.");
      setTimeout(() => setActionError(null), 5000);
    } finally {
      setActionPending(false);
    }
  };

  const handleGetAiExplanation = async () => {
    if (!job || aiLoading || aiExplanation) return;

    setAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch("/api/ai/job-explanation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId: job.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Use safe error message (no raw provider errors)
        throw new Error(errorData.error || "Unable to generate explanation");
      }

      const data = await response.json();
      setAiExplanation(data.explanation);
    } catch (error) {
      console.error("AI explanation error:", error);
      setAiError(error instanceof Error ? error.message : "Unable to generate explanation");
    } finally {
      setAiLoading(false);
    }
  };

  const handleRetryAiExplanation = () => {
    setAiError(null);
    setAiExplanation(null);
    handleGetAiExplanation();
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center p-4">
          <p className="text-foreground-secondary">Loading job...</p>
        </div>
      </AppShell>
    );
  }

  if (loadError) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center p-4">
          <div className="text-center">
            <p className="text-foreground mb-2">
              Unable to load job details right now.
            </p>
            <p className="text-foreground-secondary text-sm">
              Please try again later.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!job) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center p-4">
          <p className="text-foreground-secondary">Job not found</p>
        </div>
      </AppShell>
    );
  }

  // Extract match data only if available
  const overall_score = match?.overall_score;
  const breakdown = match?.breakdown;
  const matched_skills = match?.matched_skills || [];
  const missing_skills = match?.missing_skills || [];

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur-lg">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex gap-2">
              <CompareToggle jobId={jobId} size="sm" className="gap-2" />
              <Button
                variant={isSaved ? "primary" : "secondary"}
                size="sm"
                onClick={handleSave}
                disabled={actionPending}
                className="gap-2"
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="h-4 w-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 pb-8">
          {/* Hero Section */}
          <div className="mb-6">
            <div className="mb-4 flex items-start gap-4">
              <Avatar
                name={job.company.name}
                size="xl"
                className="shrink-0 bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-heading-lg mb-2">{job.title}</h1>
                <p className="mb-2 text-lg font-medium text-foreground-secondary">
                  {job.company.name}
                </p>
                <div className="flex flex-wrap gap-2 text-sm text-foreground-secondary">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span className="capitalize">
                      {job.work_arrangement.replace("_", " ")}
                    </span>
                  </div>
                  <span>•</span>
                  <span className="capitalize">
                    {job.employment_type.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Salary */}
            {job.salary_min && (
              <div className="mb-4">
                <p className="text-display text-foreground">
                  {formatSalary(
                    job.salary_min,
                    job.salary_max,
                    job.salary_period
                  )}
                </p>
                {job.salary_is_estimated && (
                  <p className="text-sm text-foreground-muted">Estimated</p>
                )}
              </div>
            )}

            {/* Match Score or Incomplete Profile Message */}
            {matchResult?.status === "incomplete_profile" ? (
              <IncompleteProfileMessage />
            ) : overall_score !== undefined ? (
              <Card variant="elevated" className="p-4">
                <MatchScore score={overall_score} size="lg" />
              </Card>
            ) : null}
          </div>

          {/* Match Breakdown */}
          {matchResult?.status !== "incomplete_profile" && breakdown && (
            <Card className="mb-6 p-6">
              <h2 className="text-heading mb-4">Match breakdown</h2>
              <div className="space-y-3">
                {Object.entries(breakdown).map(([key, value]) => (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="capitalize text-foreground">
                        {key.replace("_", " ")}
                      </span>
                      <span className="font-semibold text-foreground">
                        {value}%
                      </span>
                    </div>
                    <Progress value={value} max={100} size="sm" />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Dealbreaker Findings */}
          {dealbreakerEvaluation && (
            <Card className="mb-6 p-6">
              <DealbreakerFindings evaluation={dealbreakerEvaluation} />
            </Card>
          )}

          {/* AI Match Explanation */}
          {matchResult?.status !== "incomplete_profile" && match && (
            <Card className="mb-6 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand" />
                  <h2 className="text-heading">AI Match Explanation</h2>
                </div>
                {!aiExplanation && !aiLoading && !aiError && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleGetAiExplanation}
                  >
                    Explain this match
                  </Button>
                )}
              </div>

              {/* Loading State */}
              {aiLoading && (
                <div className="flex items-center gap-2 text-foreground-secondary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p>Analyzing your match...</p>
                </div>
              )}

              {/* Error State */}
              {aiError && (
                <div className="rounded-lg border border-warning/20 bg-warning/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-warning">{aiError}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRetryAiExplanation}
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              {/* Structured Explanation */}
              {aiExplanation && (
                <div className="space-y-6">
                  {/* Headline */}
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      {aiExplanation.headline}
                    </p>
                  </div>

                  {/* Summary */}
                  <div>
                    <p className="text-foreground-secondary">
                      {aiExplanation.summary}
                    </p>
                  </div>

                  {/* Why this fits */}
                  {aiExplanation.strengths.length > 0 && (
                    <div>
                      <h3 className="text-heading-sm mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Why this fits
                      </h3>
                      <ul className="space-y-3">
                        {aiExplanation.strengths.map((strength, idx) => (
                          <li key={idx}>
                            <p className="font-medium text-foreground">{strength.title}</p>
                            <p className="mt-1 text-sm text-foreground-secondary">
                              {strength.explanation}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Things to watch */}
                  {aiExplanation.concerns.length > 0 && (
                    <div>
                      <h3 className="text-heading-sm mb-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-warning" />
                        Things to watch
                      </h3>
                      <ul className="space-y-3">
                        {aiExplanation.concerns.map((concern, idx) => (
                          <li key={idx}>
                            <p className="font-medium text-foreground">{concern.title}</p>
                            <p className="mt-1 text-sm text-foreground-secondary">
                              {concern.explanation}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* What to do next */}
                  {aiExplanation.nextSteps.length > 0 && (
                    <div>
                      <h3 className="text-heading-sm mb-3">What to do next</h3>
                      <ul className="space-y-3">
                        {aiExplanation.nextSteps.map((step, idx) => (
                          <li key={idx}>
                            <p className="font-medium text-foreground">{step.title}</p>
                            <p className="mt-1 text-sm text-foreground-secondary">
                              {step.explanation}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Limitations */}
                  {aiExplanation.limitations.length > 0 && (
                    <div className="rounded-lg border border-border bg-surface-secondary p-4">
                      <p className="text-xs font-medium text-foreground-muted">
                        Limitations:
                      </p>
                      <ul className="mt-2 space-y-1">
                        {aiExplanation.limitations.map((limitation, idx) => (
                          <li key={idx} className="text-xs text-foreground-muted">
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Footer */}
                  <p className="text-xs text-foreground-muted">
                    Based on your current profile and this job.
                  </p>
                </div>
              )}

              {/* Idle State */}
              {!aiExplanation && !aiLoading && !aiError && (
                <p className="text-sm text-foreground-muted">
                  Get a personalized explanation of why this job matches your profile,
                  what to consider, and actionable next steps.
                </p>
              )}
            </Card>
          )}

          {/* Why you're a strong match */}
          {matchResult?.status !== "incomplete_profile" && match && (
            <Card className="mb-6 p-6">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <h2 className="text-heading">Why you&apos;re a strong match</h2>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {matched_skills.map((skill) => (
                  <Badge key={skill} variant="success" size="md">
                    {skill}
                  </Badge>
                ))}
              </div>
              <ul className="space-y-2">
                {match.reasons_fit.map((reason, idx) => (
                  <li key={idx} className="flex gap-2 text-foreground-secondary">
                    <span className="text-green-500">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Things to consider */}
          {matchResult?.status !== "incomplete_profile" &&
            match &&
            (missing_skills.length > 0 || match.reasons_concern.length > 0) && (
              <Card className="mb-6 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <h2 className="text-heading">Things to consider</h2>
                </div>
                {missing_skills.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-sm font-medium text-foreground">
                      Skills to develop
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {missing_skills.map((skill) => (
                        <Badge key={skill} variant="warning" size="sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {match.reasons_concern.length > 0 && (
                  <ul className="space-y-2">
                    {match.reasons_concern.map((reason, idx) => (
                      <li
                        key={idx}
                        className="flex gap-2 text-foreground-secondary"
                      >
                        <span className="text-warning">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}

          {/* About the role */}
          <Card className="mb-6 p-6">
            <h2 className="text-heading mb-3">About the role</h2>
            <p className="text-foreground-secondary">{job.description}</p>
          </Card>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <Card className="mb-6 p-6">
              <h2 className="text-heading mb-3">Responsibilities</h2>
              <ul className="space-y-2">
                {job.responsibilities.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex gap-2 text-foreground-secondary"
                  >
                    <span className="text-brand">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <Card className="mb-6 p-6">
              <h2 className="text-heading mb-3">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex gap-2 text-foreground-secondary"
                  >
                    <span className="text-brand">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <Card className="mb-6 p-6">
              <h2 className="text-heading mb-3">Benefits</h2>
              <ul className="space-y-2">
                {job.benefits.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex gap-2 text-foreground-secondary"
                  >
                    <span className="text-brand">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* About the company */}
          <Card className="mb-6 p-6">
            <div className="mb-3 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-brand" />
              <h2 className="text-heading">About {job.company.name}</h2>
            </div>
            <p className="mb-4 text-foreground-secondary">
              {job.company.description}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-foreground-muted">Industry:</span>
                <span className="font-medium text-foreground">
                  {job.company.industry}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-foreground-muted">Size:</span>
                <span className="font-medium text-foreground">
                  {job.company.size} employees
                </span>
              </div>
              {job.company.locations && job.company.locations.length > 0 && (
                <div className="flex gap-2">
                  <span className="text-foreground-muted">Locations:</span>
                  <span className="font-medium text-foreground">
                    {job.company.locations.join(", ")}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Bottom CTA */}
          <div className="flex gap-3">
            <Button
              variant={isSaved ? "secondary" : "ghost"}
              className="flex-1"
              onClick={handleSave}
              disabled={actionPending}
              size="lg"
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="mr-2 h-5 w-5" />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark className="mr-2 h-5 w-5" />
                  Save for later
                </>
              )}
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              size="lg"
              onClick={handleApply}
              disabled={actionPending}
            >
              {application ? (
                "View application"
              ) : (
                <>
                  Apply now
                  {job.external_url && (
                    <ExternalLink className="ml-2 h-4 w-4" />
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Apply Confirmation Dialog */}
      <ConfirmDialog
        open={showApplyDialog}
        onClose={() => setShowApplyDialog(false)}
        onConfirm={handleConfirmApply}
        title="Ready to apply?"
        description="We'll add this job to your application tracker, then send you to the employer's application page."
        confirmLabel="Continue to employer"
        cancelLabel="Cancel"
      />

      {/* Action Error Toast */}
      {actionError && (
        <Toast
          visible={!!actionError}
          message={actionError}
          onClose={() => setActionError(null)}
        />
      )}
    </AppShell>
  );
}
