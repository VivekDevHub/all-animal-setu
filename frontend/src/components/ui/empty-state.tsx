import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 ${className || ""}`}>
      <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-base md:text-lg font-semibold text-[var(--foreground)] mb-1.5">{title}</h4>
      <p className="text-sm text-[var(--muted-foreground)] max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
