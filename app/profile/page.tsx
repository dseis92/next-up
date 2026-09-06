"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { getUserProfile, type UserProfile } from "@/lib/storage/profile";
import {
  User,
  MapPin,
  Briefcase,
  Award,
  Target,
  Settings,
  DollarSign,
  Globe,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const userProfile = getUserProfile();
    setProfile(userProfile);

    // If no profile exists, redirect to onboarding
    if (!userProfile || !userProfile.currentRole) {
      router.push("/onboarding");
    }
  }, [router]);

  if (!profile) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center p-4">
          <p className="text-foreground-secondary">Loading profile...</p>
        </div>
      </AppShell>
    );
  }

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
              {profile.location && (
                <div className="mt-1 flex items-center gap-2 text-sm text-foreground-muted">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </div>
              )}
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={() => router.push("/onboarding")}
          >
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
          {profile.profileStrength < 100 && (
            <div className="mt-3 space-y-1 text-sm text-foreground-muted">
              {profile.profileStrength < 90 && (
                <p>• Complete onboarding to reach 90%</p>
              )}
              {!profile.about && <p>• Add an about section to increase strength</p>}
            </div>
          )}
        </Card>

        {/* About */}
        {profile.about && (
          <Card className="mb-6 p-6">
            <div className="mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-brand" />
              <h2 className="text-heading">About</h2>
            </div>
            <p className="text-foreground-secondary">{profile.about}</p>
          </Card>
        )}

        {/* Career Overview */}
        <Card className="mb-6 p-6">
          <h2 className="text-heading mb-4">Career overview</h2>
          <div className="space-y-3">
            {profile.currentRole && (
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-brand" />
                <div>
                  <p className="text-sm text-foreground-muted">Current role</p>
                  <p className="font-medium text-foreground">{profile.currentRole}</p>
                </div>
              </div>
            )}
            {profile.industry && (
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-brand" />
                <div>
                  <p className="text-sm text-foreground-muted">Industry</p>
                  <p className="font-medium text-foreground">{profile.industry}</p>
                </div>
              </div>
            )}
            {profile.yearsExperience !== undefined && (
              <div className="flex items-start gap-3">
                <Award className="h-5 w-5 text-brand" />
                <div>
                  <p className="text-sm text-foreground-muted">Experience</p>
                  <p className="font-medium text-foreground">
                    {profile.yearsExperience} years
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Skills */}
        {profile.skills.length > 0 && (
          <Card className="mb-6 p-6">
            <h2 className="text-heading mb-4">Skills</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {profile.skills.map((skill) => (
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
        )}

        {/* Career Goals */}
        {profile.goals.length > 0 && (
          <Card className="mb-6 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-brand" />
              <h2 className="text-heading">What I'm looking for</h2>
            </div>
            <div className="space-y-2">
              {profile.goals.map((goal, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  <p className="text-foreground-secondary">{goal}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Target Roles */}
        {profile.targetRoles.length > 0 && (
          <Card className="mb-6 p-6">
            <div className="mb-4">
              <h2 className="text-heading mb-1">Aiming toward</h2>
              <p className="text-sm text-foreground-secondary">
                Based on your goals and background
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.targetRoles.map((role) => (
                <Badge key={role} variant="brand" size="lg">
                  {role}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Salary & Work Preferences */}
        {(profile.salaryMin || profile.workPreferences) && (
          <Card className="mb-6 p-6">
            <h2 className="text-heading mb-4">Preferences</h2>
            <div className="space-y-3">
              {profile.salaryMin && (
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-brand" />
                  <div>
                    <p className="text-sm text-foreground-muted">Salary target</p>
                    <p className="font-medium text-foreground">
                      ${(profile.salaryMin / 1000).toFixed(0)}K
                      {profile.salaryIdeal &&
                        ` - $${(profile.salaryIdeal / 1000).toFixed(0)}K`}
                    </p>
                  </div>
                </div>
              )}
              {profile.workPreferences && (
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-brand" />
                  <div>
                    <p className="text-sm text-foreground-muted">
                      Work arrangement
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {profile.workPreferences.remote && (
                        <Badge variant="muted" size="sm">
                          Remote
                        </Badge>
                      )}
                      {profile.workPreferences.hybrid && (
                        <Badge variant="muted" size="sm">
                          Hybrid
                        </Badge>
                      )}
                      {profile.workPreferences.onsite && (
                        <Badge variant="muted" size="sm">
                          On-site
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {profile.preferredLocations.length > 0 && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-brand" />
                  <div>
                    <p className="text-sm text-foreground-muted">
                      Preferred locations
                    </p>
                    <p className="font-medium text-foreground">
                      {profile.preferredLocations.join(", ")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
