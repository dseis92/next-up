import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <AppShell>
      <div className="flex h-full items-center justify-center">
        <EmptyState
          icon={<User className="h-6 w-6" />}
          title="Your Profile"
          description="Manage your career profile, skills, and preferences. Coming soon!"
        />
      </div>
    </AppShell>
  );
}
