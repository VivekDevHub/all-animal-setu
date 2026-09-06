import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "secondary" | "outline";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20",
    success: "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20",
    warning: "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30",
    danger: "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20",
    secondary: "bg-[var(--secondary)]/10 text-[var(--secondary)] border-[var(--secondary)]/20",
    outline: "border border-[var(--border)] text-[var(--muted-foreground)] bg-transparent",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] font-medium rounded-full",
    md: "px-2.5 py-1 text-xs font-semibold rounded-full",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 border font-medium transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}
