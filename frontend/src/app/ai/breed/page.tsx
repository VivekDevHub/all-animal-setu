"use client";

import { useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { aiService } from "@/services/aiService";
import { BreedIdentificationResult } from "@/types/ai";
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Shield,
  ArrowRight,
} from "lucide-react";

export default function BreedIdentifierPage() {
  const { success, error: toastError } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<BreedIdentificationResult | null>(null);

  const handleFileChange = (selected: File) => {
    if (!selected.type.startsWith("image/")) {
      toastError("Invalid format", "Please select a PNG, JPG or WEBP image.");
      return;
    }
    setFile(selected);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selected);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!preview) return;
    setIsAnalyzing(true);
    try {
      const res = await aiService.identifyBreed(preview);
      setResult(res);
      success("Breed identified!", `AI estimated: ${res.estimatedBreed} (${res.confidence}% match).`);
    } catch {
      toastError("Analysis failed", "Unable to analyze photo. Please try another image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 text-[var(--danger)] text-xs font-bold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Vision AI Diagnostics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            AI Pet Breed Identifier
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
            Upload a clear portrait of your dog, cat, or mixed breed to discover lineage, expected adult weights, and temperaments.
          </p>
        </div>

        {/* Upload Container */}
        {!preview ? (
          <div className="border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)]/50 rounded-3xl p-8 sm:p-14 text-center bg-[var(--card)]/50 transition-all">
            <input
              type="file"
              id="breed-upload"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            />
            <label htmlFor="breed-upload" className="cursor-pointer block space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[var(--danger)]/10 text-[var(--danger)] flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)]">
                  Choose Pet Portrait or Drag & Drop
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-sm mx-auto">
                  For optimal accuracy, ensure good lighting and that the face and ears are clearly visible.
                </p>
              </div>
              <span className="inline-block px-5 py-2.5 rounded-2xl bg-[var(--primary)] text-white text-xs font-semibold shadow-xs">
                Upload Photo
              </span>
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Image Preview Side */}
            <div className="md:col-span-5 space-y-3">
              <div className="relative h-72 rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--muted)] group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Pet photo" className="w-full h-full object-cover" />
                <button
                  onClick={handleReset}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 text-white hover:bg-black transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!result && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAnalyze}
                  isLoading={isAnalyzing}
                  className="w-full gap-2 shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                  <span>Analyze Breed Lineage</span>
                </Button>
              )}
            </div>

            {/* Analysis Output Side */}
            <div className="md:col-span-7">
              {isAnalyzing ? (
                <Card className="h-72 flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <Sparkles className="w-8 h-8 text-[var(--accent)] animate-spin" />
                  <h3 className="text-sm font-bold text-[var(--foreground)]">
                    Analyzing Skull Structure, Fur Pattern & Ear Set...
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Matching against 340+ canine & feline breed standards.
                  </p>
                </Card>
              ) : result ? (
                <div className="space-y-4 animate-in fade-in zoom-in-95">
                  <Card className="border-[var(--primary)]/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                          Primary Match
                        </span>
                        <Badge size="sm" variant="success">
                          {result.confidence}% Confidence
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl font-extrabold text-[var(--primary)] mt-1">
                        {result.estimatedBreed}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-xs">
                      <div>
                        <span className="font-bold text-[var(--foreground)] block mb-1">
                          Temperament & Behavior Profile:
                        </span>
                        <p className="text-[var(--muted-foreground)] leading-relaxed">{result.temperament}</p>
                      </div>

                      <div className="pt-2 border-t border-[var(--border)]">
                        <span className="font-bold text-[var(--foreground)] block mb-2">
                          Key Physical & Care Traits:
                        </span>
                        <div className="space-y-1.5 text-[var(--foreground)]">
                          {result.characteristics.map((c, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)] shrink-0" />
                              <span>{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[var(--border)]">
                        <span className="text-[11px] font-bold text-[var(--muted-foreground)] block mb-2">
                          Alternative Possibilities:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {result.alternativePossibilities.map((alt, i) => (
                            <Badge key={i} size="sm" variant="outline">
                              {alt.breed} ({alt.confidence}%)
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="p-3.5 rounded-2xl bg-[var(--muted)]/50 border border-[var(--border)] flex items-start gap-2.5 text-xs text-[var(--muted-foreground)]">
                    <Info className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
                    <p>{result.disclaimer}</p>
                  </div>
                </div>
              ) : (
                <Card className="h-72 flex flex-col items-center justify-center text-center p-6 text-xs text-[var(--muted-foreground)]">
                  <p>Photo loaded and ready for vision analysis. Click &quot;Analyze Breed Lineage&quot; to begin.</p>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
