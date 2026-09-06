"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { petService } from "@/services/petService";
import { Pet } from "@/types";
import { ArrowLeft, Pill, Plus, CheckCircle2, Clock, X } from "lucide-react";

interface MedicationItem {
  id: string;
  name: string;
  purpose: string;
  frequency: string;
  dosage: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  status: "Active" | "Past";
}

const INITIAL_MEDS: MedicationItem[] = [
  {
    id: "med-1",
    name: "Omega-3 Salmon Oil Supplement",
    purpose: "Skin & Coat Health / Dermatitis prevention",
    frequency: "Once Daily",
    dosage: "1 pump with breakfast",
    startDate: "2026-08-01",
    prescribedBy: "Dr. Ananya Verma",
    status: "Active",
  },
  {
    id: "med-2",
    name: "Cephalexin Chewables (375mg)",
    purpose: "Bacterial skin prophylaxis",
    frequency: "Twice Daily",
    dosage: "1 tablet morning and evening with food",
    startDate: "2026-07-10",
    endDate: "2026-07-24",
    prescribedBy: "Dr. Rajesh Sharma",
    status: "Past",
  },
];

export default function MedicationsPage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const resolvedParams = use(params);
  const petId = resolvedParams.petId;

  const { success, error: toastError } = useToast();
  const [pet, setPet] = useState<Pet | null>(null);
  const [meds, setMeds] = useState<MedicationItem[]>(INITIAL_MEDS);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [frequency, setFrequency] = useState("Once Daily");
  const [dosage, setDosage] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [prescribedBy, setPrescribedBy] = useState("Dr. Ananya Verma");

  useEffect(() => {
    async function load() {
      const p = await petService.getPetById(petId);
      setPet(p);
    }
    load();
  }, [petId]);

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toastError("Medicine name is required");
      return;
    }
    const newMed: MedicationItem = {
      id: `med-${Date.now()}`,
      name,
      purpose,
      frequency,
      dosage,
      startDate,
      prescribedBy,
      status: "Active",
    };
    setMeds([newMed, ...meds]);
    setShowAddModal(false);
    setName("");
    setPurpose("");
    setDosage("");
    success("Medication added", `${name} logged. Reminders created.`);
  };

  const activeMeds = meds.filter((m) => m.status === "Active");
  const pastMeds = meds.filter((m) => m.status === "Past");

  return (
    <AppLayout>
      <div className="space-y-6">
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
            <span>+ Add Medication</span>
          </Button>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Prescriptions & Active Medications
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
            Vet-certified treatments, dosages, frequencies, and administration schedules.
          </p>
        </div>

        {/* Active Medications */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--success)] animate-pulse" />
            <span>Active Courses ({activeMeds.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeMeds.map((m) => (
              <Card key={m.id} className="border-[var(--primary)]/30 hover:shadow-sm transition-all">
                <CardContent className="p-5 space-y-3 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--foreground)]">{m.name}</h4>
                      <p className="text-[var(--muted-foreground)] mt-0.5">{m.purpose}</p>
                    </div>
                    <Badge size="sm" variant="success">● Active</Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--muted)]/60 space-y-1">
                    <p className="font-semibold text-[var(--foreground)]">Dosage: {m.dosage}</p>
                    <p className="text-[11px] text-[var(--muted-foreground)]">Schedule: {m.frequency}</p>
                  </div>

                  <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
                    <span>Prescribed: {m.prescribedBy}</span>
                    <span>Started: {m.startDate}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Past Medications */}
        {pastMeds.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-[var(--border)]">
            <h3 className="text-base font-bold text-[var(--muted-foreground)]">
              Past / Completed Treatments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-85">
              {pastMeds.map((m) => (
                <Card key={m.id}>
                  <CardContent className="p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[var(--foreground)]">{m.name}</h4>
                      <Badge size="sm" variant="outline">Completed</Badge>
                    </div>
                    <p className="text-[11px] text-[var(--muted-foreground)]">{m.purpose}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">
                      Course: {m.startDate} {m.endDate ? `to ${m.endDate}` : ""} • {m.prescribedBy}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--card)] border border-[var(--border)] w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <h3 className="text-base font-bold text-[var(--foreground)]">Add Medication</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMed} className="space-y-4 pt-4 text-xs">
                <Input
                  label="Medicine Name *"
                  placeholder="e.g. Amoxicillin, Omega-3, NexGard"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <Input
                  label="Purpose / Condition"
                  placeholder="e.g. Skin itchiness, post-op recovery"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Dosage"
                    placeholder="e.g. 1 tablet, 5ml"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                      Frequency
                    </label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="w-full h-11 rounded-xl border border-[var(--input)] bg-[var(--card)] px-3 text-xs text-[var(--foreground)]"
                    >
                      <option value="Once Daily">Once Daily</option>
                      <option value="Twice Daily">Twice Daily</option>
                      <option value="Thrice Daily">Thrice Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="As Needed">As Needed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Start Date *"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />

                  <Input
                    label="Prescribed By"
                    value={prescribedBy}
                    onChange={(e) => setPrescribedBy(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="md">
                    Add Medication
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
