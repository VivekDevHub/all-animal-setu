"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { AIFeatureCard } from "@/components/ai/AIFeatureCard";
import { PetAISelector } from "@/components/ai/PetAISelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { petService } from "@/services/petService";
import { Pet } from "@/types";
import {
  Sparkles,
  MessageSquare,
  Utensils,
  Footprints,
  Camera,
  ShieldAlert,
  AlertTriangle,
  HeartPulse,
  Info,
} from "lucide-react";

export default function AIHubPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  useEffect(() => {
    async function load() {
      const data = await petService.getPets();
      setPets(data);
      if (data.length > 0) setSelectedPet(data[0]);
    }
    load();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="rounded-3xl border border-[var(--primary)]/30 bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-[var(--primary)]/5 p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AnimalSetu Intelligent Pet Companion</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--foreground)]">
              Your Pet&apos;s AI Care Assistant
            </h1>

            <p className="text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
              Smarter health insights, personalized nutrition, breed identification, and activity schedules designed specifically for your pets.
            </p>

            {/* Safe Medical Disclaimer Alert */}
            <div className="p-3.5 rounded-2xl bg-[var(--muted)]/60 border border-[var(--border)] flex items-start gap-3 text-xs text-[var(--muted-foreground)]">
              <Info className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
              <p>
                <strong className="text-[var(--foreground)]">Responsible AI Disclaimer:</strong> AI provides educational wellness guidance and triage awareness. It does NOT replace certified veterinary diagnosis or emergency clinical care.
              </p>
            </div>
          </div>
        </div>

        {/* Pet Selection Sync */}
        {selectedPet && (
          <PetAISelector
            pets={pets}
            selectedPetId={selectedPet.id}
            onSelectPet={setSelectedPet}
            label={`Personalizing AI Insights For ${selectedPet.name}`}
          />
        )}

        {/* 4 Core AI Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AIFeatureCard
            icon={MessageSquare}
            title="AI Health Assistant"
            description="Discuss symptoms, triage concerns, and receive structured care recommendations."
            href={`/ai/health?petId=${selectedPet?.id || ""}`}
            ctaText="Ask AI Assistant"
            badgeText="24/7 Triage"
            accentColor="teal"
          />

          <AIFeatureCard
            icon={Utensils}
            title="AI Diet Planner"
            description="Generate customized portion sizes, nutrient balance, and forbidden food lists based on weight & breed."
            href={`/ai/diet?petId=${selectedPet?.id || ""}`}
            ctaText="Create Diet Plan"
            badgeText="Personalized"
            accentColor="amber"
          />

          <AIFeatureCard
            icon={Footprints}
            title="AI Exercise Planner"
            description="Build daily workout routines, interactive games, and mental enrichment tailored to your pet's energy level."
            href={`/ai/exercise?petId=${selectedPet?.id || ""}`}
            ctaText="Build Routine"
            badgeText="Enrichment"
            accentColor="blue"
          />

          <AIFeatureCard
            icon={Camera}
            title="Breed Identifier"
            description="Upload any pet photo to estimate breed lineage, traits, temperament, and care considerations."
            href="/ai/breed"
            ctaText="Scan & Identify"
            badgeText="Vision AI"
            accentColor="rose"
          />
        </div>

        {/* Emergency Triage Callout Banner */}
        <div className="rounded-3xl border border-[var(--danger)]/30 bg-[var(--danger)]/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--danger)]/15 text-[var(--danger)] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--foreground)]">
                Experiencing a life-threatening pet emergency?
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                If your pet has collapsed, is bleeding profusely, or having severe breathing difficulty, bypass AI and contact emergency care immediately.
              </p>
            </div>
          </div>

          <Link href="/emergency">
            <Button variant="danger" size="md" className="gap-2 shrink-0">
              <ShieldAlert className="w-4 h-4" />
              <span>Locate Emergency Vet</span>
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
