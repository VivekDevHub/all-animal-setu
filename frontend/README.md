# 🐾 AnimalSetu

> **One Digital Ecosystem for Your Pet's Health, Safety & Care.**

AnimalSetu is an all-in-one digital platform for pet owners, veterinary clinics, and animal welfare. It combines digital health records, AI-driven wellness guidance, veterinary discovery, lost pet QR protection, and community sharing into a single modern platform.

> ⚠️ **Note**: This frontend prototype currently uses clean mock services (`src/services/`) and realistic demo data so UI components can be wired and evaluated immediately before connecting to Firebase/Cloud APIs.

---

## 🌟 Key Features

- **Digital Health Passport**: Track pet allergies, vitals, microchip ID, and vaccination records.
- **AI Pet Assistant**: Guidance for symptoms, personalized diet planning, and breed insights.
- **Find a Vet & Emergency Care**: Directory of clinics with emergency availability and booking flows.
- **Lost Pet QR Tag**: Scannable digital collar profile for instant pet recovery.
- **Pet Community & Reels**: Connect with fellow pet parents, share moments, and adopt.
- **Insurance Comparison**: Compare sample pet insurance policies transparently.
- **Role-Aware Views**: Dynamic navigation tailored for Pet Owners, Veterinarians, and Admins.

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with CSS Variables & Design Tokens
- **Theme**: `next-themes` (Dark Mode & Light Mode support)
- **Icons**: Lucide React
- **Forms & Validation**: React Hook Form + Zod
- **Architecture**: Service Abstraction Layer (`src/services/`) & Reusable UI components

---

## 🚀 Local Setup & Development

### 1. Prerequisites
- Node.js 18+ or 20+
- npm

### 2. Installation
```bash
npm install
```

### 3. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build
```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```text
src/
├── app/
│   ├── layout.tsx             # Root layout with ThemeProvider & fonts
│   ├── globals.css            # Design tokens & color system
│   ├── page.tsx               # Public high-conversion landing page
│   ├── login/page.tsx         # Split-screen login with Google mock
│   ├── signup/page.tsx        # Signup with Pet Owner / Vet role toggle
│   ├── forgot-password/       # Password recovery flow
│   └── dashboard/             # Core dashboard shell
├── components/
│   ├── ui/                    # Reusable Button, Card, Input, Badge, Avatar, Tabs, etc.
│   ├── layout/                # Sidebar, Header (Search & Notifications), MobileNav, AppLayout
│   └── theme-provider.tsx     # Light/Dark mode provider
├── services/                  # Clean service interfaces (authService, etc.)
├── types/                     # Strict TypeScript interfaces
└── lib/                       # Utility functions (cn)
```

---

## 🧪 Demo Credentials

For quick testing during hackathon review:
- **Email**: `vivek@animalsetu.dev`
- **Password**: `password123` (or any string >= 6 characters)
- Or click **Continue with Google** on the `/login` page.
