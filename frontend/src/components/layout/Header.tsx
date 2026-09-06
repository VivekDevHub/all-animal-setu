"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  Menu,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types";

interface HeaderProps {
  onOpenMobileMenu?: () => void;
  role?: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

export function Header({ onOpenMobileMenu, role = "PET_OWNER", onRoleChange }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    {
      id: "1",
      title: "Bruno's Rabies Vaccine Due",
      desc: "Scheduled for next Tuesday at Happy Paws Vet Clinic.",
      time: "2 hours ago",
      icon: AlertCircle,
      color: "text-[var(--warning)]",
      read: false,
    },
    {
      id: "2",
      title: "Luna's Daily Medication",
      desc: "Evening anti-inflammatory dose at 8:00 PM.",
      time: "5 hours ago",
      icon: Clock,
      color: "text-[var(--secondary)]",
      read: false,
    },
    {
      id: "3",
      title: "Lab Report Analysis Ready",
      desc: "AI extracted key vitals from Dr. Sharma's test report.",
      time: "Yesterday",
      icon: CheckCircle2,
      color: "text-[var(--success)]",
      read: true,
    },
  ];

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left section: Mobile menu trigger + Search input */}
      <div className="flex items-center gap-3 w-full max-w-md">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar Trigger */}
        <button
          onClick={() => setShowSearchModal(true)}
          className="w-full hidden sm:flex items-center justify-between h-10 px-3.5 rounded-xl border border-[var(--input)] bg-[var(--background)]/60 hover:border-[var(--muted-foreground)]/40 text-sm text-[var(--muted-foreground)] transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
            <span>Search pets, records, vets, reminders...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right section: Role switcher prototype + Notifications + Theme + Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Prototype Role Switcher */}
        {onRoleChange && (
          <div className="hidden lg:flex items-center bg-[var(--muted)] rounded-xl p-0.5 text-xs">
            {(["PET_OWNER", "VET", "ADMIN"] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => onRoleChange(r)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  role === r
                    ? "bg-[var(--card)] text-[var(--foreground)] font-semibold shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {r === "PET_OWNER" ? "Owner" : r === "VET" ? "Vet" : "Admin"}
              </button>
            ))}
          </div>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="relative w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-[var(--foreground)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4 text-[var(--muted-foreground)]" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--danger)] ring-2 ring-[var(--card)]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-[var(--foreground)]">Notifications</h4>
                  <Badge size="sm" variant="default">2 new</Badge>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-[var(--primary)] hover:underline cursor-pointer font-medium"
                >
                  Mark all as read
                </button>
              </div>

              <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border text-xs transition-colors ${
                        n.read
                          ? "border-transparent bg-transparent opacity-75"
                          : "border-[var(--border)] bg-[var(--muted)]/40"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${n.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[var(--foreground)] truncate">{n.title}</p>
                          <p className="text-[var(--muted-foreground)] mt-0.5 leading-relaxed">{n.desc}</p>
                          <span className="text-[10px] text-[var(--muted-foreground)] mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-[var(--border)] mt-2 text-center">
                <Link
                  href="/reminders"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-[var(--primary)] font-semibold hover:underline"
                >
                  View All Reminders & Alerts →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-full hover:bg-[var(--muted)] transition-colors cursor-pointer"
          >
            <Avatar
              fallback="Vivek Sharma"
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
              size="sm"
            />
            <div className="hidden md:block text-left text-xs leading-tight">
              <span className="font-semibold block text-[var(--foreground)]">Vivek S.</span>
              <span className="text-[var(--muted-foreground)] text-[10px]">2 Pets Active</span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-[var(--border)]">
                <p className="text-xs font-semibold text-[var(--foreground)]">Vivek Sharma</p>
                <p className="text-[11px] text-[var(--muted-foreground)] truncate">vivek@animalsetu.dev</p>
              </div>
              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[var(--foreground)] hover:bg-[var(--muted)]"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                  Your Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[var(--foreground)] hover:bg-[var(--muted)]"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                  Settings & Safety
                </Link>
              </div>
              <div className="pt-1 border-t border-[var(--border)]">
                <Link
                  href="/login"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[var(--danger)] hover:bg-[var(--danger)]/10 font-medium"
                >
                  Sign Out
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Search Dialog Mockup */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-start justify-center pt-20 p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] w-full max-w-xl rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 pb-3 border-b border-[var(--border)]">
              <Search className="w-5 h-5 text-[var(--primary)]" />
              <input
                autoFocus
                placeholder="Type to search pets, appointments, vets, vaccines..."
                className="w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-xs px-2 py-1 rounded bg-[var(--muted)] text-[var(--muted-foreground)] font-mono hover:text-[var(--foreground)]"
              >
                ESC
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <span className="font-semibold text-[var(--muted-foreground)] uppercase tracking-wider text-[10px]">
                  Recent Pets
                </span>
                <div className="mt-2 space-y-1">
                  <Link
                    href="/pets/pet-bruno"
                    onClick={() => setShowSearchModal(false)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--muted)]"
                  >
                    <span className="font-medium">🐕 Bruno (Golden Retriever)</span>
                    <Badge size="sm" variant="success">Healthy</Badge>
                  </Link>
                  <Link
                    href="/pets/pet-luna"
                    onClick={() => setShowSearchModal(false)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--muted)]"
                  >
                    <span className="font-medium">🐈 Luna (Persian Cat)</span>
                    <Badge size="sm" variant="warning">Vaccine Due</Badge>
                  </Link>
                </div>
              </div>

              <div>
                <span className="font-semibold text-[var(--muted-foreground)] uppercase tracking-wider text-[10px]">
                  Quick Actions
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link
                    href="/ai-assistant"
                    onClick={() => setShowSearchModal(false)}
                    className="flex items-center gap-2 p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Ask AI Assistant</span>
                  </Link>
                  <Link
                    href="/emergency"
                    onClick={() => setShowSearchModal(false)}
                    className="flex items-center gap-2 p-2 rounded-xl border border-[var(--danger)]/30 hover:bg-[var(--danger)]/10 text-[var(--danger)]"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-[var(--danger)]" />
                    <span>Emergency Vet</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
