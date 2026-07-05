# 🏛️ Smart Civic Complaint Management System (SCMS)

<div align="center">

![SCMS Banner](https://img.shields.io/badge/SCMS-Smart%20Civic%20Portal-2563EB?style=for-the-badge&logoColor=white)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)](LICENSE)

**An AI-Powered Civic Decision Intelligence Platform that enables citizens to report civic issues while helping administrators analyze complaint data, generate AI-powered insights, identify hotspots, predict trends, and make better civic decisions.**

[🌐 Live Demo](https://smart-civic-complaint-management-system-1.onrender.com) · [📖 Architecture](#-system-architecture) · [⚙️ Setup](#%EF%B8%8F-installation--setup) · [✨ Features](#-features)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Installation & Setup](#%EF%B8%8F-installation--setup)
- [Database Schema](#-database-schema-overview)
- [API Reference](#-api-reference)
- [Future Enhancements](#-future-enhancements)
- [Author](#-author)

---

## 🌟 Overview

The **Smart Civic Complaint Management System (SCMS)** is a full-stack web application that bridges the gap between citizens and local government. It provides a clean, modern interface — inspired by tools like Linear and Vercel — for citizens to file and track civic complaints, and for administrators to manage, prioritize, and resolve them efficiently.

Unlike traditional government portals that feel outdated and frustrating to use, SCMS delivers a fast, transparent, and accountable civic experience with real-time tracking, PDF receipts, priority-based triage, and an analytics-driven admin dashboard. SCMS also includes an **AI Decision Dashboard** powered by **Google Gemini**, enabling administrators to transform complaint data into actionable civic intelligence. The platform identifies complaint hotspots, summarizes trends, recommends priority actions, detects recurring issues, predicts future complaint patterns, and provides an AI Decision Assistant for natural language interaction with complaint data.

---

## 🚨 Problem Statement

Civic complaint management in most municipalities suffers from:

- 📄 **No digital trail** — complaints are filed on paper or via phone with no tracking number
- 🕳️ **Zero transparency** — citizens have no visibility into the status of their complaint
- 📊 **No analytics** — administrators lack data to identify recurring issues or high-priority areas
- 🔒 **No accountability** — without IDs or records, complaints easily fall through the cracks
- 📁 **Manual workflows** — status updates and reporting are done manually, wasting staff time

**SCMS solves all of this** with a structured, database-backed system — every complaint gets a unique ID, a priority level, real-time status tracking, and a downloadable PDF receipt.

---

## ✨ Features

### 👥 Public Portal

| Feature | Description |
|---|---|
| 📝 **Complaint Registration** | Citizens file complaints with name, contact, area, category, priority, and description |
| 📧 **Email Notifications** | Optional email field triggers automatic notifications on every status change |
| 🔍 **Complaint Tracking** | Track any complaint in real time using its unique SCMS ID (e.g. `SCMS2026001`) |
| 📄 **PDF Receipt** | Download a professionally formatted PDF receipt immediately after registration |
| 📸 **Complaint Evidence Upload** | Citizens can optionally upload photos while registering complaints to provide visual evidence |
| 📊 **Live Statistics** | Landing page displays platform-wide complaint counts and resolution rates |

### 🔐 Admin Portal

| Feature | Description |
|---|---|
| 🔑 **Secure Authentication** | bcrypt-hashed password login with httpOnly cookie sessions (24 h expiry) |
| 📋 **Complaint Management** | Full sortable table with inline status updates and confirmed-delete modal |
| 👁️ **Evidence Viewing** | Administrators can securely view uploaded complaint images directly from the complaints dashboard |
| 🚦 **Status Updates** | Change any complaint to Pending · In Progress · Resolved directly in the table |
| ⚡ **Priority System** | Four-tier priority triage: Low · Medium · High · Urgent |
| 🔎 **Search & Filters** | Search by name / ID / area; filter by status, priority, and category simultaneously |
| 📑 **Pagination** | 10 complaints per page; Previous / Next / page-number navigation; state preserved across filters |
| 📤 **CSV Export** | Export all currently filtered complaints — including email and priority — with one click |
| 🗑️ **Delete Confirmation** | Complaint ID shown in confirmation modal; explicit confirmation required before deletion |

### 📈 Analytics Dashboard

| Widget | Description |
|---|---|
| 🥧 **Category Breakdown** | Pie chart of complaint volume by civic category |
| 🥧 **Status Distribution** | Pie chart of Pending / In Progress / Resolved split |
| 📈 **Monthly Trend** | Line chart of complaints filed over the past 12 months |
| 🕒 **Recent Activity** | Live table of the 5 most recently filed complaints |
| 🔢 **Stat Cards** | Real-time Total, Pending, In Progress, and Resolved counts |

---

## 🧠 AI Decision Dashboard

The AI Decision Dashboard transforms complaint data into actionable civic intelligence using **Google Gemini**.

### AI Capabilities

| Feature | Description |
|---|---|
| 🤖 AI Complaint Summary | Generates intelligent summaries of complaint data |
| 📍 Hotspot Detection | Identifies localities with unusually high complaint frequency |
| 🚨 Priority Recommendation | Suggests which civic issues require immediate attention |
| 📈 Trend Analysis | Detects increasing and decreasing complaint categories |
| 🏙️ Area-wise Analytics | Groups complaints locality-wise for better planning |
| 🧠 AI Recommendations | Suggests actions for administrators based on complaint data |
| 💬 AI Decision Assistant | Answers administrator questions using natural language |
| 🔁 Pattern Detection | Detects recurring civic issues |
| 🔍 Similar Complaint Detection | Identifies duplicate or similar complaints |
| 📊 Predictive Analytics | Predicts future complaint trends |
| 🏢 Department Recommendation | Suggests the responsible municipal department |
| ⚠️ Severity Analysis | Determines complaint severity using AI |

The AI Decision Assistant supports questions such as:

- Which locality has the highest pending complaints?
- Summarize today's complaints.
- Which department requires immediate attention?
- Predict next week's complaint trend.
- Which complaints are similar?

All AI responses are generated using **real complaint data** and are grounded in the system database.

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI component framework |
| **TypeScript** | 5.9 | End-to-end type safety |
| **Vite** | 7 | Build tool & HMR dev server |
| **Tailwind CSS** | 4 | Utility-first styling |
| **Framer Motion** | — | Page and element animations |
| **Recharts** | — | Analytics charts |
| **shadcn/ui** | — | Accessible, composable UI primitives |
| **Wouter** | — | Lightweight client-side routing |
| **TanStack Query** | — | Server-state management & caching |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 24 | JavaScript runtime |
| **Express** | 5 | HTTP server framework |
| **TypeScript** | 5.9 | Type safety across all routes |
| **Drizzle ORM** | — | Type-safe PostgreSQL query builder |
| **PostgreSQL** | Latest | Persistent relational database |
| **Google Gemini API** | Latest | AI-powered civic decision intelligence and AI assistant |
| **bcryptjs** | — | Secure password hashing (admin auth) |
| **Cloudinary** | — | Secure cloud storage for complaint evidence images |
| **Nodemailer** | — | SMTP email notification delivery |
| **pdfkit** | — | Programmatic PDF receipt generation |
| **Zod v4** | — | Runtime schema validation |
| **pino** | — | Structured JSON logging |

### Tooling & Infrastructure

| Tool | Purpose |
|---|---|
| **pnpm workspaces** | Monorepo package management |
| **Orval** | OpenAPI spec → React Query hooks + Zod schemas (codegen) |
| **esbuild** | Fast, tree-shaken API server bundling |
| **drizzle-kit** | Database schema push & migrations |

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Reverse Proxy / CDN                      │
│               Path-based routing  ·  HTTPS / mTLS            │
└───────────────────────┬──────────────────────────────────────┘
                        │
           ┌────────────┴─────────────┐
           │                          │
           ▼                          ▼
 ┌──────────────────┐      ┌───────────────────────┐
 │  React + Vite    │      │   Express 5 API        │
 │  (Static SPA)    │      │   /api/*               │
 │                  │      │                        │
 │  Public Pages    │      │   Routes               │
 │  /               │◄────►│   /api/complaints      │
 │  /register       │ HTTP │   /api/admin           │
 │  /track          │      │   /api/analytics       │
 │                  │      │   /api/healthz         │
 │  Admin Pages     │      │                        │
 │  /admin          │      │   Middleware            │
 │  /admin/         │      │   cors · cookie-parser │
 │    complaints    │      │   pino-http · zod      │
 └──────────────────┘      └────────────┬──────────┘
                                        │
                              ┌─────────▼──────────┐
                              │   Drizzle ORM       │
                              │   (node-postgres)   │
                              └─────────┬──────────┘
                                        │
                              ┌─────────▼──────────┐                 
                              │    PostgreSQL      │
                              │                    │
                              │ complaints         │
                              │ complaint_counter  │
                              └─────────┬──────────┘
                                        │
                                        ▼
                              ┌────────────────────┐
                              │ AI Decision Engine │
                              └─────────┬──────────┘
                                        │
                                        ▼
                              ┌────────────────────┐
                              │ Google Gemini API  │
                              └─────────┬──────────┘
                                        │
                                        ▼
                              ┌────────────────────┐
                              │ AI Dashboard &     │
                              │ AI Assistant       │
                              └────────────────────┘

---

### Monorepo Structure

```
scms/
├── artifacts/
│   ├── api-server/               # Express 5 backend
│   │   └── src/
│   │       ├── routes/           # complaints · admin · analytics · health
│   │       └── lib/              # pdf · mailer · logger
│   └── scms/                     # React + Vite frontend
│       └── src/
│           ├── pages/            # home · register · track · admin/*
│           └── components/       # layout · ui (shadcn/ui primitives)
├── lib/
│   ├── api-spec/                 # openapi.yaml  ← single source of truth
│   ├── api-client-react/         # ✦ Generated: React Query hooks
│   ├── api-zod/                  # ✦ Generated: Zod validation schemas
│   └── db/                       # Drizzle schema + pg connection pool
└── pnpm-workspace.yaml
```

### OpenAPI-Driven Codegen Pipeline

```
lib/api-spec/openapi.yaml
         │
         ├──► Orval ──► lib/api-client-react/   (React Query hooks for the frontend)
         └──► Orval ──► lib/api-zod/            (Zod schemas for backend validation)
```

> The OpenAPI spec is the **single source of truth**. Changing an endpoint, request body, or response shape flows through to both the frontend hooks and the backend validators automatically via `pnpm --filter @workspace/api-spec run codegen`.

---

## ⚙️ Installation & Setup

### Prerequisites

| Requirement | Minimum Version |
|---|---|
| Node.js | 20+ (24 recommended) |
| pnpm | 9+ |
| PostgreSQL | 14+ |

### 1 — Clone the repository

```bash
git clone https://github.com/your-username/scms.git
cd scms
```

### 2 — Install all dependencies

```bash
pnpm install
```

### 3 — Configure environment variables

```env
# ── Required ────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/scms
GEMINI_API_KEY=your_gemini_api_key

# ── Email notifications (optional) ─────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com

# ── Admin credentials override (optional) ──────────────
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<bcrypt-hash>   # bcrypt hash of your chosen password
```

> 💡 When `SMTP_*` variables are not set, the system logs a notice and skips email delivery — no errors are thrown. Email notifications activate automatically once the SMTP config is present.

### 4 — Push the database schema

```bash
pnpm --filter @workspace/db run push
```

### 5 — Start the development servers

```bash
# Terminal 1 — API server
pnpm --filter @workspace/api-server run dev

# Terminal 2 — React frontend
pnpm --filter @workspace/scms run dev
```

### 6 — Open the application

| Interface | URL |
|---|---|
| 🌐 Public Portal | `http://localhost:3000/` |
| 🔐 Admin Login | `http://localhost:3000/admin/login` |
| 🩺 API Health | `http://localhost:5000/api/healthz` |

> **Default admin credentials:** `admin` / `admin123`
> ⚠️ Change the password in production by setting `ADMIN_PASSWORD_HASH` to a `bcrypt` hash of your chosen password.

### Useful commands

```bash
# Regenerate React Query hooks + Zod schemas from the OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Full typecheck across all workspace packages
pnpm run typecheck

# Build all packages for production
pnpm run build
```

---

## 🗄️ Database Schema Overview

### Table: `complaints`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | PRIMARY KEY | Auto-increment internal ID |
| `complaint_id` | `TEXT` | NOT NULL · UNIQUE | Public ID, e.g. `SCMS2026001` |
| `name` | `TEXT` | NOT NULL | Complainant full name |
| `email` | `TEXT` | NULLABLE | Optional — used for status notifications |
| `mobile` | `TEXT` | NOT NULL | 10-digit mobile number |
| `area` | `TEXT` | NOT NULL | Locality / village |
| `category` | `TEXT` | NOT NULL | Civic category (Water, Road, etc.) |
| `description` | `TEXT` | NOT NULL | Detailed issue description |
| `status` | `TEXT` | DEFAULT `'Pending'` | `Pending` · `In Progress` · `Resolved` |
| `priority` | `TEXT` | DEFAULT `'Medium'` | `Low` · `Medium` · `High` · `Urgent` |
| `created_at` | `TIMESTAMP` | DEFAULT `now()` | UTC submission timestamp |

### Table: `complaint_counter`

| Column | Type | Description |
|---|---|---|
| `id` | `SERIAL` | Primary key |
| `year` | `INTEGER` | Calendar year (UNIQUE per year) |
| `last_count` | `INTEGER` | Last issued sequence number for that year |

> **How complaint IDs are generated:** Each `INSERT` atomically increments the year's counter using `ON CONFLICT DO UPDATE SET last_count = last_count + 1`. The public ID is formatted as `SCMS{YEAR}{NNN}` — e.g. `SCMS2026001`. A new calendar year automatically gets its own counter row, resetting the sequence.

---

## 📡 API Reference

### Complaints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/complaints` | List complaints — supports `?status`, `?category`, `?priority`, `?search` |
| `POST` | `/api/complaints` | Register a new complaint |
| `GET` | `/api/complaints/:id` | Get a single complaint by database ID |
| `GET` | `/api/complaints/track/:complaintId` | Track by public ID (e.g. `SCMS2026001`) |
| `PATCH` | `/api/complaints/:id` | Update complaint status (triggers email if set) |
| `DELETE` | `/api/complaints/:id` | Permanently delete a complaint |
| `GET` | `/api/complaints/:id/pdf` | Stream a PDF receipt for download |

### Admin

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/login` | Authenticate — sets httpOnly session cookie |
| `POST` | `/api/admin/logout` | Invalidate session — clears cookie |
| `GET` | `/api/admin/me` | Verify current session status |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/stats` | Total · Pending · In Progress · Resolved counts |
| `GET` | `/api/analytics/by-category` | Complaint volume grouped by civic category |
| `GET` | `/api/analytics/by-status` | Complaint volume grouped by status |
| `GET` | `/api/analytics/monthly-trend` | Monthly complaint counts for the past 12 months |
| `GET` | `/api/analytics/recent` | 5 most recently filed complaints |

### AI

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/ai/insights` | Generate AI-powered dashboard insights |
| `POST` | `/api/ai/ask` | Ask questions about complaint data using the AI Decision Assistant |

---

## 🔮 Future Enhancements

| # | Feature | Description | Priority |
|---|---|---|---|
| 1 | 📱 **Mobile App** | React Native / Expo companion app for on-the-go complaint filing | 🔴 High |
| 2 | 🗺️ **Interactive GIS Maps** | Display complaint hotspots on an interactive geographic map with clustering and heatmaps | 🔴 High |
| 3 | 🧠 **Smart Resource Allocation** | Recommend deployment of field teams based on complaint density and severity | 🔴 High |
| 4 | 👥 **Multi-Admin Roles** | Role-based access: Super Admin · Department Officer · Viewer | 🟡 Medium |
| 5 | 🤖 **AI Auto-Classification** | LLM-powered automatic category and priority assignment | 🟡 Medium |
| 6 | 🔔 **Push Notifications** | Real-time browser and mobile push alerts on status changes | 🟡 Medium |
| 7 | 📊 **SLA Reporting** | Department-wise resolution time tracking and SLA dashboards | 🟡 Medium |
| 8 | 📅 **Auto-Escalation** | Automatically raise priority on overdue complaints | 🟡 Medium |
| 9 | 🌐 **Multi-language** | Regional language support (Hindi, Tamil, Telugu, etc.) | 🟢 Low |
| 10 | 🔗 **Webhook Integrations** | Notify external systems (Slack, WhatsApp) on status changes | 🟢 Low |

---

## 👤 Author

<div align="center">

**Built with ❤️ for transparent and accountable civic governance**

---

*SCMS — Making civic complaints visible, trackable, and resolvable.*

[![Made with TypeScript](https://img.shields.io/badge/Made%20with-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Powered by PostgreSQL](https://img.shields.io/badge/Powered%20by-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)

</div>


---

# 📸 Screenshots

## 🏠 Home Page

![Home Page](home_page.png)

## 📝 Register Complaint

![Register Complaint](register_complaint.png)

## ✅ Complaint Registered

![Complaint Registered](complaint_registered.png)

## 🔍 Track Complaint

![Track Complaint](track_complaint.png)

## 🔐 Admin Login

![Admin Login](admin_login.png)

## 📊 Admin Dashboard

![Admin Dashboard](admin_dashboard.png)

## 📋 Complaint Management

![Complaint Management](admin_complaints.png)

## 🧠 AI Decision Dashboard

![AI Dashboard](ai_dashboard.png)

## 🤖 AI Decision Assistant

![AI Assistant](ai_assistant.png)
