"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (options: { title: string; message?: string; type?: ToastType; duration?: number }) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({
      title,
      message,
      type = "info",
      duration = 4000,
    }: {
      title: string;
      message?: string;
      type?: ToastType;
      duration?: number;
    }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => toast({ title, message, type: "success" }), [toast]);
  const error = useCallback((title: string, message?: string) => toast({ title, message, type: "error" }), [toast]);
  const warning = useCallback((title: string, message?: string) => toast({ title, message, type: "warning" }), [toast]);
  const info = useCallback((title: string, message?: string) => toast({ title, message, type: "info" }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-200 transition-all ${
              t.type === "success"
                ? "bg-[var(--card)] border-[var(--success)]/30 text-[var(--foreground)]"
                : t.type === "error"
                ? "bg-[var(--card)] border-[var(--danger)]/30 text-[var(--foreground)]"
                : t.type === "warning"
                ? "bg-[var(--card)] border-[var(--warning)]/30 text-[var(--foreground)]"
                : "bg-[var(--card)] border-[var(--border)] text-[var(--foreground)]"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />}
              {t.type === "error" && <AlertCircle className="w-5 h-5 text-[var(--danger)]" />}
              {t.type === "warning" && <AlertCircle className="w-5 h-5 text-[var(--warning)]" />}
              {t.type === "info" && <Info className="w-5 h-5 text-[var(--primary)]" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold tracking-tight text-[var(--foreground)]">{t.title}</p>
              {t.message && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{t.message}</p>}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
