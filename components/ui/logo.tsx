import { cn } from "@/lib/utils";

export interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

export function Logo({ size = "md", className, showText = true }: LogoProps) {
  const sizes = {
    sm: { container: "h-8", text: "text-xl" },
    md: { container: "h-10", text: "text-2xl" },
    lg: { container: "h-12", text: "text-3xl" },
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Simple geometric logo mark */}
      <div
        className={cn(
          "flex items-center justify-center aspect-square rounded-lg bg-brand",
          sizes[size].container
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-3/5 w-3/5"
        >
          {/* N with forward arrow motion */}
          <path
            d="M6 18V6L14 18V6M16 12L20 12M18 10L20 12L18 14"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-brand-foreground"
          />
        </svg>
      </div>
      {showText && (
        <span
          className={cn(
            "font-bold tracking-tight text-foreground",
            sizes[size].text
          )}
        >
          NextUp
        </span>
      )}
    </div>
  );
}
