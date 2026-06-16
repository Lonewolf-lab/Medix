<div align="center">

# 🩺 Medix

### An AI-powered personal health management platform

*Stop panic-Googling your symptoms. Triage, records, medications, and lab insights — in one calm place.*

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Vite](https://img.shields.io/badge/Vite-8-646CFF)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8)
![License](https://img.shields.io/badge/License-MIT-blue)

</div>

---

## Overview

People panic-google their symptoms, get terrified by worst-case results, and have no organized
place to manage their health. Medical reports end up scattered across WhatsApp, email, and paper
files. Doctor visits for minor issues are slow and expensive.

**Medix** is a full-stack platform that gives users:

- 🧠 **AI symptom triage** — a structured *first opinion* (not a diagnosis) with severity, likely causes, and next steps
- 📁 **Health records** — upload lab reports & prescriptions (PDF/image), with AI explanations and per-document chat
- 💊 **Medication tracking** — reminders, course expiry, and **AI prescription extraction** from a photo/PDF
- 💬 **Context-aware AI chat** — an assistant that knows your age, blood group, medications, and recent symptoms
- 📊 **Lab dashboard** — automatic **biomarker extraction** from reports, color-coded normal/borderline/high

> ⚠️ Medix is **not** a substitute for professional medical advice. Every AI response includes a disclaimer.

---

## Architecture

```
┌──────────────────┐      HTTPS + HttpOnly cookie       ┌────────────────────┐
│  React frontend  │  ───────────────────────────────► │  Spring Boot API   │
│  (Vite, Tailwind)│  ◄─────────────────────────────── │  (JWT, Spring Sec) │
└──────────────────┘            JSON / multipart        └─────────┬──────────┘
                                                                   │
                                          ┌────────────────────────┼───────────────┐
                                          │                        │               │
                                    ┌─────▼─────┐          ┌───────▼──────┐  ┌─────▼──────┐
                                    │ PostgreSQL│          │  Groq AI API │  │  PDFBox    │
                                    │  (JPA)    │          │ (LLM + vision)│ │ (extract)  │
                                    └───────────┘          └──────────────┘  └────────────┘
```

**Key design decisions**

- **All AI calls are proxied through the backend** — the API key never touches the client.
- **Stateless JWT auth in an HttpOnly cookie** (`medix_token`), with a Bearer-header fallback and a
  DB-backed token blacklist for secure logout.
- **Per-feature package structure** on the backend (`auth`, `symptom`, `record`, `medication`,
  `chat`, `dashboard`, …) — each with its own controller/service/repository/DTOs.
- **User context is injected into every AI prompt** (age, blood group, active meds, recent symptoms)
  for personalized responses.

---

## Tech Stack

| Layer        | Technologies |
|--------------|--------------|
| **Backend**  | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA / Hibernate, WebFlux WebClient, Apache PDFBox, Maven |
| **Database** | PostgreSQL |
| **AI**       | Groq API — `llama-3.3-70b-versatile` (text) + vision model for image extraction |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Zustand, Axios, React Router, Framer Motion, Recharts, React Hot Toast |
| **Auth**     | JWT (jjwt) in HttpOnly cookie + token blacklist |

---

## Repository Structure

```
Medix/
├── medix-backend/      # Spring Boot REST API (complete)
│   └── src/main/java/com/medimind/
│       ├── auth/  user/  symptom/  record/  medication/  chat/  dashboard/
│       ├── ai/  security/  config/  storage/  exception/
│       └── MedixApplication.java
└── medix-frontend/     # React app (in progress)
    └── src/
        ├── api/  store/  routes/  components/  pages/  hooks/  utils/  constants/
        └── App.jsx  main.jsx
```

---

## Getting Started

### Prerequisites
- Java 17+, Maven
- Node.js 20+
- PostgreSQL running locally
- A free [Groq API key](https://console.groq.com)

### 1. Backend

```bash
cd medix-backend

# Create your local secrets file from the template
cp src/main/resources/application-local.properties.example \
   src/main/resources/application-local.properties
# → fill in: spring.datasource.password, jwt.secret (32+ chars), ai.api.key

# Create the database
createdb medimind   # or via psql:  CREATE DATABASE medimind;

mvn spring-boot:run   # starts on http://localhost:8080
```

### 2. Frontend

```bash
cd medix-frontend
cp .env.example .env        # VITE_API_BASE_URL=http://localhost:8080
npm install
npm run dev                 # starts on http://localhost:5173
```

---

## API Surface (selected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` · `/login` · `/logout` | Cookie-based auth |
| `POST` | `/api/symptoms/analyze` | AI symptom triage |
| `POST` | `/api/records` · `/api/records/{id}/analyze` · `/chat` | Upload & AI-analyze documents |
| `POST` | `/api/medications/extract-prescription` | AI prescription extraction |
| `POST` | `/api/dashboard/upload-report` · `/health-summary` | Biomarker extraction & insights |
| `POST` | `/api/chat/message` | Context-aware health assistant |

All `/api/**` routes except `/api/auth/**` require authentication.

---

## Security Notes

- Secrets live only in `application-local.properties` (gitignored) — never committed.
- Passwords hashed with BCrypt; JWT signed and short-lived; logout blacklists the token.
- CORS restricted to the frontend origin with credentials enabled.

---

## Roadmap

- [ ] Complete frontend feature pages + animated 3D landing experience
- [ ] Live deployment (managed Postgres + cloud file storage)
- [ ] Handwritten prescription extraction (vision)
- [ ] Email medication reminders & PDF health-summary export

---

## Author

**Siddhant Sinha** — B.Tech CSE, Amity University Noida
Full-stack solo project.

## License

[MIT](./LICENSE)
