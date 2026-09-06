"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase } from "lucide-react";

export default function ApplicationsPage() {
  const router = useRouter();

  return (
    <AppShell>
      <div className="flex h-full items-center justify-center">
        <EmptyState
          icon={<Briefcase className="h-6 w-6" />}
          title="No applications yet"
          description="When you find something worth pursuing, it'll show up here."
          action={{
            label: "Discover jobs",
            onClick: () => router.push("/discover"),
          }}
        />
      </div>
    </AppShell>
  );
}
