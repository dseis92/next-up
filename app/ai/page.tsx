"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import {
  Sparkles,
  FileText,
  Target,
  MessageSquare,
  TrendingUp,
  Search,
  Lightbulb,
  ListChecks,
} from "lucide-react";

const starterPrompts = [
  {
    icon: Search,
    title: "Find jobs for me",
    description: "Help me discover opportunities that match my profile",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: Target,
    title: "Explore new careers",
    description: "What career paths make sense for my background?",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    icon: FileText,
    title: "Improve my resume",
    description: "Get suggestions to make my resume stronger",
    gradient: "from-green-500 to-green-600",
  },
  {
    icon: MessageSquare,
    title: "Prepare for interviews",
    description: "Practice common questions and prepare responses",
    gradient: "from-orange-500 to-orange-600",
  },
  {
    icon: ListChecks,
    title: "Analyze this job",
    description: "Should I apply? Get detailed job fit analysis",
    gradient: "from-pink-500 to-pink-600",
  },
  {
    icon: TrendingUp,
    title: "Build a career plan",
    description: "Create a roadmap to reach my career goals",
    gradient: "from-indigo-500 to-indigo-600",
  },
  {
    icon: Lightbulb,
    title: "Skill gap analysis",
    description: "What skills should I develop for my target roles?",
    gradient: "from-yellow-500 to-yellow-600",
  },
  {
    icon: FileText,
    title: "Write a cover letter",
    description: "Generate a personalized cover letter for this job",
    gradient: "from-teal-500 to-teal-600",
  },
];

export default function AIPage() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-brand-foreground">
              <Sparkles className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-heading-lg mb-2">AI Career Coach</h1>
          <p className="text-foreground-secondary">
            Get personalized guidance for your career journey
          </p>
        </div>

        {/* Context Card */}
        <Card variant="elevated" className="mb-6 p-4">
          <div className="flex items-center gap-3">
            <Avatar name="Dylan" size="md" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                I know about your profile
              </p>
              <p className="text-xs text-foreground-muted">
                Tower Foreman • 8 years experience • Madison, WI
              </p>
            </div>
            <div className="rounded-full bg-green-500/10 px-3 py-1">
              <p className="text-xs font-medium text-green-500">Ready</p>
            </div>
          </div>
        </Card>

        {/* Starter Prompts */}
        <div>
          <h2 className="mb-4 text-sm font-medium text-foreground-muted">
            What would you like help with?
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {starterPrompts.map((prompt) => {
              const Icon = prompt.icon;
              return (
                <Card
                  key={prompt.title}
                  variant="elevated"
                  className="group cursor-pointer p-4 transition-all hover:shadow-lg"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${prompt.gradient} text-white`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 font-semibold text-foreground group-hover:text-brand">
                        {prompt.title}
                      </h3>
                      <p className="text-sm text-foreground-secondary">
                        {prompt.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="mt-8">
          <h2 className="mb-4 text-sm font-medium text-foreground-muted">
            Recent conversations
          </h2>
          <Card variant="muted" className="p-6 text-center">
            <p className="text-sm text-foreground-muted">
              Your AI conversations will appear here
            </p>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="mt-6 p-4">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10">
              <Sparkles className="h-4 w-4 text-brand" />
            </div>
            <div className="flex-1 space-y-1 text-sm">
              <p className="font-medium text-foreground">
                AI that knows your career
              </p>
              <p className="text-foreground-secondary">
                Your career coach understands your background, skills, and goals
                to provide personalized advice. All conversations are private
                and designed to help you make informed decisions.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
