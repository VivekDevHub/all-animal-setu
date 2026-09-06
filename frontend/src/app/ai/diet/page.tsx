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
import { DietPlan } from "@/types/ai";
import {
  Utensils,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  Clock,
  Info,
  Calendar,
} from "lucide-react";

function AIDietPlannerContent() {
  const searchParams = useSearchParams();
  const urlPetId = searchParams.get("petId");

  const { success, error: toastError } = useToast();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [plan, setPlan] = useState<DietPlan | null>(null);
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
      const generated = await aiService.generateDietPlan(selectedPet);
      setPlan(generated);
      success("Diet plan generated!", `Customized meal guidelines calculated for ${selectedPet.name}.`);
    } catch {
      toastError("Failed to generate plan");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-[var(--accent)] text-xs font-bold mb-1">
          <Sparkles className="w-4 h-4" />
          <span>AI Nutrition Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
          AI Diet & Feeding Planner
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
          Formulate balanced caloric intake, scheduled feeding portions, and allergen exclusions tailored to your pet.
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

      {/* Pet Vitals Overview */}
      {selectedPet && (
        <Card className="bg-[var(--card)]/50">
          <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">Species / Breed</span>
                <span className="font-bold text-[var(--foreground)]">{selectedPet.species} • {selectedPet.breed}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">Weight & Age</span>
                <span className="font-bold text-[var(--foreground)]">{selectedPet.weightKg} kg • {selectedPet.ageYears} yrs</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">Allergies</span>
                <span className="font-bold text-[var(--danger)]">
                  {selectedPet.allergies?.length ? selectedPet.allergies.join(", ") : "None reported"}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleGenerate}
              isLoading={isGenerating}
              className="gap-2 shadow-sm"
            >
              <Utensils className="w-4 h-4" />
              <span>{plan ? "Regenerate Plan" : "Generate Diet Plan"}</span>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generated Diet Plan Display */}
      {plan && (
        <div className="space-y-6 animate-in fade-in zoom-in-95">
          {/* Header Summary Card */}
          <Card className="border-[var(--accent)]/30 bg-gradient-to-r from-[var(--accent)]/5 via-[var(--card)] to-[var(--primary)]/5">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <Badge size="sm" variant="default">Formulated for {plan.petName}</Badge>
                  <CardTitle className="text-xl mt-2 font-extrabold">
                    {plan.petName}&apos;s Daily Nutritional Architecture
                  </CardTitle>
                </div>
                <div className="p-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center">
                  <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">Target Daily Energy</span>
                  <span className="text-lg font-extrabold text-[var(--accent)]">{plan.dailyCalories} kcal</span>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Feeding Schedule */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--primary)]" />
              <span>Recommended Feeding Schedule</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plan.feedingSchedule.map((meal, idx) => (
                <Card key={idx}>
                  <CardContent className="p-5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[var(--foreground)]">{meal.meal}</span>
                      <Badge size="sm" variant="secondary">{meal.time}</Badge>
                    </div>
                    <p className="font-semibold text-[var(--primary)] text-sm">{meal.portion}</p>
                    <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">{meal.notes}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* General Guidelines & Hydration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                  <span>General Feeding Principles</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-[var(--foreground)]">
                {plan.generalGuidelines.map((g, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5 shrink-0" />
                    <span>{g}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-[var(--secondary)]" />
                  <span>Hydration & Fresh Water Guidance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[var(--secondary)]/10 border border-[var(--secondary)]/20">
                  <p className="font-bold text-[var(--foreground)]">{plan.hydrationGuidance}</p>
                </div>
                <p className="text-[var(--muted-foreground)] text-[11px] leading-relaxed">
                  Always position water away from direct sunlight. Cats prefer wide, shallow stainless bowls to prevent whisker stress.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Forbidden Foods Card */}
          <Card className="border-[var(--danger)]/30 bg-[var(--danger)]/5">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-[var(--danger)] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Toxic & Forbidden Foods to Avoid</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {plan.foodsToAvoid.map((food, i) => (
                  <div key={i} className="flex items-center gap-2 text-[var(--foreground)] font-medium">
                    <span className="text-[var(--danger)]">✕</span>
                    <span>{food}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="p-3.5 rounded-2xl bg-[var(--muted)]/50 border border-[var(--border)] flex items-start gap-2.5 text-xs text-[var(--muted-foreground)]">
            <Info className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
            <p>{plan.importantNotice}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AIDietPlannerPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-xs text-[var(--muted-foreground)]">Loading diet planner...</div>}>
        <AIDietPlannerContent />
      </Suspense>
    </AppLayout>
  );
}
