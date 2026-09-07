/**
 * Applications storage
 * Uses Supabase for persistence
 */

import { createClient } from "@/lib/supabase/client";
import type { Application, ApplicationStage, ApplicationEvent } from "@/types";

export interface ApplicationNote {
  id: string;
  applicationId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

// Applications
/**
 * Get all applications for the current user
 *
 * @throws Error if the database query fails
 * @returns Array of applications (may be empty if no applications)
 */
export async function getApplications(): Promise<Application[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      job:jobs (
        *,
        company:companies (*)
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch applications:", { userId: user.id, error: error.message });
    throw new Error("Unable to load applications. Please try again.");
  }

  return (
    data?.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      job_id: row.job_id,
      job: {
        ...row.job,
        company: row.job.company,
      },
      stage: row.stage as ApplicationStage,
      applied_date: row.applied_date,
      source: row.source,
      salary_offered: row.salary_offered,
      recruiter_name: row.recruiter_name,
      recruiter_email: row.recruiter_email,
      next_action: row.next_action,
      next_action_date: row.next_action_date,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })) || []
  );
}

/**
 * Get a single application by ID
 *
 * @throws Error if the database query fails
 * @returns Application if found, null if not found
 */
export async function getApplicationById(id: string): Promise<Application | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      job:jobs (
        *,
        company:companies (*)
      )
    `
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch application by id:", { applicationId: id, error: error.message });
    throw new Error("Unable to load application details. Please try again.");
  }

  if (!data) return null;

  return {
    id: data.id,
    user_id: data.user_id,
    job_id: data.job_id,
    job: {
      ...data.job,
      company: data.job.company,
    },
    stage: data.stage as ApplicationStage,
    applied_date: data.applied_date,
    source: data.source,
    salary_offered: data.salary_offered,
    recruiter_name: data.recruiter_name,
    recruiter_email: data.recruiter_email,
    next_action: data.next_action,
    next_action_date: data.next_action_date,
    notes: data.notes,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Get an application by job ID
 *
 * @throws Error if the database query fails
 * @returns Application if found, null if not found
 */
export async function getApplicationByJobId(jobId: string): Promise<Application | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      job:jobs (
        *,
        company:companies (*)
      )
    `
    )
    .eq("job_id", jobId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch application by job id:", { jobId, error: error.message });
    throw new Error("Unable to load application. Please try again.");
  }

  if (!data) return null;

  return {
    id: data.id,
    user_id: data.user_id,
    job_id: data.job_id,
    job: {
      ...data.job,
      company: data.job.company,
    },
    stage: data.stage as ApplicationStage,
    applied_date: data.applied_date,
    source: data.source,
    salary_offered: data.salary_offered,
    recruiter_name: data.recruiter_name,
    recruiter_email: data.recruiter_email,
    next_action: data.next_action,
    next_action_date: data.next_action_date,
    notes: data.notes,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function createApplication(data: {
  jobId: string;
  job: Application["job"];
  stage?: ApplicationStage;
  source?: string;
}): Promise<Application> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  // Check for existing application
  const existing = await getApplicationByJobId(data.jobId);
  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();

  const { data: newApp, error } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      job_id: data.jobId,
      stage: data.stage || "applied",
      applied_date: now,
      source: data.source || "nextup_discover",
    })
    .select(
      `
      *,
      job:jobs (
        *,
        company:companies (*)
      )
    `
    )
    .single();

  if (error) {
    console.error("Failed to create application:", { jobId: data.jobId, error: error.message });
    throw new Error("Failed to create application");
  }

  // Create initial event
  await createApplicationEvent({
    applicationId: newApp.id,
    eventType: "created",
    description: "Application created",
  });

  return {
    id: newApp.id,
    user_id: newApp.user_id,
    job_id: newApp.job_id,
    job: {
      ...newApp.job,
      company: newApp.job.company,
    },
    stage: newApp.stage as ApplicationStage,
    applied_date: newApp.applied_date,
    source: newApp.source,
    salary_offered: newApp.salary_offered,
    recruiter_name: newApp.recruiter_name,
    recruiter_email: newApp.recruiter_email,
    next_action: newApp.next_action,
    next_action_date: newApp.next_action_date,
    notes: newApp.notes,
    created_at: newApp.created_at,
    updated_at: newApp.updated_at,
  };
}

export async function updateApplicationStage(
  applicationId: string,
  newStage: ApplicationStage
): Promise<Application | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get current application
  const app = await getApplicationById(applicationId);
  if (!app) return null;

  const oldStage = app.stage;

  // Update stage
  const { data, error } = await supabase
    .from("applications")
    .update({ stage: newStage })
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .select(
      `
      *,
      job:jobs (
        *,
        company:companies (*)
      )
    `
    )
    .single();

  if (error) {
    console.error("Failed to update application stage:", { applicationId, newStage, error: error.message });
    throw new Error("Failed to update application stage");
  }

  if (!data) return null;

  // Create stage change event
  await createApplicationEvent({
    applicationId,
    eventType: "stage_change",
    fromStage: oldStage,
    toStage: newStage,
    description: `Moved to ${newStage.replace("_", " ")}`,
  });

  return {
    id: data.id,
    user_id: data.user_id,
    job_id: data.job_id,
    job: {
      ...data.job,
      company: data.job.company,
    },
    stage: data.stage as ApplicationStage,
    applied_date: data.applied_date,
    source: data.source,
    salary_offered: data.salary_offered,
    recruiter_name: data.recruiter_name,
    recruiter_email: data.recruiter_email,
    next_action: data.next_action,
    next_action_date: data.next_action_date,
    notes: data.notes,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function updateApplication(
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
): Promise<Application | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("applications")
    .update(updates)
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .select(
      `
      *,
      job:jobs (
        *,
        company:companies (*)
      )
    `
    )
    .single();

  if (error) {
    console.error("Failed to update application:", { applicationId, error: error.message });
    throw new Error("Failed to update application");
  }

  if (!data) return null;

  return {
    id: data.id,
    user_id: data.user_id,
    job_id: data.job_id,
    job: {
      ...data.job,
      company: data.job.company,
    },
    stage: data.stage as ApplicationStage,
    applied_date: data.applied_date,
    source: data.source,
    salary_offered: data.salary_offered,
    recruiter_name: data.recruiter_name,
    recruiter_email: data.recruiter_email,
    next_action: data.next_action,
    next_action_date: data.next_action_date,
    notes: data.notes,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

// Application Events
export async function getApplicationEvents(
  applicationId: string
): Promise<ApplicationEvent[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("application_events")
    .select("*")
    .eq("application_id", applicationId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch application events:", { applicationId, error: error.message });
    return [];
  }

  return (
    data?.map((row) => ({
      id: row.id,
      application_id: row.application_id,
      event_type: row.event_type,
      from_stage: row.from_stage as ApplicationStage | undefined,
      to_stage: row.to_stage as ApplicationStage | undefined,
      description: row.description,
      event_date: row.event_date,
      created_at: row.created_at,
    })) || []
  );
}

export async function createApplicationEvent(data: {
  applicationId: string;
  eventType: string;
  fromStage?: ApplicationStage;
  toStage?: ApplicationStage;
  description?: string;
}): Promise<ApplicationEvent> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data: newEvent, error } = await supabase
    .from("application_events")
    .insert({
      application_id: data.applicationId,
      user_id: user.id,
      event_type: data.eventType,
      from_stage: data.fromStage,
      to_stage: data.toStage,
      description: data.description,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create application event:", { applicationId: data.applicationId, eventType: data.eventType, error: error.message });
    throw new Error("Failed to create application event");
  }

  return {
    id: newEvent.id,
    application_id: newEvent.application_id,
    event_type: newEvent.event_type,
    from_stage: newEvent.from_stage as ApplicationStage | undefined,
    to_stage: newEvent.to_stage as ApplicationStage | undefined,
    description: newEvent.description,
    event_date: newEvent.event_date,
    created_at: newEvent.created_at,
  };
}

// Application Notes
export async function getApplicationNotes(
  applicationId: string
): Promise<ApplicationNote[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("application_notes")
    .select("*")
    .eq("application_id", applicationId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch application notes:", { applicationId, error: error.message });
    return [];
  }

  return (
    data?.map((row) => ({
      id: row.id,
      applicationId: row.application_id,
      body: row.body,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })) || []
  );
}

export async function createApplicationNote(
  applicationId: string,
  body: string
): Promise<ApplicationNote> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data: newNote, error } = await supabase
    .from("application_notes")
    .insert({
      application_id: applicationId,
      user_id: user.id,
      body,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create application note:", { applicationId, error: error.message });
    throw new Error("Failed to create application note");
  }

  return {
    id: newNote.id,
    applicationId: newNote.application_id,
    body: newNote.body,
    createdAt: newNote.created_at,
    updatedAt: newNote.updated_at,
  };
}

export async function updateApplicationNote(
  applicationId: string,
  noteId: string,
  body: string
): Promise<ApplicationNote | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("application_notes")
    .update({ body })
    .eq("id", noteId)
    .eq("application_id", applicationId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Failed to update application note:", { applicationId, noteId, error: error.message });
    throw new Error("Failed to update application note");
  }

  if (!data) return null;

  return {
    id: data.id,
    applicationId: data.application_id,
    body: data.body,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function deleteApplicationNote(
  applicationId: string,
  noteId: string
): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("application_notes")
    .delete()
    .eq("id", noteId)
    .eq("application_id", applicationId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to delete application note:", { applicationId, noteId, error: error.message });
    throw new Error("Failed to delete application note");
  }

  return true;
}
