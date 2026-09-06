"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  getApplicationById,
  updateApplicationStage,
  updateApplication,
  getApplicationEvents,
  getApplicationNotes,
  createApplicationNote,
  updateApplicationNote,
} from "@/lib/storage/applications";
import { formatSalary, formatRelativeDate } from "@/lib/utils";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Calendar,
  ExternalLink,
  Plus,
  Edit2,
  Check,
  X,
} from "lucide-react";
import type { Application, ApplicationStage, ApplicationEvent } from "@/types";
import type { ApplicationNote } from "@/lib/storage/applications";

const STAGE_OPTIONS: { value: ApplicationStage; label: string }[] = [
  { value: "preparing", label: "Preparing" },
  { value: "applied", label: "Applied" },
  { value: "recruiter_screen", label: "Recruiter Screen" },
  { value: "interview", label: "Interview" },
  { value: "final_interview", label: "Final Interview" },
  { value: "offer", label: "Offer" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [events, setEvents] = useState<ApplicationEvent[]>([]);
  const [notes, setNotes] = useState<ApplicationNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");

  useEffect(() => {
    const loadApplication = async () => {
      const app = await getApplicationById(appId);
      setApplication(app);

      if (app) {
        setEvents(await getApplicationEvents(appId));
        setNotes(await getApplicationNotes(appId));
      }
    };

    loadApplication();
  }, [appId]);

  const handleStageChange = async (newStage: ApplicationStage) => {
    const updated = await updateApplicationStage(appId, newStage);
    if (updated) {
      setApplication(updated);
      setEvents(await getApplicationEvents(appId));
    }
  };

  const handleAddNote = async () => {
    if (newNote.trim()) {
      await createApplicationNote(appId, newNote.trim());
      setNotes(await getApplicationNotes(appId));
      setNewNote("");
    }
  };

  const handleEditNote = async (noteId: string) => {
    if (editingNoteText.trim()) {
      await updateApplicationNote(appId, noteId, editingNoteText.trim());
      setNotes(await getApplicationNotes(appId));
      setEditingNoteId(null);
      setEditingNoteText("");
    }
  };

  const startEditNote = (note: ApplicationNote) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.body);
  };

  const cancelEditNote = () => {
    setEditingNoteId(null);
    setEditingNoteText("");
  };

  if (!application) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center p-4">
          <p className="text-foreground-secondary">Application not found</p>
        </div>
      </AppShell>
    );
  }

  const { job } = application;

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
            {job.external_url && (
              <a
                href={job.external_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="sm" className="gap-2">
                  Job posting
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </div>

        <div className="p-4 pb-8">
          {/* Header Section */}
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
                </div>
              </div>
            </div>

            {job.salary_min && (
              <div className="mb-4">
                <p className="text-display text-foreground">
                  {formatSalary(
                    job.salary_min,
                    job.salary_max,
                    job.salary_period
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Current Stage */}
          <Card className="mb-6 p-6">
            <h2 className="text-heading mb-3">Current stage</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {STAGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStageChange(option.value)}
                  className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                    application.stage === option.value
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-surface text-foreground-secondary hover:border-foreground-muted"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Application Info */}
          <Card className="mb-6 p-6">
            <h2 className="text-heading mb-4">Application details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Applied</span>
                <span className="font-medium text-foreground">
                  {formatRelativeDate(
                    new Date(application.applied_date || application.created_at)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Source</span>
                <span className="font-medium capitalize text-foreground">
                  {application.source?.replace("_", " ") || "NextUp"}
                </span>
              </div>
              {application.next_action && (
                <>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Next action</span>
                    <span className="font-medium text-foreground">
                      {application.next_action}
                    </span>
                  </div>
                  {application.next_action_date && (
                    <div className="flex justify-between">
                      <span className="text-foreground-muted">By</span>
                      <span className="font-medium text-foreground">
                        {formatRelativeDate(
                          new Date(application.next_action_date)
                        )}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Timeline */}
          <Card className="mb-6 p-6">
            <h2 className="text-heading mb-4">Timeline</h2>
            <div className="space-y-3">
              {events
                .slice()
                .reverse()
                .map((event, idx) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/20">
                        <div className="h-2 w-2 rounded-full bg-brand" />
                      </div>
                      {idx < events.length - 1 && (
                        <div className="w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium text-foreground">
                        {event.description || event.event_type}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {formatRelativeDate(new Date(event.event_date))}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Notes */}
          <Card className="mb-6 p-6">
            <h2 className="text-heading mb-4">Notes</h2>

            {/* Add note */}
            <div className="mb-4 flex gap-2">
              <Input
                type="text"
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddNote();
                  }
                }}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddNote}
                disabled={!newNote.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Notes list */}
            <div className="space-y-3">
              {notes.length === 0 ? (
                <p className="text-center text-sm text-foreground-muted">
                  No notes yet
                </p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg bg-surface-muted p-3"
                  >
                    {editingNoteId === note.id ? (
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={editingNoteText}
                          onChange={(e) => setEditingNoteText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleEditNote(note.id);
                            } else if (e.key === "Escape") {
                              cancelEditNote();
                            }
                          }}
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditNote(note.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEditNote}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm text-foreground">
                            {note.body}
                          </p>
                          <p className="mt-1 text-xs text-foreground-muted">
                            {formatRelativeDate(new Date(note.createdAt))}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditNote(note)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
