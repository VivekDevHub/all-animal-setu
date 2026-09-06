"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { PetCard } from "@/components/pet/PetCard";
import { EmptyState } from "@/components/ui/empty-state";
import { petService } from "@/services/petService";
import { Pet } from "@/types";
import { PawPrint, Plus, LayoutGrid, List, Search, Filter, AlertCircle } from "lucide-react";

export default function PetsPage() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const loadPets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await petService.getPets();
      setPets(data);
    } catch {
      setError("Failed to load your pets. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function fetchPets() {
      try {
        const data = await petService.getPets();
        if (!ignore) {
          setPets(data);
          setIsLoading(false);
        }
      } catch {
        if (!ignore) {
          setError("Failed to load your pets. Please try again.");
          setIsLoading(false);
        }
      }
    }
    fetchPets();
    return () => {
      ignore = true;
    };
  }, []);

  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecies = speciesFilter === "ALL" || pet.species === speciesFilter;
    return matchesSearch && matchesSpecies;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              My Pets
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
              Manage your pets, health records, and day-to-day care information.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-[var(--muted)] p-1 rounded-xl border border-[var(--border)]">
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                aria-label="List view"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Link href="/pets/add">
              <Button variant="primary" size="md" className="gap-1.5 shadow-sm">
                <Plus className="w-4 h-4" />
                <span>Add New Pet</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-[var(--card)] p-3 rounded-2xl border border-[var(--border)] shadow-xs">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search pets by name or breed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--background)]/60 text-sm text-[var(--foreground)] pl-10 pr-4 py-2 rounded-xl border border-[var(--input)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors placeholder:text-[var(--muted-foreground)]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-[var(--muted-foreground)] hidden sm:block ml-1" />
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="w-full sm:w-auto bg-[var(--background)]/60 text-xs font-semibold text-[var(--foreground)] px-3 py-2 rounded-xl border border-[var(--input)] focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="ALL">All Species</option>
              <option value="Dog">Dogs</option>
              <option value="Cat">Cats</option>
              <option value="Bird">Birds</option>
              <option value="Rabbit">Rabbits</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Main Content: Loading / Error / Empty / Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-72 rounded-2xl border border-[var(--border)] bg-[var(--card)] animate-pulse p-6 space-y-4"
              >
                <div className="w-full h-32 bg-[var(--muted)] rounded-xl" />
                <div className="h-4 bg-[var(--muted)] rounded w-2/3" />
                <div className="h-3 bg-[var(--muted)] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger)]/5 text-[var(--danger)]">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={loadPets} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : filteredPets.length === 0 ? (
          <EmptyState
            icon={PawPrint}
            title={searchQuery || speciesFilter !== "ALL" ? "No matching pets found" : "No pets added yet"}
            description={
              searchQuery || speciesFilter !== "ALL"
                ? "Try adjusting your search query or species filter."
                : "Create your first pet profile to start managing their digital health journey with AnimalSetu."
            }
            actionLabel={searchQuery || speciesFilter !== "ALL" ? "Reset Filters" : "Add Your First Pet"}
            onAction={
              searchQuery || speciesFilter !== "ALL"
                ? () => {
                    setSearchQuery("");
                    setSpeciesFilter("ALL");
                  }
                : () => {
                    router.push("/pets/add");
                  }
            }
          />
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
