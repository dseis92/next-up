"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, MapPin, ArrowRight, SlidersHorizontal } from "lucide-react";
import { mockJobMatches } from "@/lib/data/mock-jobs";
import { formatSalary } from "@/lib/utils";

export default function ExplorePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArrangement, setSelectedArrangement] = useState<string | null>(
    null
  );
  const [minMatch, setMinMatch] = useState(0);

  const filteredJobs = useMemo(() => {
    return mockJobMatches.filter((match) => {
      const { job, overall_score } = match;

      // Search filter
      const matchesSearch =
        !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchQuery.toLowerCase());

      // Work arrangement filter
      const matchesArrangement =
        !selectedArrangement || job.work_arrangement === selectedArrangement;

      // Match score filter
      const matchesScore = overall_score >= minMatch;

      return matchesSearch && matchesArrangement && matchesScore;
    });
  }, [searchQuery, selectedArrangement, minMatch]);

  const arrangements = [
    { value: "remote", label: "Remote" },
    { value: "hybrid", label: "Hybrid" },
    { value: "onsite", label: "On-site" },
  ];

  const matchFilters = [
    { value: 90, label: "90%+" },
    { value: 80, label: "80%+" },
    { value: 70, label: "70%+" },
    { value: 0, label: "All" },
  ];

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-heading-lg mb-2">Explore jobs</h1>
          <p className="text-foreground-secondary">
            Search and filter through all opportunities
          </p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" />
            <Input
              type="text"
              placeholder="Search by title, company, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-3">
          {/* Work Arrangement */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-foreground-muted">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="font-medium">Work arrangement</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {arrangements.map((arr) => (
                <Badge
                  key={arr.value}
                  variant={
                    selectedArrangement === arr.value ? "brand" : "default"
                  }
                  className="cursor-pointer"
                  onClick={() =>
                    setSelectedArrangement(
                      selectedArrangement === arr.value ? null : arr.value
                    )
                  }
                >
                  {arr.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Match Score */}
          <div>
            <div className="mb-2 text-sm font-medium text-foreground-muted">
              Minimum match
            </div>
            <div className="flex flex-wrap gap-2">
              {matchFilters.map((filter) => (
                <Badge
                  key={filter.value}
                  variant={minMatch === filter.value ? "brand" : "default"}
                  className="cursor-pointer"
                  onClick={() => setMinMatch(filter.value)}
                >
                  {filter.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-foreground-secondary">
          {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"}{" "}
          found
        </div>

        {/* Results */}
        {filteredJobs.length === 0 ? (
          <EmptyState
            icon={<Search className="h-6 w-6" />}
            title="No jobs found"
            description="Try adjusting your filters or search terms"
          />
        ) : (
          <div className="space-y-3">
            {filteredJobs.map((match) => {
              const { job, overall_score, matched_skills } = match;

              return (
                <Card
                  key={job.id}
                  variant="elevated"
                  className="cursor-pointer p-4 transition-all hover:shadow-lg"
                  onClick={() => router.push(`/jobs/${job.id}`)}
                >
                  <div className="flex gap-3">
                    <Avatar
                      name={job.company.name}
                      size="lg"
                      className="shrink-0 bg-gradient-to-br from-blue-500 to-blue-600"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {job.title}
                        </h3>
                        <Badge
                          variant={overall_score >= 90 ? "success" : "brand"}
                          size="sm"
                          className="shrink-0"
                        >
                          {overall_score}%
                        </Badge>
                      </div>
                      <p className="mb-2 text-sm text-foreground-secondary">
                        {job.company.name}
                      </p>
                      <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-foreground-muted">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{job.location}</span>
                        </div>
                        <span>•</span>
                        <span className="capitalize">
                          {job.work_arrangement.replace("_", " ")}
                        </span>
                        <span>•</span>
                        <span className="capitalize">
                          {job.employment_type.replace("_", " ")}
                        </span>
                      </div>
                      {job.salary_min && (
                        <p className="mb-2 text-lg font-bold text-foreground">
                          {formatSalary(
                            job.salary_min,
                            job.salary_max,
                            job.salary_period
                          )}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {matched_skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="muted" size="sm">
                            {skill}
                          </Badge>
                        ))}
                        {matched_skills.length > 3 && (
                          <Badge variant="muted" size="sm">
                            +{matched_skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/jobs/${job.id}`);
                      }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
