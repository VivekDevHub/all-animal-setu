"use client";

import Link from "next/link";
import { Pet } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeartPulse, ArrowRight, Sparkles } from "lucide-react";

interface PetCardProps {
  pet: Pet;
  viewMode?: "grid" | "list";
}

export function PetCard({ pet, viewMode = "grid" }: PetCardProps) {
  const getStatusVariant = (status: Pet["healthStatus"]) => {
    switch (status) {
      case "Healthy":
        return "success";
      case "Vaccination Due":
        return "warning";
      case "Attention Needed":
        return "danger";
      case "Recovering":
        return "secondary";
      default:
        return "default";
    }
  };

  if (viewMode === "list") {
    return (
      <Card className="hover:border-[var(--primary)]/40 transition-all">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2 border-[var(--border)] bg-[var(--muted)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pet.photoUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300"}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[var(--foreground)]">{pet.name}</h3>
                <Badge size="sm" variant={getStatusVariant(pet.healthStatus)}>
                  {pet.healthStatus}
                </Badge>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                {pet.species} • {pet.breed} • {pet.gender}
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                {pet.ageYears} {pet.ageYears === 1 ? "year" : "years"} • {pet.weightKg} kg
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--border)]">
            <Link href={`/pets/${pet.id}`}>
              <Button variant="primary" size="sm" className="gap-1.5 w-full sm:w-auto">
                <span>View Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden hover:border-[var(--primary)]/50 hover:shadow-md transition-all flex flex-col justify-between">
      {/* Photo with Overlay Badge */}
      <div className="relative h-44 w-full bg-[var(--muted)] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pet.photoUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600"}
          alt={pet.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <Badge size="sm" variant={getStatusVariant(pet.healthStatus)} className="shadow-xs backdrop-blur-md">
            {pet.healthStatus}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-black/50 text-white backdrop-blur-md">
            {pet.species}
          </span>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight">{pet.name}</h3>
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">
              {pet.weightKg} kg
            </span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            {pet.breed} • {pet.gender} • {pet.ageYears} {pet.ageYears === 1 ? "year" : "years"}
          </p>

          {/* Quick Health Summary Pill */}
          <div className="mt-3 p-2.5 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span className="text-[11px] text-[var(--muted-foreground)]">
                {pet.healthStatus === "Healthy"
                  ? "Vitals Stable"
                  : pet.healthStatus === "Vaccination Due"
                  ? "Booster Required"
                  : "Needs Care"}
              </span>
            </div>
            {pet.bloodGroup && (
              <span className="text-[10px] font-mono font-bold text-[var(--foreground)] uppercase">
                {pet.bloodGroup}
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
          <Link href={`/pets/${pet.id}/health-passport`} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[var(--accent)]" />
            Passport
          </Link>
          <Link href={`/pets/${pet.id}`}>
            <Button variant="primary" size="sm" className="gap-1 shadow-xs">
              <span>View Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
