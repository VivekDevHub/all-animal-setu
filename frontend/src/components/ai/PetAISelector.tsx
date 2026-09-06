"use client";

import { Pet } from "@/types";

interface PetAISelectorProps {
  pets: Pet[];
  selectedPetId: string;
  onSelectPet: (pet: Pet) => void;
  label?: string;
}

export function PetAISelector({
  pets,
  selectedPetId,
  onSelectPet,
  label = "Active Pet Profile",
}: PetAISelectorProps) {
  if (pets.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
          {label}
        </span>
        <span className="text-[11px] text-[var(--primary)] font-medium">
          Context synced with AI
        </span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {pets.map((pet) => {
          const isSelected = pet.id === selectedPetId;
          return (
            <button
              key={pet.id}
              type="button"
              onClick={() => onSelectPet(pet)}
              className={`flex items-center gap-3 p-2.5 pr-4 rounded-2xl border transition-all cursor-pointer shrink-0 text-left ${
                isSelected
                  ? "bg-[var(--primary)]/10 border-[var(--primary)] ring-2 ring-[var(--primary)]/20 shadow-xs"
                  : "bg-[var(--card)] border-[var(--border)] hover:bg-[var(--muted)]"
              }`}
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--muted)] shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pet.photoUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200"}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[var(--foreground)] leading-tight">{pet.name}</h4>
                <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                  {pet.species} • {pet.breed}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
