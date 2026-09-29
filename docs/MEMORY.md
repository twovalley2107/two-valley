# Project Memory & Context (MEMORY.md)

## Project Name: Two Valley
**Document Version:** 1.0
**Status:** Approved (v1.0)
**Aligned With:** PRD.md, ARCHITECTURE.md, DESIGN.md, RULES.md, TASKS.md v1.1, TEST_PLAN.md v1.0, SECURITY.md v1.0, DECISIONS.md v1.0

---

## 1. Project Identity

- **Brand Name:** Two Valley
- **Domain & Focus:** Premium e-commerce web platform for artisanal luxury perfumes (fragrances) and single-estate, high-elevation tea (chai patti).
- **Brand Positioning:** Elegant, tactile, sensory-rich luxury. Bridging two distinct natural valleys—high-altitude tea gardens and botanical fragrance fields.
- **Core User Experience:** High-craft, immersive shopping experience with warm luxury aesthetic, subtle fluid micro-animations, selective 3D bottle/tin showcases, smooth performance, and zero clutter.

---

## 2. Product Scope

### MVP Scope (Approved)
- **Initial Catalog Size:** Approximately 8–9 perfume SKUs and approximately 5–6 tea/chai patti SKUs.
- **Customer-Facing Capabilities:**
  - Browse luxury landing page with hero feature showcases and brand storytelling.
  - Search, filter, and sort catalog by collection, scent notes/flavor profile, price, and mood.
  - View product detail pages with notes breakdown, brewing/scent instructions, dynamic recommendations, and selective 3D display.
  - Guest and authenticated Wishlist management (with seamless guest-to-auth merge upon login).
  - Guest and authenticated Cart management (with persistent session & user syncing).
  - Multi-step Checkout with structured address validation, technology-agnostic payment abstraction (`PaymentAdapter`), order confirmation, and guest checkout support.
  - Customer Order history and status tracking.
  - Customer Reviews and rating submissions (verified buyer badges).
  - Content-based deterministic recommendations (similar notes/tea type/price tier).
  - Transparent behavioural telemetry logging (`EventLog`).
- **Admin Capabilities:**
  - Independent admin authentication & session verification (`assertAdminSession()`).
  - Analytics dashboard (sales revenue, order velocity, top products, basic recommendation performance).
  - Product management (CRUD, inventory stock adjustment, image management via Supabase Storage).
  - Order management (list, filter by status, update fulfillment state).
  - Customer management (view profile details, purchase history).
  - Review moderation (approve, reject, flag reviews).

### Explicitly Excluded from MVP (Deferred to Post-MVP)
- ML / AI collaborative filtering models or recommendation engines.
- Multi-currency / international shipping calculations.
- Native mobile applications (iOS/Android).
- AR (Augmented Reality) virtual try-on / interactive 3D studio customizer.
- Multi-Factor Authentication (MFA).
- Advanced automated marketing campaigns.

---

## 3. Technical Stack

| Layer | Technology | Key Details |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | App Router with React Server Components (RSC) by default |
| **Language** | TypeScript | Strict mode (`strict: true`), zero `any` types |
| **Styling** | Tailwind CSS v3/v4 | Utility classes mapped strictly to CSS tokens in `globals.css` |
| **Design System** | Centralised CSS Tokens | Standardized colors (`--bg-primary`, `--accent-gold`, etc.), fonts, spacing |
| **Database** | Supabase PostgreSQL | Managed Postgres database accessed exclusively via Prisma ORM |
| **ORM** | Prisma | Type-safe schema definition, migrations, and queries |
| **Auth** | Supabase Auth | `@supabase/ssr` with HttpOnly cookies for customer sessions |
| **Storage** | Supabase Storage | Public bucket for product images, avatar uploads, banner assets |
| **UI Animation** | `motion/react` | Declarative page transitions, micro-interactions, layout morphing |
| **3D Engine** | Three.js + R3F | `@react-three/fiber` + `@react-three/drei` for selective product models |
| **State Management**| Zustand | Lightweight client state for Cart drawer, Wishlist UI state, Filter drawers |
| **Validation** | Zod | Single source of truth for API, Form, and Server Action input validation |

---

## 4. Key Architectural Principles

1. **Server Components by Default:**
   - Pages and layouts are React Server Components (RSC) fetching data directly via Prisma.
   - Client Components (`'use client'`) are strictly restricted to interactive nodes (forms, interactive drawers, 3D canvases, motion triggers).
2. **Server Actions & Route Handlers:**
   - Server Actions handle form submissions and state mutations.
   - Route Handlers (`/api/*`) handle external webhooks and structured endpoints.
3. **Application-Layer Scoping:**
   - Prisma queries for customer resources must ALWAYS explicitly include `where: { profileId }` or `where: { sessionId }`.
   - Database queries do not rely solely on database RLS.
4. **Independent Admin Authorization:**
   - Every `/admin/*` route handler and admin Server Action must call `assertAdminSession()`.
   - Middleware provides boundary check; Server Action re-verifies session + `Profile.role === 'ADMIN'`.
5. **Monetary Precision:**
   - All product prices, cart totals, tax, shipping, and discounts use Prisma `Decimal` / SQL `DECIMAL(10,2)`.
   - Calculations use `decimal.js` or `Big.js`; never JS float arithmetic.
6. **Structured Shipping Address:**
   - Order shipping addresses are stored as structured JSON matching `ShippingAddressSchema` (street, city, state, postalCode, country).
7. **Guest Session Strategy:**
   - Unauthenticated users receive a guest `session_id` cookie (UUIDv4, 30-day expiry).
   - Intentionally **non-HttpOnly** because browser client-side logic requires access for telemetry logging (`EventLog`) and guest wishlist functionality.
   - Used to scope guest carts and wishlists until login/signup, when guest items merge into the authenticated profile.
   - It is a UUID/non-authentication identifier and must never be treated as an authentication authority.
   - Formatted with `SameSite=Lax` and `Secure` in production per `SECURITY.md` cookie security rules.

---

## 5. Recommendation System (MVP)

- **Engine Strategy:** Fully deterministic content-based filtering algorithm implemented in TypeScript (`src/lib/recommendations/engine.ts`).
- **Matching Criteria:** Evaluates category, fragrance family / tea region, primary notes / flavor profile, and price range.
- **Scoring Function:** Calculates similarity score based on weighted attribute overlap (e.g., shared notes +20 points, same category +30 points).
- **Hard Rule:** **No ML libraries, ML models, collaborative filtering, or AI ranking are introduced in MVP.** Recommendations remain deterministic/content-based.
- **Telemetry Integration:** Recommendations log `RECOMMENDATION_IMPRESSION` and `RECOMMENDATION_CLICK` events to track CTR deterministically.

---

## 6. Behaviour Telemetry

- **Database Model:** `EventLog` table storing `id`, `profileId` (nullable), `sessionId` (nullable), `eventType`, `payload` (JSONB), and `createdAt`.
- **Tracked Events:**
  - `PRODUCT_VIEW`
  - `CATEGORY_VIEW`
  - `SEARCH_EXECUTE`
  - `ADD_TO_CART`
  - `REMOVE_FROM_CART`
  - `WISHLIST_TOGGLE`
  - `CHECKOUT_START`
  - `ORDER_COMPLETED`
  - `RECOMMENDATION_IMPRESSION`
  - `RECOMMENDATION_CLICK`
- **Privacy & Security:** Payload must never store PII (passwords, complete credit card numbers, unhashed secrets, or full street addresses).

---

## 7. Visual & Design Memory

- **Color Palette (CSS Variable Tokens):**
  - Primary Background: Deep obsidian / rich earth tones (`--color-bg-primary`: `#0D0D0C`, `--color-bg-surface`: `#141412`)
  - Accent / Luxury Highlight: Warm brushed gold & amber (`--color-accent-gold`: `#D4AF37`, `--color-accent-amber`: `#E67E22`)
  - Text & Contrast: Warm cream / off-white (`--color-text-primary`: `#F5F5F0`, `--color-text-muted`: `#A0A096`)
- **Typography:**
  - Serif Display (Headings): Playfair Display / Cormorant Garamond (luxury editorial feel).
  - Sans-Serif (Body & UI): Inter / Plus Jakarta Sans (clean readability).
- **Selective 3D Philosophy:**
  - 3D interactive canvases (R3F) are reserved exclusively for hero product displays and interactive bottle/tea tin showcases.
  - Non-3D fallback static webp images render seamlessly on low-power mobile devices or when `prefers-reduced-motion: reduce` is detected.
- **Motion Philosophy:**
  - Subtle, high-frame-rate transitions using `motion/react`.
  - Micro-interactions on buttons, card hovers, cart drawer slide-in, and toast alerts.

---

## 8. Security Memory

- **Auth Layer:** Supabase Auth for customer identity. Session management via `@supabase/ssr` cookies.
- **Admin Security:** Middleware network protection + independent `assertAdminSession()` check in every admin layout and action.
- **Validation:** Every user input parsed with Zod schemas at Server Action / API boundaries.
- **Secrets Management:** Environment variables strictly categorized into Public (`NEXT_PUBLIC_*`) and Private (`SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `PAYMENT_SECRET_KEY`).
- **Data Isolation:** Dual guest/auth scoping for Cart and Wishlist tables (`profileId` or `sessionId`).
- **Guest Session Security:** Guest `session_id` is intentionally non-HttpOnly (accessible to browser client for telemetry and guest wishlist), a UUID/non-authentication identifier marked `Secure` in production, and must never be treated as an authentication authority.

---

## 9. Development Guardrails

- **Strict TypeScript:** No `any` types permitted. All functions, props, and server actions must have explicit interface definitions.
- **No Unapproved Dependencies:** Only packages listed in `RULES.md` / `DECISIONS.md` ADR-022 are permitted.
- **No ML in MVP:** Recommendations must remain purely deterministic algorithms.
- **Provider Neutrality:** Payment gateway logic abstracted behind `PaymentAdapter` interface (`mockPaymentAdapter`, `razorpayPaymentAdapter`, `stripePaymentAdapter`).
- **No Over-Engineering:** Keep components modular, focused, and maintainable.
- **Preserve Approved Architecture:** Do not modify schema, auth, or architecture without explicit ADR update.

---

## 10. Documentation Hierarchy

When working on Two Valley, consult the authoritative documentation as follows:

| Topic / Task Type | Primary Document | Secondary Reference |
| :--- | :--- | :--- |
| Product Features & Business Requirements | `PRD.md` | `TASKS.md` |
| System Architecture & Data Schema | `ARCHITECTURE.md` | `DECISIONS.md` |
| Visual Design Tokens & UI Specs | `DESIGN.md` | `RULES.md` |
| Coding Standards, Rules & Guardrails | `RULES.md` | `SECURITY.md` |
| Task Dependencies & Execution Order | `TASKS.md` | `TEST_PLAN.md` |
| Testing Strategy & Acceptance Criteria | `TEST_PLAN.md` | `RULES.md` |
| Security Protocols & Threat Model | `SECURITY.md` | `RULES.md` |
| ADR Rationale & Technical Decisions | `DECISIONS.md` | `ARCHITECTURE.md` |
| High-Level AI Context & Project Overview | `MEMORY.md` (this file) | All approved docs |

---

## 11. Current Project Status

As of September 22, 2026:

- **PRD.md:** Approved (v1.0)
- **ARCHITECTURE.md:** Approved (v1.0)
- **DESIGN.md:** Approved (v1.0)
- **RULES.md:** Approved (v1.1)
- **TASKS.md:** Approved (v1.1)
- **TEST_PLAN.md:** Approved (v1.0)
- **SECURITY.md:** Approved (v1.0)
- **DECISIONS.md:** Approved (v1.0)
- **MEMORY.md:** Approved (v1.0)
- **README.md:** Approved (v1.0)

**Implementation Phase Status:**
Phase 1 tasks (TV-01-001 through TV-01-010) are COMPLETE.
Next work begins with Phase 2 (Environment & Database Setup) starting with task TV-02-001 in TASKS.md.

---
