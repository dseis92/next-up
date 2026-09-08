import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { ChevronRight, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="text-heading-lg mb-6">Settings</h1>

        {/* Settings Sections */}
        <div className="bg-surface-secondary divide-surface-tertiary divide-y rounded-lg border border-surface-tertiary">
          {/* Dealbreakers */}
          <Link
            href="/settings/dealbreakers"
            className="hover:bg-surface-tertiary flex items-center justify-between px-6 py-4 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="bg-error/10 text-error rounded-lg p-2">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-foreground text-body-md font-medium">Dealbreakers</h3>
                <p className="text-foreground-secondary text-body-sm">
                  Set your non-negotiable preferences
                </p>
              </div>
            </div>
            <ChevronRight className="text-foreground-secondary h-5 w-5" />
          </Link>
        </div>

        {/* Future Settings */}
        <div className="mt-8">
          <p className="text-foreground-secondary text-body-sm">
            More settings coming soon: account management, privacy controls, and notifications.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
