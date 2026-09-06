"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { vetService } from "@/services/vetService";
import { VetFacility } from "@/types/ai";
import {
  MapPin,
  Search,
  Phone,
  Navigation,
  Star,
  Clock,
  ShieldAlert,
  Building,
} from "lucide-react";

export default function VetsDirectoryPage() {
  const { success, error: toastError } = useToast();
  const [vets, setVets] = useState<VetFacility[]>([]);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasLocation, setHasLocation] = useState(false);

  const loadVets = useCallback(async (typeFilter?: string) => {
    setIsLoading(true);
    try {
      const data = await vetService.getNearbyVets({ type: typeFilter || selectedType });
      setVets(data);
    } catch {
      toastError("Could not load clinics");
    } finally {
      setIsLoading(false);
    }
  }, [selectedType, toastError]);

  useEffect(() => {
    loadVets();
  }, [loadVets]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      toastError("Geolocation not supported by browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (_pos) => {
        setHasLocation(true);
        success("Location calibrated", `Found clinics within 5km radius.`);
        loadVets();
      },
      () => {
        toastError("Location permission denied", "Showing all metropolitan clinics by default.");
      }
    );
  };

  const filteredVets = vets.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
                Find Veterinary Clinics & Hospitals
              </h1>
              <Badge size="sm" variant="default">Verified Directory</Badge>
            </div>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
              Locate licensed veterinary practices, specialty surgery hospitals, and 24/7 emergency centers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={requestLocation}
              className="gap-2 text-xs"
            >
              <Navigation className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>{hasLocation ? "Location Synced" : "Use Current Location"}</span>
            </Button>
            <Link href="/emergency">
              <Button variant="danger" size="md" className="gap-1.5 shadow-sm">
                <ShieldAlert className="w-4 h-4" />
                <span>24/7 Emergency</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-[var(--card)] p-3 rounded-2xl border border-[var(--border)] shadow-xs">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clinic name, hospital, address, or street..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--background)]/60 text-sm text-[var(--foreground)] pl-10 pr-4 py-2 rounded-xl border border-[var(--input)] focus:outline-none focus:border-[var(--primary)] transition-colors placeholder:text-[var(--muted-foreground)]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {["ALL", "CLINIC", "HOSPITAL", "EMERGENCY"].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  loadVets(type);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedType === type
                    ? "bg-[var(--primary)] text-white shadow-xs"
                    : "bg-[var(--muted)]/60 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {type === "ALL" ? "All Facilities" : type}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Simulated Map Banner */}
        <div className="h-44 sm:h-56 rounded-3xl overflow-hidden border border-[var(--border)] bg-gradient-to-br from-[var(--muted)] to-[var(--card)] relative p-6 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between z-10">
            <div className="p-2 rounded-xl bg-black/60 text-white text-xs backdrop-blur-md flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[var(--primary)]" />
              <span>Map View • Showing {filteredVets.length} Facilities Nearby</span>
            </div>
            <Badge size="sm" variant="success">GPS Active</Badge>
          </div>

          {/* Graphical Map Simulation Pins */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="flex items-center gap-4 z-10">
            <div className="flex items-center gap-1.5 text-xs text-[var(--foreground)] font-semibold">
              <span className="w-3 h-3 rounded-full bg-[var(--danger)]" /> Emergency Hospital
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--foreground)] font-semibold">
              <span className="w-3 h-3 rounded-full bg-[var(--primary)]" /> General Clinic
            </div>
          </div>
        </div>

        {/* Directory Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            <div className="h-40 bg-[var(--muted)] rounded-2xl" />
            <div className="h-40 bg-[var(--muted)] rounded-2xl" />
          </div>
        ) : filteredVets.length === 0 ? (
          <EmptyState
            icon={Building}
            title="No facilities found"
            description="Try adjusting your search criteria or clear your facility filters."
            actionLabel="Reset Search"
            onAction={() => {
              setSearchQuery("");
              setSelectedType("ALL");
              loadVets("ALL");
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredVets.map((v) => (
              <Card
                key={v.id}
                className={`hover:border-[var(--primary)]/50 hover:shadow-md transition-all ${
                  v.type === "EMERGENCY" ? "border-red-500/20" : ""
                }`}
              >
                <CardContent className="p-6 space-y-4 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[var(--foreground)]">{v.name}</h3>
                      </div>
                      <p className="text-[var(--muted-foreground)] mt-0.5">{v.address}</p>
                    </div>
                    <Badge size="sm" variant={v.type === "EMERGENCY" ? "danger" : "secondary"}>
                      {v.type}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-[var(--muted-foreground)] font-medium">
                    <span className="flex items-center gap-1 text-[var(--accent)] font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {v.rating} ({v.reviewsCount} reviews)
                    </span>
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5 text-[var(--primary)]" />
                      {v.distanceKm} km away
                    </span>
                    <span className="flex items-center gap-1 text-[var(--success)] font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      {v.isOpenNow ? "Open Now" : "Closed"}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-3">
                    {v.phone && (
                      <a href={`tel:${v.phone}`}>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                          <Phone className="w-3.5 h-3.5 text-[var(--primary)]" />
                          <span>{v.phone}</span>
                        </Button>
                      </a>
                    )}
                    <a
                      href={`https://maps.google.com/?q=${v.lat},${v.lng}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="primary" size="sm" className="gap-1.5 shadow-xs">
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Get Directions</span>
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
