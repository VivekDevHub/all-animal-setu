"use client";

import { Pet } from "@/types";
import { HealthPassportData } from "@/data/healthRecords";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  QrCode,
  HeartPulse,
  AlertTriangle,
  Pill,
  Syringe,
  Phone,
  FileCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface DigitalHealthPassportProps {
  pet: Pet;
  passportData?: HealthPassportData | null;
}

export function DigitalHealthPassport({ pet, passportData }: DigitalHealthPassportProps) {
  const { success } = useToast();

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    success("Passport link copied", "Shareable digital passport link copied to clipboard.");
  };

  return (
    <div className="space-y-6">
      {/* Passport Identity Header Card */}
      <div className="rounded-3xl border-2 border-[var(--primary)]/30 bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-[var(--primary)]/5 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-[var(--primary)]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-[var(--primary)] shadow-md shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pet.photoUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400"}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--primary)]">
                  Digital Health Passport
                </span>
                <Badge size="sm" variant="success" className="gap-1">
                  <Shield className="w-3 h-3" />
                  Verified
                </Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
                {pet.name}
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                {pet.species} • {pet.breed} • {pet.gender} • {pet.ageYears} years • {pet.weightKg} kg
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5">
              <QrCode className="w-4 h-4" />
              <span>Share Passport</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 hidden sm:inline-flex"
            >
              <FileCheck className="w-4 h-4" />
              <span>Print Card</span>
            </Button>
          </div>
        </div>

        {/* Primary Vitals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 rounded-2xl bg-[var(--background)]/60 border border-[var(--border)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Blood Group
            </span>
            <p className="text-sm font-bold text-[var(--foreground)] mt-0.5">
              {pet.bloodGroup || "Not Tested"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--background)]/60 border border-[var(--border)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Microchip ID
            </span>
            <p className="text-sm font-mono font-bold text-[var(--foreground)] mt-0.5 truncate">
              {pet.microchipId || "Unregistered"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--background)]/60 border border-[var(--border)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Primary Clinic
            </span>
            <p className="text-sm font-bold text-[var(--foreground)] mt-0.5 truncate">
              {passportData?.primaryVet?.clinic || "Happy Paws Clinic"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--background)]/60 border border-[var(--border)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Emergency Contact
            </span>
            <p className="text-sm font-bold text-[var(--danger)] mt-0.5 truncate">
              {pet.emergencyContact || "+91 98765 43210"}
            </p>
          </div>
        </div>
      </div>

      {/* Passport Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Allergies & Conditions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-[var(--danger)]">
              <AlertTriangle className="w-4 h-4" />
              <CardTitle className="text-base">Allergies & Medical Conditions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-[var(--muted-foreground)] block mb-2 uppercase tracking-wider">
                Known Allergies
              </span>
              {pet.allergies && pet.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {pet.allergies.map((allergy, i) => (
                    <Badge key={i} variant="danger" size="md">
                      ⚠️ {allergy}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--muted-foreground)] italic">No known allergies logged.</p>
              )}
            </div>

            <div className="pt-2 border-t border-[var(--border)]">
              <span className="text-xs font-semibold text-[var(--muted-foreground)] block mb-2 uppercase tracking-wider">
                Chronic / Diagnosed Conditions
              </span>
              {pet.medicalConditions && pet.medicalConditions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {pet.medicalConditions.map((cond, i) => (
                    <Badge key={i} variant="warning" size="md">
                      {cond}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--muted-foreground)] italic">No chronic medical conditions.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Active Medications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-[var(--secondary)]">
              <Pill className="w-4 h-4" />
              <CardTitle className="text-base">Active Medications & Supplements</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {passportData?.activeMedications && passportData.activeMedications.length > 0 ? (
              passportData.activeMedications.map((med) => (
                <div
                  key={med.id}
                  className="p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <h4 className="font-bold text-[var(--foreground)]">{med.medicineName}</h4>
                    <p className="text-[var(--muted-foreground)] mt-0.5">{med.dosageText}</p>
                    <span className="text-[10px] text-[var(--muted-foreground)] block mt-1">
                      Prescribed by {med.prescribedBy}
                    </span>
                  </div>
                  <Badge size="sm" variant="secondary">{med.frequency}</Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--muted-foreground)] italic">No active medications currently prescribed.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vaccination Verification Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--primary)]">
              <Syringe className="w-4 h-4" />
              <CardTitle className="text-base">Immunization Status</CardTitle>
            </div>
            <span className="text-xs text-[var(--muted-foreground)] font-medium">
              Last validated: {passportData?.lastUpdated || "September 2026"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(passportData?.vaccinations || []).map((vac) => (
              <div
                key={vac.id}
                className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      vac.status === "Completed"
                        ? "bg-[var(--success)]/10 text-[var(--success)]"
                        : "bg-[var(--warning)]/15 text-[var(--warning)]"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--foreground)]">{vac.vaccineName}</h4>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      Administered: {vac.dateAdministered} • Batch: {vac.batchNumber || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-[11px] text-[var(--muted-foreground)]">
                    Next Due: <strong className="text-[var(--foreground)]">{vac.dueDate}</strong>
                  </span>
                  <Badge
                    size="sm"
                    variant={vac.status === "Completed" ? "success" : "warning"}
                  >
                    {vac.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
