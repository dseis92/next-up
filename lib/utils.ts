import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format salary for display
 */
export function formatSalary(
  min: number,
  max?: number,
  period: "hourly" | "yearly" = "yearly"
): string {
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `$${Math.round(num / 1000)}K`;
    }
    return `$${num}`;
  };

  const prefix = period === "hourly" ? "" : "";
  const suffix = period === "hourly" ? "/hr" : "";

  if (max && max !== min) {
    return `${prefix}${formatNumber(min)}${suffix}–${formatNumber(max)}${suffix}`;
  }

  return `${prefix}${formatNumber(min)}${suffix}`;
}

/**
 * Format match percentage
 */
export function formatMatchScore(score: number): string {
  return `${Math.round(score)}%`;
}

/**
 * Get match label based on score
 */
export function getMatchLabel(score: number): string {
  if (score >= 90) return "Great fit";
  if (score >= 80) return "Strong fit";
  if (score >= 70) return "Worth a look";
  if (score >= 60) return "Possible fit";
  return "Lower match";
}

/**
 * Get match color class based on score
 */
export function getMatchColorClass(score: number): string {
  if (score >= 90) return "text-match-high";
  if (score >= 80) return "text-match-medium";
  return "text-match-low";
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}

/**
 * Format date relative to now
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

/**
 * Sleep utility for demos/animations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Generate a color based on string (for avatar backgrounds)
 */
export function getColorFromString(str: string): string {
  const colors = [
    "#ef4444", // red
    "#f59e0b", // orange
    "#a3e635", // lime
    "#22c55e", // green
    "#14b8a6", // teal
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#ec4899", // pink
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
