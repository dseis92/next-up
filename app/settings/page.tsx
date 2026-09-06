import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="flex h-full items-center justify-center">
        <EmptyState
          icon={<Settings className="h-6 w-6" />}
          title="Settings"
          description="Manage your account, privacy, and preferences. Coming soon!"
        />
      </div>
    </AppShell>
  );
}
