"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PetCard } from "@/components/pet/PetCard";
import { useToast } from "@/components/ui/toast";
import { petService } from "@/services/petService";
import { healthService } from "@/services/healthService";
import { authService } from "@/services/authService";
import { Pet, Reminder, User } from "@/types";
import {
  PawPrint,
  Calendar,
  HeartPulse,
  Sparkles,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  MapPin,
  MessageSquare,
  Check,
  Shield,
} from "lucide-react";

export default function HealthcareDashboard() {
  const { success } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [user, petsData, remsData] = await Promise.all([
        authService.getCurrentUser(),
        petService.getPets(),
        healthService.getReminders(),
      ]);
      setCurrentUser(user);
      setPets(petsData);
      setReminders(remsData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCompleteReminder = async (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: true } : r))
    );
    await healthService.toggleReminder(id, true);
    success("Completed!", "Reminder marked as done.");
  };

  const pendingReminders = reminders.filter((r) => !r.completed);
  const vaccinesDue = pets.filter((p) => p.healthStatus === "Vaccination Due").length;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
                Good Morning, {currentUser?.name.split(" ")[0] || "Vivek"} 👋
              </h1>
              <Badge size="sm" variant="default">Pet Parent</Badge>
            </div>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
              Here’s what’s happening with your pets today. All systems and records synchronized.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/pets/add">
              <Button variant="primary" size="md" className="gap-1.5 shadow-sm">
                <Plus className="w-4 h-4" />
                <span>+ Add Pet</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Top Stat Summary Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:border-[var(--primary)]/40 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                  Active Pets
                </p>
                <p className="text-2xl font-bold text-[var(--foreground)] mt-1">{pets.length} Pets</p>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                <PawPrint className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-[var(--warning)]/40 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                  Vaccinations Due
                </p>
                <p className="text-2xl font-bold text-[var(--warning)] mt-1">
                  {vaccinesDue > 0 ? `${vaccinesDue} Due Soon` : "Up to Date"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--warning)]/15 text-[var(--warning)]">
                <HeartPulse className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-[var(--secondary)]/40 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                  Appointments
                </p>
                <p className="text-2xl font-bold text-[var(--secondary)] mt-1">1 Upcoming</p>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--secondary)]/10 text-[var(--secondary)]">
                <Calendar className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-[var(--accent)]/40 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                  Active Reminders
                </p>
                <p className="text-2xl font-bold text-[var(--foreground)] mt-1">
                  {pendingReminders.length} Tasks
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)]">
                <Sparkles className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Pets Grid Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">My Pets</h2>
              <p className="text-xs text-[var(--muted-foreground)]">Your active companion profiles</p>
            </div>
            <Link href="/pets">
              <Button variant="ghost" size="sm" className="text-xs font-semibold gap-1">
                <span>View All ({pets.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        </div>

        {/* Split Section: Reminders & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Upcoming Reminders (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--primary)]" />
                <span>Today&apos;s Care Reminders</span>
              </h3>
              <Link href="/reminders" className="text-xs text-[var(--primary)] font-semibold hover:underline">
                Manage All →
              </Link>
            </div>

            <div className="space-y-2.5">
              {pendingReminders.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] flex items-center justify-between gap-3 text-xs hover:border-[var(--primary)]/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCompleteReminder(r.id)}
                      className="w-6 h-6 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 text-transparent hover:text-[var(--primary)] flex items-center justify-center transition-all cursor-pointer"
                      title="Mark as completed"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--foreground)]">{r.title}</span>
                        <Badge size="sm" variant="outline">{r.petName}</Badge>
                      </div>
                      <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                        {r.dosage ? `${r.dosage} • ` : ""}{r.dateTime}
                      </p>
                    </div>
                  </div>

                  <Badge size="sm" variant={r.category === "Vaccination" ? "warning" : "secondary"}>
                    {r.category}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" />
              <span>Quick Actions</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/pets/pet-bruno/upload"
                className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="mt-3">
                  <h4 className="text-xs font-bold text-[var(--foreground)]">Smart OCR</h4>
                  <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Upload record</p>
                </div>
              </Link>

              <Link
                href="/vets"
                className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--secondary)] hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div className="w-8 h-8 rounded-xl bg-[var(--secondary)]/10 text-[var(--secondary)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="mt-3">
                  <h4 className="text-xs font-bold text-[var(--foreground)]">Find Clinic</h4>
                  <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Book consult</p>
                </div>
              </Link>

              <Link
                href="/ai-assistant"
                className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)] hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="mt-3">
                  <h4 className="text-xs font-bold text-[var(--foreground)]">Ask AI</h4>
                  <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Diet & wellness</p>
                </div>
              </Link>

              <Link
                href="/emergency"
                className="p-3.5 rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger)]/5 hover:bg-[var(--danger)]/10 hover:shadow-xs transition-all flex flex-col justify-between group text-[var(--danger)]"
              >
                <div className="w-8 h-8 rounded-xl bg-[var(--danger)]/20 text-[var(--danger)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="mt-3">
                  <h4 className="text-xs font-bold">Emergency</h4>
                  <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">24/7 Hotline</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
