import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Search } from "lucide-react";

export default function ExplorePage() {
  return (
    <AppShell>
      <div className="flex h-full items-center justify-center">
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="Explore Jobs"
          description="Search and filter through all available opportunities. Coming soon!"
        />
      </div>
    </AppShell>
  );
}
