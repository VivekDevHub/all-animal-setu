import Link from "next/link";
import {
  PawPrint,
  HeartPulse,
  Sparkles,
  MapPin,
  Users,
  ShieldCheck,
  CreditCard,
  QrCode,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Activity,
  FileText,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col selection:bg-[var(--primary)]/20 selection:text-[var(--primary)]">
      {/* Public Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
              <PawPrint className="w-6 h-6 fill-white" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-[var(--foreground)]">
                Animal<span className="text-[var(--primary)]">Setu</span>
              </span>
              <span className="block text-[10px] text-[var(--muted-foreground)] font-semibold tracking-wider uppercase">
                Pet Health & Safety
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--muted-foreground)]">
            <a href="#features" className="hover:text-[var(--foreground)] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[var(--foreground)] transition-colors">
              How It Works
            </a>
            <a href="#trust" className="hover:text-[var(--foreground)] transition-colors">
              Safety & Trust
            </a>
            <Link href="/emergency" className="text-[var(--danger)] font-semibold flex items-center gap-1.5 hover:opacity-80">
              <AlertTriangle className="w-4 h-4" />
              Emergency Vet
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="md">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="md" className="hidden sm:inline-flex">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[var(--primary)]/15 to-[var(--secondary)]/15 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <Badge variant="default" size="md" className="gap-2 px-3 py-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Next-Gen Pet-Care Ecosystem</span>
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--foreground)] leading-[1.12]">
                Everything Your Pet Needs.{" "}
                <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                  In One Place.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-2xl leading-relaxed">
                Manage your pet’s health, find certified veterinary care, get instant AI-powered guidance,
                maintain digital health passports, and stay connected with a community that genuinely cares.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Explore Demo Dashboard
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-[var(--border)] flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[var(--muted-foreground)] font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                  <span>Digital Health Passport</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                  <span>24/7 AI Guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                  <span>Verified Vet Clinics</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual: Premium Pet Health Passport Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl backdrop-blur-xl">
                {/* Header of Pet Card */}
                <div className="flex items-center justify-between pb-5 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[var(--primary)]/30 shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400"
                        alt="Bruno the Golden Retriever"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-[var(--foreground)]">Bruno</h3>
                        <Badge size="sm" variant="success">Healthy</Badge>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)]">Golden Retriever • 3 Years • 24 kg</p>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                    <QrCode className="w-5 h-5" />
                  </div>
                </div>

                {/* Passport Vitals Grid */}
                <div className="grid grid-cols-3 gap-3 py-4 text-center">
                  <div className="p-2.5 rounded-xl bg-[var(--muted)]/60">
                    <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)]">Blood Group</span>
                    <p className="text-sm font-bold text-[var(--foreground)] mt-0.5">DEA 1.1</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--muted)]/60">
                    <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)]">Microchip</span>
                    <p className="text-sm font-bold text-[var(--foreground)] mt-0.5">#98514-X</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--muted)]/60">
                    <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)]">Last Checkup</span>
                    <p className="text-sm font-bold text-[var(--foreground)] mt-0.5">Aug 2026</p>
                  </div>
                </div>

                {/* Upcoming Vaccine Reminder Alert */}
                <div className="p-3.5 rounded-2xl bg-[var(--warning)]/10 border border-[var(--warning)]/20 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--warning)]/20 text-[var(--warning)] flex items-center justify-center">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--foreground)]">Rabies Booster Due</h4>
                      <p className="text-[11px] text-[var(--muted-foreground)]">Due in 5 days at Happy Paws</p>
                    </div>
                  </div>
                  <Badge size="sm" variant="warning">Upcoming</Badge>
                </div>

                {/* AI Assistant Quick Pill */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 border border-[var(--primary)]/20 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                    <span className="text-xs font-medium text-[var(--foreground)]">
                      Ask AI: Diet & Exercise Analysis
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[var(--primary)] hover:underline cursor-pointer">
                    Ask Now →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Proof Points Section */}
      <section id="trust" className="py-12 border-y border-[var(--border)] bg-[var(--card)]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-extrabold text-[var(--primary)]">15,000+</p>
              <p className="text-xs font-medium text-[var(--muted-foreground)] mt-1 uppercase tracking-wider">
                Pets Protected
              </p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[var(--secondary)]">850+</p>
              <p className="text-xs font-medium text-[var(--muted-foreground)] mt-1 uppercase tracking-wider">
                Verified Vet Clinics
              </p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[var(--accent)]">99.8%</p>
              <p className="text-xs font-medium text-[var(--muted-foreground)] mt-1 uppercase tracking-wider">
                QR Tag Safety Rate
              </p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[var(--foreground)]">24 / 7</p>
              <p className="text-xs font-medium text-[var(--muted-foreground)] mt-1 uppercase tracking-wider">
                Emergency & AI Support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge variant="secondary" size="md">Complete Ecosystem</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
              Designed for Complete Pet Wellness & Safety
            </h2>
            <p className="text-base text-[var(--muted-foreground)]">
              From routine vaccine tracking to emergency hospital locator and intelligent nutrition planning,
              everything is built specifically for loving pet parents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Healthcare */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-7 transition-all hover:border-[var(--primary)]/50 hover:shadow-lg group">
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">🩺 Pet Healthcare</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                Centralized digital health records, automatic vaccination schedules, prescription tracking, and lab report storage.
              </p>
            </div>

            {/* Feature 2: AI Pet Assistant */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-7 transition-all hover:border-[var(--accent)]/50 hover:shadow-lg group">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">🤖 AI Pet Assistant</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                Instant breed-specific nutrition plans, behavioral insights, exercise routines, and symptom context prior to vet visits.
              </p>
            </div>

            {/* Feature 3: Find Nearby Vets */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-7 transition-all hover:border-[var(--secondary)]/50 hover:shadow-lg group">
              <div className="w-12 h-12 rounded-2xl bg-[var(--secondary)]/10 text-[var(--secondary)] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">📍 Find Nearby Vets</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                Locate verified veterinary clinics, book appointments, check consultation fees, and access 24/7 emergency care immediately.
              </p>
            </div>

            {/* Feature 4: Pet Community */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-7 transition-all hover:border-[var(--primary)]/50 hover:shadow-lg group">
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">🐕 Pet Community</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                Connect with local pet owners, exchange training tips, discover adoption shelters, and share joyful pet reels.
              </p>
            </div>

            {/* Feature 5: Pet Safety & QR */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-7 transition-all hover:border-[var(--danger)]/50 hover:shadow-lg group">
              <div className="w-12 h-12 rounded-2xl bg-[var(--danger)]/10 text-[var(--danger)] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">🛡️ Pet Safety & Lost QR</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                Generate smart digital QR collar tags. If your pet wanders, any finder can scan to see emergency contacts and critical medical alerts.
              </p>
            </div>

            {/* Feature 6: Pet Insurance */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-7 transition-all hover:border-[var(--secondary)]/50 hover:shadow-lg group">
              <div className="w-12 h-12 rounded-2xl bg-[var(--secondary)]/10 text-[var(--secondary)] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">💳 Pet Insurance Comparison</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                Compare coverage policies for surgery, accidents, and routine preventive checkups with total transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[var(--muted)]/30 border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-extrabold text-[var(--foreground)]">How AnimalSetu Works</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              A simple 5-step journey to keep your pet joyful, vaccinated, and secure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {[
              { step: "01", title: "Create Pet Profile", desc: "Add species, breed, age & photo." },
              { step: "02", title: "Build Health Passport", desc: "Log vaccines, allergies & records." },
              { step: "03", title: "Get AI Guidance", desc: "Receive customized diet & exercise." },
              { step: "04", title: "Find Certified Vets", desc: "Book in-clinic or video consults." },
              { step: "05", title: "Protect With QR", desc: "Download safety tag for lost pet safety." },
            ].map((s, idx) => (
              <div
                key={s.step}
                className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] relative"
              >
                <span className="text-2xl font-extrabold text-[var(--primary)]/40 font-mono">
                  {s.step}
                </span>
                <h4 className="text-sm font-bold text-[var(--foreground)] mt-2 mb-1">{s.title}</h4>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Warning Banner Section */}
      <section className="py-10 bg-gradient-to-r from-red-600/10 via-rose-500/10 to-orange-500/10 border-b border-red-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-[var(--danger)] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--foreground)]">Have an Urgent Pet Emergency?</h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Access immediate emergency vet contacts and 24-hour critical care clinics near your location.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/emergency">
              <Button variant="danger" size="md" className="gap-2">
                <PhoneCall className="w-4 h-4" />
                Emergency Hotline & Clinics
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Badge variant="default" size="md">Join AnimalSetu Today</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-tight">
            Your Pet Deserves Better Care.
          </h2>
          <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-xl mx-auto">
            Give your furry companion the protection, proactive healthcare, and love they deserve with our digital ecosystem.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup">
              <Button variant="primary" size="lg" className="shadow-lg">
                Start with AnimalSetu — Free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Sign In to Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[var(--border)] bg-[var(--card)] py-12 text-xs text-[var(--muted-foreground)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <PawPrint className="w-4 h-4 text-[var(--primary)]" />
            <span className="font-bold text-[var(--foreground)]">AnimalSetu</span>
            <span>— One Digital Ecosystem for Pet Health, Safety & Care.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-[var(--foreground)]">Dashboard</Link>
            <Link href="/vets" className="hover:text-[var(--foreground)]">Find Vets</Link>
            <Link href="/emergency" className="text-[var(--danger)] hover:underline">Emergency</Link>
            <Link href="/login" className="hover:text-[var(--foreground)]">Sign In</Link>
          </div>

          <div>
            <span>© {new Date().getFullYear()} AnimalSetu. Built for pet health & safety.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
