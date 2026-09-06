"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { healthService } from "@/services/healthService";
import { petService } from "@/services/petService";
import { VaccinationRecord, Pet } from "@/types";
import {
  ArrowLeft,
  Syringe,
  Plus,
  CheckCircle2,
  Calendar,
  AlertCircle,
  X,
  Clock,
  Building,
} from "lucide-react";

export default function VaccinationsPage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const resolvedParams = use(params);
  const petId = resolvedParams.petId;

  const { success, error: toastError } = useToast();
  const [pet, setPet] = useState<Pet | null>(null);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [vaccineName, setVaccineName] = useState("");
  const [dateAdministered, setDateAdministered] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [administeredBy, setAdministeredBy] = useState("Dr. Ananya Verma");
  const [batchNumber, setBatchNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [petData, vacsData] = await Promise.all([
        petService.getPetById(petId),
        healthService.getVaccinations(petId),
      ]);
      setPet(petData);
      setVaccinations(vacsData);
    } finally {
      setIsLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccineName.trim() || !dueDate) {
      toastError("Please complete required fields", "Vaccine name and next due date are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await healthService.addVaccination(petId, {
        petId,
        vaccineName,
        dateAdministered,
        dueDate,
        status: "Completed",
        administeredBy,
        batchNumber: batchNumber || undefined,
      });

      setVaccinations([created, ...vaccinations]);
      setShowAddModal(false);
      setVaccineName("");
      setDueDate("");
      setBatchNumber("");
      success("Vaccination logged", `${created.vaccineName} recorded. Reminder scheduled for ${created.dueDate}.`);
    } catch {
      toastError("Failed to save vaccination");
    } finally {
      setIsSubmitting(false);
    }
  };

  const upcomingCount = vaccinations.filter((v) => v.status !== "Completed").length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link href={`/pets/${petId}`}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-[var(--muted-foreground)]">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {pet?.name || "Pet"}</span>
            </Button>
          </Link>

          <Button
            variant="primary"
            size="md"
            onClick={() => setShowAddModal(true)}
            className="gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Vaccination</span>
          </Button>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Vaccination & Immunization Record
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
            Track immunizations, booster deadlines, and certified veterinary batches.
          </p>
        </div>

        {/* Status Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-[var(--success)]/20 bg-[var(--success)]/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Completed</span>
                <p className="text-xl font-bold text-[var(--success)] mt-0.5">
                  {vaccinations.filter((v) => v.status === "Completed").length} Vaccines
                </p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-[var(--success)]" />
            </CardContent>
          </Card>

          <Card className="border-[var(--warning)]/20 bg-[var(--warning)]/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Due Soon</span>
                <p className="text-xl font-bold text-[var(--warning)] mt-0.5">
                  {upcomingCount} Upcoming
                </p>
              </div>
              <Clock className="w-6 h-6 text-[var(--warning)]" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Primary Clinician</span>
                <p className="text-sm font-bold text-[var(--foreground)] mt-0.5 truncate">
                  Dr. Ananya Verma
                </p>
              </div>
              <Building className="w-5 h-5 text-[var(--muted-foreground)]" />
            </CardContent>
          </Card>
        </div>

        {/* Vaccinations List */}
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-20 bg-[var(--muted)] rounded-2xl" />
            <div className="h-20 bg-[var(--muted)] rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-4">
            {vaccinations.map((vac) => (
              <Card key={vac.id} className="hover:border-[var(--primary)]/40 transition-all">
                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        vac.status === "Completed"
                          ? "bg-[var(--success)]/10 text-[var(--success)]"
                          : "bg-[var(--warning)]/15 text-[var(--warning)]"
                      }`}
                    >
                      <Syringe className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[var(--foreground)]">{vac.vaccineName}</h3>
                        <Badge
                          size="sm"
                          variant={vac.status === "Completed" ? "success" : "warning"}
                        >
                          {vac.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                        Administered: <strong>{vac.dateAdministered}</strong> • Next Due:{" "}
                        <strong className="text-[var(--foreground)]">{vac.dueDate}</strong>
                      </p>
                      <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                        Batch: {vac.batchNumber || "Not recorded"} • By: {vac.administeredBy || "Certified Vet"}
                      </p>
                    </div>
                  </div>

                  <div className="self-end sm:self-center">
                    <Button variant="outline" size="sm" onClick={() => success("Reminder active", `Notification set for ${vac.dueDate}`)}>
                      Sync Reminder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal: Add Vaccination */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--card)] border border-[var(--border)] w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <h3 className="text-base font-bold text-[var(--foreground)]">Log Vaccination</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddVaccine} className="space-y-4 pt-4 text-xs">
                <Input
                  label="Vaccine Name *"
                  placeholder="e.g. Rabies Booster, DHPP, Bordetella"
                  value={vaccineName}
                  onChange={(e) => setVaccineName(e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Administered Date *"
                    type="date"
                    value={dateAdministered}
                    onChange={(e) => setDateAdministered(e.target.value)}
                    required
                  />

                  <Input
                    label="Next Due Date *"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Administered By (Doctor/Clinic)"
                  placeholder="e.g. Dr. Ananya Verma"
                  value={administeredBy}
                  onChange={(e) => setAdministeredBy(e.target.value)}
                />

                <Input
                  label="Batch / Serial Number"
                  placeholder="e.g. RB-992-IN"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                />

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                    Save Vaccination
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
