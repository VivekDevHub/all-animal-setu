"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { PetAISelector } from "@/components/ai/PetAISelector";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { aiService } from "@/services/aiService";
import { petService } from "@/services/petService";
import { Pet } from "@/types";
import { ExercisePlan } from "@/types/ai";
import {
  Footprints,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  Shield,
  Activity,
} from "lucide-react";

function AIExercisePlannerContent() {
  const searchParams = useSearchParams();
  const urlPetId = searchParams.get("petId");

  const { success, error: toastError } = useToast();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [plan, setPlan] = useState<ExercisePlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadData = useCallback(async () => {
    const data = await petService.getPets();
    setPets(data);
    const initial = urlPetId ? data.find((p) => p.id === urlPetId) : data[0];
    if (initial) setSelectedPet(initial);
  }, [urlPetId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenerate = async () => {
    if (!selectedPet) return;
    setIsGenerating(true);
    try {
      const generated = await aiService.generateExercisePlan(selectedPet);
      setPlan(generated);
      success("Exercise plan active!", `Daily enrichment schedule ready for ${selectedPet.name}.`);
    } catch {
      toastError("Failed to generate exercise plan");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 text-[var(--secondary)] text-xs font-bold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Activity & Enrichment Coach</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            AI Exercise & Fitness Planner
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
            Build healthy daily activity targets, cognitive games, and leash routines suited to breed energy.
          </p>
        </div>

        {/* Pet Profile Context */}
        {selectedPet && (
          <PetAISelector
            pets={pets}
            selectedPetId={selectedPet.id}
            onSelectPet={(p) => {
              setSelectedPet(p);
              setPlan(null);
            }}
          />
        )}

        {/* Vitals Bar */}
        {selectedPet && (
          <Card className="bg-[var(--card)]/50">
            <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">Breed & Energy</span>
                  <span className="font-bold text-[var(--foreground)]">{selectedPet.breed} • High Energy</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">Age & Weight</span>
                  <span className="font-bold text-[var(--foreground)]">{selectedPet.ageYears} yrs • {selectedPet.weightKg} kg</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleGenerate}
                isLoading={isGenerating}
                className="gap-2 shadow-sm"
              >
                <Footprints className="w-4 h-4" />
                <span>{plan ? "Recalculate Schedule" : "Generate Exercise Plan"}</span>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Plan Output */}
        {plan && (
          <div className="space-y-6 animate-in fade-in zoom-in-95">
            {/* Header Stat */}
            <Card className="border-[var(--secondary)]/30 bg-gradient-to-r from-[var(--secondary)]/5 via-[var(--card)] to-[var(--primary)]/5">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <Badge size="sm" variant="secondary">Activity Protocol</Badge>
                    <CardTitle className="text-xl mt-2 font-extrabold">
                      {plan.petName}&apos;s Daily Movement Schedule
                    </CardTitle>
                  </div>
                  <div className="p-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center">
                    <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">Target Active Time</span>
                    <span className="text-lg font-extrabold text-[var(--secondary)]">{plan.targetDailyMinutes} mins/day</span>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Daily Schedule Blocks */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--primary)]" />
                <span>Structured Daily Routine</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plan.dailySchedule.map((item, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-5 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <Badge size="sm" variant={item.intensity === "High" ? "danger" : item.intensity === "Moderate" ? "warning" : "secondary"}>
                          {item.intensity} Intensity
                        </Badge>
                        <span className="font-bold text-[var(--primary)]">{item.duration}</span>
                      </div>
                      <h4 className="font-bold text-sm text-[var(--foreground)] mt-2">{item.activity}</h4>
                      <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">{item.enrichmentType}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recommended Games & Rest Protocol */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[var(--accent)]" />
                    <span>Recommended Enrichment Drills</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-[var(--foreground)]">
                  {plan.recommendedActivities.map((act, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)] mt-0.5 shrink-0" />
                      <span>{act}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[var(--primary)]" />
                    <span>Rest & Heat Safety Protocol</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <p className="text-[var(--foreground)] leading-relaxed">{plan.restAndRecovery}</p>
                  <div className="p-3 rounded-xl bg-[var(--warning)]/10 border border-[var(--warning)]/20 text-[var(--foreground)] font-medium">
                    {plan.safetyCaution}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
  );
}

export default function AIExercisePlannerPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-xs text-[var(--muted-foreground)]">Loading exercise planner...</div>}>
        <AIExercisePlannerContent />
      </Suspense>
    </AppLayout>
  );
}
