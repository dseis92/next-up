/**
 * Local storage abstraction for applications
 * This will be replaced by Supabase in Phase 8
 */

import type { Application, ApplicationStage, ApplicationEvent } from "@/types";

export interface ApplicationNote {
  id: string;
  applicationId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

// Applications
export function getApplications(): Application[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("applications");
  return stored ? JSON.parse(stored) : [];
}

export function getApplicationById(id: string): Application | null {
  const apps = getApplications();
  return apps.find((app) => app.id === id) || null;
}

export function getApplicationByJobId(jobId: string): Application | null {
  const apps = getApplications();
  return apps.find((app) => app.job_id === jobId) || null;
}

export function createApplication(data: {
  jobId: string;
  job: Application["job"];
  stage?: ApplicationStage;
  source?: string;
}): Application {
  const apps = getApplications();

  // Check for duplicate
  const existing = apps.find((app) => app.job_id === data.jobId);
  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  const newApp: Application = {
    id: crypto.randomUUID(),
    user_id: "local-user", // Will be replaced with real user ID in Phase 8
    job_id: data.jobId,
    job: data.job,
    stage: data.stage || "applied",
    applied_date: now,
    source: data.source || "nextup_discover",
    created_at: now,
    updated_at: now,
  };

  apps.push(newApp);
  localStorage.setItem("applications", JSON.stringify(apps));

  // Create initial event
  createApplicationEvent({
    applicationId: newApp.id,
    eventType: "created",
    description: "Application created",
  });

  return newApp;
}

export function updateApplicationStage(
  applicationId: string,
  newStage: ApplicationStage
): Application | null {
  const apps = getApplications();
  const app = apps.find((a) => a.id === applicationId);

  if (!app) return null;

  const oldStage = app.stage;
  app.stage = newStage;
  app.updated_at = new Date().toISOString();

  localStorage.setItem("applications", JSON.stringify(apps));

  // Create stage change event
  createApplicationEvent({
    applicationId,
    eventType: "stage_change",
    fromStage: oldStage,
    toStage: newStage,
    description: `Moved to ${newStage.replace("_", " ")}`,
  });

  return app;
}

export function updateApplication(
  applicationId: string,
  updates: Partial<
    Pick<
      Application,
      | "next_action"
      | "next_action_date"
      | "recruiter_name"
      | "recruiter_email"
      | "salary_offered"
      | "notes"
    >
  >
): Application | null {
  const apps = getApplications();
  const app = apps.find((a) => a.id === applicationId);

  if (!app) return null;

  Object.assign(app, updates);
  app.updated_at = new Date().toISOString();

  localStorage.setItem("applications", JSON.stringify(apps));
  return app;
}

// Application Events
export function getApplicationEvents(applicationId: string): ApplicationEvent[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(`app_events_${applicationId}`);
  return stored ? JSON.parse(stored) : [];
}

export function createApplicationEvent(data: {
  applicationId: string;
  eventType: string;
  fromStage?: ApplicationStage;
  toStage?: ApplicationStage;
  description?: string;
}): ApplicationEvent {
  const events = getApplicationEvents(data.applicationId);

  const newEvent: ApplicationEvent = {
    id: crypto.randomUUID(),
    application_id: data.applicationId,
    event_type: data.eventType,
    event_date: new Date().toISOString(),
    description: data.description,
    created_at: new Date().toISOString(),
  };

  events.push(newEvent);
  localStorage.setItem(
    `app_events_${data.applicationId}`,
    JSON.stringify(events)
  );

  return newEvent;
}

// Application Notes
export function getApplicationNotes(applicationId: string): ApplicationNote[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(`app_notes_${applicationId}`);
  return stored ? JSON.parse(stored) : [];
}

export function createApplicationNote(
  applicationId: string,
  body: string
): ApplicationNote {
  const notes = getApplicationNotes(applicationId);

  const newNote: ApplicationNote = {
    id: crypto.randomUUID(),
    applicationId,
    body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  notes.push(newNote);
  localStorage.setItem(`app_notes_${applicationId}`, JSON.stringify(notes));

  return newNote;
}

export function updateApplicationNote(
  applicationId: string,
  noteId: string,
  body: string
): ApplicationNote | null {
  const notes = getApplicationNotes(applicationId);
  const note = notes.find((n) => n.id === noteId);

  if (!note) return null;

  note.body = body;
  note.updatedAt = new Date().toISOString();

  localStorage.setItem(`app_notes_${applicationId}`, JSON.stringify(notes));
  return note;
}

export function deleteApplicationNote(
  applicationId: string,
  noteId: string
): boolean {
  const notes = getApplicationNotes(applicationId);
  const filtered = notes.filter((n) => n.id !== noteId);

  if (filtered.length === notes.length) return false;

  localStorage.setItem(`app_notes_${applicationId}`, JSON.stringify(filtered));
  return true;
}
