"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  getUserDealbreakers,
  saveUserDealbreakers,
  clearUserDealbreakers,
} from "@/lib/storage/dealbreakers";
import type { DealbreakerPreferences } from "@/lib/dealbreakers/types";

export default function DealbreakerSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadedSuccessfully, setLoadedSuccessfully] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Form state
  const [minimumSalary, setMinimumSalary] = useState<string>("");
  const [requireDisclosure, setRequireDisclosure] = useState(false);
  const [selectedArrangements, setSelectedArrangements] = useState<Set<string>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());

  // Load user and preferences
  useEffect(() => {
    async function loadPreferences() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        setUserId(user.id);

        const preferences = await getUserDealbreakers(user.id);

        if (preferences) {
          setMinimumSalary(preferences.minimumSalary?.toString() ?? "");
          setRequireDisclosure(preferences.requireSalaryDisclosure);
          setSelectedArrangements(new Set(preferences.allowedWorkArrangements));
          setSelectedTypes(new Set(preferences.allowedEmploymentTypes));
        }

        setLoadedSuccessfully(true);
      } catch (err) {
        console.error("Failed to load preferences:", err);
        setError("Unable to load your preferences.");
        setLoadedSuccessfully(false);
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, [router]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setLoadedSuccessfully(false);

    async function retry() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        setUserId(user.id);

        const preferences = await getUserDealbreakers(user.id);

        if (preferences) {
          setMinimumSalary(preferences.minimumSalary?.toString() ?? "");
          setRequireDisclosure(preferences.requireSalaryDisclosure);
          setSelectedArrangements(new Set(preferences.allowedWorkArrangements));
          setSelectedTypes(new Set(preferences.allowedEmploymentTypes));
        }

        setLoadedSuccessfully(true);
      } catch (err) {
        console.error("Failed to load preferences:", err);
        setError("Unable to load your preferences.");
        setLoadedSuccessfully(false);
      } finally {
        setLoading(false);
      }
    }

    retry();
  };

  const handleSave = async () => {
    if (!userId || !loadedSuccessfully) return;

    // Validate salary input
    if (minimumSalary) {
      const parsed = parseInt(minimumSalary, 10);
      if (isNaN(parsed)) {
        setError("Minimum salary must be a valid number.");
        return;
      }
      if (parsed < 0) {
        setError("Minimum salary cannot be negative.");
        return;
      }
      if (parsed > 10000000) {
        setError("Minimum salary exceeds maximum allowed value (10,000,000).");
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      const preferences: Omit<DealbreakerPreferences, "createdAt" | "updatedAt"> = {
        userId,
        minimumSalary: minimumSalary ? parseInt(minimumSalary, 10) : undefined,
        requireSalaryDisclosure: requireDisclosure,
        allowedWorkArrangements: Array.from(selectedArrangements) as (
          | "remote"
          | "hybrid"
          | "onsite"
        )[],
        allowedEmploymentTypes: Array.from(selectedTypes) as (
          | "full_time"
          | "part_time"
          | "contract"
          | "temporary"
        )[],
      };

      await saveUserDealbreakers(preferences);

      // Navigate back to settings
      router.push("/settings");
    } catch (err) {
      console.error("Failed to save preferences:", err);
      setError("Unable to save your preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!userId || !loadedSuccessfully) return;
    if (!confirm("Are you sure you want to clear all dealbreakers?")) return;

    setSaving(true);
    setError(null);

    try {
      await clearUserDealbreakers(userId);

      // Reset form
      setMinimumSalary("");
      setRequireDisclosure(false);
      setSelectedArrangements(new Set());
      setSelectedTypes(new Set());
    } catch (err) {
      console.error("Failed to clear preferences:", err);
      setError("Unable to clear your preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggleArrangement = (arrangement: string) => {
    const newSet = new Set(selectedArrangements);
    if (newSet.has(arrangement)) {
      newSet.delete(arrangement);
    } else {
      newSet.add(arrangement);
    }
    setSelectedArrangements(newSet);
  };

  const toggleType = (type: string) => {
    const newSet = new Set(selectedTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setSelectedTypes(newSet);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl p-6">
          <p className="text-foreground-secondary">Loading...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl p-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/settings")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Button>

          <h1 className="text-heading-lg mb-2">Dealbreakers</h1>
          <p className="text-foreground-secondary text-body-md">
            Dealbreakers flag opportunities that conflict with your non-negotiables. They do not
            change your match score.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-error/10 text-error mb-6 rounded-lg border border-error/20 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-body-sm">{error}</p>
                {!loadedSuccessfully && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRetry}
                    disabled={loading}
                    className="mt-2"
                  >
                    Retry
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="space-y-8">
          {/* Minimum Salary */}
          <div>
            <label className="text-foreground text-body-md mb-2 block font-medium">
              Minimum compensation
            </label>
            <p className="text-foreground-secondary text-body-sm mb-3">
              Set your minimum acceptable yearly salary.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-foreground-secondary">$</span>
              <input
                type="number"
                value={minimumSalary}
                onChange={(e) => setMinimumSalary(e.target.value)}
                placeholder="e.g., 100000"
                className="bg-surface-secondary text-foreground border-surface-tertiary focus:border-primary focus:ring-primary w-full max-w-xs rounded-lg border px-4 py-2 focus:outline-none focus:ring-2"
              />
              <span className="text-foreground-secondary text-body-sm">per year</span>
            </div>
          </div>

          {/* Salary Disclosure */}
          <div>
            <label className="text-foreground text-body-md mb-3 flex items-center gap-3 font-medium">
              <input
                type="checkbox"
                checked={requireDisclosure}
                onChange={(e) => setRequireDisclosure(e.target.checked)}
                className="border-surface-tertiary bg-surface-secondary checked:bg-primary checked:border-primary h-5 w-5 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              Require salary disclosure
            </label>
            <p className="text-foreground-secondary text-body-sm ml-8">
              Flag opportunities that don&apos;t list compensation.
            </p>
          </div>

          {/* Work Arrangement */}
          <div>
            <label className="text-foreground text-body-md mb-2 block font-medium">
              Work arrangement
            </label>
            <p className="text-foreground-secondary text-body-sm mb-3">
              Select acceptable work arrangements (leave empty for no restriction).
            </p>
            <div className="space-y-2">
              {["remote", "hybrid", "onsite"].map((arrangement) => (
                <label
                  key={arrangement}
                  className="text-foreground text-body-md flex items-center gap-3"
                >
                  <input
                    type="checkbox"
                    checked={selectedArrangements.has(arrangement)}
                    onChange={() => toggleArrangement(arrangement)}
                    className="border-surface-tertiary bg-surface-secondary checked:bg-primary checked:border-primary h-5 w-5 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {arrangement === "remote"
                    ? "Remote"
                    : arrangement === "hybrid"
                      ? "Hybrid"
                      : "On-site"}
                </label>
              ))}
            </div>
          </div>

          {/* Employment Type */}
          <div>
            <label className="text-foreground text-body-md mb-2 block font-medium">
              Employment type
            </label>
            <p className="text-foreground-secondary text-body-sm mb-3">
              Select acceptable employment types (leave empty for no restriction).
            </p>
            <div className="space-y-2">
              {["full_time", "part_time", "contract", "temporary"].map((type) => (
                <label key={type} className="text-foreground text-body-md flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedTypes.has(type)}
                    onChange={() => toggleType(type)}
                    className="border-surface-tertiary bg-surface-secondary checked:bg-primary checked:border-primary h-5 w-5 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {type === "full_time"
                    ? "Full-time"
                    : type === "part_time"
                      ? "Part-time"
                      : type === "contract"
                        ? "Contract"
                        : "Temporary"}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center gap-4">
          <Button onClick={handleSave} disabled={saving || !userId || !loadedSuccessfully}>
            {saving ? "Saving..." : "Save changes"}
          </Button>

          {(minimumSalary ||
            requireDisclosure ||
            selectedArrangements.size > 0 ||
            selectedTypes.size > 0) && (
            <Button variant="ghost" onClick={handleClear} disabled={saving || !loadedSuccessfully}>
              Clear all dealbreakers
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
