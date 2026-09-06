"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PawPrint, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const forgotSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setIsLoading(true);
    setTimeout(() => {
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[var(--background)] p-4 sm:p-8">
      <div className="flex items-center justify-between max-w-xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white">
            <PawPrint className="w-5 h-5 fill-white" />
          </div>
          <span className="font-bold text-base tracking-tight text-[var(--foreground)]">
            Animal<span className="text-[var(--primary)]">Setu</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-10 shadow-lg">
          {!isSubmitted ? (
            <>
              <div className="mb-6 space-y-2 text-center sm:text-left">
                <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
                  Reset Password
                </h1>
                <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
                  Enter your email and we’ll send you instructions to recover your AnimalSetu account.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail className="w-4 h-4 text-[var(--muted-foreground)]" />}
                  error={errors.email?.message}
                  {...register("email")}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 rounded-2xl bg-[var(--success)]/15 text-[var(--success)] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">Check Your Email</h2>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                We sent a password reset instruction link to{" "}
                <span className="font-semibold text-[var(--foreground)]">{submittedEmail}</span>.
                (Demo environment mock).
              </p>
              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => setIsSubmitted(false)}
              >
                Send to another email
              </Button>
            </div>
          )}

          <div className="pt-6 mt-6 border-t border-[var(--border)] text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-[var(--muted-foreground)]">
        © {new Date().getFullYear()} AnimalSetu. Protected Pet Healthcare Infrastructure.
      </div>
    </div>
  );
}
