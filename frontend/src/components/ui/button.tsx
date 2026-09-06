"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "accent";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] focus-visible:ring-[var(--primary)] shadow-sm hover:shadow",
      secondary:
        "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)] focus-visible:ring-[var(--secondary)] shadow-sm",
      outline:
        "border border-[var(--border)] bg-transparent hover:bg-[var(--muted)] text-[var(--foreground)] focus-visible:ring-[var(--primary)]",
      ghost:
        "bg-transparent hover:bg-[var(--muted)] text-[var(--foreground)] focus-visible:ring-[var(--muted)]",
      danger:
        "bg-[var(--danger)] text-white hover:opacity-90 focus-visible:ring-[var(--danger)] shadow-sm",
      accent:
        "bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-95 focus-visible:ring-[var(--accent)] font-semibold shadow-sm",
    };

    const sizeStyles = {
      sm: "text-xs h-8 px-3 gap-1.5",
      md: "text-sm h-10 px-4 py-2 gap-2",
      lg: "text-base h-12 px-6 py-3 gap-2.5 rounded-2xl",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
