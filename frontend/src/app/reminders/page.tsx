"use client";

import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { healthService } from "@/services/healthService";
import { Reminder } from "@/types";
import {
  Bell,
  CheckCircle2,
  Clock,
  Pill,
  Syringe,
  Calendar,
  Sparkles,
  Filter,
  Check,
} from "lucide-react";

export default function RemindersPage() {
  const { success } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await healthService.getReminders();
      setReminders(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggle = async (id: string, current: boolean) => {
    // Optimistic update
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !current } : r))
    );
    await healthService.toggleReminder(id, !current);
    if (!current) {
      success("Reminder marked complete", "Great job staying proactive with your pet's care!");
    }
  };

  const filtered = reminders.filter(
    (r) => selectedCategory === "ALL" || r.category === selectedCategory
  );

  const pendingCount = reminders.filter((r) => !r.completed).length;

  const getCategoryIcon = (cat: Reminder["category"]) => {
    switch (cat) {
      case "Medicine":
        return <Pill className="w-4 h-4 text-[var(--secondary)]" />;
      case "Vaccination":
        return <Syringe className="w-4 h-4 text-[var(--warning)]" />;
      case "Appointment":
        return <Calendar className="w-4 h-4 text-[var(--primary)]" />;
      default:
        return <Clock className="w-4 h-4 text-[var(--muted-foreground)]" />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Care Reminders & Alerts
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
              Never miss a booster vaccination, daily medication dose, or follow-up checkup.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge size="md" variant={pendingCount > 0 ? "warning" : "success"} className="gap-1.5 px-3 py-1">
              <Bell className="w-3.5 h-3.5" />
              <span>{pendingCount} Pending Reminders</span>
            </Badge>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {["ALL", "Medicine", "Vaccination", "Appointment", "General Care"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)] hover:bg-[var(--muted)]"
              }`}
            >
              {cat === "ALL" ? "All Reminders" : cat}
            </button>
          ))}
        </div>

        {/* Reminders List */}
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-16 bg-[var(--muted)] rounded-2xl" />
            <div className="h-16 bg-[var(--muted)] rounded-2xl" />
            <div className="h-16 bg-[var(--muted)] rounded-2xl" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="You're all caught up! 🎉"
            description="No pending reminders in this category. Your pets are right on track."
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((reminder) => (
              <Card
                key={reminder.id}
                className={`transition-all ${
                  reminder.completed
                    ? "opacity-60 bg-[var(--card)]/50"
                    : "hover:border-[var(--primary)]/40 hover:shadow-xs"
                }`}
              >
                <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <button
                      onClick={() => handleToggle(reminder.id, reminder.completed)}
                      aria-label="Toggle completion"
                      className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                        reminder.completed
                          ? "bg-[var(--success)] border-[var(--success)] text-white"
                          : "border-[var(--border)] hover:border-[var(--primary)] text-transparent"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-[var(--muted)]">
                        {getCategoryIcon(reminder.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-bold text-[var(--foreground)] ${
                              reminder.completed ? "line-through text-[var(--muted-foreground)]" : ""
                            }`}
                          >
                            {reminder.title}
                          </h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)]">
                            {reminder.petName}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                          {reminder.dosage ? `${reminder.dosage} • ` : ""}Scheduled: {reminder.dateTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Badge
                    size="sm"
                    variant={reminder.completed ? "outline" : "warning"}
                  >
                    {reminder.completed ? "Completed" : "Pending"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
