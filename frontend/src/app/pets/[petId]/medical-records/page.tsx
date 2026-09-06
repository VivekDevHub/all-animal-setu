"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { healthService } from "@/services/healthService";
import { petService } from "@/services/petService";
import { MedicalRecord, Pet } from "@/types";
import {
  ArrowLeft,
  FileText,
  Plus,
  Search,
  Calendar,
  Sparkles,
  Upload,
  CheckCircle2,
  FileCheck,
  X,
} from "lucide-react";

export default function MedicalRecordsPage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const resolvedParams = use(params);
  const petId = resolvedParams.petId;

  const { success, error: toastError } = useToast();
  const [pet, setPet] = useState<Pet | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New Record Form State
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<MedicalRecord["type"]>("Prescription");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newVet, setNewVet] = useState("Dr. Ananya Verma");
  const [newClinic, setNewClinic] = useState("Happy Paws Veterinary Clinic");
  const [newSummary, setNewSummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [petData, recordsData] = await Promise.all([
        petService.getPetById(petId),
        healthService.getMedicalRecords(petId),
      ]);
      setPet(petData);
      setRecords(recordsData);
    } finally {
      setIsLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toastError("Title is required");
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await healthService.addMedicalRecord(petId, {
        petId,
        title: newTitle,
        type: newType,
        date: newDate,
        veterinarian: newVet,
        clinicName: newClinic,
        summary: newSummary || undefined,
      });
      setRecords([created, ...records]);
      setShowUploadModal(false);
      setNewTitle("");
      setNewSummary("");
      success("Medical record saved", "Record added to pet's digital health timeline.");
    } catch {
      toastError("Could not save record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.veterinarian.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.clinicName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "ALL" || r.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href={`/pets/${petId}`}>
              <Button variant="ghost" size="sm" className="gap-1.5 text-[var(--muted-foreground)]">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to {pet?.name || "Pet"}</span>
              </Button>
            </Link>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setShowUploadModal(true)}
            className="gap-2 shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Medical Record</span>
          </Button>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Medical Records & History
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
            Complete timeline of prescriptions, laboratory diagnostics, and clinical consultations.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-[var(--card)] p-3 rounded-2xl border border-[var(--border)] shadow-xs">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search records, diagnoses, veterinarians..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--background)]/60 text-sm text-[var(--foreground)] pl-10 pr-4 py-2 rounded-xl border border-[var(--input)] focus:outline-none focus:border-[var(--primary)] transition-colors placeholder:text-[var(--muted-foreground)]"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full sm:w-auto bg-[var(--background)]/60 text-xs font-semibold text-[var(--foreground)] px-3 py-2 rounded-xl border border-[var(--input)] focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="ALL">All Record Types</option>
            <option value="Prescription">Prescriptions</option>
            <option value="Lab Report">Lab Reports</option>
            <option value="Consultation">Consultations</option>
            <option value="Vaccination">Vaccinations</option>
            <option value="X-Ray">X-Rays</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Medical Records Timeline */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-28 bg-[var(--muted)] rounded-2xl" />
            <div className="h-28 bg-[var(--muted)] rounded-2xl" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No medical records found"
            description="Start building your pet's healthcare history by uploading or logging your first medical consultation."
            actionLabel="+ Add First Medical Record"
            onAction={() => setShowUploadModal(true)}
          />
        ) : (
          <div className="relative pl-6 sm:pl-8 border-l-2 border-[var(--border)] space-y-6">
            {filteredRecords.map((record) => (
              <div key={record.id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-6 w-4 h-4 rounded-full bg-[var(--card)] border-4 border-[var(--primary)] group-hover:scale-125 transition-transform" />

                <Card className="hover:border-[var(--primary)]/40 hover:shadow-md transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <Badge
                          size="sm"
                          variant={
                            record.type === "Lab Report"
                              ? "secondary"
                              : record.type === "Prescription"
                              ? "warning"
                              : "default"
                          }
                        >
                          {record.type}
                        </Badge>
                        <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {record.date}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                        {record.clinicName}
                      </span>
                    </div>
                    <CardTitle className="text-base sm:text-lg mt-1 font-bold">
                      {record.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <p className="text-[var(--foreground)] leading-relaxed">
                      {record.summary || "Routine clinical review and vitals check."}
                    </p>

                    {/* AI Extracted Vitals Pill if available */}
                    {record.aiExtractedData && (
                      <div className="p-3 rounded-xl bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 border border-[var(--primary)]/20 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[var(--primary)] font-bold text-[11px]">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Extracted Key Biomarkers</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          {Object.entries(record.aiExtractedData).map(([key, val]) => (
                            <div key={key} className="bg-[var(--card)]/80 p-1.5 rounded-lg border border-[var(--border)]">
                              <span className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] block">{key}</span>
                              <span className="font-semibold text-[11px] text-[var(--foreground)] truncate block">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
                      <span>Attending: <strong>{record.veterinarian}</strong></span>
                      {record.fileUrl && (
                        <a
                          href={record.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--primary)] font-semibold hover:underline flex items-center gap-1"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          View Attachment
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Add Record Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--card)] border border-[var(--border)] w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                <div>
                  <h3 className="text-lg font-bold text-[var(--foreground)]">Add Medical Record</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">Log a consultation, lab test or prescription</p>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRecord} className="space-y-4 pt-4">
                <Input
                  label="Record Title *"
                  placeholder="e.g. Annual Blood Panel & Health Exam"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                      Record Type *
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as MedicalRecord["type"])}
                      className="w-full h-11 rounded-xl border border-[var(--input)] bg-[var(--card)] px-3 text-xs text-[var(--foreground)]"
                    >
                      <option value="Prescription">Prescription</option>
                      <option value="Lab Report">Lab Report</option>
                      <option value="Consultation">Consultation</option>
                      <option value="Vaccination">Vaccination</option>
                      <option value="X-Ray">X-Ray</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <Input
                    label="Date *"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Doctor / Veterinarian"
                    value={newVet}
                    onChange={(e) => setNewVet(e.target.value)}
                  />

                  <Input
                    label="Clinic / Hospital"
                    value={newClinic}
                    onChange={(e) => setNewClinic(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Summary & Diagnosis Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Findings, prescriptions or notes provided by your vet..."
                    value={newSummary}
                    onChange={(e) => setNewSummary(e.target.value)}
                    className="w-full rounded-xl border border-[var(--input)] bg-[var(--card)] p-3 text-xs text-[var(--foreground)]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                    Save Record
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
