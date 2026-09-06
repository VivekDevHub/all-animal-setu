# AnimalSetu API Reference

Complete list of backend API endpoints for AnimalSetu.

**Base URL (production):** `https://{region}-{project-id}.cloudfunctions.net/api`  
**Base URL (local emulator):** `http://localhost:5001/{project-id}/asia-south1/api`  
**API prefix:** `/api/v1`

---

## Legend

| Status | Meaning |
|--------|---------|
| ✅ Implemented | Available in the current codebase |
| 🔜 Planned | Defined in architecture; not yet built |

---

## Authentication

Protected endpoints require:

```http
Authorization: Bearer <firebase-id-token>
```

**Roles:** `PET_OWNER` (default) · `VET` · `ADMIN` · `CLINIC_ADMIN` (future)

---

## Standard Response Format

**Success**
```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

**Error**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

---

## Root

| Status | Method | Endpoint | Auth | Description |
|--------|--------|----------|------|-------------|
| ✅ | GET | `/` | No | Service info and API version |

---

## Health

| Status | Method | Endpoint | Auth | Description |
|--------|--------|----------|------|-------------|
| ✅ | GET | `/api/v1/health` | No | Public health check |
| ✅ | GET | `/api/v1/health/protected` | Yes | Verify token + load user profile |
| ✅ | GET | `/api/v1/health/admin` | Yes (ADMIN) | Verify admin role access |

---

## Users

| Status | Method | Endpoint | Auth | Description |
|--------|--------|----------|------|-------------|
| 🔜 | GET | `/api/v1/users/me` | Yes | Get current user profile |
| 🔜 | PATCH | `/api/v1/users/me` | Yes | Update profile (name, phone, language, timezone, photo) |
| 🔜 | DELETE | `/api/v1/users/me` | Yes | Request account deletion |

> Users cannot update `role`, `isActive`, or `isVerified` via profile APIs.

---

## Pets

| Status | Method | Endpoint | Auth | Description |
|--------|--------|----------|------|-------------|
| ✅ | POST | `/api/v1/pets` | Yes (PET_OWNER+) | Create a pet |
| ✅ | GET | `/api/v1/pets` | Yes | List current user's pets (paginated) |
| ✅ | GET | `/api/v1/pets/:petId` | Yes | Get pet by ID (ownership verified) |
| ✅ | PATCH | `/api/v1/pets/:petId` | Yes | Update pet (ownership verified) |
| ✅ | DELETE | `/api/v1/pets/:petId` | Yes | Soft-delete pet (`isActive: false`) |
| ✅ | POST | `/api/v1/pets/:petId/photo` | Yes | Upload pet profile photo (multipart `photo`) |

> `ownerId` is always set server-side from the authenticated user. Never accepted from the client.  
> Delete is a **soft delete** — sets `isActive: false` to preserve linked medical data.

### Create pet example

```http
POST /api/v1/pets
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Bruno",
  "species": "Dog",
  "breed": "Golden Retriever",
  "gender": "Male",
  "dateOfBirth": "2022-05-10",
  "weight": 24.5,
  "weightUnit": "kg",
  "allergies": [],
  "medicalConditions": []
}
```

### Upload photo example

```http
POST /api/v1/pets/:petId/photo
Authorization: Bearer <token>
Content-Type: multipart/form-data

photo: <file>  (JPEG, PNG, WEBP — max 5MB)
```

---

## Health Passport

| Status | Method | Endpoint | Auth | Description |
|--------|--------|----------|------|-------------|
| ✅ | GET | `/api/v1/pets/:petId/health-passport` | Yes | Get digital health passport |
| ✅ | PUT | `/api/v1/pets/:petId/health-passport` | Yes | Create/update health passport |

---

## Medical Records

| Status | Method | Endpoint | Auth | Description |
|--------|--------|----------|------|-------------|
| ✅ | POST | `/api/v1/pets/:petId/medical-records` | Yes | Create medical record |
| ✅ | GET | `/api/v1/pets/:petId/medical-records` | Yes | List records (paginated) |
| ✅ | GET | `/api/v1/pets/:petId/medical-records/:recordId` | Yes | Get single record |
| ✅ | PATCH | `/api/v1/pets/:petId/medical-records/:recordId` | Yes | Update record |
| ✅ | DELETE | `/api/v1/pets/:petId/medical-records/:recordId` | Yes | Delete record |

**Record types:** `CHECKUP` · `SURGERY` · `LAB_REPORT` · `PRESCRIPTION` · `VACCINATION` · `EMERGENCY` · `OTHER`

---

## Vaccinations

| Status | Method | Endpoint | Auth | Description |
|--------|--------|----------|------|-------------|
| ✅ | POST | `/api/v1/pets/:petId/vaccinations` | Yes | Add vaccination record |
| ✅ | GET | `/api/v1/pets/:petId/vaccinations` | Yes | List vaccinations (paginated) |
| ✅ | GET | `/api/v1/pets/:petId/vaccinations/:vaccinationId` | Yes | Get vaccination |
| ✅ | PATCH | `/api/v1/pets/:petId/vaccinations/:vaccinationId` | Yes | Update vaccination |
| ✅ | DELETE | `/api/v1/pets/:petId/vaccinations/:vaccinationId` | Yes | Delete vaccination |

> Auto-creates a reminder when `nextDueDate` is provided.

---

## Medications

| Status | Method | Endpoint | Auth | Description |
|--------|--------|----------|------|-------------|
| ✅ | POST | `/api/v1/pets/:petId/medications` | Yes | Add medication record |
| ✅ | GET | `/api/v1/pets/:petId/medications` | Yes | List medications (paginated) |
| ✅ | GET | `/api/v1/pets/:petId/medications/:medicationId` | Yes | Get medication |
| ✅ | PATCH | `/api/v1/pets/:petId/medications/:medicationId` | Yes | Update medication |
| ✅ | DELETE | `/api/v1/pets/:petId/medications/:medicationId` | Yes | Deactivate medication |

> AI does **not** prescribe medication. Records come from vet/user input only.

---

## Reminders

| Status | Method | Endpoint | Auth | Description |
|--------|--------|----------|------|-------------|
| ✅ | POST | `/api/v1/reminders` | Yes | Create custom reminder |
| ✅ | GET | `/api/v1/reminders` | Yes | List user reminders (paginated, optional `petId`) |
| ✅ | GET | `/api/v1/reminders/:reminderId` | Yes | Get reminder |
| ✅ | PATCH | `/api/v1/reminders/:reminderId` | Yes | Update reminder |
| ✅ | DELETE | `/api/v1/reminders/:reminderId` | Yes | Cancel reminder (`status: CANCELLED`) |

**Reminder types:** `VACCINATION` · `MEDICATION` · `APPOINTMENT` · `HEALTH_CHECK` · `CUSTOM`

---

## Documents & OCR

| Status | Method | Endpoint | Auth | Description |
|--------|--------|----------|------|-------------|
| ✅ | POST | `/api/v1/documents/upload` | Yes | Upload medical document (multipart `file`) |
| ✅ | GET | `/api/v1/documents/:documentId` | Yes | Get document metadata |
| ✅ | POST | `/api/v1/documents/:documentId/ocr` | Yes | Trigger OCR extraction |
| ✅ | POST | `/api/v1/documents/:documentId/confirm` | Yes | Confirm OCR draft (optional save as vaccination) |

> OCR output is **DRAFT** until confirmed. Set `runOcr=true` on upload for async processing.

---

## AI

| Status | Method | Endpoint | Auth | Rate limit | Description |
|--------|--------|----------|------|------------|-------------|
| 🔜 | POST | `/api/v1/ai/health-assistant` | Yes | 10/min | AI health guidance (not a diagnosis) |
| 🔜 | POST | `/api/v1/ai/diet-plan` | Yes | 10/min | AI diet plan based on pet profile |
| 🔜 | POST | `/api/v1/ai/exercise-plan` | Yes | 10/min | AI exercise plan based on pet profile |
| 🔜 | POST | `/api/v1/ai/breed-identify` | Yes | 10/min | Breed identification from image |

**AI urgency levels:** `LOW` · `MODERATE` · `URGENT` · `EMERGENCY`

---

## Veterinarians & Clinics

| Status | Method | Endpoint | Auth | Description |
|--------|--------|----------|------|-------------|
| 🔜 | GET | `/api/v1/vets` | Optional | List/search vet clinics |
| 🔜 | GET | `/api/v1/vets/nearby` | Optional | Nearby clinics by lat/lng/radius |
| 🔜 | GET | `/api/v1/vets/:vetId` | Optional | Get clinic/vet details |

---

## Emergency

| Status | Method | Endpoint | Auth | Description |
|--------|--------|----------|------|-------------|
| 🔜 | GET | `/api/v1/emergency/nearby` | Optional | Nearest emergency veterinary clinics |

> Emergency search works independently of AI. Returns call, directions, and clinic info immediately.

---

## Appointments

| Status | Method | Endpoint | Auth | Description |
|--------|--------|----------|------|-------------|
| 🔜 | POST | `/api/v1/appointments` | Yes | Book appointment |
| 🔜 | GET | `/api/v1/appointments` | Yes | List appointments (paginated) |
| 🔜 | GET | `/api/v1/appointments/:appointmentId` | Yes | Get appointment |
| 🔜 | PATCH | `/api/v1/appointments/:appointmentId` | Yes | Update status / notes |
| 🔜 | DELETE | `/api/v1/appointments/:appointmentId` | Yes | Cancel appointment |

**Statuses:** `REQUESTED` · `CONFIRMED` · `REJECTED` · `CANCELLED` · `COMPLETED` · `NO_SHOW`

---

## Consultations

| Status | Method | Endpoint | Auth | Description |
|--------|--------|----------|------|-------------|
| 🔜 | POST | `/api/v1/consultations` | Yes | Start consultation |
| 🔜 | GET | `/api/v1/consultations` | Yes | List consultations |
| 🔜 | GET | `/api/v1/consultations/:consultationId` | Yes | Get consultation |
| 🔜 | PATCH | `/api/v1/consultations/:consultationId` | Yes | Update status |
| 🔜 | POST | `/api/v1/consultations/:consultationId/messages` | Yes | Send message |
| 🔜 | GET | `/api/v1/consultations/:consultationId/messages` | Yes | List messages (paginated) |

---

## Community — Posts

| Status | Method | Endpoint | Auth | Description |
|--------|--------|----------|------|-------------|
| 🔜 | POST | `/api/v1/community/posts` | Yes | Create post |
| 🔜 | GET | `/api/v1/community/posts` | Optional | List public posts (paginated) |
| 🔜 | GET | `/api/v1/community/posts/:postId` | Optional | Get post |
| 🔜 | DELETE | `/api/v1/community/posts/:postId` | Yes | Delete own post |
| 🔜 | POST | `/api/v1/community/posts/:postId/like` | Yes | Like post |
| 🔜 | DELETE | `/api/v1/community/posts/:postId/like` | Yes | Unlike post |
| 🔜 | POST | `/api/v1/community/posts/:postId/comments` | Yes | Add comment |
| 🔜 | GET | `/api/v1/community/posts/:postId/comments` | Optional | List comments (paginated) |
| 🔜 | DELETE | `/api/v1/community/posts/:postId/comments/:commentId` | Yes | Delete own comment |
| 🔜 | POST | `/api/v1/community/posts/:postId/report` | Yes | Report post |

---

## Community — Reels

| Status | Method | Endpoint | Auth | Description |
|--------|--------|----------|------|-------------|
| 🔜 | POST | `/api/v1/community/reels` | Yes | Upload reel metadata |
| 🔜 | GET | `/api/v1/community/reels` | Optional | List reels (paginated) |
| 🔜 | GET | `/api/v1/community/reels/:reelId` | Optional | Get reel |
| 🔜 | DELETE | `/api/v1/community/reels/:reelId` | Yes | Delete own reel |
| 🔜 | POST | `/api/v1/community/reels/:reelId/like` | Yes | Like reel |
| 🔜 | DELETE | `/api/v1/community/reels/:reelId/like` | Yes | Unlike reel |

---

## Insurance

| Status | Method | Endpoint | Auth | Description |
|--------|--------|----------|------|-------------|
| 🔜 | GET | `/api/v1/insurance/plans` | Optional | List insurance plans (demo/simulated data) |
| 🔜 | GET | `/api/v1/insurance/plans/:planId` | Optional | Get plan details |

> Plans are **DEMO / SIMULATED** until real provider APIs are integrated.

---

## Pet Walker

| Status | Method | Endpoint | Auth | Description |
|--------|--------|----------|------|-------------|
| 🔜 | GET | `/api/v1/walkers` | Yes | List available walkers |
| 🔜 | GET | `/api/v1/walkers/:walkerId` | Yes | Get walker profile |
| 🔜 | POST | `/api/v1/walks` | Yes | Book a walk |
| 🔜 | GET | `/api/v1/walks` | Yes | List walks |
| 🔜 | GET | `/api/v1/walks/:walkId` | Yes | Get walk details |
| 🔜 | PATCH | `/api/v1/walks/:walkId` | Yes | Update walk status / route |
| 🔜 | POST | `/api/v1/walks/:walkId/location` | Yes | Submit GPS location update |

---

## Lost Pet QR

| Status | Method | Endpoint | Auth | Description |
|--------|--------|----------|------|-------------|
| 🔜 | POST | `/api/v1/lost-pet/tags` | Yes | Create lost-pet QR tag |
| 🔜 | GET | `/api/v1/lost-pet/tags` | Yes | List user's tags |
| 🔜 | GET | `/api/v1/lost-pet/:tagId` | No | Public scan page (safe info only) |
| 🔜 | POST | `/api/v1/lost-pet/:tagId/contact` | No | Contact owner (rate-limited) |

> Public scan exposes pet name, photo, species, breed, and emergency message — **not** owner PII.

---

## Notifications

| Status | Method | Endpoint | Auth | Description |
|--------|--------|----------|------|-------------|
| 🔜 | GET | `/api/v1/notifications` | Yes | List notifications (paginated) |
| 🔜 | PATCH | `/api/v1/notifications/:notificationId/read` | Yes | Mark as read |
| 🔜 | POST | `/api/v1/notifications/device-token` | Yes | Register FCM device token |
| 🔜 | DELETE | `/api/v1/notifications/device-token` | Yes | Remove device token |

---

## Admin

| Status | Method | Endpoint | Auth | Description |
|--------|--------|----------|------|-------------|
| 🔜 | GET | `/api/v1/admin/users` | Yes (ADMIN) | List users |
| 🔜 | PATCH | `/api/v1/admin/users/:userId` | Yes (ADMIN) | Update user role / status |
| 🔜 | GET | `/api/v1/admin/vets` | Yes (ADMIN) | List vet verification requests |
| 🔜 | PATCH | `/api/v1/admin/vets/:vetId` | Yes (ADMIN) | Approve/reject vet |
| 🔜 | GET | `/api/v1/admin/reports` | Yes (ADMIN) | List community reports |
| 🔜 | PATCH | `/api/v1/admin/reports/:reportId` | Yes (ADMIN) | Moderate reported content |
| 🔜 | GET | `/api/v1/admin/analytics` | Yes (ADMIN) | Product analytics summary |

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `VALIDATION_ERROR` | 400 | Invalid request input |
| `NOT_FOUND` | 404 | Resource not found |
| `PET_NOT_FOUND` | 404 | Pet not found |
| `USER_NOT_FOUND` | 404 | User not found |
| `APPOINTMENT_NOT_FOUND` | 404 | Appointment not found |
| `INVALID_ROLE` | 403 | Role not allowed for this action |
| `FILE_TOO_LARGE` | 400 | Upload exceeds size limit |
| `INVALID_FILE_TYPE` | 400 | Unsupported file type |
| `AI_ERROR` | 503 | AI service unavailable |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Pagination

List endpoints support cursor-based pagination:

```http
GET /api/v1/community/posts?limit=20&cursor={lastDocId}
```

Response includes:
```json
{
  "success": true,
  "data": {
    "items": [],
    "nextCursor": "abc123",
    "hasMore": true
  }
}
```

---

## Implementation Phases

| Phase | Modules | Status |
|-------|---------|--------|
| 1 | Foundation, health, middleware | ✅ Complete |
| 2A | Pets (CRUD, photo, ownership) | ✅ Complete |
| 2B | Health passport | ✅ Complete |
| 2C | Medical records | ✅ Complete |
| 2D | Vaccinations + auto reminders | ✅ Complete |
| 2E | Medications + reminders | ✅ Complete |
| 2F | Reminders + scheduler | ✅ Complete |
| 2G | Document upload | ✅ Complete |
| 2H | OCR (Vision API) | ✅ Complete |
| 2I | Security rules, indexes, tests | ✅ Complete |
| 3–12 | AI, vets, appointments, community, admin | 🔜 |

---

*Last updated: Phase 2 complete — Pet & Healthcare Core Backend.*
