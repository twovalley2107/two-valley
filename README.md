# Two Valley — Luxury E-Commerce Platform

**Document Version:** 1.0  
**Status:** Approved (v1.0)  
**Aligned With:** PRD.md, ARCHITECTURE.md, DESIGN.md, RULES.md (v1.1), TASKS.md (v1.1), TEST_PLAN.md (v1.0), SECURITY.md (v1.0), DECISIONS.md (v1.0), MEMORY.md (v1.0)

---

## 1. Project Overview

**Two Valley** is a high-craft, sensory-driven e-commerce web platform designed for two distinct luxury product categories:
- **Artisanal Fragrances & Perfumes:** Botanical scents, extrait de parfum, and luxury home/body fragrances.
- **Single-Estate Teas (Chai Patti):** High-elevation, rare-harvest specialty teas from pristine mountain valleys.

The platform bridges two natural valleys—mountain tea gardens and botanical fragrance fields—delivering a tactile, immersive digital shopping experience. Built with a warm luxury visual system, fluid micro-interactions, selective interactive 3D product showcases, and high-performance rendering.

---

## 2. MVP Scope

### Initial Catalog
- **Perfumes:** Approximately 8–9 luxury perfume SKUs.
- **Teas:** Approximately 5–6 single-estate tea/chai patti SKUs.

### Core Capabilities
- **Customer Experience:**
  - Immersive landing page with hero feature showcases, brand storytelling, and category gateways.
  - Multi-faceted catalog search, filtering, and sorting (by collection, scent notes/flavor profile, price, and mood).
  - Rich product detail pages featuring fragrance notes breakdowns, tea brewing guidelines, dynamic recommendations, and selective 3D interactive displays.
  - Dual guest and authenticated Wishlist management with seamless guest-to-auth merge upon login.
  - Persistent guest and authenticated Cart management with real-time price calculations.
  - Multi-step checkout with structured address validation, technology-agnostic payment gateway abstraction (`PaymentAdapter`), order confirmation, and guest checkout.
  - Customer order history, shipment tracking, and verified buyer review submissions.
  - Fully deterministic content-based recommendation engine (matching notes, tea category, price tier).
  - Privacy-focused behavioural telemetry logging (`EventLog`).

- **Admin Portal:**
  - Independent admin authentication and session verification (`assertAdminSession()`).
  - Executive analytics dashboard (revenue, order velocity, top products, recommendation CTR).
  - Product catalog management (CRUD operations, inventory control, image uploads via Cloudinary Storage).
  - Order fulfillment management (status workflow: Pending -> Processing -> Shipped -> Delivered).
  - Customer profile directory and order history lookup.
  - Review moderation (approve, reject, flag customer reviews).

---

## 3. Technology Stack

| Layer | Technology | Key Function |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | React Server Components (RSC) by default for SSR, SEO, and fast TTFB |
| **Language** | TypeScript | Strict mode (`strict: true`), zero `any` types |
| **Styling** | Tailwind CSS v3/v4 | Utility classes mapped to CSS variables in `globals.css` |
| **Design System** | Centralised CSS Tokens | Color palette, typography, spacing, depth tokens |
| **Database** | Supabase PostgreSQL | Relational storage for products, orders, profiles, cart, wishlist, telemetry |
| **ORM** | Prisma | Type-safe database client, migrations, and schema definitions |
| **Auth** | Supabase Auth | `@supabase/ssr` session management via HttpOnly cookies |
| **Storage** | Cloudinary Storage | Optimized CDN object storage for product images and media |
| **Animation** | `motion/react` | Declarative page transitions and UI micro-interactions |
| **Imagery** | Cloudinary CDN | High-resolution, responsive product photography with automatic format delivery |
| **Validation** | Zod | Single source of truth for API, form, and Server Action schemas |
| **State Management**| Zustand | Client-side UI state (cart drawer, wishlist drawer, filter drawers) |

---

## 4. Architecture Overview

- **Server Components by Default:** Page layouts, data fetching, and static content render as RSCs. Client Components (`'use client'`) are strictly limited to interactive elements (forms, drawers, motion controllers, 3D canvases).
- **Server Actions & Route Handlers:** Server Actions handle state mutations and form submissions; Route Handlers (`/api/*`) handle structured API endpoints and webhooks.
- **Application-Layer Data Isolation:** Prisma queries for customer resources explicitly enforce ownership scoping (`profileId` or `sessionId`). Application logic does not rely solely on database RLS.
- **Independent Admin Authorization:** Every `/admin/*` route and Server Action independently executes `assertAdminSession()`, verifying session validity and `Profile.role === 'ADMIN'`.
- **Monetary Precision:** All monetary values use Prisma `Decimal` / SQL `DECIMAL(10,2)` processed with `decimal.js` or `Big.js` to avoid floating-point arithmetic errors.
- **Deterministic Recommendations & Telemetry:** Recommendation matching uses a pure TypeScript algorithm evaluating product attribute overlap. Behavioral events are recorded in `EventLog` with non-HttpOnly guest `session_id` cookies for tracking.

---

## 5. Repository Structure

```
two-valley/
├── src/
│   ├── app/                  # Next.js App Router (pages, layouts, API routes)
│   │   ├── (customer)/       # Customer-facing routes (catalog, PDP, cart, checkout)
│   │   ├── (auth)/           # Authentication routes (login, signup, callback)
│   │   ├── admin/            # Independent Admin Portal routes
│   │   └── api/              # Route Handlers (webhooks, telemetry, recommendations)
│   ├── components/           # UI components
│   │   ├── ui/               # Base design system primitives (buttons, inputs, cards)
│   │   ├── 3d/               # R3F 3D canvases and bottle/leaf models
│   │   ├── customer/         # Customer-specific components (PDP, cart drawer)
│   │   └── admin/            # Admin dashboard components and tables
│   ├── lib/                  # Core logic, services, and utilities
│   │   ├── db/               # Prisma client instance and DB helpers
│   │   ├── auth/             # Supabase Auth client, server sessions, assertAdminSession
│   │   ├── payment/          # PaymentAdapter interface & implementations (Mock, Razorpay, Stripe)
│   │   ├── recommendations/  # Deterministic recommendation engine
│   │   ├── telemetry/        # EventLog telemetry dispatcher
│   │   ├── validation/       # Zod schemas (address, checkout, product, review)
│   │   └── utils/            # General helpers (currency formatting, date formatters)
│   ├── types/                # Shared TypeScript interfaces and type definitions
│   └── styles/               # CSS modules and globals.css design token definitions
├── prisma/                   # Prisma schema (schema.prisma) and migration scripts
├── public/                   # Static assets (favicons, fallback product webp images)
├── docs/                     # Authoritative project specifications & planning documents
├── tests/                    # Testing suite (unit, integration, flow tests per TEST_PLAN.md)
├── .env.example              # Template environment variables (committed)
├── .env                      # Local environment secrets (git-ignored)
├── tsconfig.json             # TypeScript configuration (strict: true)
├── tailwind.config.ts        # Tailwind CSS token mapping configuration
└── README.md                 # Root developer documentation (this file)
```

---

## 6. Documentation Guide

Developers and AI coding agents must consult the appropriate specification document based on task context:

| Document | Primary Focus & When to Read |
| :--- | :--- |
| [`docs/PRD.md`](file:///c:/Users/ACER/OneDrive/Desktop/two-valley/docs/PRD.md) | **Product Requirements:** Business goals, user journeys, catalog scope, feature requirements. |
| [`docs/ARCHITECTURE.md`](file:///c:/Users/ACER/OneDrive/Desktop/two-valley/docs/ARCHITECTURE.md) | **System Architecture:** Component boundaries, database schema, data flow, payment/auth architecture. |
| [`docs/DESIGN.md`](file:///c:/Users/ACER/OneDrive/Desktop/two-valley/docs/DESIGN.md) | **Visual System & UI:** Design tokens, colors, typography, layout guidelines, 3D/motion specs. |
| [`docs/RULES.md`](file:///c:/Users/ACER/OneDrive/Desktop/two-valley/docs/RULES.md) | **Coding Guardrails:** Mandatory code conventions, TypeScript rules, security rules, dependency rules. |
| [`docs/TASKS.md`](file:///c:/Users/ACER/OneDrive/Desktop/two-valley/docs/TASKS.md) | **Execution Roadmap:** Dependency-ordered implementation phases and task acceptance criteria. |
| [`docs/TEST_PLAN.md`](file:///c:/Users/ACER/OneDrive/Desktop/two-valley/docs/TEST_PLAN.md) | **QA & Testing:** Test layer expectations, critical flow test cases, quality gate verification rules. |
| [`docs/SECURITY.md`](file:///c:/Users/ACER/OneDrive/Desktop/two-valley/docs/SECURITY.md) | **Security Model:** Threat model, auth security, admin verification, secret handling, vulnerability gates. |
| [`docs/DECISIONS.md`](file:///c:/Users/ACER/OneDrive/Desktop/two-valley/docs/DECISIONS.md) | **ADR Log:** 22 established technical choices, trade-offs, and rationale. |
| [`docs/MEMORY.md`](file:///c:/Users/ACER/OneDrive/Desktop/two-valley/docs/MEMORY.md) | **Project Context:** Fast-reference memory summarizing key identity, stack, rules, and current status. |

---

## 7. Core Development Guardrails

1. **Strict TypeScript:** `"strict": true` enforced. Explicit return types required for public functions and server actions. `any` is strictly prohibited.
2. **Server Components by Default:** Fetch data in RSCs. Add `'use client'` only to leaf nodes requiring user interaction or browser APIs.
3. **Input Validation:** All input (API payloads, Server Action params, form data) MUST be parsed through Zod schemas before processing.
4. **Independent Admin Auth:** Every admin action/route MUST call `assertAdminSession()`. Never trust middleware alone.
5. **Monetary Decimal Safety:** Use Prisma `Decimal` / `decimal.js` for all pricing calculations. Never use native floating-point math for money.
6. **No ML in MVP:** Recommendations must remain fully deterministic content-based algorithms.
7. **Dependency Control:** Use ONLY approved dependencies listed in `RULES.md` / `DECISIONS.md` ADR-022. New dependencies require justification.
8. **Provider Neutrality:** Keep payment processing isolated behind the `PaymentAdapter` abstraction interface.

---

## 8. Environment Variables

All application configuration is managed via environment variables.

- **`.env.example`** provides a complete template of required variables (without real secrets).
- **`.env`** contains local environment values and MUST NOT be committed to git.

### Classification Overview

- **Public Variables (`NEXT_PUBLIC_*`):** Safe for client-side bundle exposure (e.g., Supabase project URL, Supabase anon key, app base URL).
- **Private Variables:** Server-side only; MUST NOT be prefixed with `NEXT_PUBLIC_` (e.g., `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, payment secret keys).

---

## 9. Getting Started

> **Note:** The project is currently in the **Planning & Documentation Phase**. Application code setup commands (such as package installation and database migrations) are pending the start of Phase 2 implementation.

### Intended Setup Sequence (Phase 2 Onward)

1. **Clone & Environment Setup:**
   ```bash
   cp .env.example .env
   # Populate .env with local database and Supabase credentials
   ```

2. **Install Dependencies (Pending Phase 2):**
   ```bash
   npm install
   ```

3. **Database Initialization (Pending Phase 2):**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Local Development Server (Pending Phase 2):**
   ```bash
   npm run dev
   ```

---

## 10. Development Workflow

Development follows the structured **Vibe Coding** task-by-task workflow:

1. **Review Specification:** Read the relevant specification docs in `docs/`.
2. **Select Task:** Pick the next unblocked task from `docs/TASKS.md`.
3. **Single Task Implementation:** Implement ONLY the selected task in isolation.
4. **Test & Verify:** Run relevant tests and quality checks per `docs/TEST_PLAN.md`.
5. **Review & Document:** Update task status in `TASKS.md` and log decisions in `DECISIONS.md` if new technical choices were made.
6. **Proceed:** Repeat task-by-task sequence cleanly.

---

## 11. Testing & Quality Gates

Production deployment is strictly blocked until all quality gates defined in `TEST_PLAN.md` pass:

- **Type Checking:** `tsc --noEmit` must pass cleanly with zero errors.
- **Build Verification:** `npm run build` must complete successfully.
- **Customer Flow QA:** Automated/manual verification of landing page, catalog search, PDP, cart, wishlist, checkout, and order history.
- **Admin Flow QA:** Verification of admin login, analytics, product CRUD, order processing, and review moderation.
- **Security Audit:** Verification of admin session defense, Zod validation boundaries, PII protection, and zero high/critical `npm audit` CVEs.
- **Performance Review:** Core Web Vitals targets (LCP < 2.5s, FID/INP < 200ms, CLS < 0.1, bundle size < 200kB initial JS).
- **Production Smoke Test:** Post-deployment smoke check of critical paths in the staging environment.

---

## 12. Security Overview

Two Valley enforces a defense-in-depth security architecture:

- **Authentication:** Customer auth handled by Supabase Auth with HttpOnly cookies via `@supabase/ssr`.
- **Admin Defense:** Dual-layer protection combining Next.js middleware network boundary check and mandatory independent `assertAdminSession()` checks.
- **Data Scoping:** All database access is explicitly scoped to `profileId` or `sessionId` at the application layer.
- **Validation & Sanitization:** Zod schemas validate all inputs; HTML output is sanitized to prevent XSS.

For full security specs, threat model, and vulnerability management rules, see [`docs/SECURITY.md`](file:///c:/Users/ACER/OneDrive/Desktop/two-valley/docs/SECURITY.md).

---

## 13. Deployment

Two Valley is designed for zero-downtime deployment on modern serverless hosting platforms (e.g., Vercel / Netlify):

- **Build Target:** Standard Next.js production build (`next build`).
- **Database:** Supabase PostgreSQL with pooled connection string for serverless environment compatibility.
- **Static Assets & Media:** Served via Supabase Storage public buckets and Next.js Image Optimization.
- **Deployment Gate:** Automated CI pipeline executes type checking, linting, tests, build check, and security audit before permitting production releases.

---

## 14. Current Project Status

- **Planning & Specification Phase:** **COMPLETE** upon approval of this `README.md`.
- **Approved Specifications:**
  - `PRD.md` v1.0
  - `ARCHITECTURE.md` v1.0
  - `DESIGN.md` v1.0
  - `RULES.md` v1.1
  - `TASKS.md` v1.1
  - `TEST_PLAN.md` v1.0
  - `SECURITY.md` v1.0
  - `DECISIONS.md` v1.0
  - `MEMORY.md` v1.0
  - `README.md` v1.0 (Approved)
- **Application Code Implementation:** Has **NOT** started yet.
- **Next Step:** Proceed to Phase 2 (Environment & Database Setup) starting with task `TV-02-001` in `docs/TASKS.md`.

---

## 15. Future Scope (Post-MVP)

The following capabilities are explicitly deferred to post-MVP releases:
- Machine Learning (ML) / AI collaborative filtering recommendations.
- Multi-Factor Authentication (MFA) for customer/admin accounts.
- Full Strict Content Security Policy (CSP) headers.
- Theme customizer / Dark Mode extensions.
- Augmented Reality (AR) virtual try-on & interactive 3D studio customizer.
- Multi-currency support & international shipping tax calculation.
