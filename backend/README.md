# AnimalSetu Backend

Production-ready Firebase backend for **AnimalSetu** — a digital ecosystem for pet health, safety, and care.

> **Phase 1 complete:** Backend foundation (auth middleware, RBAC, validation, logging, Firebase config, security rules skeleton).

## Architecture

```
backend/
├── firebase.json          # Firebase project configuration
├── firestore.rules        # Firestore security rules
├── firestore.indexes.json # Firestore indexes
├── storage.rules          # Storage security rules
├── .env.example           # Environment variable template
└── functions/
    └── src/
        ├── config/        # Env, Firebase Admin, constants
        ├── middleware/    # Auth, roles, validation, rate limit, errors
        ├── shared/        # Errors, logger, responses, types, utils
        ├── routes/        # API route definitions
        └── index.ts       # Cloud Functions entry point
```

## Tech Stack

- Node.js 20 + TypeScript (strict)
- Firebase Cloud Functions v2
- Firebase Admin SDK (Auth, Firestore, Storage)
- Express + CORS
- Zod validation
- Vitest testing

## Prerequisites

1. [Node.js 20+](https://nodejs.org/)
2. [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`
3. A Firebase project with Authentication, Firestore, Storage enabled

## Setup

### 1. Install dependencies

```bash
cd backend
npm run install:all
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in Firebase Admin credentials (from Firebase Console → Project Settings → Service Accounts → Generate new private key):

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
STORAGE_BUCKET=your-project-id.appspot.com
```

Alternatively, set `GOOGLE_APPLICATION_CREDENTIALS` to a service account JSON file path.

### 3. Link Firebase project

Edit `.firebaserc` and replace `your-firebase-project-id` with your project ID.

### 4. Build

```bash
npm run build
```

### 5. Run emulators (local development)

```bash
npm run serve
```

Emulator UI: http://localhost:4000  
Functions base URL: http://localhost:5001/{project-id}/asia-south1/api

## API Endpoints (Phase 1)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | Service info |
| GET | `/api/v1/health` | No | Health check |
| GET | `/api/v1/health/protected` | Yes | Authenticated health check |
| GET | `/api/v1/health/admin` | Yes (ADMIN) | Admin-only health check |

### Authentication

All protected endpoints require:

```
Authorization: Bearer <firebase-id-token>
```

The backend verifies tokens via Firebase Admin SDK and loads the user profile from Firestore (`users/{uid}`).

### Response Format

**Success:**
```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired Firebase ID token"
  }
}
```

## Security Decisions (Phase 1)

| Decision | Rationale |
|----------|-----------|
| Firestore/Storage rules deny all client access | Sensitive operations go through Cloud Functions with Admin SDK |
| Roles never accepted from client | New users default to `PET_OWNER`; admin/vet assigned server-side |
| Zod validation on all inputs | Never trust `req.body`, `req.query`, or `req.params` |
| Structured JSON logging | Observability without logging tokens, passwords, or medical data |
| CORS restricted to configured origins | No wildcard `*` in production |
| Rate limiting middleware ready | AI/auth/upload limiters configured via env vars |
| Request ID on every request | Traceability via `X-Request-Id` header |

## User Roles

| Role | Phase 1 Support |
|------|-----------------|
| `PET_OWNER` | Default for new users |
| `VET` | Middleware ready |
| `ADMIN` | Middleware ready |
| `CLINIC_ADMIN` | Reserved for future phases |

## Testing

```bash
cd backend
npm test
```

Tests cover: env validation, error handling, API responses, Zod validation, RBAC middleware, rate limiting.

## Deployment

```bash
firebase login
firebase deploy --only functions,firestore,storage
```

Set production secrets via [Firebase Secret Manager](https://firebase.google.com/docs/functions/config-env) or Cloud Functions environment config.

## Known Limitations (Phase 1)

- No business module routes yet (users, pets, health, etc.)
- Firestore/Storage rules deny all direct client access (intentional until Phase 2+)
- Rate limiting uses in-memory store (suitable for single-instance; use Redis/Firestore for multi-instance in production)
- No CI/CD pipeline yet (planned Phase 12)
- Demo/seed data not yet created

## Next Phase

**Phase 2 — User + Pet:** User profiles, role protection, pet CRUD, ownership security, Firestore/Storage rules for owners, User A/B isolation tests.

---

© AnimalSetu — One Digital Ecosystem for Your Pet's Health, Safety & Care.
