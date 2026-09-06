import { VaccinationRecord, MedicalRecord, Reminder } from "@/types";

export interface HealthPassportData {
  petId: string;
  petName: string;
  species: string;
  breed: string;
  gender: string;
  dateOfBirth: string;
  ageYears: number;
  weightKg: number;
  bloodGroup: string;
  microchipId: string;
  allergies: string[];
  medicalConditions: string[];
  vaccinations: VaccinationRecord[];
  activeMedications: {
    id: string;
    medicineName: string;
    dosageText: string;
    frequency: string;
    prescribedBy: string;
    status: "Active" | "Completed";
  }[];
  primaryVet: {
    name: string;
    clinic: string;
    phone: string;
  };
  emergencyContact: string;
  lastUpdated: string;
}

export const INITIAL_VACCINATIONS: VaccinationRecord[] = [
  {
    id: "vac-001",
    petId: "pet-bruno",
    vaccineName: "Rabies Booster",
    dateAdministered: "2025-08-10",
    dueDate: "2026-08-10",
    status: "Completed",
    batchNumber: "RB-88912-IN",
    administeredBy: "Dr. Ananya Verma (Happy Paws)",
  },
  {
    id: "vac-002",
    petId: "pet-bruno",
    vaccineName: "DHPP (Distemper, Hepatitis, Parvo, Parainfluenza)",
    dateAdministered: "2025-09-15",
    dueDate: "2026-09-15",
    status: "Completed",
    batchNumber: "DHPP-4410",
    administeredBy: "Dr. Ananya Verma (Happy Paws)",
  },
  {
    id: "vac-003",
    petId: "pet-bruno",
    vaccineName: "Bordetella (Kennel Cough)",
    dateAdministered: "2026-02-12",
    dueDate: "2026-09-12",
    status: "Upcoming",
    batchNumber: "BD-0021-X",
    administeredBy: "Dr. Sharma",
  },
  {
    id: "vac-004",
    petId: "pet-luna",
    vaccineName: "FVRCP (Feline Viral Rhinotracheitis)",
    dateAdministered: "2025-05-18",
    dueDate: "2026-05-18",
    status: "Overdue",
    batchNumber: "FV-990-CAT",
    administeredBy: "City Vet Care",
  },
];

export const INITIAL_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: "rec-001",
    petId: "pet-bruno",
    title: "Annual Wellness Consultation & Blood Panel",
    type: "Lab Report",
    date: "2026-08-12",
    veterinarian: "Dr. Ananya Verma",
    clinicName: "Happy Paws Veterinary Clinic",
    fileUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600",
    summary: "Complete Blood Count (CBC) and liver enzymes normal. Mild ear wax buildup treated with Otic drops.",
    aiExtractedData: {
      WBC: "8.2 x10^3/uL (Normal)",
      RBC: "6.9 x10^6/uL (Normal)",
      Hemoglobin: "16.1 g/dL",
      Platelets: "290 x10^3/uL",
      Diagnosis: "Healthy canine with mild seasonal dermatitis",
    },
  },
  {
    id: "rec-002",
    petId: "pet-bruno",
    title: "Post-Swim Ear Examination & Antibacterial Prescription",
    type: "Prescription",
    date: "2026-07-20",
    veterinarian: "Dr. Rajesh Sharma",
    clinicName: "All-Pets Care Centre",
    summary: "Ear cleaning prescribed for 5 days following lake swim. No infection detected.",
  },
  {
    id: "rec-003",
    petId: "pet-bruno",
    title: "Canine Orthopedic Hip Evaluation",
    type: "Consultation",
    date: "2026-04-10",
    veterinarian: "Dr. Ananya Verma",
    clinicName: "Happy Paws Veterinary Clinic",
    summary: "Joint mobility in optimal range. Weight is well managed at 24.5 kg.",
  },
];

export const INITIAL_REMINDERS: Reminder[] = [
  {
    id: "rem-001",
    petId: "pet-bruno",
    petName: "Bruno",
    title: "Rabies Booster Vaccine",
    category: "Vaccination",
    dateTime: "2026-09-12 10:30 AM",
    completed: false,
  },
  {
    id: "rem-002",
    petId: "pet-luna",
    petName: "Luna",
    title: "Eye Cleansing Drops",
    category: "Medicine",
    dosage: "2 drops in right eye",
    dateTime: "Today, 8:00 PM",
    completed: false,
  },
  {
    id: "rem-003",
    petId: "pet-bruno",
    petName: "Bruno",
    title: "Flea & Tick Prevention Chewable",
    category: "Medicine",
    dosage: "1 chewable tablet (NexGard)",
    dateTime: "Tomorrow, 9:00 AM",
    completed: false,
  },
  {
    id: "rem-004",
    petId: "pet-bruno",
    petName: "Bruno",
    title: "Follow-up Checkup with Dr. Verma",
    category: "Appointment",
    dateTime: "2026-09-15 11:00 AM",
    completed: false,
  },
];
