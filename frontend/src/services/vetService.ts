import { apiClient } from "./apiClient";
import { VetFacility, EmergencyEvent } from "@/types/ai";

export const MOCK_NEARBY_VETS: VetFacility[] = [
  {
    id: "vet-01",
    name: "Happy Paws 24/7 Veterinary Hospital & ICU",
    type: "EMERGENCY",
    address: "42 Healthcare Ave, Sector 14, Metro City",
    distanceKm: 1.2,
    rating: 4.9,
    reviewsCount: 312,
    isOpenNow: true,
    is24x7Emergency: true,
    phone: "+91 98765 11223",
    lat: 28.6139,
    lng: 77.209,
  },
  {
    id: "vet-02",
    name: "Apex Animal Specialty Surgical Clinic",
    type: "HOSPITAL",
    address: "109 Ring Road, Near Central Park",
    distanceKm: 2.8,
    rating: 4.7,
    reviewsCount: 184,
    isOpenNow: true,
    is24x7Emergency: true,
    phone: "+91 98111 22334",
    lat: 28.62,
    lng: 77.215,
  },
  {
    id: "vet-03",
    name: "All-Pets Community Wellness Clinic",
    type: "CLINIC",
    address: "5 Greenview Lane, Block C",
    distanceKm: 3.5,
    rating: 4.6,
    reviewsCount: 96,
    isOpenNow: true,
    is24x7Emergency: false,
    phone: "+91 98222 33445",
    lat: 28.605,
    lng: 77.22,
  },
  {
    id: "vet-04",
    name: "Emergency Pet Trauma & Poison Center",
    type: "EMERGENCY",
    address: "Emergency Wing 2, Metro Animal Campus",
    distanceKm: 4.1,
    rating: 4.9,
    reviewsCount: 520,
    isOpenNow: true,
    is24x7Emergency: true,
    phone: "+91 99999 00000",
    lat: 28.63,
    lng: 77.225,
  },
];

class VetService {
  async getNearbyVets(options: {
    lat?: number;
    lng?: number;
    radius?: number;
    type?: string;
  } = {}): Promise<VetFacility[]> {
    try {
      return await apiClient.get<VetFacility[]>("/vets/nearby", {
        params: {
          lat: options.lat,
          lng: options.lng,
          radius: options.radius,
          type: options.type !== "ALL" ? options.type : undefined,
        },
      });
    } catch {
      if (options.type && options.type !== "ALL") {
        return MOCK_NEARBY_VETS.filter((v) => v.type === options.type);
      }
      return MOCK_NEARBY_VETS;
    }
  }

  async createEmergency(input: {
    petId: string;
    description?: string;
    lat?: number;
    lng?: number;
  }): Promise<EmergencyEvent> {
    const newEvent: EmergencyEvent = {
      id: `emg-${Date.now()}`,
      petId: input.petId,
      petName: input.petId === "pet-luna" ? "Luna" : "Bruno",
      description: input.description || "Acute emergency triggered by user.",
      status: "OPEN",
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      location: {
        lat: input.lat || 28.6139,
        lng: input.lng || 77.209,
        address: "Current Geolocation",
      },
      assignedFacility: MOCK_NEARBY_VETS[0],
    };

    try {
      return await apiClient.post<EmergencyEvent>("/emergency", input);
    } catch {
      return newEvent;
    }
  }

  async getEmergencyById(id: string): Promise<EmergencyEvent | null> {
    try {
      return await apiClient.get<EmergencyEvent>(`/emergency/${id}`);
    } catch {
      return {
        id,
        petId: "pet-bruno",
        petName: "Bruno",
        description: "Severe respiratory distress / choking symptom report.",
        status: "OPEN",
        createdAt: "Just now",
        location: {
          lat: 28.6139,
          lng: 77.209,
          address: "Current Geolocation",
        },
        assignedFacility: MOCK_NEARBY_VETS[0],
      };
    }
  }

  async updateEmergencyStatus(id: string, status: "OPEN" | "RESOLVED" | "IN_CARE"): Promise<void> {
    try {
      await apiClient.patch(`/emergency/${id}`, { status });
    } catch {
      // ignore
    }
  }
}

export const vetService = new VetService();
