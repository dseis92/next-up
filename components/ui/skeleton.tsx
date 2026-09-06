import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "text";
}

export function Skeleton({
  className,
  variant = "default",
  ...props
}: SkeletonProps) {
  const variants = {
    default: "rounded-[var(--radius-md)]",
    circular: "rounded-full",
    text: "rounded h-4",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-surface-muted",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
