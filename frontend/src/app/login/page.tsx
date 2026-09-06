"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PawPrint, Mail, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { authService } from "@/services/authService";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "vivek@animalsetu.dev",
      password: "password123",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await authService.login(data);
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await authService.login({ email: "google-user@animalsetu.dev" });
      router.push("/dashboard");
    } finally {
      setIsGoogleLoading(false);
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

      {/* Left Column: Premium Healthcare + Pet Tech Banner */}
      <div className="hidden md:flex flex-col justify-between w-1/2 bg-gradient-to-br from-[var(--primary)]/10 via-[var(--secondary)]/10 to-[var(--background)] p-12 border-r border-[var(--border)] relative overflow-hidden">
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
                Healthcare & AI
              </span>
            </div>
          </Link>

          <div className="mt-20 max-w-md space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Pet Health Records</span>
            </div>
            <h2 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight leading-snug">
              Welcome back to your pet’s digital health home.
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Track upcoming vaccinations, access lab reports, consult with licensed vets, and keep your pets safe with smart QR protection.
            </p>
          </div>
        </div>

        {/* Testimonial / Trust card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-md p-5 max-w-md shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[var(--border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
                alt="Dr. Ananya"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--foreground)]">Dr. Ananya Verma, BVSc</p>
              <p className="text-[11px] text-[var(--muted-foreground)]">Happy Paws Veterinary Clinic</p>
            </div>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] italic leading-relaxed">
            “AnimalSetu streamlines medical history sharing between pet parents and clinical teams. It makes diagnosis faster and safer.”
          </p>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 max-w-xl mx-auto w-full">
        <div className="hidden md:flex justify-end">
          <ThemeToggle />
        </div>

        <div className="my-auto py-8">
          <div className="mb-8 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Sign In to AnimalSetu
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Enter your credentials or continue with Google to access your dashboard.
            </p>
          </div>

          {/* Quick Demo Hint */}
          <div className="mb-6 p-3 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-xs text-[var(--primary)] flex items-center justify-between">
            <span className="font-medium">💡 Demo credentials are prefilled for instant testing.</span>
            <span className="font-bold uppercase tracking-wider text-[10px]">Ready</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Password
                </span>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[var(--primary)] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register("password")}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--background)] px-3 text-[var(--muted-foreground)]">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Button */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full gap-2.5"
            onClick={handleGoogleLogin}
            isLoading={isGoogleLoading}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Switch to Signup */}
          <p className="text-center text-xs text-[var(--muted-foreground)] mt-8">
            Don’t have an AnimalSetu account?{" "}
            <Link href="/signup" className="text-[var(--primary)] font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        <div className="text-center text-[11px] text-[var(--muted-foreground)]">
          Protected by AnimalSetu Safety Protocols. Mock authentication environment.
        </div>
      </div>
    </div>
  );
}
