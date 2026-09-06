import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PawPrint, Calendar, HeartPulse, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPreview() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Good Morning, Vivek 👋
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Here’s what’s happening with your pets today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/pets/add">
              <Button variant="primary" size="md">
                + Add Pet
              </Button>
            </Link>
          </div>
        </div>

        {/* Top Stat Summary Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                  My Pets
                </p>
                <p className="text-2xl font-bold text-[var(--foreground)] mt-1">2 Pets</p>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                <PawPrint className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                  Vaccinations
                </p>
                <p className="text-2xl font-bold text-[var(--warning)] mt-1">2 Upcoming</p>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--warning)]/15 text-[var(--warning)]">
                <HeartPulse className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
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

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                  Health Alerts
                </p>
                <p className="text-2xl font-bold text-[var(--foreground)] mt-1">1 Reminder</p>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                <Sparkles className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Phase 1 placeholder note */}
        <Card className="border-[var(--primary)]/30 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--secondary)]/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="default">Phase 1 Foundation Ready</Badge>
              <Badge variant="outline">Layout Shell Active</Badge>
            </div>
            <CardTitle className="mt-2">Welcome to the AnimalSetu Shell</CardTitle>
            <CardDescription>
              Sidebar, dynamic Header with search and notifications, Theme toggle (Light/Dark mode), and Mobile Bottom Navigation are live. Full interactive Pet Management, Health Passport, and Vitals will be wired up in Phase 2.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">
                View Login Page
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="sm">
                View Signup Page
              </Button>
            </Link>
            <Link href="/">
              <Button variant="primary" size="sm">
                Back to Landing Page
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
