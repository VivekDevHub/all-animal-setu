"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ImageUploader } from "@/components/ui/image-uploader";
import { useToast } from "@/components/ui/toast";
import { petService } from "@/services/petService";
import { ArrowLeft, PawPrint, HeartPulse, ShieldCheck, Sparkles } from "lucide-react";

const addPetSchema = z.object({
  name: z.string().min(1, { message: "Pet name is required" }).max(50),
  species: z.enum(["Dog", "Cat", "Bird", "Rabbit", "Other"], {
    errorMap: () => ({ message: "Please select a species" }),
  }),
  breed: z.string().min(1, { message: "Breed is required" }),
  gender: z.enum(["Male", "Female"], {
    errorMap: () => ({ message: "Please select gender" }),
  }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
  weightKg: z.coerce.number().positive({ message: "Weight must be greater than 0" }),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  microchipId: z.string().optional(),
  emergencyContact: z.string().optional(),
  notes: z.string().optional(),
});

type AddPetFormValues = z.infer<typeof addPetSchema>;

export default function AddPetPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedSpecies, setSelectedSpecies] = useState<"Dog" | "Cat" | "Bird" | "Rabbit" | "Other">("Dog");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddPetFormValues>({
    resolver: zodResolver(addPetSchema),
    defaultValues: {
      species: "Dog",
      gender: "Male",
      dateOfBirth: new Date().toISOString().split("T")[0],
      weightKg: 10,
    },
  });

  const onSubmit = async (data: AddPetFormValues) => {
    setIsSubmitting(true);
    try {
      const allergiesList = data.allergies
        ? data.allergies.split(",").map((a) => a.trim()).filter(Boolean)
        : [];
      const conditionsList = data.medicalConditions
        ? data.medicalConditions.split(",").map((c) => c.trim()).filter(Boolean)
        : [];

      const newPet = await petService.createPet({
        name: data.name,
        species: data.species,
        breed: data.breed,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        weightKg: data.weightKg,
        photoUrl: photoUrl || undefined,
        allergies: allergiesList,
        medicalConditions: conditionsList,
        bloodGroup: data.bloodGroup || undefined,
        microchipId: data.microchipId || undefined,
        emergencyContact: data.emergencyContact || undefined,
        notes: data.notes || undefined,
      });

      success("Pet profile created!", `${newPet.name} has been added to AnimalSetu.`);
      router.push(`/pets/${newPet.id}`);
    } catch {
      toastError("Unable to create pet", "Please verify your input and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Breadcrumb & Title */}
        <div className="flex items-center gap-3">
          <Link href="/pets">
            <Button variant="ghost" size="sm" className="gap-1.5 text-[var(--muted-foreground)]">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My Pets</span>
            </Button>
          </Link>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Add a New Pet
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
            Build your pet’s digital health passport, record medical history, and set up reminders.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-[var(--primary)] font-semibold text-sm">
                <PawPrint className="w-4 h-4" />
                <span>1. Basic Information</span>
              </div>
              <CardTitle className="text-lg">Pet Profile & Identity</CardTitle>
              <CardDescription>Essential details about your furry family member.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Pet Name *"
                  placeholder="e.g. Bruno"
                  error={errors.name?.message}
                  {...register("name")}
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Species *
                  </label>
                  <select
                    {...register("species")}
                    onChange={(e) => {
                      register("species").onChange(e);
                      setSelectedSpecies(e.target.value as "Dog" | "Cat" | "Bird" | "Rabbit" | "Other");
                    }}
                    className="w-full h-11 rounded-xl border border-[var(--input)] bg-[var(--card)] px-3.5 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                  >
                    <option value="Dog">Dog 🐶</option>
                    <option value="Cat">Cat 🐱</option>
                    <option value="Bird">Bird 🦜</option>
                    <option value="Rabbit">Rabbit 🐰</option>
                    <option value="Other">Other 🐾</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Breed *"
                  placeholder={selectedSpecies === "Dog" ? "e.g. Golden Retriever" : "e.g. Persian"}
                  error={errors.breed?.message}
                  {...register("breed")}
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Gender *
                  </label>
                  <select
                    {...register("gender")}
                    className="w-full h-11 rounded-xl border border-[var(--input)] bg-[var(--card)] px-3.5 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Date of Birth *"
                  type="date"
                  error={errors.dateOfBirth?.message}
                  {...register("dateOfBirth")}
                />

                <Input
                  label="Weight (kg) *"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 24.5"
                  error={errors.weightKg?.message}
                  {...register("weightKg")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Pet Photo */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-[var(--secondary)] font-semibold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>2. Pet Photo</span>
              </div>
              <CardTitle className="text-lg">Profile Avatar</CardTitle>
              <CardDescription>Upload a clear photo to personalize your pet’s health passport.</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader value={photoUrl} onChange={setPhotoUrl} label="Pet Portrait" />
            </CardContent>
          </Card>

          {/* Section 3: Health Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-[var(--danger)] font-semibold text-sm">
                <HeartPulse className="w-4 h-4" />
                <span>3. Health Information</span>
              </div>
              <CardTitle className="text-lg">Medical Passport Essentials</CardTitle>
              <CardDescription>Critical vitals for emergency clinics and vet checkups.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Blood Group"
                  placeholder="e.g. DEA 1.1 or Type A"
                  {...register("bloodGroup")}
                />

                <Input
                  label="Microchip Number"
                  placeholder="e.g. 985-141-008-921"
                  {...register("microchipId")}
                />
              </div>

              <Input
                label="Known Allergies (Comma separated)"
                placeholder="e.g. Chicken byproduct, Penicillin, Pollen"
                helperText="Leave empty if no known allergies."
                {...register("allergies")}
              />

              <Input
                label="Existing Medical Conditions (Comma separated)"
                placeholder="e.g. Seasonal dermatitis, Hip dysplasia"
                helperText="Chronic or past diagnosed conditions."
                {...register("medicalConditions")}
              />
            </CardContent>
          </Card>

          {/* Section 4: Emergency & Safety */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-[var(--accent)] font-semibold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>4. Emergency & Care Notes</span>
              </div>
              <CardTitle className="text-lg">Emergency Contact & QR Details</CardTitle>
              <CardDescription>Information printed on lost pet QR tags and emergency notices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Emergency Contact Phone"
                placeholder="e.g. +91 98765 43210 (Vivek)"
                {...register("emergencyContact")}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Care Instructions & Temperament Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Very friendly with other dogs, scared of thunderstorms, loves raw carrots."
                  className="w-full rounded-xl border border-[var(--input)] bg-[var(--card)] p-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                  {...register("notes")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-[var(--border)]">
            <Link href="/pets">
              <Button type="button" variant="outline" size="lg">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="shadow-md"
            >
              Create Pet Profile
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
