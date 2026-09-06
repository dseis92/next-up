import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Sparkles } from "lucide-react";

export default function AIPage() {
  return (
    <AppShell>
      <div className="flex h-full items-center justify-center">
        <EmptyState
          icon={<Sparkles className="h-6 w-6" />}
          title="AI Career Coach"
          description="Get personalized career guidance, resume help, and interview prep. Coming soon!"
        />
      </div>
    </AppShell>
  );
}
