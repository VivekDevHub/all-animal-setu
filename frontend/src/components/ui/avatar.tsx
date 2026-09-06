import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Avatar({
  src,
  alt = "Avatar",
  fallback,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl font-bold",
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-full bg-[var(--muted)] border border-[var(--border)] font-semibold text-[var(--foreground)] select-none",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="uppercase">{fallback.slice(0, 2)}</span>
      )}
    </div>
  );
}
