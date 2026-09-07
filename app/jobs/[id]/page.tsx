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
import { IncompleteProfileMessage } from "@/components/jobs/incomplete-profile-message";
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
} from "lucide-react";
import type { JobMatch, Application } from "@/types";
import type { MatchResult } from "@/lib/matching/types";

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
    if (isSaved) {
      await unsaveJob(jobId);
      setIsSaved(false);
    } else {
      await saveJob(jobId);
      setIsSaved(true);
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
    if (!job) return;

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

  if (!job) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center p-4">
          <p className="text-foreground-secondary">Job not found</p>
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
              Unable to load your personalized match right now.
            </p>
            <p className="text-foreground-secondary text-sm">
              Please try again later.
            </p>
          </div>
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
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              variant={isSaved ? "primary" : "secondary"}
              size="sm"
              onClick={handleSave}
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
    </AppShell>
  );
}
