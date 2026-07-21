<div align="center">

# 🩺 Medix

### An AI-powered personal health management platform

*Stop panic-Googling your symptoms. Triage, records, medications, calendar scheduling, and lab insights — in one calm place.*

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Vite](https://img.shields.io/badge/Vite-8-646CFF)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-0284C7)
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
- 💊 **Medication tracking** — active prescription management, dosage tracking, course expiry, and **AI prescription extraction**
- 📅 **Unified Health Calendar & Scheduler** — full-spread interactive grid, single-card per medication displaying time ranges (`09:00 - 21:00`), daily pop-up agenda, and full CRUD doctor appointment booking
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
- **Per-feature package structure** on the backend (`auth`, `user`, `symptom`, `record`, `medication`,
  `appointment`, `chat`, `dashboard`, …) — each with its own controller/service/repository/DTOs.
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
├── medix-backend/      # Spring Boot REST API
│   └── src/main/java/com/medimind/
│       ├── auth/  user/  symptom/  record/  medication/  appointment/  chat/  dashboard/
│       ├── ai/  security/  config/  storage/  exception/
│       └── MedixApplication.java
└── medix-frontend/     # React web application
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

### 1. Database Setup
Create a PostgreSQL database named `medimind`:
```sql
CREATE DATABASE medimind;
```

### 2. Backend Setup
```bash
cd medix-backend
cp src/main/resources/application.properties.example src/main/resources/application.properties
cp src/main/resources/application-local.properties.example src/main/resources/application-local.properties
```

Edit `application-local.properties` with your credentials:
```properties
spring.datasource.password=your_postgres_password
jwt.secret=your_super_secret_jwt_key_at_least_32_characters
ai.api.key=your_groq_api_key
```

Run the API server:
```bash
mvn spring-boot:run
```

### 3. Frontend Setup
```bash
cd medix-frontend
npm install
npm run dev
```

Visit `http://localhost:4000` in your browser.

---

## License

Distributed under the MIT License. See `LICENSE` for details.
