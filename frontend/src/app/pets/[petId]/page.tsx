"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DigitalHealthPassport } from "@/components/pet/DigitalHealthPassport";
import { petService } from "@/services/petService";
import { healthService } from "@/services/healthService";
import { Pet, VaccinationRecord, MedicalRecord } from "@/types";
import { HealthPassportData } from "@/data/healthRecords";
import {
  ArrowLeft,
  Sparkles,
  HeartPulse,
  Syringe,
  Pill,
  FileText,
  Calendar,
  AlertTriangle,
  Plus,
  Clock,
  Shield,
  Phone,
  FilePlus,
} from "lucide-react";

export default function PetProfilePage({ params }: { params: Promise<{ petId: string }> }) {
  const resolvedParams = use(params);
  const petId = resolvedParams.petId;

  const [pet, setPet] = useState<Pet | null>(null);
  const [passport, setPassport] = useState<HealthPassportData | null>(null);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [petData, passData, vacData, recData] = await Promise.all([
        petService.getPetById(petId),
        healthService.getHealthPassport(petId),
        healthService.getVaccinations(petId),
        healthService.getMedicalRecords(petId),
      ]);
      setPet(petData);
      setPassport(passData);
      setVaccinations(vacData);
      setRecords(recData);
    } finally {
      setIsLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-6 w-32 bg-[var(--muted)] rounded-lg" />
          <div className="h-64 bg-[var(--muted)] rounded-3xl" />
          <div className="h-12 w-96 bg-[var(--muted)] rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-[var(--muted)] rounded-2xl" />
            <div className="h-48 bg-[var(--muted)] rounded-2xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!pet) {
    return (
      <AppLayout>
        <div className="p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[var(--danger)]/10 text-[var(--danger)] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Pet Not Found</h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            We couldn’t locate a pet profile matching ID <code>{petId}</code>.
          </p>
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
      <div className="space-y-6">
        {/* Top Breadcrumbs */}
        <div className="flex items-center justify-between">
          <Link href="/pets">
            <Button variant="ghost" size="sm" className="gap-1.5 text-[var(--muted-foreground)]">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Pets</span>
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Link href={`/pets/${pet.id}/health-passport`}>
              <Button variant="outline" size="sm" className="gap-1.5 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Health Passport</span>
              </Button>
            </Link>
            <Link href="/emergency">
              <Button variant="danger" size="sm" className="gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                <span>Emergency</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Pet Profile Hero Header */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-[var(--border)] shadow-md shrink-0 bg-[var(--muted)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pet.photoUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600"}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
                    {pet.name}
                  </h1>
                  <Badge
                    size="sm"
                    variant={
                      pet.healthStatus === "Healthy"
                        ? "success"
                        : pet.healthStatus === "Vaccination Due"
                        ? "warning"
                        : "danger"
                    }
                  >
                    {pet.healthStatus}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-[var(--muted-foreground)] mt-1">
                  {pet.species} • {pet.breed}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  {pet.ageYears} {pet.ageYears === 1 ? "year old" : "years old"} • {pet.gender} • {pet.weightKg} kg
                </p>
              </div>
            </div>

            {/* Quick Stats Pills */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="px-3.5 py-2 rounded-2xl bg-[var(--muted)] border border-[var(--border)] text-xs">
                <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">Blood Group</span>
                <span className="font-bold text-[var(--foreground)]">{pet.bloodGroup || "DEA 1.1"}</span>
              </div>
              <div className="px-3.5 py-2 rounded-2xl bg-[var(--muted)] border border-[var(--border)] text-xs">
                <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">Microchip</span>
                <span className="font-mono font-bold text-[var(--foreground)]">{pet.microchipId || "Registered"}</span>
              </div>
              <div className="px-3.5 py-2 rounded-2xl bg-[var(--muted)] border border-[var(--border)] text-xs">
                <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">Last Vet Visit</span>
                <span className="font-bold text-[var(--foreground)]">{pet.lastVetVisit || "Recent"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Profile Sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto flex flex-wrap gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="passport">Health Passport</TabsTrigger>
            <TabsTrigger value="vaccinations">Vaccinations ({vaccinations.length})</TabsTrigger>
            <TabsTrigger value="records">Medical Records ({records.length})</TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {/* Health Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <HeartPulse className="w-4 h-4 text-[var(--primary)]" />
                      <span>Health Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-xs">
                        <span className="text-[10px] uppercase font-semibold text-[var(--muted-foreground)]">Allergies</span>
                        <p className="font-bold text-[var(--foreground)] mt-0.5">
                          {pet.allergies?.length || 0} Reported
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-xs">
                        <span className="text-[10px] uppercase font-semibold text-[var(--muted-foreground)]">Conditions</span>
                        <p className="font-bold text-[var(--foreground)] mt-0.5">
                          {pet.medicalConditions?.length || 0} Monitored
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-xs">
                        <span className="text-[10px] uppercase font-semibold text-[var(--muted-foreground)]">Vaccine Status</span>
                        <p className="font-bold text-[var(--success)] mt-0.5">Up to Date</p>
                      </div>
                    </div>

                    {pet.notes && (
                      <div className="p-3.5 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)] text-xs">
                        <span className="font-bold text-[var(--foreground)] block mb-1">Care & Temperament Notes:</span>
                        <p className="text-[var(--muted-foreground)] leading-relaxed">{pet.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Upcoming Schedule */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[var(--secondary)]" />
                      <span>Upcoming Vaccines & Care</span>
                    </CardTitle>
                    <Link href={`/pets/${pet.id}/vaccinations`}>
                      <span className="text-xs text-[var(--primary)] font-semibold hover:underline">
                        View All →
                      </span>
                    </Link>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {vaccinations.slice(0, 2).map((vac) => (
                      <div
                        key={vac.id}
                        className="p-3 rounded-xl border border-[var(--border)] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <Syringe className="w-4 h-4 text-[var(--primary)]" />
                          <div>
                            <p className="font-bold text-[var(--foreground)]">{vac.vaccineName}</p>
                            <p className="text-[10px] text-[var(--muted-foreground)]">Due: {vac.dueDate}</p>
                          </div>
                        </div>
                        <Badge size="sm" variant={vac.status === "Completed" ? "success" : "warning"}>
                          {vac.status}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Info Column */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                      Emergency Contacts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-[var(--danger)]/5 border border-[var(--danger)]/20">
                      <span className="text-[10px] font-bold uppercase text-[var(--danger)] block">Pet Owner Contact</span>
                      <p className="font-bold text-[var(--foreground)] mt-0.5">{pet.emergencyContact || "+91 98765 43210"}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
                      <span className="text-[10px] font-bold uppercase text-[var(--muted-foreground)] block">Primary Hospital</span>
                      <p className="font-bold text-[var(--foreground)] mt-0.5">Happy Paws Vet Clinic</p>
                      <p className="text-[11px] text-[var(--muted-foreground)]">+91 98765 11223</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Action Buttons */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href={`/pets/${pet.id}/medical-records`}>
                      <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                        <FilePlus className="w-4 h-4 text-[var(--primary)]" />
                        <span>Upload Medical Record</span>
                      </Button>
                    </Link>
                    <Link href={`/pets/${pet.id}/vaccinations`}>
                      <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                        <Syringe className="w-4 h-4 text-[var(--secondary)]" />
                        <span>Log Vaccination</span>
                      </Button>
                    </Link>
                    <Link href="/lost-pet">
                      <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                        <Shield className="w-4 h-4 text-[var(--accent)]" />
                        <span>Generate Lost Pet QR Tag</span>
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: DIGITAL HEALTH PASSPORT */}
          <TabsContent value="passport">
            <DigitalHealthPassport pet={pet} passportData={passport} />
          </TabsContent>

          {/* TAB 3: VACCINATIONS */}
          <TabsContent value="vaccinations">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--foreground)]">Vaccination History</h3>
                <Link href={`/pets/${pet.id}/vaccinations`}>
                  <Button variant="primary" size="sm" className="gap-1.5">
                    <Plus className="w-4 h-4" />
                    <span>Add Vaccination</span>
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {vaccinations.map((vac) => (
                  <Card key={vac.id}>
                    <CardContent className="p-4 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                          <Syringe className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[var(--foreground)]">{vac.vaccineName}</h4>
                          <p className="text-[11px] text-[var(--muted-foreground)]">
                            Administered: {vac.dateAdministered} • Batch: {vac.batchNumber || "N/A"}
                          </p>
                        </div>
                      </div>
                      <Badge size="sm" variant={vac.status === "Completed" ? "success" : "warning"}>
                        {vac.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: MEDICAL RECORDS */}
          <TabsContent value="records">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--foreground)]">Medical Records & Reports</h3>
                <Link href={`/pets/${pet.id}/medical-records`}>
                  <Button variant="primary" size="sm" className="gap-1.5">
                    <Plus className="w-4 h-4" />
                    <span>Upload Document</span>
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {records.map((rec) => (
                  <Card key={rec.id}>
                    <CardContent className="p-4 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[var(--secondary)]/10 text-[var(--secondary)] flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[var(--foreground)]">{rec.title}</h4>
                          <p className="text-[11px] text-[var(--muted-foreground)]">
                            {rec.type} • {rec.date} • {rec.veterinarian}
                          </p>
                        </div>
                      </div>
                      <Badge size="sm" variant="secondary">
                        {rec.type}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
