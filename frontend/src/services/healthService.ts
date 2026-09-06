import { VaccinationRecord, MedicalRecord, Reminder } from "@/types";
import { apiClient } from "./apiClient";
import { INITIAL_VACCINATIONS, INITIAL_MEDICAL_RECORDS, INITIAL_REMINDERS, HealthPassportData } from "@/data/healthRecords";

class HealthService {
  async getHealthPassport(petId: string): Promise<HealthPassportData | null> {
    try {
      const res = await apiClient.get<HealthPassportData>(`/pets/${petId}/health-passport`);
      return res;
    } catch {
      // Fallback
      return {
        petId,
        petName: "Bruno",
        species: "Dog",
        breed: "Golden Retriever",
        gender: "Male",
        dateOfBirth: "2022-04-15",
        ageYears: 4,
        weightKg: 24.5,
        bloodGroup: "DEA 1.1",
        microchipId: "985-141-008-921",
        allergies: ["Chicken byproduct", "Pollen"],
        medicalConditions: ["Mild seasonal dermatitis"],
        vaccinations: INITIAL_VACCINATIONS.filter((v) => v.petId === petId),
        activeMedications: [
          {
            id: "med-01",
            medicineName: "Omega 3 & 6 Fatty Acid Supplement",
            dosageText: "1 pump with morning meal",
            frequency: "Daily",
            prescribedBy: "Dr. Ananya Verma",
            status: "Active",
          },
        ],
        primaryVet: {
          name: "Dr. Ananya Verma",
          clinic: "Happy Paws Veterinary Clinic",
          phone: "+91 98765 11223",
        },
        emergencyContact: "+91 98765 43210 (Vivek)",
        lastUpdated: "September 6, 2026",
      };
    }
  }

  async getVaccinations(petId: string): Promise<VaccinationRecord[]> {
    try {
      const res = await apiClient.get<VaccinationRecord[]>(`/pets/${petId}/vaccinations`);
      return Array.isArray(res) ? res : INITIAL_VACCINATIONS.filter((v) => v.petId === petId);
    } catch {
      return INITIAL_VACCINATIONS.filter((v) => v.petId === petId);
    }
  }

  async addVaccination(petId: string, data: Omit<VaccinationRecord, "id">): Promise<VaccinationRecord> {
    const newRecord: VaccinationRecord = {
      ...data,
      id: `vac-${Date.now()}`,
      petId,
    };
    try {
      return await apiClient.post<VaccinationRecord>(`/pets/${petId}/vaccinations`, newRecord);
    } catch {
      return newRecord;
    }
  }

  async getMedicalRecords(petId: string): Promise<MedicalRecord[]> {
    try {
      const res = await apiClient.get<MedicalRecord[]>(`/pets/${petId}/medical-records`);
      return Array.isArray(res) ? res : INITIAL_MEDICAL_RECORDS.filter((r) => r.petId === petId);
    } catch {
      return INITIAL_MEDICAL_RECORDS.filter((r) => r.petId === petId);
    }
  }

  async addMedicalRecord(petId: string, data: Omit<MedicalRecord, "id">): Promise<MedicalRecord> {
    const newRecord: MedicalRecord = {
      ...data,
      id: `rec-${Date.now()}`,
      petId,
    };
    try {
      return await apiClient.post<MedicalRecord>(`/pets/${petId}/medical-records`, newRecord);
    } catch {
      return newRecord;
    }
  }

  async getReminders(petId?: string): Promise<Reminder[]> {
    try {
      const res = await apiClient.get<Reminder[]>("/reminders");
      const list = Array.isArray(res) ? res : INITIAL_REMINDERS;
      return petId ? list.filter((r) => r.petId === petId) : list;
    } catch {
      return petId ? INITIAL_REMINDERS.filter((r) => r.petId === petId) : INITIAL_REMINDERS;
    }
  }

  async toggleReminder(reminderId: string, completed: boolean): Promise<Reminder> {
    try {
      return await apiClient.patch<Reminder>(`/reminders/${reminderId}`, { completed });
    } catch {
      const found = INITIAL_REMINDERS.find((r) => r.id === reminderId);
      if (found) found.completed = completed;
      return found || { id: reminderId, petId: "", petName: "", title: "", category: "Medicine", dateTime: "", completed };
    }
  }
}

export const healthService = new HealthService();
