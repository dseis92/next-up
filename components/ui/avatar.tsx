"use client";

import { forwardRef, useState, type ImgHTMLAttributes } from "react";
import { cn, getInitials, getColorFromString } from "@/lib/utils";

export interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, size = "md", ...props }, ref) => {
    const [imageError, setImageError] = useState(false);
    const displayName = name || alt || "User";
    const initials = getInitials(displayName);
    const backgroundColor = getColorFromString(displayName);

    const sizes = {
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base",
      xl: "h-16 w-16 text-lg",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
          sizes[size],
          className
        )}
        style={{
          backgroundColor: !src || imageError ? backgroundColor : undefined,
        }}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || name}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
            {...props}
          />
        ) : (
          <span className="font-semibold text-white">{initials}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar };
