/**
 * Local storage abstraction for job actions
 * This will be replaced by Supabase in Phase 8
 */

export interface PassedJob {
  jobId: string;
  passedAt: string;
  reason?: string;
}

// Saved Jobs
export function getSavedJobs(): string[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("savedJobs");
  return saved ? JSON.parse(saved) : [];
}

export function saveJob(jobId: string): void {
  const savedIds = getSavedJobs();
  if (!savedIds.includes(jobId)) {
    savedIds.push(jobId);
    localStorage.setItem("savedJobs", JSON.stringify(savedIds));
  }
}

export function unsaveJob(jobId: string): void {
  const savedIds = getSavedJobs();
  const filtered = savedIds.filter((id) => id !== jobId);
  localStorage.setItem("savedJobs", JSON.stringify(filtered));
}

export function isJobSaved(jobId: string): boolean {
  return getSavedJobs().includes(jobId);
}

// Passed Jobs
export function getPassedJobs(): PassedJob[] {
  if (typeof window === "undefined") return [];
  const passed = localStorage.getItem("passedJobs");
  return passed ? JSON.parse(passed) : [];
}

export function passJob(jobId: string, reason?: string): void {
  const passedJobs = getPassedJobs();

  // Don't add duplicate
  if (passedJobs.some((p) => p.jobId === jobId)) return;

  passedJobs.push({
    jobId,
    passedAt: new Date().toISOString(),
    reason,
  });

  localStorage.setItem("passedJobs", JSON.stringify(passedJobs));
}

export function undoPass(jobId: string): void {
  const passedJobs = getPassedJobs();
  const filtered = passedJobs.filter((p) => p.jobId !== jobId);
  localStorage.setItem("passedJobs", JSON.stringify(filtered));
}

export function isJobPassed(jobId: string): boolean {
  return getPassedJobs().some((p) => p.jobId === jobId);
}

export function getPassedJobIds(): string[] {
  return getPassedJobs().map((p) => p.jobId);
}

// Daily Progress
export interface DailyProgressData {
  date: string;
  reviewed: number;
}

export function getDailyProgress(): DailyProgressData {
  if (typeof window === "undefined") {
    return { date: new Date().toDateString(), reviewed: 0 };
  }

  const today = new Date().toDateString();
  const stored = localStorage.getItem("dailyProgress");

  if (stored) {
    const data = JSON.parse(stored);
    if (data.date === today) {
      return data;
    }
  }

  // Reset for new day
  return { date: today, reviewed: 0 };
}

export function incrementDailyProgress(): void {
  const progress = getDailyProgress();
  const newProgress = {
    date: progress.date,
    reviewed: progress.reviewed + 1,
  };
  localStorage.setItem("dailyProgress", JSON.stringify(newProgress));
}
