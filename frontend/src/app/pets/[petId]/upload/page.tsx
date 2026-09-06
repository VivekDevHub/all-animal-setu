"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { MedicalDocumentUploader, ExtractedOcrData } from "@/components/health/MedicalDocumentUploader";
import { healthService } from "@/services/healthService";
import { petService } from "@/services/petService";
import { Pet } from "@/types";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function DocumentUploadPage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const resolvedParams = use(params);
  const petId = resolvedParams.petId;
  const router = useRouter();

  const [pet, setPet] = useState<Pet | null>(null);

  useEffect(() => {
    async function load() {
      const p = await petService.getPetById(petId);
      setPet(p);
    }
    load();
  }, [petId]);

  const handleSaved = async (extracted: ExtractedOcrData) => {
    // Save to records
    await healthService.addMedicalRecord(petId, {
      petId,
      title: `${extracted.vaccineOrTest} (${extracted.documentType})`,
      type: extracted.documentType.includes("Vaccin") ? "Vaccination" : "Lab Report",
      date: extracted.dateAdministered,
      veterinarian: extracted.veterinarian,
      clinicName: extracted.clinicName,
      summary: extracted.keyFindings,
    });

    // Also auto-save to vaccination record if it is a vaccine
    if (extracted.nextDueDate) {
      await healthService.addVaccination(petId, {
        petId,
        vaccineName: extracted.vaccineOrTest,
        dateAdministered: extracted.dateAdministered,
        dueDate: extracted.nextDueDate,
        status: "Completed",
        administeredBy: extracted.veterinarian,
        batchNumber: extracted.batchNumber,
      });
    }

    router.push(`/pets/${petId}/medical-records`);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href={`/pets/${petId}`}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-[var(--muted-foreground)]">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {pet?.name || "Pet"}</span>
            </Button>
          </Link>
        </div>

        <div>
          <div className="flex items-center gap-2 text-[var(--primary)] font-semibold text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Smart Healthcare Document Processing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Upload & Analyze Document for {pet?.name || "Your Pet"}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
            Upload paper prescriptions, test panels, or vaccine cards. Our AI will automatically extract clinical fields for your review.
          </p>
        </div>

        <MedicalDocumentUploader
          onConfirmedSave={handleSaved}
          onCancel={() => router.push(`/pets/${petId}/medical-records`)}
        />
      </div>
    </AppLayout>
  );
}
