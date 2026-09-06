"use client";

import React, { useState } from "react";
import { Upload, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUploader({ value, onChange, label = "Pet Photo" }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string>(value || "");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview("");
    onChange("");
  };

  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
        {label}
      </span>

      {preview ? (
        <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--muted)] group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              />
              <span className="px-3 py-1.5 rounded-xl bg-white/90 text-black text-xs font-semibold hover:bg-white shadow-sm flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                Change Photo
              </span>
            </label>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleRemove}
              className="gap-1 shadow-sm"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
            isDragging
              ? "border-[var(--primary)] bg-[var(--primary)]/10"
              : "border-[var(--border)] hover:border-[var(--primary)]/50 bg-[var(--card)]/50"
          }`}
        >
          <label className="flex flex-col items-center justify-center cursor-pointer w-full">
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            />
            <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[var(--foreground)] text-center">
              Click to upload <span className="text-[var(--muted-foreground)] font-normal">or drag and drop</span>
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              JPG, PNG or WEBP (Max 5MB)
            </p>
          </label>
        </div>
      )}
    </div>
  );
}
