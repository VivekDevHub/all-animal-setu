"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PawPrint,
  Sparkles,
  MapPin,
  User,
} from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/dashboard", icon: LayoutDashboard },
    { name: "Pets", href: "/pets", icon: PawPrint },
    { name: "AI Vet", href: "/ai", icon: Sparkles, highlight: true },
    { name: "Vets", href: "/vets", icon: MapPin },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--card)]/90 backdrop-blur-lg border-t border-[var(--border)] px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "text-[var(--primary)] font-bold scale-105"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${
                    item.highlight && !isActive ? "text-[var(--accent)]" : ""
                  }`}
                />
                {item.highlight && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium tracking-tight">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
