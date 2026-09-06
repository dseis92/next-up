import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Activity } from "lucide-react";

export default function ActivityPage() {
  return (
    <AppShell>
      <div className="flex h-full items-center justify-center">
        <EmptyState
          icon={<Activity className="h-6 w-6" />}
          title="Your Activity"
          description="Track your progress, streaks, and career momentum. Coming soon!"
        />
      </div>
    </AppShell>
  );
}
