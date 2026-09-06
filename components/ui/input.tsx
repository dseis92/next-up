import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "flex h-11 w-full rounded-[var(--radius-md)] border-2 bg-surface px-4 py-2 text-base text-foreground transition-colors",
            "placeholder:text-foreground-muted",
            "focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-danger focus:border-danger focus:ring-danger/10"
              : "border-border hover:border-border-strong",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-foreground-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
