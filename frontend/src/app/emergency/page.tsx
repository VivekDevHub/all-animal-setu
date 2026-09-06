"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { vetService, MOCK_NEARBY_VETS } from "@/services/vetService";
import { petService } from "@/services/petService";
import { Pet } from "@/types";
import { VetFacility, EmergencyEvent } from "@/types/ai";
import {
  AlertTriangle,
  Phone,
  Navigation,
  Shield,
  Clock,
  HeartPulse,
  Activity,
  CheckCircle2,
  FileCheck,
} from "lucide-react";

export default function EmergencyPage() {
  const { success, error: toastError } = useToast();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeEmergency, setActiveEmergency] = useState<EmergencyEvent | null>(null);

  useEffect(() => {
    async function load() {
      const data = await petService.getPets();
      setPets(data);
      if (data.length > 0) setSelectedPet(data[0]);
    }
    load();
  }, []);

  const handleTriggerEmergency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet) return;
    setIsSubmitting(true);
    try {
      const created = await vetService.createEmergency({
        petId: selectedPet.id,
        description: description || "Critical acute distress",
      });
      setActiveEmergency(created);
      success("Emergency assistance activated", "Closest ICU & emergency trauma centers dispatched.");
    } catch {
      toastError("Failed to dispatch emergency event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const emergencyHospitals = MOCK_NEARBY_VETS.filter((v) => v.is24x7Emergency);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Emergency Hero Alert */}
        <div className="rounded-3xl border-2 border-[var(--danger)]/40 bg-gradient-to-br from-[var(--danger)]/15 via-[var(--card)] to-[var(--danger)]/5 p-6 sm:p-8 shadow-lg relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[var(--danger)] text-white flex items-center justify-center shrink-0 shadow-md">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--danger)]">
                  Critical Pet Triage & Support
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
                  Pet Emergency? Get Help Immediately.
                </h1>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Connect instantly with 24/7 trauma hospitals, ICUs, and prepare digital health cards.
                </p>
              </div>
            </div>

            {selectedPet && (
              <Link href={`/pets/${selectedPet.id}/health-passport`}>
                <Button variant="outline" size="sm" className="gap-1.5 shrink-0 border-[var(--primary)] text-[var(--primary)]">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Emergency Health Card</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Trigger / Status Section */}
        {!activeEmergency ? (
          <Card className="border-[var(--danger)]/20">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-[var(--danger)]" />
                <span>Initiate Emergency Dispatch</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTriggerEmergency} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pet Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                      Which pet needs care? *
                    </label>
                    <select
                      value={selectedPet?.id || ""}
                      onChange={(e) => {
                        const found = pets.find((p) => p.id === e.target.value);
                        if (found) setSelectedPet(found);
                      }}
                      className="w-full h-11 rounded-xl border border-[var(--input)] bg-[var(--card)] px-3 text-sm text-[var(--foreground)] font-semibold"
                    >
                      {pets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.species} • {p.breed})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Immediate Emergency Hotline */}
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[var(--danger)] block">
                        24/7 Metro Emergency Hotline
                      </span>
                      <span className="text-sm font-extrabold text-[var(--foreground)]">+91 99999 00000</span>
                    </div>
                    <a href="tel:+919999900000">
                      <Button variant="danger" size="sm" type="button" className="gap-1.5 shadow-sm">
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Hotline</span>
                      </Button>
                    </a>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Describe symptoms or incident (Optional - Do not delay transport)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Difficulty breathing, choking, collapsed after walk, bleeding from paw..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-[var(--input)] bg-[var(--card)] p-3 text-xs text-[var(--foreground)]"
                  />
                </div>

                <Button
                  type="submit"
                  variant="danger"
                  size="lg"
                  isLoading={isSubmitting}
                  className="w-full gap-2 text-sm font-bold shadow-md"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Find Nearest Open Emergency Hospital</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          /* Active Emergency Status Banner */
          <Card className="border-2 border-[var(--danger)] bg-gradient-to-r from-red-500/10 via-[var(--card)] to-[var(--card)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge size="md" variant="danger" className="animate-pulse">
                  ACTIVE EMERGENCY INCIDENT #{activeEmergency.id}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveEmergency(null);
                    success("Incident resolved", "Emergency event marked as completed.");
                  }}
                  className="text-xs"
                >
                  Mark as Resolved
                </Button>
              </div>
              <CardTitle className="text-lg mt-2 font-bold">
                Emergency Care Initiated for {activeEmergency.petName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <p className="text-[var(--foreground)]">
                Assigned ICU facility: <strong>{activeEmergency.assignedFacility?.name}</strong> (1.2 km away)
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <a href={`tel:${activeEmergency.assignedFacility?.phone}`}>
                  <Button variant="danger" size="sm" className="gap-1.5 shadow-sm">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Facility ({activeEmergency.assignedFacility?.phone})</span>
                  </Button>
                </a>
                <a
                  href={`https://maps.google.com/?q=${activeEmergency.assignedFacility?.lat},${activeEmergency.assignedFacility?.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="primary" size="sm" className="gap-1.5 shadow-sm">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Open GPS Directions</span>
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 24/7 Verified Emergency Hospitals List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--danger)]" />
              <span>Nearby 24/7 Emergency & Critical Care Centers</span>
            </h3>
            <span className="text-xs text-[var(--muted-foreground)]">Sorted by proximity</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {emergencyHospitals.map((hosp) => (
              <Card key={hosp.id} className="border-red-500/20 hover:border-red-500/40 transition-all">
                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[var(--foreground)]">{hosp.name}</h4>
                      <Badge size="sm" variant="danger">24/7 ICU</Badge>
                    </div>
                    <p className="text-[var(--muted-foreground)]">{hosp.address}</p>
                    <p className="text-[11px] text-[var(--foreground)] font-semibold flex items-center gap-2 mt-1">
                      <span>🚗 {hosp.distanceKm} km away</span>
                      <span>•</span>
                      <span className="text-[var(--success)] font-bold">Open 24 Hours</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {hosp.phone && (
                      <a href={`tel:${hosp.phone}`}>
                        <Button variant="danger" size="sm" className="gap-1.5 shadow-sm">
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Clinic</span>
                        </Button>
                      </a>
                    )}
                    <a
                      href={`https://maps.google.com/?q=${hosp.lat},${hosp.lng}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Directions</span>
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
