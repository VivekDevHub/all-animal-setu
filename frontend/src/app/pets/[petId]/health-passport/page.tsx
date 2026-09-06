"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { DigitalHealthPassport } from "@/components/pet/DigitalHealthPassport";
import { petService } from "@/services/petService";
import { healthService } from "@/services/healthService";
import { Pet } from "@/types";
import { HealthPassportData } from "@/data/healthRecords";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function StandaloneHealthPassportPage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const resolvedParams = use(params);
  const petId = resolvedParams.petId;

  const [pet, setPet] = useState<Pet | null>(null);
  const [passport, setPassport] = useState<HealthPassportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [petData, passData] = await Promise.all([
          petService.getPetById(petId),
          healthService.getHealthPassport(petId),
        ]);
        setPet(petData);
        setPassport(passData);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [petId]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
          <div className="h-6 w-32 bg-[var(--muted)] rounded-lg" />
          <div className="h-64 bg-[var(--muted)] rounded-3xl" />
          <div className="h-48 bg-[var(--muted)] rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  if (!pet) {
    return (
      <AppLayout>
        <div className="p-12 text-center max-w-md mx-auto space-y-4">
          <AlertCircle className="w-12 h-12 text-[var(--danger)] mx-auto" />
          <h2 className="text-xl font-bold">Pet Not Found</h2>
          <Link href="/pets">
            <Button variant="primary" size="md">
              Back to My Pets
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href={`/pets/${pet.id}`}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-[var(--muted-foreground)]">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {pet.name}&apos;s Profile</span>
            </Button>
          </Link>
        </div>

        <DigitalHealthPassport pet={pet} passportData={passport} />
      </div>
    </AppLayout>
  );
}
