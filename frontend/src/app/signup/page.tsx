"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PawPrint, Mail, Lock, User as UserIcon, HeartHandshake, Stethoscope } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { authService } from "@/services/authService";
import { UserRole } from "@/types";

const signupSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Please confirm your password" }),
    role: z.enum(["PET_OWNER", "VET"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"PET_OWNER" | "VET">("PET_OWNER");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "PET_OWNER",
    },
  });

  const handleRoleSelect = (role: "PET_OWNER" | "VET") => {
    setSelectedRole(role);
    setValue("role", role);
  };

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      await authService.signup({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role as UserRole,
      });
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--background)]">
      {/* Top Mobile Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2">
          <PawPrint className="w-5 h-5 text-[var(--primary)]" />
          <span className="font-bold text-sm">AnimalSetu</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Left Column: Brand Benefits */}
      <div className="hidden md:flex flex-col justify-between w-1/2 bg-gradient-to-br from-[var(--secondary)]/10 via-[var(--primary)]/10 to-[var(--background)] p-12 border-r border-[var(--border)]">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <PawPrint className="w-6 h-6 fill-white" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-[var(--foreground)]">
                Animal<span className="text-[var(--primary)]">Setu</span>
              </span>
              <span className="block text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold">
                Join the Ecosystem
              </span>
            </div>
          </Link>

          <div className="mt-16 max-w-md space-y-6">
            <h2 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight leading-snug">
              Start giving your pet the care they truly deserve.
            </h2>

            <div className="space-y-4 text-sm text-[var(--muted-foreground)]">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <strong className="text-[var(--foreground)] block">Digital Health Passport</strong>
                  Track vaccinations, medications and vet consults in one cloud profile.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--secondary)]/20 text-[var(--secondary)] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <strong className="text-[var(--foreground)] block">AI Pet Wellness Guide</strong>
                  Personalized diet and exercise plans formulated for your breed.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--accent)]/25 text-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <strong className="text-[var(--foreground)] block">Lost Pet QR Protection</strong>
                  Instant scannable collars so your pet is always protected.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-[var(--muted-foreground)]">
          Free forever for pet owners • Verified clinic profiles
        </div>
      </div>

      {/* Right Column: Signup Form */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 max-w-xl mx-auto w-full">
        <div className="hidden md:flex justify-end">
          <ThemeToggle />
        </div>

        <div className="my-auto py-4">
          <div className="mb-6 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Create Your Free Account
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Join thousands of pet parents and veterinarians on AnimalSetu.
            </p>
          </div>

          {/* Role Picker */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
              I am joining as a
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect("PET_OWNER")}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  selectedRole === "PET_OWNER"
                    ? "border-[var(--primary)] bg-[var(--primary)]/10 ring-2 ring-[var(--primary)]/20"
                    : "border-[var(--border)] hover:bg-[var(--muted)]"
                }`}
              >
                <div className={`p-2 rounded-xl ${selectedRole === "PET_OWNER" ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--foreground)]">Pet Owner</p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">Manage pets & health</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect("VET")}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  selectedRole === "VET"
                    ? "border-[var(--secondary)] bg-[var(--secondary)]/10 ring-2 ring-[var(--secondary)]/20"
                    : "border-[var(--border)] hover:bg-[var(--muted)]"
                }`}
              >
                <div className={`p-2 rounded-xl ${selectedRole === "VET" ? "bg-[var(--secondary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--foreground)]">Veterinarian</p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">Clinical consultations</p>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Vivek Sharma"
              leftIcon={<UserIcon className="w-4 h-4 text-[var(--muted-foreground)]" />}
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4 text-[var(--muted-foreground)]" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4 text-[var(--muted-foreground)]" />}
                error={errors.password?.message}
                {...register("password")}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4 text-[var(--muted-foreground)]" />}
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          {/* Switch to Login */}
          <p className="text-center text-xs text-[var(--muted-foreground)] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--primary)] font-semibold hover:underline">
              Sign in instead
            </Link>
          </p>
        </div>

        <div className="text-center text-[11px] text-[var(--muted-foreground)]">
          By signing up, you agree to AnimalSetu terms of service and pet data privacy.
        </div>
      </div>
    </div>
  );
}
