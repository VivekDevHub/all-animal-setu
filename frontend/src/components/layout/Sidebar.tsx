"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PawPrint,
  HeartPulse,
  MapPin,
  CalendarDays,
  Sparkles,
  AlertTriangle,
  Users,
  ShieldCheck,
  Footprints,
  QrCode,
  Settings,
  X,
  Stethoscope,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types";

interface SidebarProps {
  role?: UserRole;
  onCloseMobile?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
  danger?: boolean;
}

export function Sidebar({ role = "PET_OWNER", onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  // Role-aware navigation links
  const petOwnerNav: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Pets", href: "/pets", icon: PawPrint, badge: "2" },
    { name: "Health & Records", href: "/health/records", icon: HeartPulse },
    { name: "Find a Vet", href: "/vets", icon: MapPin },
    { name: "Appointments", href: "/appointments", icon: CalendarDays, badge: "1" },
    { name: "AI Pet Assistant", href: "/ai-assistant", icon: Sparkles, highlight: true },
    { name: "Emergency", href: "/emergency", icon: AlertTriangle, danger: true },
    { name: "Community", href: "/community", icon: Users },
    { name: "Insurance", href: "/insurance", icon: ShieldCheck },
    { name: "Pet Walker", href: "/walker", icon: Footprints },
    { name: "Lost Pet QR", href: "/lost-pet", icon: QrCode },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const vetNav: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Appointments", href: "/appointments", icon: CalendarDays, badge: "4" },
    { name: "Patients", href: "/pets", icon: PawPrint },
    { name: "Consultations", href: "/consultation/demo", icon: Stethoscope },
    { name: "Medical Records", href: "/health/records", icon: HeartPulse },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const adminNav: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Users & Owners", href: "/dashboard/users", icon: Users },
    { name: "Vets & Clinics", href: "/vets", icon: Stethoscope },
    { name: "Emergency Alerts", href: "/emergency", icon: ShieldAlert, danger: true },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const navItems = role === "VET" ? vetNav : role === "ADMIN" ? adminNav : petOwnerNav;

  return (
    <aside className="w-64 h-full bg-[var(--card)] border-r border-[var(--border)] flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-6 flex items-center justify-between border-b border-[var(--border)]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white shadow-sm shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <PawPrint className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[var(--foreground)]">
                Animal<span className="text-[var(--primary)]">Setu</span>
              </span>
              <span className="block text-[10px] text-[var(--muted-foreground)] -mt-1 font-medium tracking-wide">
                PET CARE ECOSYSTEM
              </span>
            </div>
          </Link>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation items list */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-8.5rem)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-[var(--primary)]/10 text-[var(--primary)] font-semibold shadow-xs"
                    : item.danger
                    ? "text-[var(--danger)] hover:bg-[var(--danger)]/10"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive
                        ? "text-[var(--primary)]"
                        : item.danger
                        ? "text-[var(--danger)]"
                        : item.highlight
                        ? "text-[var(--accent)]"
                        : "text-[var(--muted-foreground)]"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <Badge
                    size="sm"
                    variant={item.danger ? "danger" : isActive ? "default" : "secondary"}
                  >
                    {item.badge}
                  </Badge>
                )}

                {item.highlight && !item.badge && (
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Role Indicator / Switcher Footer */}
      <div className="p-4 border-t border-[var(--border)] bg-[var(--muted)]/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
            <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              {role.replace("_", " ")}
            </span>
          </div>
          <Badge size="sm" variant="outline">
            v0.1-proto
          </Badge>
        </div>
      </div>
    </aside>
  );
}
