export type UserRole = "PET_OWNER" | "VET" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
}

export type PetGender = "Male" | "Female";

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: "Dog" | "Cat" | "Bird" | "Rabbit" | "Other";
  breed: string;
  gender: PetGender;
  dateOfBirth: string;
  ageYears: number;
  weightKg: number;
  photoUrl?: string;
  healthStatus: "Healthy" | "Attention Needed" | "Vaccination Due" | "Recovering";
  allergies: string[];
  medicalConditions: string[];
  bloodGroup?: string;
  microchipId?: string;
  emergencyContact?: string;
  notes?: string;
  lastVetVisit?: string;
}

export interface VaccinationRecord {
  id: string;
  petId: string;
  vaccineName: string;
  dateAdministered: string;
  dueDate: string;
  status: "Completed" | "Upcoming" | "Overdue";
  batchNumber?: string;
  administeredBy?: string;
}

export interface MedicalRecord {
  id: string;
  petId: string;
  title: string;
  type: "Prescription" | "Lab Report" | "Vaccination" | "Consultation" | "X-Ray" | "Other";
  date: string;
  veterinarian: string;
  clinicName: string;
  fileUrl?: string;
  summary?: string;
  aiExtractedData?: Record<string, string | number | boolean>;
}

export interface Reminder {
  id: string;
  petId: string;
  petName: string;
  title: string;
  category: "Medicine" | "Vaccination" | "Appointment" | "Follow-up" | "General Care";
  dateTime: string;
  dosage?: string;
  completed: boolean;
}

export interface VetClinic {
  id: string;
  name: string;
  doctorName: string;
  specialization: string;
  rating: number;
  reviewsCount: number;
  distanceKm: number;
  isOpenNow: boolean;
  hasEmergency: boolean;
  phone: string;
  address: string;
  consultationFee: number;
  imageUrl?: string;
}

export interface Appointment {
  id: string;
  petId: string;
  petName: string;
  vetClinicId: string;
  vetName: string;
  clinicName: string;
  dateTime: string;
  reason: string;
  status: "Confirmed" | "Pending" | "Completed" | "Cancelled";
  type: "In-Person" | "Video Consultation";
}

export interface InsurancePlan {
  id: string;
  name: string;
  provider: string;
  monthlyPrice: number;
  coverageAmount: number;
  accidentCover: boolean;
  illnessCover: boolean;
  dentalCover: boolean;
  features: string[];
  recommended?: boolean;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar?: string;
  petName: string;
  caption: string;
  mediaUrl: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  category: "For You" | "Following" | "Rescue" | "Training";
  createdAt: string;
}
