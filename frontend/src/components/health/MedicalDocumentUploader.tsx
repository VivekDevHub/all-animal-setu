"use client";

import React, { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Sparkles, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export interface ExtractedOcrData {
  petName: string;
  documentType: string;
  vaccineOrTest: string;
  dateAdministered: string;
  nextDueDate: string;
  veterinarian: string;
  clinicName: string;
  batchNumber: string;
  keyFindings: string;
}

interface MedicalDocumentUploaderProps {
  onConfirmedSave: (data: ExtractedOcrData) => void;
  onCancel?: () => void;
}

export function MedicalDocumentUploader({
  onConfirmedSave,
  onCancel,
}: MedicalDocumentUploaderProps) {
  const { success, error: toastError } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<ExtractedOcrData | null>(null);

  const handleFile = (selected: File) => {
    if (!selected.type.startsWith("image/") && selected.type !== "application/pdf") {
      toastError("Unsupported format", "Please select a JPG, PNG or PDF document.");
      return;
    }
    setFile(selected);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(selected);

    // Trigger simulated AI OCR extraction pipeline
    simulateOcr(selected);
  };

  const simulateOcr = (selectedFile: File) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setOcrResult({
        petName: "Bruno",
        documentType: "Vaccination Certificate",
        vaccineOrTest: "Rabies Booster (Rabisin-R)",
        dateAdministered: "2026-08-10",
        nextDueDate: "2027-08-10",
        veterinarian: "Dr. Ananya Verma, BVSc",
        clinicName: "Happy Paws Veterinary Clinic",
        batchNumber: "RB-2026-IN441",
        keyFindings: "Vaccine administered sub-Q right shoulder. Normal temperature (101.4 F). No immediate adverse reactions noted.",
      });
      success("Document analyzed", "AI extracted key clinical details. Review below before saving.");
    }, 1800);
  };

  const handleConfirm = () => {
    if (!ocrResult) return;
    onConfirmedSave(ocrResult);
    success("Verified & saved!", "Document and structured data added to medical records.");
  };

  return (
    <div className="space-y-6">
      {!file ? (
        /* Upload Area */
        <div className="border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)]/50 rounded-3xl p-8 sm:p-12 text-center bg-[var(--card)]/50 transition-all">
          <input
            type="file"
            id="doc-upload"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <label htmlFor="doc-upload" className="cursor-pointer block space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--foreground)]">
                Upload Medical Document or Vaccination Card
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-sm mx-auto leading-relaxed">
                AnimalSetu AI reads prescriptions, test panels, and vaccination cards to automatically fill dates and reminders.
              </p>
            </div>
            <span className="inline-block px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold shadow-xs">
              Choose Document or Photo
            </span>
          </label>
        </div>
      ) : isProcessing ? (
        /* OCR Processing Animation */
        <Card className="p-8 sm:p-12 text-center space-y-4 border-[var(--primary)]/30">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--primary)]/20 border-t-[var(--primary)] animate-spin" />
            <Sparkles className="w-6 h-6 text-[var(--accent)]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)]">
              AI Analyzing Medical Document...
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-xs mx-auto">
              Reading veterinarian stamps, vaccine lot numbers, dates, and dosage schedules.
            </p>
          </div>
          <Badge size="sm" variant="default" className="animate-pulse">
            Draft Processing • Not Saved Yet
          </Badge>
        </Card>
      ) : ocrResult ? (
        /* WOW MOMENT: OCR Review & Confirmation Screen */
        <div className="space-y-6 animate-in fade-in zoom-in-95">
          <div className="p-4 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[var(--primary)] font-semibold">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" />
              <span>AI Extracted Details — Please review and edit before confirming</span>
            </div>
            <Badge size="sm" variant="warning">Draft Mode</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Document Preview */}
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] block">
                Original Document
              </span>
              <div className="h-80 rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--muted)] flex items-center justify-center relative group">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Uploaded document" className="w-full h-full object-contain" />
                ) : (
                  <FileText className="w-16 h-16 text-[var(--muted-foreground)]" />
                )}
                <div className="absolute bottom-3 left-3 right-3 p-2 rounded-xl bg-black/60 text-white text-[11px] backdrop-blur-xs flex items-center justify-between">
                  <span className="truncate">{file.name}</span>
                  <button
                    onClick={() => {
                      setFile(null);
                      setOcrResult(null);
                    }}
                    className="text-red-300 hover:text-red-100 font-bold ml-2"
                  >
                    Discard
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Editable Extracted Fields */}
            <div className="lg:col-span-7 space-y-4 bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] block">
                Extracted Clinical Fields (Editable)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Pet Name"
                  value={ocrResult.petName}
                  onChange={(e) => setOcrResult({ ...ocrResult, petName: e.target.value })}
                />
                <Input
                  label="Document Type"
                  value={ocrResult.documentType}
                  onChange={(e) => setOcrResult({ ...ocrResult, documentType: e.target.value })}
                />
              </div>

              <Input
                label="Vaccine / Procedure / Test Name"
                value={ocrResult.vaccineOrTest}
                onChange={(e) => setOcrResult({ ...ocrResult, vaccineOrTest: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Date Administered"
                  type="date"
                  value={ocrResult.dateAdministered}
                  onChange={(e) => setOcrResult({ ...ocrResult, dateAdministered: e.target.value })}
                />
                <Input
                  label="Next Due Date"
                  type="date"
                  value={ocrResult.nextDueDate}
                  onChange={(e) => setOcrResult({ ...ocrResult, nextDueDate: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Veterinarian"
                  value={ocrResult.veterinarian}
                  onChange={(e) => setOcrResult({ ...ocrResult, veterinarian: e.target.value })}
                />
                <Input
                  label="Clinic / Hospital"
                  value={ocrResult.clinicName}
                  onChange={(e) => setOcrResult({ ...ocrResult, clinicName: e.target.value })}
                />
              </div>

              <Input
                label="Batch / Lot #"
                value={ocrResult.batchNumber}
                onChange={(e) => setOcrResult({ ...ocrResult, batchNumber: e.target.value })}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Clinical Notes / Findings
                </label>
                <textarea
                  rows={2}
                  value={ocrResult.keyFindings}
                  onChange={(e) => setOcrResult({ ...ocrResult, keyFindings: e.target.value })}
                  className="w-full rounded-xl border border-[var(--input)] bg-[var(--card)] p-2.5 text-xs text-[var(--foreground)]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setFile(null);
                    setOcrResult(null);
                    onCancel?.();
                  }}
                >
                  Discard
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleConfirm}
                  className="gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Save to Records</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
