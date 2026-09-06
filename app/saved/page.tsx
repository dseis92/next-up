"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Bookmark } from "lucide-react";

export default function SavedPage() {
  const router = useRouter();

  return (
    <AppShell>
      <div className="flex h-full items-center justify-center">
        <EmptyState
          icon={<Bookmark className="h-6 w-6" />}
          title="Nothing saved yet"
          description="Save opportunities you might want to revisit."
          action={{
            label: "Discover jobs",
            onClick: () => router.push("/discover"),
          }}
        />
      </div>
    </AppShell>
  );
}
