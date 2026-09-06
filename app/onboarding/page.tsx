"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  getOnboardingData,
  saveOnboardingData,
  type OnboardingData,
} from "@/lib/storage/onboarding";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  DollarSign,
  Briefcase,
  Target,
  Award,
  MapPin,
  Settings,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

const TOTAL_STEPS = 10;

// Step 1: Goals
function GoalsStep({
  data,
  onUpdate,
}: {
  data: Partial<OnboardingData>;
  onUpdate: (updates: Partial<OnboardingData>) => void;
}) {
  const goalOptions = [
    "More money",
    "Better hours",
    "Remote work",
    "Less travel",
    "Career growth",
    "Management opportunities",
    "Less physical work",
    "New industry",
    "Better benefits",
    "More meaningful work",
  ];

  const selected = data.goals || [];

  const toggle = (goal: string) => {
    const newGoals = selected.includes(goal)
      ? selected.filter((g) => g !== goal)
      : [...selected, goal];
    onUpdate({ goals: newGoals });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-heading-lg mb-2">What would make your next job better?</h1>
        <p className="text-foreground-secondary">Select all that apply</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {goalOptions.map((goal) => (
          <button
            key={goal}
            onClick={() => toggle(goal)}
            className={`rounded-xl border-2 p-4 text-left transition-all ${
              selected.includes(goal)
                ? "border-brand bg-brand/10 text-brand"
                : "border-border bg-surface text-foreground hover:border-foreground-muted"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium">{goal}</span>
              {selected.includes(goal) && (
                <Check className="h-5 w-5 shrink-0" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 2: Current Career
function CurrentCareerStep({
  data,
  onUpdate,
}: {
  data: Partial<OnboardingData>;
  onUpdate: (updates: Partial<OnboardingData>) => void;
}) {
  const statusOptions = [
    "Employed",
    "Unemployed",
    "Student",
    "Freelancer",
    "Career break",
    "Other",
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-heading-lg mb-2">Tell us about your current role</h1>
        <p className="text-foreground-secondary">
          This helps us understand your background
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Current job title
          </label>
          <Input
            type="text"
            placeholder="e.g., Tower Foreman"
            value={data.currentTitle || ""}
            onChange={(e) => onUpdate({ currentTitle: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Industry
          </label>
          <Input
            type="text"
            placeholder="e.g., Telecommunications"
            value={data.industry || ""}
            onChange={(e) => onUpdate({ industry: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Years of experience
          </label>
          <Input
            type="number"
            placeholder="8"
            value={data.yearsExperience || ""}
            onChange={(e) =>
              onUpdate({ yearsExperience: parseInt(e.target.value) || 0 })
            }
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Employment status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => onUpdate({ employmentStatus: status })}
                className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                  data.employmentStatus === status
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border bg-surface text-foreground hover:border-foreground-muted"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 3: Experience (Simplified for MVP)
function ExperienceStep({
  data,
  onUpdate,
}: {
  data: Partial<OnboardingData>;
  onUpdate: (updates: Partial<OnboardingData>) => void;
}) {
  const hasExperience = (data.experiences?.length || 0) > 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-heading-lg mb-2">Work experience</h1>
        <p className="text-foreground-secondary">
          We&apos;ll use your current role for now
        </p>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand/10">
            <Briefcase className="h-6 w-6 text-brand" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">
              {data.currentTitle || "Current role"}
            </h3>
            <p className="text-sm text-foreground-secondary">
              {data.yearsExperience} years experience
            </p>
          </div>
          <CheckCircle2 className="h-6 w-6 text-brand" />
        </div>
        <p className="text-sm text-foreground-muted">
          You can add more experience details later in your profile.
        </p>
      </Card>
    </div>
  );
}

// Step 4: Skills
function SkillsStep({
  data,
  onUpdate,
}: {
  data: Partial<OnboardingData>;
  onUpdate: (updates: Partial<OnboardingData>) => void;
}) {
  const [customSkill, setCustomSkill] = useState("");

  const suggestedSkills = [
    "Leadership",
    "Project Management",
    "Construction",
    "Safety Coordination",
    "Crew Management",
    "Telecommunications",
    "Field Operations",
    "Documentation",
  ];

  const skills = data.skills || [];

  const addSkill = (name: string, proficiency: OnboardingData["skills"][0]["proficiency"] = "strong") => {
    if (skills.some((s) => s.name === name)) return;
    onUpdate({ skills: [...skills, { name, proficiency }] });
  };

  const removeSkill = (name: string) => {
    onUpdate({ skills: skills.filter((s) => s.name !== name) });
  };

  const addCustomSkill = () => {
    if (customSkill.trim()) {
      addSkill(customSkill.trim());
      setCustomSkill("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-heading-lg mb-2">What are your key skills?</h1>
        <p className="text-foreground-secondary">
          Add the skills you&apos;re strongest in
        </p>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-foreground">
          Suggested skills
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestedSkills.map((skill) => {
            const hasSkill = skills.some((s) => s.name === skill);
            return (
              <button
                key={skill}
                onClick={() =>
                  hasSkill ? removeSkill(skill) : addSkill(skill)
                }
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  hasSkill
                    ? "bg-brand text-brand-foreground"
                    : "border border-border bg-surface text-foreground hover:border-brand"
                }`}
              >
                {skill}
                {hasSkill && <Check className="ml-1 inline h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-foreground">Add your own</p>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter a skill..."
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addCustomSkill();
              }
            }}
          />
          <Button onClick={addCustomSkill} disabled={!customSkill.trim()}>
            Add
          </Button>
        </div>
      </div>

      {skills.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-medium text-foreground">
            Your skills ({skills.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge
                key={skill.name}
                variant="brand"
                size="md"
                className="cursor-pointer"
                onClick={() => removeSkill(skill.name)}
              >
                {skill.name}
                <span className="ml-1">×</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Step 5: Target Roles
function TargetRolesStep({
  data,
  onUpdate,
}: {
  data: Partial<OnboardingData>;
  onUpdate: (updates: Partial<OnboardingData>) => void;
}) {
  const [customRole, setCustomRole] = useState("");

  const suggestedRoles = [
    "Project Engineer",
    "Assistant Project Manager",
    "Construction Manager",
    "Field Engineer",
    "Project Coordinator",
    "Operations Manager",
    "Telecommunications Construction Manager",
    "Site Supervisor",
  ];

  const roles = data.targetRoles || [];

  const toggle = (role: string) => {
    const newRoles = roles.includes(role)
      ? roles.filter((r) => r !== role)
      : [...roles, role];
    onUpdate({ targetRoles: newRoles });
  };

  const addCustomRole = () => {
    if (customRole.trim() && !roles.includes(customRole.trim())) {
      onUpdate({ targetRoles: [...roles, customRole.trim()] });
      setCustomRole("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-heading-lg mb-2">What roles interest you?</h1>
        <p className="text-foreground-secondary">Select all that apply</p>
      </div>

      <div className="grid gap-3">
        {suggestedRoles.map((role) => (
          <button
            key={role}
            onClick={() => toggle(role)}
            className={`rounded-xl border-2 p-4 text-left transition-all ${
              roles.includes(role)
                ? "border-brand bg-brand/10 text-brand"
                : "border-border bg-surface text-foreground hover:border-foreground-muted"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{role}</span>
              {roles.includes(role) && <Check className="h-5 w-5 shrink-0" />}
            </div>
          </button>
        ))}
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-foreground">
          Or add your own
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter a role..."
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addCustomRole();
              }
            }}
          />
          <Button onClick={addCustomRole} disabled={!customRole.trim()}>
            Add
          </Button>
        </div>
      </div>

      <button
        onClick={() => onUpdate({ targetRoles: ["Not sure yet"] })}
        className="w-full rounded-lg border-2 border-dashed border-border p-4 text-sm text-foreground-muted transition-colors hover:border-brand hover:text-brand"
      >
        I&apos;m not sure yet
      </button>
    </div>
  );
}

// Step 6: Salary
function SalaryStep({
  data,
  onUpdate,
}: {
  data: Partial<OnboardingData>;
  onUpdate: (updates: Partial<OnboardingData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-heading-lg mb-2">What&apos;s your salary target?</h1>
        <p className="text-foreground-secondary">
          This helps us filter opportunities
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <DollarSign className="h-4 w-4" />
            Minimum acceptable (yearly)
          </label>
          <Input
            type="number"
            placeholder="60000"
            value={data.salaryMin || ""}
            onChange={(e) =>
              onUpdate({ salaryMin: parseInt(e.target.value) || undefined })
            }
          />
          {data.salaryMin && (
            <p className="mt-1 text-xs text-foreground-muted">
              ${(data.salaryMin / 1000).toFixed(0)}K per year
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <TrendingUp className="h-4 w-4" />
            Ideal salary (yearly)
          </label>
          <Input
            type="number"
            placeholder="80000"
            value={data.salaryIdeal || ""}
            onChange={(e) =>
              onUpdate({ salaryIdeal: parseInt(e.target.value) || undefined })
            }
          />
          {data.salaryIdeal && (
            <p className="mt-1 text-xs text-foreground-muted">
              ${(data.salaryIdeal / 1000).toFixed(0)}K per year
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Step 7: Work Preferences
function WorkPreferencesStep({
  data,
  onUpdate,
}: {
  data: Partial<OnboardingData>;
  onUpdate: (updates: Partial<OnboardingData>) => void;
}) {
  const prefs = data.workPreferences || {
    remote: false,
    hybrid: false,
    onsite: false,
    fullTime: true,
    partTime: false,
    contract: false,
  };

  const updatePref = (key: keyof typeof prefs, value: boolean) => {
    onUpdate({ workPreferences: { ...prefs, [key]: value } });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-heading-lg mb-2">Work preferences</h1>
        <p className="text-foreground-secondary">
          What kind of work arrangement do you want?
        </p>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-foreground">
          Work location
        </p>
        <div className="grid gap-3">
          {[
            { key: "remote", label: "Remote", desc: "Work from anywhere" },
            {
              key: "hybrid",
              label: "Hybrid",
              desc: "Mix of remote and office",
            },
            { key: "onsite", label: "On-site", desc: "In-person at office" },
          ].map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() =>
                updatePref(
                  key as keyof typeof prefs,
                  !prefs[key as keyof typeof prefs]
                )
              }
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                prefs[key as keyof typeof prefs]
                  ? "border-brand bg-brand/10"
                  : "border-border bg-surface hover:border-foreground-muted"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{label}</p>
                  <p className="text-sm text-foreground-muted">{desc}</p>
                </div>
                {prefs[key as keyof typeof prefs] && (
                  <Check className="h-5 w-5 text-brand" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-foreground">
          Employment type
        </p>
        <div className="grid gap-3">
          {[
            { key: "fullTime", label: "Full-time", desc: "Standard employment" },
            { key: "partTime", label: "Part-time", desc: "Flexible hours" },
            { key: "contract", label: "Contract", desc: "Project-based work" },
          ].map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() =>
                updatePref(
                  key as keyof typeof prefs,
                  !prefs[key as keyof typeof prefs]
                )
              }
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                prefs[key as keyof typeof prefs]
                  ? "border-brand bg-brand/10"
                  : "border-border bg-surface hover:border-foreground-muted"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{label}</p>
                  <p className="text-sm text-foreground-muted">{desc}</p>
                </div>
                {prefs[key as keyof typeof prefs] && (
                  <Check className="h-5 w-5 text-brand" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 8: Location
function LocationStep({
  data,
  onUpdate,
}: {
  data: Partial<OnboardingData>;
  onUpdate: (updates: Partial<OnboardingData>) => void;
}) {
  const [newLocation, setNewLocation] = useState("");
  const locations = data.preferredLocations || [];

  const addLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      onUpdate({ preferredLocations: [...locations, newLocation.trim()] });
      setNewLocation("");
    }
  };

  const removeLocation = (loc: string) => {
    onUpdate({ preferredLocations: locations.filter((l) => l !== loc) });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-heading-lg mb-2">Location preferences</h1>
        <p className="text-foreground-secondary">Where do you want to work?</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Current location
        </label>
        <Input
          type="text"
          placeholder="e.g., Madison, WI"
          value={data.location || ""}
          onChange={(e) => onUpdate({ location: e.target.value })}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Preferred locations
        </label>
        <div className="mb-2 flex gap-2">
          <Input
            type="text"
            placeholder="Add a location..."
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addLocation();
              }
            }}
          />
          <Button onClick={addLocation} disabled={!newLocation.trim()}>
            Add
          </Button>
        </div>
        {locations.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {locations.map((loc) => (
              <Badge
                key={loc}
                variant="brand"
                className="cursor-pointer"
                onClick={() => removeLocation(loc)}
              >
                {loc} <span className="ml-1">×</span>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Maximum commute (minutes)
        </label>
        <Input
          type="number"
          placeholder="30"
          value={data.maxCommute || ""}
          onChange={(e) =>
            onUpdate({ maxCommute: parseInt(e.target.value) || undefined })
          }
        />
      </div>

      <button
        onClick={() =>
          onUpdate({ willingToRelocate: !data.willingToRelocate })
        }
        className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
          data.willingToRelocate
            ? "border-brand bg-brand/10"
            : "border-border bg-surface hover:border-foreground-muted"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Willing to relocate</p>
            <p className="text-sm text-foreground-muted">
              Open to moving for the right opportunity
            </p>
          </div>
          {data.willingToRelocate && <Check className="h-5 w-5 text-brand" />}
        </div>
      </button>
    </div>
  );
}

// Step 9: Priorities (Simplified)
function PrioritiesStep({
  data,
  onUpdate,
}: {
  data: Partial<OnboardingData>;
  onUpdate: (updates: Partial<OnboardingData>) => void;
}) {
  const priorities = data.priorities || {
    salary: 5,
    workLifeBalance: 5,
    careerGrowth: 5,
    location: 5,
    remoteFlexibility: 5,
    culture: 5,
    stability: 5,
    benefits: 5,
    mission: 5,
    learning: 5,
  };

  const topPriorities = [
    { key: "salary", label: "Salary" },
    { key: "workLifeBalance", label: "Work/life balance" },
    { key: "careerGrowth", label: "Career growth" },
    { key: "location", label: "Location" },
    { key: "remoteFlexibility", label: "Remote flexibility" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-heading-lg mb-2">What matters most to you?</h1>
        <p className="text-foreground-secondary">
          Rank your top priorities (1-10)
        </p>
      </div>

      <div className="space-y-4">
        {topPriorities.map(({ key, label }) => (
          <div key={key}>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                {label}
              </label>
              <span className="text-sm font-bold text-brand">
                {priorities[key as keyof typeof priorities]}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={priorities[key as keyof typeof priorities]}
              onChange={(e) =>
                onUpdate({
                  priorities: {
                    ...priorities,
                    [key]: parseInt(e.target.value),
                  },
                })
              }
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-muted accent-brand"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Step 10: Review
function ReviewStep({ data }: { data: Partial<OnboardingData> }) {
  const sections = [
    {
      icon: Target,
      label: "Goals",
      value: data.goals?.join(", ") || "Not set",
    },
    {
      icon: Briefcase,
      label: "Current role",
      value: data.currentTitle || "Not set",
    },
    {
      icon: Award,
      label: "Top skills",
      value:
        data.skills?.slice(0, 3).map((s) => s.name).join(", ") || "Not set",
    },
    {
      icon: Target,
      label: "Target roles",
      value: data.targetRoles?.slice(0, 2).join(", ") || "Not set",
    },
    {
      icon: DollarSign,
      label: "Salary target",
      value: data.salaryMin
        ? `$${(data.salaryMin / 1000).toFixed(0)}K+`
        : "Not set",
    },
    {
      icon: MapPin,
      label: "Location",
      value: data.location || "Not set",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-brand-foreground">
            <CheckCircle2 className="h-8 w-8" />
          </div>
        </div>
        <h1 className="text-heading-lg mb-2">You&apos;re ready!</h1>
        <p className="text-foreground-secondary">
          Here&apos;s what we know about you
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {sections.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                <Icon className="h-5 w-5 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground-muted">
                  {label}
                </p>
                <p className="text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-center text-sm text-foreground-muted">
        You can update these details anytime in your profile
      </p>
    </div>
  );
}

// Main Onboarding Component
export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<Partial<OnboardingData>>({});

  useEffect(() => {
    const loadData = async () => {
      const saved = await getOnboardingData();
      if (saved) {
        setData(saved);
      }
    };
    loadData();
  }, []);

  // Update local state only (synchronous, no database write)
  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prevData) => ({ ...prevData, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (data.goals?.length || 0) > 0;
      case 2:
        return !!(
          data.currentTitle &&
          data.industry &&
          data.yearsExperience !== undefined &&
          data.employmentStatus
        );
      case 3:
        return true; // Always can proceed from experience
      case 4:
        return (data.skills?.length || 0) > 0;
      case 5:
        return (data.targetRoles?.length || 0) > 0;
      case 6:
        return data.salaryMin !== undefined;
      case 7:
        return !!(
          data.workPreferences?.remote ||
          data.workPreferences?.hybrid ||
          data.workPreferences?.onsite
        );
      case 8:
        return !!data.location;
      case 9:
        return true;
      case 10:
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    // Save current state to database before navigating
    try {
      await saveOnboardingData(data);

      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(currentStep + 1);
      } else {
        // Complete onboarding - final save successful, navigate to discover
        router.push("/discover");
      }
    } catch (error) {
      console.error("Failed to save onboarding progress:", error);
      // TODO: Show user-friendly error toast
      // For now, prevent navigation on save failure
      alert("Failed to save your progress. Please check your connection and try again.");
    }
  };

  const handleBack = async () => {
    // Save current state before navigating back
    try {
      await saveOnboardingData(data);

      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
      }
    } catch (error) {
      console.error("Failed to save onboarding progress:", error);
      // Allow navigation back even if save fails (data is in local state)
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const renderStep = () => {
    const props = { data, onUpdate: updateData };

    switch (currentStep) {
      case 1:
        return <GoalsStep {...props} />;
      case 2:
        return <CurrentCareerStep {...props} />;
      case 3:
        return <ExperienceStep {...props} />;
      case 4:
        return <SkillsStep {...props} />;
      case 5:
        return <TargetRolesStep {...props} />;
      case 6:
        return <SalaryStep {...props} />;
      case 7:
        return <WorkPreferencesStep {...props} />;
      case 8:
        return <LocationStep {...props} />;
      case 9:
        return <PrioritiesStep {...props} />;
      case 10:
        return <ReviewStep data={data} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              Step {currentStep} of {TOTAL_STEPS}
            </p>
            <p className="text-sm text-foreground-muted">
              {Math.round((currentStep / TOTAL_STEPS) * 100)}%
            </p>
          </div>
          <Progress
            value={currentStep}
            max={TOTAL_STEPS}
            size="md"
            barClassName="bg-brand"
          />
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex gap-3">
          {currentStep > 1 && (
            <Button variant="secondary" onClick={handleBack} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1"
          >
            {currentStep === TOTAL_STEPS ? (
              "Show my matches"
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
