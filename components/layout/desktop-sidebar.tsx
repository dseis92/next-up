"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import {
  Sparkles,
  Search,
  LayoutGrid,
  Activity,
  User,
  Briefcase,
  Bookmark,
  Settings,
} from "lucide-react";

const navItems = [
  {
    label: "Discover",
    href: "/discover",
    icon: LayoutGrid,
  },
  {
    label: "Explore",
    href: "/explore",
    icon: Search,
  },
  {
    label: "Applications",
    href: "/applications",
    icon: Briefcase,
  },
  {
    label: "Saved",
    href: "/saved",
    icon: Bookmark,
  },
];

const secondaryItems = [
  {
    label: "Activity",
    href: "/activity",
    icon: Activity,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
];

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-border bg-surface md:flex">
      <div className="flex h-16 items-center px-6">
        <Link href="/discover">
          <Logo size="md" />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4 py-4">
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-brand/10 text-brand"
                    : "text-foreground-secondary hover:bg-surface-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* AI Career Coach - Special */}
        <Link
          href="/ai"
          className={cn(
            "mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
            pathname === "/ai"
              ? "bg-brand text-brand-foreground shadow-md"
              : "bg-brand/5 text-brand hover:bg-brand/10"
          )}
        >
          <Sparkles
            className="h-5 w-5"
            strokeWidth={pathname === "/ai" ? 2.5 : 2}
          />
          AI Career Coach
        </Link>

        <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
          {secondaryItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-brand/10 text-brand"
                    : "text-foreground-secondary hover:bg-surface-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
              pathname === "/settings"
                ? "bg-brand/10 text-brand"
                : "text-foreground-secondary hover:bg-surface-muted hover:text-foreground"
            )}
          >
            <Settings
              className="h-5 w-5"
              strokeWidth={pathname === "/settings" ? 2.5 : 2}
            />
            Settings
          </Link>
        </div>
      </nav>
    </aside>
  );
}
