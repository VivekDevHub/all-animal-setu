import { Pet } from "@/types";
import { apiClient } from "./apiClient";
import { INITIAL_PETS } from "@/data/pets";

export interface CreatePetInput {
  name: string;
  species: "Dog" | "Cat" | "Bird" | "Rabbit" | "Other";
  breed: string;
  gender: "Male" | "Female";
  dateOfBirth: string;
  weightKg: number;
  photoUrl?: string;
  allergies?: string[];
  medicalConditions?: string[];
  bloodGroup?: string;
  microchipId?: string;
  emergencyContact?: string;
  notes?: string;
}

export interface UpdatePetInput extends Partial<CreatePetInput> {
  healthStatus?: "Healthy" | "Attention Needed" | "Vaccination Due" | "Recovering";
}

const STORAGE_KEY = "animalsetu_local_pets";

class PetService {
  private getLocalPets(): Pet[] {
    if (typeof window === "undefined") return INITIAL_PETS;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PETS));
      return INITIAL_PETS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_PETS;
    }
  }

  private setLocalPets(pets: Pet[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
    }
  }

  async getPets(): Promise<Pet[]> {
    try {
      // Connect to real backend: GET /api/v1/pets
      const res = await apiClient.get<{ success: boolean; data: Pet[] } | Pet[]>("/pets");
      if (Array.isArray(res)) return res;
      if (res && typeof res === "object" && "data" in res && Array.isArray(res.data)) {
        return res.data;
      }
      return this.getLocalPets();
    } catch {
      // Graceful fallback for offline / development
      return this.getLocalPets();
    }
  }

  async getPetById(id: string): Promise<Pet | null> {
    try {
      // GET /api/v1/pets/:petId
      const res = await apiClient.get<{ success: boolean; data: Pet } | Pet>(`/pets/${id}`);
      if (res && "id" in res) return res;
      if (res && typeof res === "object" && "data" in res && res.data) {
        return res.data;
      }
      const local = this.getLocalPets();
      return local.find((p) => p.id === id) || null;
    } catch {
      const local = this.getLocalPets();
      return local.find((p) => p.id === id) || null;
    }
  }

  async createPet(input: CreatePetInput): Promise<Pet> {
    const ageYears = Math.max(
      0,
      new Date().getFullYear() - new Date(input.dateOfBirth).getFullYear()
    );

    const newPet: Pet = {
      id: `pet-${Date.now()}`,
      ownerId: "user-vivek-001",
      name: input.name,
      species: input.species,
      breed: input.breed,
      gender: input.gender,
      dateOfBirth: input.dateOfBirth,
      ageYears: ageYears || 1,
      weightKg: Number(input.weightKg),
      photoUrl:
        input.photoUrl ||
        (input.species === "Dog"
          ? "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600"
          : "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600"),
      healthStatus: "Healthy",
      allergies: input.allergies || [],
      medicalConditions: input.medicalConditions || [],
      bloodGroup: input.bloodGroup || "Unknown",
      microchipId: input.microchipId || "",
      emergencyContact: input.emergencyContact || "",
      notes: input.notes || "",
      lastVetVisit: new Date().toISOString().split("T")[0],
    };

    try {
      // POST /api/v1/pets
      const res = await apiClient.post<{ success: boolean; data: Pet } | Pet>("/pets", newPet);
      const savedPet = "id" in res ? res : res.data;
      const all = [savedPet, ...this.getLocalPets()];
      this.setLocalPets(all);
      return savedPet;
    } catch {
      // Save locally if backend is unreachable
      const all = [newPet, ...this.getLocalPets()];
      this.setLocalPets(all);
      return newPet;
    }
  }

  async updatePet(id: string, input: UpdatePetInput): Promise<Pet> {
    try {
      // PATCH /api/v1/pets/:petId
      const res = await apiClient.patch<{ success: boolean; data: Pet } | Pet>(`/pets/${id}`, input);
      const updated = "id" in res ? res : res.data;
      const all = this.getLocalPets().map((p) => (p.id === id ? { ...p, ...updated } : p));
      this.setLocalPets(all);
      return updated;
    } catch {
      const all = this.getLocalPets().map((p) => (p.id === id ? { ...p, ...input } : p));
      this.setLocalPets(all);
      const found = all.find((p) => p.id === id);
      if (!found) throw new Error("Pet not found");
      return found;
    }
  }

  async deletePet(id: string): Promise<void> {
    try {
      // DELETE /api/v1/pets/:petId
      await apiClient.delete(`/pets/${id}`);
    } catch {
      // Fallback
    }
    const filtered = this.getLocalPets().filter((p) => p.id !== id);
    this.setLocalPets(filtered);
  }
}

export const petService = new PetService();
