"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  User,
  MapPin,
  Briefcase,
  Award,
  Target,
  Settings,
} from "lucide-react";

export default function ProfilePage() {
  const profile = {
    name: "Dylan",
    currentRole: "Tower Foreman",
    location: "Madison, WI",
    yearsExperience: 8,
    profileStrength: 82,
  };

  const skills = [
    { name: "Leadership", proficiency: "expert" },
    { name: "Field Operations", proficiency: "expert" },
    { name: "Construction", proficiency: "strong" },
    { name: "Safety Coordination", proficiency: "strong" },
    { name: "Crew Management", proficiency: "expert" },
    { name: "Telecommunications", proficiency: "strong" },
    { name: "Project Documentation", proficiency: "comfortable" },
    { name: "Fiber Optics", proficiency: "comfortable" },
  ];

  const experience = [
    {
      title: "Tower Foreman",
      company: "Midwest Telecom",
      period: "2020 - Present",
      current: true,
    },
    {
      title: "Lead Technician",
      company: "Midwest Telecom",
      period: "2017 - 2020",
      current: false,
    },
    {
      title: "Telecommunications Technician",
      company: "Regional Communications",
      period: "2015 - 2017",
      current: false,
    },
  ];

  const certifications = [
    "OSHA 30-Hour Construction",
    "Tower Climbing Safety",
    "First Aid/CPR",
  ];

  const careerGoals = [
    "Transition into project management",
    "Reduce physical demands of work",
    "Increase salary to $80K+",
    "Leverage leadership experience",
  ];

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={profile.name} size="xl" />
            <div>
              <h1 className="text-heading-lg mb-1">{profile.name}</h1>
              <p className="text-foreground-secondary">{profile.currentRole}</p>
              <div className="mt-1 flex items-center gap-2 text-sm text-foreground-muted">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </div>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Edit
          </Button>
        </div>

        {/* Profile Strength */}
        <Card className="mb-6 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-heading mb-1">Profile strength</h2>
              <p className="text-sm text-foreground-secondary">
                {profile.profileStrength}% complete
              </p>
            </div>
            <div className="text-2xl font-bold text-brand">
              {profile.profileStrength}%
            </div>
          </div>
          <Progress
            value={profile.profileStrength}
            max={100}
            size="md"
            barClassName="bg-brand"
          />
          <div className="mt-3 space-y-1 text-sm text-foreground-muted">
            <p>• Add portfolio projects to reach 90%</p>
            <p>• Complete career goals section to reach 95%</p>
          </div>
        </Card>

        {/* About */}
        <Card className="mb-6 p-6">
          <div className="mb-3 flex items-center gap-2">
            <User className="h-5 w-5 text-brand" />
            <h2 className="text-heading">About</h2>
          </div>
          <p className="text-foreground-secondary">
            Experienced telecommunications professional with {profile.yearsExperience} years
            in field operations and crew leadership. Proven track record in
            managing construction projects, ensuring safety compliance, and
            leading high-performing teams. Currently seeking opportunities to
            transition into project management roles that leverage my leadership
            experience while reducing physical demands.
          </p>
        </Card>

        {/* Experience */}
        <Card className="mb-6 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-brand" />
            <h2 className="text-heading">Experience</h2>
          </div>
          <div className="space-y-4">
            {experience.map((exp, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-start justify-between">
                    <h3 className="font-semibold text-foreground">
                      {exp.title}
                    </h3>
                    {exp.current && (
                      <Badge variant="brand" size="sm">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-foreground-secondary">
                    {exp.company}
                  </p>
                  <p className="text-sm text-foreground-muted">{exp.period}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Skills */}
        <Card className="mb-6 p-6">
          <h2 className="text-heading mb-4">Skills</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {skills.map((skill) => (
              <div key={skill.name} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {skill.name}
                    </p>
                    <Badge variant="muted" size="sm" className="capitalize">
                      {skill.proficiency}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Certifications */}
        <Card className="mb-6 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-brand" />
            <h2 className="text-heading">Certifications</h2>
          </div>
          <div className="space-y-2">
            {certifications.map((cert) => (
              <div key={cert} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-brand" />
                <p className="text-foreground-secondary">{cert}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Career Goals */}
        <Card className="mb-6 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-brand" />
            <h2 className="text-heading">What I'm looking for</h2>
          </div>
          <div className="space-y-2">
            {careerGoals.map((goal, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                <p className="text-foreground-secondary">{goal}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Career Direction */}
        <Card className="overflow-hidden p-6">
          <div className="mb-4">
            <h2 className="text-heading mb-1">Aiming toward</h2>
            <p className="text-sm text-foreground-secondary">
              Based on your profile and goals
            </p>
          </div>
          <div className="space-y-2">
            <Badge variant="brand" size="lg">
              Project Engineer
            </Badge>
            <Badge variant="brand" size="lg">
              Construction Manager
            </Badge>
            <Badge variant="brand" size="lg">
              Field Operations Manager
            </Badge>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
