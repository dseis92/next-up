"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Search,
  LayoutGrid,
  Activity,
  User,
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
    label: "AI",
    href: "/ai",
    icon: Sparkles,
    isSpecial: true,
  },
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

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur-lg md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 transition-all duration-200",
                isActive
                  ? "text-brand"
                  : "text-foreground-muted hover:text-foreground",
                item.isSpecial &&
                  "relative before:absolute before:-top-1 before:h-1 before:w-8 before:rounded-full before:bg-brand before:opacity-0 before:transition-opacity",
                item.isSpecial && isActive && "before:opacity-100"
              )}
            >
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center transition-transform",
                  isActive && "scale-110"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-all",
                  isActive ? "opacity-100" : "opacity-70"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
