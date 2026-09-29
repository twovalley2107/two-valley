# Architecture Decision Record Log (DECISIONS.md)

## Project Name: Two Valley
**Document Version:** 1.0
**Status:** Approved (v1.0)
**Aligned With:** PRD.md, ARCHITECTURE.md, DESIGN.md, RULES.md, TASKS.md v1.1, TEST_PLAN.md v1.0, SECURITY.md v1.0

---

## About This Document

This is the authoritative ADR (Architecture Decision Record) log for the Two Valley project. It records every significant technical, architectural, and design decision established and approved during the planning phase.

**Conventions:**
- **Status: Decided** — approved and to be implemented as specified.
- **Status: Future Consideration** — intentionally deferred; not decided for MVP.
- **Status: Superseded** — replaced by a later decision (noted in the record).

Do not reopen or contradict Decided records without creating a new superseding ADR and updating the superseded record's status. All future decisions discovered during implementation should be appended to this log.

---

## Table of Contents

| ID | Title | Status |
| :--- | :--- | :--- |
| [ADR-001](#adr-001) | Next.js App Router with TypeScript | Decided |
| [ADR-002](#adr-002) | Tailwind CSS with Centralised Design Tokens | Decided |
| [ADR-003](#adr-003) | Supabase Auth for Customer Authentication | Decided |
| [ADR-004](#adr-004) | Prisma ORM with Supabase PostgreSQL | Decided |
| [ADR-005](#adr-005) | Supabase Storage for Uploaded Assets | Superseded by ADR-024 |
| [ADR-006](#adr-006) | `motion/react` for UI Animation | Decided |
| [ADR-007](#adr-007) | Three.js / React Three Fiber for Selective 3D | Superseded by ADR-023 |
| [ADR-008](#adr-008) | Server Components by Default | Decided |
| [ADR-009](#adr-009) | Server Actions and Route Handlers for Data Mutations | Decided |
| [ADR-010](#adr-010) | Decimal Type for All Monetary Fields | Decided |
| [ADR-011](#adr-011) | Structured JSON Shipping Address | Decided |
| [ADR-012](#adr-012) | Guest `session_id` Cookie Strategy | Decided |
| [ADR-013](#adr-013) | Dual Wishlist Uniqueness Constraints | Decided |
| [ADR-014](#adr-014) | Independent Admin Authorization via `assertAdminSession()` | Decided |
| [ADR-015](#adr-015) | Zod for All Input Validation | Decided |
| [ADR-016](#adr-016) | Technology-Agnostic `PaymentAdapter` Interface | Decided |
| [ADR-017](#adr-017) | Deterministic Content-Based Recommendation Engine | Decided |
| [ADR-018](#adr-018) | No ML in MVP | Decided |
| [ADR-019](#adr-019) | Behavioural Telemetry via `EventLog` | Decided |
| [ADR-020](#adr-020) | Mobile / Reduced-Motion 3D Fallback Strategy | Decided |
| [ADR-021](#adr-021) | Premium Two Valley Visual System | Decided |
| [ADR-022](#adr-022) | Dependency and Over-Engineering Guardrails | Decided |
| [ADR-023](#adr-023) | Replace MVP 3D/WebGL with Optimized Imagery and Motion | Decided |
| [ADR-024](#adr-024) | Replace Supabase Storage with Cloudinary for Product Images | Decided |
| [ADR-025](#adr-025) | Customer Auth Upgrade (Email + Password + OTP & Google OAuth) | Decided |

---
## ADR-001

### Next.js App Router with TypeScript

**Status:** Decided
**Date:** Planning Phase
**Decided In:** ARCHITECTURE.md

#### Context

Two Valley requires a production-grade full-stack web framework supporting SSR for SEO and performance on product pages, collocated server-side data fetching, a clear server/client rendering boundary, and TypeScript strictness for a maintainable, type-safe codebase.

#### Decision

Use **Next.js App Router** as the full-stack framework with **TypeScript** in strict mode (`"strict": true` in `tsconfig.json`).

- All routes use the `src/app/` directory (App Router convention).
- TypeScript strict mode is non-negotiable; `any` is prohibited across `src/`.
- `tsc --noEmit` must pass with zero errors as a hard deployment gate.

#### Alternatives Considered

| Alternative | Reason Rejected |
| :--- | :--- |
| **Next.js Pages Router** | Lacks native React Server Components and the streaming model required for premium UX |
| **Remix** | Rejected in favour of Next.js's broader ecosystem, Vercel deployment alignment, and App Router's RSC model |
| **Vite + React SPA** | No native SSR; SEO requirements for product pages ruled out a pure SPA |
| **Astro** | Limited React ecosystem integration; not suitable for complex e-commerce with auth and real-time cart state |

#### Consequences

- **Positive:** First-class SSR, streaming, and React Server Components. Excellent SEO. Frictionless Vercel deployment.
- **Positive:** TypeScript strict mode prevents entire categories of runtime bugs.
- **Negative:** More complex mental model than Pages Router; the Server/Client Component boundary must be understood.
- **Constraint:** Three.js requires `next/dynamic` with `ssr: false`; this SSR boundary must be enforced carefully.

#### Related

- `RULES.md` §1 (TypeScript strictness), §2 (Server vs Client Component rules)
- `ARCHITECTURE.md` §2 (Framework)
- `TASKS.md` TV-01-001 (Project initialisation)

---
## ADR-002

### Tailwind CSS with Centralised Design Tokens

**Status:** Decided
**Date:** Planning Phase
**Decided In:** ARCHITECTURE.md, DESIGN.md

#### Context

Two Valley requires a precise, premium visual system with consistent brand colours (Forest Green, Ivory, Muted Gold), typography (Playfair Display, Inter), and spacing — enforced without ad-hoc values scattered across component files, and compatible with Next.js App Router (no CSS-in-JS runtime required).

#### Decision

Use **Tailwind CSS** combined with **CSS custom properties (design tokens)** defined in `src/app/globals.css`.

- Brand colours, typography, spacing, and motion variables defined as CSS custom properties under `:root`.
- `tailwind.config.ts` references these variables, making brand tokens available as Tailwind classes.
- No ad-hoc colour values (e.g., `text-green-700`) permitted in component files; only design-token-mapped classes (e.g., `text-forest-green`).

#### Alternatives Considered

| Alternative | Reason Rejected |
| :--- | :--- |
| **Vanilla CSS Modules** | Insufficient utility for rapid component development in a complex e-commerce UI |
| **CSS-in-JS (Styled Components, Emotion)** | Runtime overhead; not recommended with React Server Components; hydration complexity |
| **Tailwind without design tokens** | Would permit ad-hoc colour values, breaking brand consistency |
| **Chakra UI / MUI** | Opinionated defaults conflict with the premium custom Two Valley design; adds unnecessary bundle weight |

#### Consequences

- **Positive:** Rapid UI iteration. Brand system enforced via config rather than convention.
- **Positive:** CSS custom properties work naturally with `prefers-color-scheme` for future theme extensions.
- **Positive:** Zero runtime overhead — all styles resolved at build time.
- **Negative:** Tailwind class lists can become verbose; components must stay focused.
- **Constraint:** Every brand-specific value must go through the design token system, not raw Tailwind palette values.

#### Related

- `DESIGN.md` §2 (Colour system), §3 (Typography), §7 (Design tokens)
- `RULES.md` §5 (Tailwind/CSS design-token usage)
- `TASKS.md` TV-05-002 (Design token implementation)

---
## ADR-003

### Supabase Auth for Customer Authentication

**Status:** Decided
**Date:** Planning Phase
**Decided In:** ARCHITECTURE.md, SECURITY.md

#### Context

Two Valley requires customer registration, login, session management, and role-based access control. Key requirements: secure password handling without storing raw passwords; cookie-based sessions compatible with Next.js App Router SSR; roles stored in the application database; low implementation complexity.

#### Decision

Use **Supabase Auth** for all customer authentication, integrated via **`@supabase/ssr`** for cookie-based session handling.

- No custom password hashing, JWT generation, or token management implemented by the application.
- `@supabase/ssr` manages the session cookie lifecycle server-side.
- A `Profile` table mirrors `auth.users` and is the authoritative source for `role` (CUSTOMER / ADMIN).
- `Profile.id` = `auth.users.id` (UUID).

#### Alternatives Considered

| Alternative | Reason Rejected |
| :--- | :--- |
| **Custom bcrypt + JWT system** | High implementation burden; high risk of security defects; not a business differentiator |
| **NextAuth.js / Auth.js** | Additional abstraction over Supabase without meaningful benefit |
| **Clerk** | External paid service; not aligned with the Supabase-native stack |
| **Firebase Auth** | Separate vendor from the database; increases operational complexity |

#### Consequences

- **Positive:** Battle-tested auth with minimal custom code. Email confirmation, password reset, session refresh out of the box.
- **Positive:** `@supabase/ssr` provides correct cookie handling for App Router including middleware-based session refresh.
- **Negative:** `Profile` record must be created reliably on registration; orphaned auth users without a Profile are not permitted.
- **Constraint:** Session validation must use `createServerClient`, never the browser client. `SUPABASE_SERVICE_ROLE_KEY` must remain server-only.

#### Related

- `ARCHITECTURE.md` §3 (Authentication)
- `SECURITY.md` §2, §3, §5
- `RULES.md` §10 (Supabase/Auth security rules)
- `TASKS.md` TV-03-001 to TV-03-005

---
## ADR-004

### Prisma ORM with Supabase PostgreSQL

**Status:** Decided
**Date:** Planning Phase
**Decided In:** ARCHITECTURE.md

#### Context

Two Valley requires type-safe query building, schema migration management under version control, a production-grade PostgreSQL host, and connection pooling suitable for serverless deployment.

#### Decision

Use **Prisma ORM** for type-safe database access with **Supabase PostgreSQL** as the host.

- `DATABASE_URL` connects to Supabase PgBouncer for runtime queries.
- `DIRECT_URL` connects directly for Prisma migrations (PgBouncer does not support DDL).
- `prisma migrate deploy` (not `migrate dev`) used in production.
- A Prisma singleton (`src/lib/db.ts`) used globally to prevent connection exhaustion.
- `prisma/schema.prisma` is the single source of truth for the database structure.

#### Alternatives Considered

| Alternative | Reason Rejected |
| :--- | :--- |
| **Drizzle ORM** | Rejected in favour of Prisma's more mature migration tooling and established Next.js ecosystem |
| **Raw SQL (pg / postgres.js)** | No type safety; high injection risk without strict parameterization; migrations unmanaged |
| **SQLite (development only)** | Eliminated; PostgreSQL used in both development and production for consistency |
| **Supabase JS client for all queries** | No migration management; bypasses Prisma's type system |

#### Consequences

- **Positive:** Full type safety from schema to query result. Migrations tracked in source control.
- **Positive:** Dual URL configuration handles the PgBouncer/migration separation cleanly.
- **Negative:** Prisma does not propagate Supabase Row-Level Security context — application-layer `profileId` scoping is mandatory on all user-specific queries (see ADR-014, SECURITY.md §8).
- **Constraint:** `$queryRaw` with string concatenation prohibited; Prisma tagged template literals required for any raw SQL.

#### Related

- `ARCHITECTURE.md` §4 (Database)
- `SECURITY.md` §7, §8
- `RULES.md` §12 (Prisma/database rules)
- `TASKS.md` TV-02-001 to TV-02-006

---
## ADR-005

### Supabase Storage for Uploaded Assets

**Status:** Decided
**Date:** Planning Phase
**Decided In:** ARCHITECTURE.md

#### Context

Two Valley requires a reliable, CDN-backed storage solution for product images — integrated with existing Supabase infrastructure, with admin-only writes, public reads, and abstractable for future provider swap.

#### Decision

Use **Supabase Storage** for all product images and uploaded assets.

- Bucket policies: public read for product images; writes restricted to admin-authenticated contexts.
- Only the CDN public URL stored in `ProductImage` records.
- Admin upload actions call `assertAdminSession()` before initiating any upload.
- A storage abstraction layer (`src/lib/storage.ts`) wraps Supabase Storage so the provider can be swapped without changing call sites.

#### Alternatives Considered

| Alternative | Reason Rejected |
| :--- | :--- |
| **AWS S3** | Separate vendor; additional credentials; not aligned with the Supabase-native stack for MVP |
| **Cloudinary** | Paid transformation service; transformation capabilities not required in MVP |
| **Vercel Blob** | Viable; rejected to keep storage within the Supabase ecosystem |
| **Self-hosted** | Not appropriate for serverless; no CDN; high operational burden |

#### Consequences

- **Positive:** Native Supabase integration; CDN-backed for global performance.
- **Positive:** Storage abstraction layer preserves provider-swap flexibility.
- **Negative:** Free tier storage and bandwidth limits must be monitored at scale.
- **Constraint:** File type, size (max 10MB), and filename sanitization enforced at the application layer before upload.

#### Related

- `ARCHITECTURE.md` §5 (Storage)
- `SECURITY.md` §15 (File and image upload security)
- `TASKS.md` TV-04-003 (Product image upload)

---
## ADR-006

### `motion/react` for UI Animation

**Status:** Decided
**Date:** Planning Phase
**Decided In:** ARCHITECTURE.md, DESIGN.md

#### Context

Two Valley requires smooth, purposeful UI animations — page transitions, scroll reveals, hover effects, cart slide-over, and modal entry/exit. A single canonical library is needed that supports `prefers-reduced-motion` and works natively with React and Next.js App Router.

#### Decision

Use **`motion/react`** (the React-specific entry point of the Motion library, formerly Framer Motion) as the sole animation library.

- All animations use `import { motion, AnimatePresence, useInView, useScroll } from "motion/react"`.
- `framer-motion` is explicitly **prohibited** — zero imports permitted anywhere in the codebase.
- All animated components implement `prefers-reduced-motion: reduce` fallbacks.
- Use cases: page transitions, scroll reveals, hover/tilt on product cards, cart slide-over, modal entry/exit, tea steam/leaf motion.

#### Alternatives Considered

| Alternative | Reason Rejected |
| :--- | :--- |
| **`framer-motion`** | Superseded by `motion/react`; mixing both causes bundle duplication |
| **GSAP** | Commercial license cost; `motion/react` is sufficient for all required animations |
| **CSS-only animations** | Cannot handle complex gesture-driven or scroll-linked animations |
| **React Spring** | Viable; rejected to avoid dual animation libraries |

#### Consequences

- **Positive:** Declarative, composable animations integrated with React lifecycle. `AnimatePresence` handles exit animations.
- **Positive:** Native `prefers-reduced-motion` support.
- **Negative:** Animated components must be Client Components, increasing the client bundle for animated pages.
- **Constraint:** `framer-motion` must never be imported. A grep check is in TEST_PLAN.md 3D-012.

#### Related

- `ARCHITECTURE.md` §7 (Animation)
- `DESIGN.md` §6 (Motion principles)
- `RULES.md` §7 (Motion/3D usage rules)
- `TEST_PLAN.md` 3D-012, 3D-013

---
## ADR-007

### Three.js / React Three Fiber for Selective 3D

**Status:** Decided
**Date:** Planning Phase
**Decided In:** ARCHITECTURE.md, DESIGN.md

#### Context

Two Valley includes selective premium 3D enhancements. 3D must not appear in the initial bundle, must degrade gracefully on mobile and `prefers-reduced-motion`, and must use the React ecosystem.

#### Decision

Use **Three.js** via **React Three Fiber (R3F)** and **`@react-three/drei`** for selective 3D canvas rendering.

- 3D canvases loaded client-side only via `next/dynamic` with `{ ssr: false }`.
- Three.js / R3F must never appear in the initial page bundle (verified via `@next/bundle-analyzer`).
- 3D limited to: Hero canvas (homepage), Tea particle system (tea category page), PDP opt-in 3D model viewer.
- On mobile (768px and below) or `prefers-reduced-motion: reduce`: 3D canvases replaced by static WebP or CSS fallbacks.
- PDP 3D is opt-in: toggle button appears only when `productModel3dPath` is defined; canvas loads on click, not pre-loaded.

#### Alternatives Considered

| Alternative | Reason Rejected |
| :--- | :--- |
| **Spline / Spline React** | Vendor lock-in; opaque bundle; limited programmatic control |
| **Babylon.js** | More complex API for required use cases; smaller React ecosystem |
| **CSS 3D transforms** | Insufficient for true 3D model rendering |
| **No 3D** | 3D is a defined brand differentiator per PRD.md |

#### Consequences

- **Positive:** Declarative React API for 3D. Rich `drei` utility library for common needs.
- **Positive:** Dynamic imports completely exclude Three.js from SSR and initial bundle.
- **Negative:** Three.js is large; bundle analysis must confirm no initial bundle leakage.
- **Constraint:** 3D always conditional: mobile check + reduced-motion check before rendering any canvas. Static fallback is mandatory.

#### Related

- `ARCHITECTURE.md` §7 (3D)
- `DESIGN.md` §6.2 (3D principles)
- `RULES.md` §7 (Motion/3D usage rules)
- `TEST_PLAN.md` §17 (3D and Motion Fallback Tests), 3D-004, 3D-010, 3D-011

---
## ADR-008

### Server Components by Default

**Status:** Decided
**Date:** Planning Phase
**Decided In:** ARCHITECTURE.md, RULES.md

#### Context

A clear policy is needed for when to opt into Client Components to avoid unnecessary client-side JavaScript and keep sensitive logic server-side.

#### Decision

**Server Components are the default.** `"use client"` is added only when strictly necessary.

**Client Components permitted only for:**
- Components using browser APIs (`useState`, `useEffect`, `useRef`, `window`, `document`).
- Components using interactive event handlers (`onClick`, `onChange`, `onSubmit`).
- Components using `motion/react` animated elements.
- Components using Zustand store access (cart, UI state).
- Components that must read browser cookies (guest `session_id`).

**Server Components required for:**
- All data fetching (Prisma queries, Supabase data reads).
- All layouts, page shells, and non-interactive wrappers.

#### Alternatives Considered

| Alternative | Reason Rejected |
| :--- | :--- |
| **Client Components by default** | Eliminates RSC performance benefits; exposes component logic to client bundle |
| **No clear rule** | Leads to inconsistent patterns and accidental data leakage |

#### Consequences

- **Positive:** Minimal client JavaScript. Server-side data fetching without waterfalls. Sensitive Prisma logic never reaches the browser.
- **Negative:** Requires disciplined component decomposition — interactive elements extracted into small Client Component leaves.
- **Constraint:** Server Components must never import Client Component hooks. Client Components must never contain Prisma queries or server-only imports.

#### Related

- `ARCHITECTURE.md` §2.3 (Server vs Client Components)
- `RULES.md` §3 (Server vs Client Component rules)
- `TASKS.md` TV-05-001 (Layout and navigation)

---
## ADR-009

### Server Actions and Route Handlers for Data Mutations

**Status:** Decided
**Date:** Planning Phase
**Decided In:** ARCHITECTURE.md, RULES.md

#### Context

Two Valley needs a secure, type-safe pattern for data mutations — form submissions, cart updates, wishlist, order creation, and admin operations.

#### Decision

Use **Next.js Server Actions** for all data mutations and form submissions. Use **Route Handlers** (`src/app/api/`) for external webhooks, the telemetry endpoint (`POST /api/telemetry`), and the recommendations endpoint (`GET /api/recommendations`).

All Server Actions must:
1. Begin with authorization verification (session check or `assertAdminSession()`).
2. Validate all inputs with Zod before any processing.
3. Return a typed `ActionResult<T>` — never throw unhandled errors to the client.
4. Never expose Prisma errors or stack traces in the returned error field.
5. Live in dedicated files (e.g., `src/actions/catalogActions.ts`), not inline in component files.

#### Alternatives Considered

| Alternative | Reason Rejected |
| :--- | :--- |
| **tRPC** | Additional abstraction without clear benefit in App Router |
| **REST API layer for all mutations** | Unnecessary boilerplate; loses colocation and type safety |
| **GraphQL** | Significant overhead for this project scope |
| **Client-side fetch to Route Handlers** | Extra round-trips; loses type safety of Server Actions |

#### Consequences

- **Positive:** Server Actions colocated with components. No manual API client setup. Full type safety.
- **Positive:** Built-in CSRF protection via Next.js `Origin` header check.
- **Negative:** Newer pattern with some edge cases in error handling that require care.
- **Constraint:** All Server Actions in dedicated files per RULES.md.

#### Related

- `ARCHITECTURE.md` §2.4 (Server Actions)
- `RULES.md` §9 (API/Server Action rules)
- `SECURITY.md` §10 (API and Server Action security)

---
## ADR-010

### Decimal Type for All Monetary Fields

**Status:** Decided
**Date:** Planning Phase (correction applied)
**Decided In:** ARCHITECTURE.md

#### Context

IEEE 754 floating-point (`Float`) types introduce rounding errors that can corrupt order totals, tax calculations, and price displays.

#### Decision

All monetary database fields use **`Decimal @db.Decimal(10, 2)`** in the Prisma schema, not `Float`.

Affected fields: `Product.price`, `Product.salePrice`, `ProductVariant.priceOverride`, `Order.subtotal`, `Order.tax`, `Order.shippingFee`, `Order.total`, `OrderItem.unitPrice`, `OrderItem.totalPrice`.

Prisma returns these as `Prisma.Decimal` objects. All monetary values must be typed as `Prisma.Decimal` or serialised to `string` — never as raw `number` in financial contexts.

#### Alternatives Considered

| Alternative | Reason Rejected |
| :--- | :--- |
| **`Float` (IEEE 754)** | Rejected categorically; a well-documented source of e-commerce calculation bugs |
| **Integer cents** | Valid; rejected in favour of `Decimal` which is more readable without a conversion layer |
| **String storage** | Loses database-level arithmetic capabilities |

#### Consequences

- **Positive:** No floating-point rounding errors. `Decimal(10, 2)` supports up to 99,999,999.99.
- **Negative:** Requires explicit serialisation to string before JSON responses or display.
- **Constraint:** `UNIT-CART-007` in TEST_PLAN.md verifies no raw float is used for prices.

#### Related

- `ARCHITECTURE.md` §4.2 (Schema — monetary fields)
- `RULES.md` §12 (Prisma/database rules)
- `TEST_PLAN.md` UNIT-CART-006, UNIT-CART-007, UNIT-TS-003

---
## ADR-011

### Structured JSON Shipping Address

**Status:** Decided
**Date:** Planning Phase (correction applied)
**Decided In:** ARCHITECTURE.md

#### Context

`Order.shippingAddress` needs to store recipient name, address lines, city, state, postal code, country, and contact details. A flat string containing serialised JSON was considered.

#### Decision

`Order.shippingAddress` is typed as **`Json`** in the Prisma schema — a structured JSON object, not a serialised string.

The validated shape (enforced via Zod at the checkout Server Action): `recipientName`, `addressLine1`, `addressLine2?`, `city`, `state?`, `postalCode`, `country`, `phone?`.

A typed interface (`ShippingAddressJson`) must be defined and cast at query boundaries.

#### Alternatives Considered

| Alternative | Reason Rejected |
| :--- | :--- |
| **`String` containing serialised JSON** | Requires manual serialise/deserialise; no schema validation; PostgreSQL cannot query individual fields |
| **Separate `ShippingAddress` table** | Adds joins; addresses are order-specific snapshots, not reusable entities |
| **Individual columns** | Inflexible for international address variations; schema changes require migrations |

#### Consequences

- **Positive:** PostgreSQL can query individual JSON fields. No manual JSON.stringify/parse needed.
- **Positive:** Zod validation at input time prevents malformed data reaching the database.
- **Negative:** Prisma's `Json` type requires TypeScript casting at query boundaries.
- **Constraint:** `Order.shippingAddress` must never be stored as a plain string. `INT-CHK-003` verifies this.

#### Related

- `ARCHITECTURE.md` §4.2 (Schema — Order)
- `RULES.md` §12 (Prisma/database rules)
- `TEST_PLAN.md` INT-CHK-003, CHK-005

---
## ADR-012

### Guest `session_id` Cookie Strategy

**Status:** Decided
**Date:** Planning Phase
**Decided In:** ARCHITECTURE.md, SECURITY.md

#### Context

Two Valley serves anonymous (guest) users who should use the wishlist and have behaviour tracked for recommendations before registering. A mechanism is needed to persist anonymous identity across requests without authentication.

#### Decision

Issue a **`session_id` cookie** (a cryptographically random UUID v4 via `crypto.randomUUID()`) to every anonymous visitor on their first page visit.

- Stored as a **browser-readable (non-HttpOnly)** cookie — client-side code needs to read it for telemetry and wishlist calls.
- `Secure` flag enforced in production (HTTPS-only).
- Carries **no authentication authority** — pseudonymous identifier only.
- On login, guest data associated with `sessionId` is migrated server-side to the authenticated `profileId`.

#### Alternatives Considered

| Alternative | Reason Rejected |
| :--- | :--- |
| **localStorage** | Not accessible in SSR; cannot be read by server-side middleware |
| **Fingerprinting** | Privacy-invasive; unreliable; conflicts with minimal PII commitment |
| **No guest tracking** | Prevents guest wishlist and pre-login recommendation personalisation |
| **IndexedDB** | Client-side only; not suitable for SSR or middleware access |

#### Consequences

- **Positive:** Simple, stateless pseudonymous identity. No server-side session storage required for guests.
- **Positive:** Enables guest wishlist persistence and pre-login telemetry without registration.
- **Negative:** Non-HttpOnly is a deliberate, documented trade-off. The cookie carries no auth value; risk is low.
- **Constraint:** Guest session must never be used to bypass authenticated-only access controls.

#### Related

- `ARCHITECTURE.md` §3.3 (Guest session)
- `SECURITY.md` §3.2 (Cookie security), §6 (Guest session security)
- `TEST_PLAN.md` AUTH-008, AUTH-MIG-001 to AUTH-MIG-003

---
## ADR-013

### Dual Wishlist Uniqueness Constraints

**Status:** Decided
**Date:** Planning Phase (correction applied)
**Decided In:** ARCHITECTURE.md

#### Context

`WishlistItem` must prevent duplicate entries for both authenticated users (keyed by `profileId`) and guests (keyed by `sessionId`). A single composite unique constraint fails here because PostgreSQL treats NULL != NULL in composite unique indexes.

#### Decision

Define **two separate unique constraints** on `WishlistItem`:

```
@@unique([profileId, productId])   // Authenticated users
@@unique([sessionId, productId])   // Guest users
```

Exactly one of `profileId` / `sessionId` must be non-null per record; the other must be explicitly null.

#### Alternatives Considered

| Alternative | Reason Rejected |
| :--- | :--- |
| **Single `@@unique([profileId, sessionId, productId])`** | Does not correctly enforce uniqueness when one field is null (PostgreSQL NULL != NULL behaviour) |
| **Application-layer deduplication only** | Race conditions possible; database-level constraints are the appropriate guarantee |
| **Separate `GuestWishlistItem` and `UserWishlistItem` tables** | Increases schema complexity; dual-constraint approach is simpler |

#### Consequences

- **Positive:** Deduplication guaranteed at the database level, independent of application logic.
- **Positive:** Clean separation of guest and authenticated wishlist identity without a union table.
- **Negative:** Application code must set exactly one of `profileId` / `sessionId` to non-null; the other explicitly to null.
- **Constraint:** `INT-WISH-002` and `INT-WISH-004` verify each constraint independently.

#### Related

- `ARCHITECTURE.md` §4.2 (Schema — WishlistItem)
- `TEST_PLAN.md` INT-WISH-001 to INT-WISH-007
- `TASKS.md` TV-08-001

---
## ADR-014

### Independent Admin Authorization via `assertAdminSession()`

**Status:** Decided
**Date:** Planning Phase
**Decided In:** ARCHITECTURE.md, RULES.md, SECURITY.md

#### Context

Next.js middleware can redirect unauthenticated users away from `/admin/*`, but middleware can be bypassed by direct Server Action calls or direct HTTP POST requests. A middleware-only approach would leave admin mutations unprotected.

#### Decision

Implement a **two-layer, defense-in-depth admin authorization model**:

**Layer 1 — Next.js Middleware (`src/middleware.ts`):**
Request-level route protection redirecting unauthenticated users from `/admin/*`. This is a UX convenience and first-line defence only — it does not replace Layer 2.

**Layer 2 — `assertAdminSession()` (mandatory, per-operation):**
An independent server-side function that:
1. Retrieves the session via the server-side Supabase client (`createServerClient`).
2. Verifies the session exists and has not expired.
3. Queries `Profile` from Prisma using `session.user.id`.
4. Verifies `Profile.role === 'ADMIN'`.
5. Throws "Unauthorized" (no session) or "Forbidden" (wrong role) on failure.
6. Returns the verified user only on full success.

Must be called as the **first executable line** in every admin Server Action, admin Route Handler, and the admin layout.

#### Alternatives Considered

| Alternative | Reason Rejected |
| :--- | :--- |
| **Middleware alone** | Bypassable via direct Server Action or API calls; no protection for mutations triggered outside the browser |
| **Role check in each component** | Rendering-layer check only; does not protect server-side mutations |
| **Supabase RLS for admin data** | RLS does not apply to Prisma queries (see ADR-004, SECURITY.md §8); cannot substitute for application-layer auth |

#### Consequences

- **Positive:** Admin mutations protected even if middleware is misconfigured, bypassed, or absent.
- **Positive:** Auditable pattern — every admin handler must contain `assertAdminSession()` as its first statement.
- **Negative:** Boilerplate required in every admin handler; skipping is a security defect caught in code review and security audit (TV-21-001).
- **Constraint:** `assertAdminSession()` called after data access is prohibited. `SEC-001`, `SEC-002`, `ADMIN-AUTH-007` verify bypass resistance.

#### Related

- `ARCHITECTURE.md` §3.4 (Admin authorization)
- `SECURITY.md` §4, §5
- `RULES.md` §10.1 (Independent admin authorization)
- `TEST_PLAN.md` §6.2 (Admin Authorization Tests)
- `TASKS.md` TV-21-001 (Security audit)

---
## ADR-015

### Zod for All Input Validation

**Status:** Decided
**Date:** Planning Phase
**Decided In:** RULES.md, SECURITY.md

#### Context

TypeScript types provide compile-time safety but no runtime validation. A runtime validation library is required for all user-controlled input entering the system through Server Actions or Route Handlers.

#### Decision

Use **Zod** as the sole input validation library for all Server Actions and Route Handlers.

- Zod is an **approved core dependency** not subject to the dependency guardrail scrutiny applied to optional packages.
- All Server Actions validate inputs with a Zod schema as the first operation.
- All Route Handlers validate request body and significant query parameters.
- Schemas use explicit, narrow types: `z.enum()`, `z.string().min(1).max(N)`, `z.number().int().min(1).max(5)`.
- `z.any()` and `z.unknown()` are prohibited as substitutes for proper schema definitions.

#### Alternatives Considered

| Alternative | Reason Rejected |
| :--- | :--- |
| **Yup** | Valid alternative; Zod preferred for TypeScript-first design and superior type inference |
| **`class-validator` / decorators** | Class-based; less idiomatic with plain TypeScript |
| **Manual validation** | Error-prone; inconsistent; high maintenance burden |
| **`valibot`** | Smaller bundle; less ecosystem maturity at time of decision |

#### Consequences

- **Positive:** Runtime type safety at every input boundary. Zod infers TypeScript types, eliminating duplicate type definitions.
- **Positive:** Consistent validation error shapes across all actions and handlers.
- **Negative:** Slightly verbose for complex nested schemas; mitigated by composing smaller schemas.
- **Constraint:** `SEC-010`, `SEC-011` verify Zod is applied at all entry points.

#### Related

- `RULES.md` §11 (Validation and error handling)
- `SECURITY.md` §9 (Input validation with Zod)
- `TEST_PLAN.md` §4 (Unit tests), §5 (Integration tests)

---
## ADR-016

### Technology-Agnostic `PaymentAdapter` Interface

**Status:** Decided
**Date:** Planning Phase
**Decided In:** ARCHITECTURE.md, SECURITY.md

#### Context

Two Valley requires payment processing for checkout, but the specific payment provider was intentionally not selected during the planning phase. The architecture must support payment without coupling the codebase to a single vendor's SDK.

#### Decision

Define a **`PaymentAdapter` interface** (`src/lib/payments/types.ts`) abstracting all payment operations:

- `initializePayment(order: Order): Promise<PaymentIntent>` — creates a payment intent or session.
- `verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean` — verifies webhook authenticity.
- `getPaymentStatus(reference: string): Promise<PaymentStatus>` — retrieves payment status.

The concrete implementation (`src/lib/payments/adapter.ts`) implements this interface for the chosen provider. All checkout and webhook code calls the interface, not the provider SDK directly.

#### Alternatives Considered

| Alternative | Reason Rejected |
| :--- | :--- |
| **Hard-code Stripe SDK calls** | Vendor lock-in; switching providers requires touching all payment-related code |
| **Delay payment design entirely** | Checkout is an MVP requirement; the interface must be defined even if the provider is selected later |
| **GraphQL payment abstraction** | Over-engineering for a single payment integration |

#### Consequences

- **Positive:** Provider can be swapped by implementing a new concrete adapter without changing checkout or webhook code.
- **Positive:** `verifyWebhookSignature` enforced at the interface level — any implementation must provide it.
- **Negative:** Abstraction layer adds mapping burden; concrete adapter must faithfully translate provider-specific concepts.
- **Constraint:** All payment-specific secrets remain server-only regardless of provider chosen.

#### Related

- `ARCHITECTURE.md` §6 (Payment)
- `SECURITY.md` §11 (Payment and webhook security)
- `TASKS.md` TV-10-001 to TV-10-005

---
## ADR-017

### Deterministic Content-Based Recommendation Engine

**Status:** Decided
**Date:** Planning Phase
**Decided In:** ARCHITECTURE.md, PRD.md

#### Context

Two Valley requires product recommendations on the PDP ("You May Also Enjoy") and cross-category pairing ("Pairs Well With"). The PRD explicitly defines these as content-based, not ML or collaborative filtering.

#### Decision

Implement a **deterministic, content-based recommendation engine** (`src/lib/recommendations.ts`) scoring product similarity via Jaccard similarity across shared attributes: `category`, sensory notes, `mood` tags, `occasion` tags, `useCase` tags, `pairingTags`, and price tier (Low / Mid / High).

Products ranked by descending similarity score. Highest-scored published, in-stock products (excluding the source product) are returned.

The "Pairs Well With" widget selects the highest-scoring product from the **opposite category** (perfume vs tea) based on shared `mood`, `occasion`, and `pairingTags`.

#### Alternatives Considered

| Alternative | Reason Rejected |
| :--- | :--- |
| **Collaborative filtering** | Requires significant user interaction history; not viable at MVP launch; explicitly excluded per PRD |
| **ML model** | See ADR-018; explicitly excluded from MVP |
| **Manual curation only** | Does not scale; admin must manually tag every recommendation |
| **Vector similarity (embeddings)** | Requires embedding model and vector database; post-MVP scope |

#### Consequences

- **Positive:** Fully deterministic — same inputs produce same outputs. Testable without mocking.
- **Positive:** No ML dependencies, training pipelines, or serving infrastructure.
- **Positive:** Admin can influence recommendations by updating product metadata tags.
- **Negative:** Cannot learn from user behaviour; quality depends on metadata completeness.
- **Future Scope:** Post-MVP, `EventLog` telemetry may inform a hybrid approach. Requires a new ADR before implementation.

#### Related

- `ARCHITECTURE.md` §9 (Recommendation engine)
- `PRD.md` §8 (Recommendations)
- `TASKS.md` TV-13-001 to TV-13-004
- `TEST_PLAN.md` §12 (Recommendation Engine Tests)

---
## ADR-018

### No ML in MVP

**Status:** Decided
**Date:** Planning Phase
**Decided In:** PRD.md, ARCHITECTURE.md, TASKS.md

#### Context

ML-based recommendations, personalisation, or ranking have been discussed as potential future enhancements. A definitive decision is needed on MVP inclusion.

#### Decision

**No ML libraries, ML models, collaborative filtering, AI ranking, probabilistic scoring, or external AI APIs are introduced in the MVP.** This is a hard rule with no exceptions.

- No `tensorflow`, `@tensorflow/tfjs`, `onnxruntime`, `langchain`, or similar packages in `package.json`.
- Recommendation logic is fully deterministic (see ADR-017).
- `EventLog` telemetry is collected but not used for ML training in MVP — preserved for future use.

#### Alternatives Considered

| Alternative | Reason Rejected |
| :--- | :--- |
| **Lightweight collaborative filtering** | Requires meaningful interaction history not available at MVP launch |
| **External AI ranking API** | Additional vendor dependency; latency; not justified for MVP user base |
| **Embedding-based similarity** | Requires vector database and embedding model; over-engineered for the metadata-based requirements |

#### Consequences

- **Positive:** Zero ML dependency surface. No model versioning or serving infrastructure.
- **Positive:** Recommendation tests are fully deterministic — no probabilistic test cases.
- **Negative:** Recommendations cannot self-improve from user behaviour in MVP.
- **Future Scope:** Post-MVP `EventLog` data may inform a hybrid or ML-based approach. A new ADR is required before any ML implementation.

#### Related

- `PRD.md` §8 (Recommendations), §15 (Post-MVP features)
- `ARCHITECTURE.md` §9 (Recommendation engine)
- `TASKS.md` TV-13-001 to TV-13-004 (acceptance criteria: no ML)
- `TEST_PLAN.md` REC-010 (grep verification: no ML imports)

---
## ADR-019

### Behavioural Telemetry via `EventLog`

**Status:** Decided
**Date:** Planning Phase
**Decided In:** ARCHITECTURE.md, PRD.md

#### Context

Two Valley requires analytics data to understand user behaviour and provide admin insights. The telemetry system must work for both authenticated users and anonymous guests, and must not block the UI.

#### Decision

Implement a **lightweight behavioural telemetry system** storing events in an `EventLog` database table via `POST /api/telemetry`.

- Event types: `product_view`, `search_query`, `wishlist_add`, `cart_add`, `checkout_start`, `purchase_completed`.
- Each event: `eventType`, `metadata` (JSON — product-level identifiers only, no PII), `sessionId`, `profileId` (null for guests), `createdAt`.
- Client-side dispatch uses `navigator.sendBeacon()` (primary) with `fetch({ keepalive: true })` as fallback — neither blocks the UI thread.
- The telemetry endpoint validates `eventType` with Zod and accepts both guest and authenticated requests.
- `EventLog` data accessible only to admin users, gated by `assertAdminSession()`.

#### Alternatives Considered

| Alternative | Reason Rejected |
| :--- | :--- |
| **Google Analytics / Mixpanel** | Data leaves the platform; privacy considerations; adds third-party script to bundle |
| **No telemetry** | Eliminates admin analytics and data foundation for future recommendation improvement |
| **Server-side event logging only** | Cannot capture all client-side events |

#### Consequences

- **Positive:** All telemetry data owned by the platform, stored in existing PostgreSQL, accessible only to admins.
- **Positive:** Non-blocking dispatch — no perceptible UI impact.
- **Positive:** Provides data foundation for post-MVP recommendation improvements without ML infrastructure now.
- **Negative:** `EventLog` accumulates indefinitely in MVP; data retention cleanup mechanism required post-MVP.
- **Constraint:** `metadata` must never contain PII.

#### Related

- `ARCHITECTURE.md` §10 (Telemetry)
- `PRD.md` §9 (Telemetry)
- `SECURITY.md` §16 (Telemetry and privacy)
- `TASKS.md` TV-14-001 to TV-14-003
- `TEST_PLAN.md` §13 (Telemetry Tests)

---
## ADR-020

### Mobile / Reduced-Motion 3D Fallback Strategy

**Status:** Decided
**Date:** Planning Phase
**Decided In:** ARCHITECTURE.md, DESIGN.md, RULES.md

#### Context

Three.js / R3F 3D canvases are performance-intensive. Mobile devices have lower GPU capabilities. Users with `prefers-reduced-motion: reduce` have indicated discomfort or health issues from motion. A fallback strategy is required.

#### Decision

3D canvases are **never rendered unconditionally**. A two-condition gate applies to every canvas:

**Condition 1 — Viewport width:** Canvases rendered only on viewports 769px and above. On 768px and below: static WebP image or CSS fallback.

**Condition 2 — Reduced-motion preference:** If `prefers-reduced-motion: reduce` is detected, canvases replaced by static fallbacks regardless of viewport width.

Specific fallback rules:
- **Hero canvas:** Static WebP on mobile or reduced-motion.
- **Tea particle canvas:** CSS keyframe animation fallback on mobile; no animation on reduced-motion.
- **PDP 3D viewer:** Opt-in only; not pre-loaded; falls back to static gallery if no 3D asset exists.

All `motion/react` animations also respond to `prefers-reduced-motion`.

#### Alternatives Considered

| Alternative | Reason Rejected |
| :--- | :--- |
| **3D on all devices** | Unacceptable performance on mid/low-range mobile; vestibular harm for reduced-motion users |
| **3D on mobile with quality reduction** | Still renders a canvas; does not resolve the accessibility concern |
| **No 3D at all** | Rejects a defined brand differentiator; acceptable fallback does not mean removing desktop 3D |

#### Consequences

- **Positive:** All users receive a functional, appropriate experience regardless of device or accessibility preference.
- **Positive:** WCAG 2.1 AA `prefers-reduced-motion` requirement satisfied.
- **Positive:** Three.js is dynamically imported; mobile devices never download it.
- **Negative:** Each 3D feature requires two implementations (canvas + fallback), increasing effort.
- **Constraint:** `TEST_PLAN.md` 3D-002, 3D-003, 3D-006 verify fallbacks on mobile and reduced-motion.

#### Related

- `ARCHITECTURE.md` §7 (3D)
- `DESIGN.md` §6.2 (3D/motion principles)
- `RULES.md` §7 (Motion/3D usage rules), §13 (Accessibility)
- `TEST_PLAN.md` §17, A11Y-018 to A11Y-020

---
## ADR-021

### Premium Two Valley Visual System

**Status:** Decided
**Date:** Planning Phase
**Decided In:** DESIGN.md

#### Context

Two Valley is positioned as a premium artisan brand bridging perfumery and tea. The visual identity must communicate luxury, sensory depth, and artisanal craft. A coherent design system is required for consistency across all UI surfaces.

#### Decision

Define and implement the **Two Valley Visual System** as documented in `DESIGN.md`:

**Colour Palette:**
- Primary: Forest Green (#1B4332), Ivory (#FDFBF7), Muted Gold (#C9A84C)
- Supporting: Warm White, Charcoal, Blush Rose, Muted Teal

**Typography:**
- Editorial/headings: **Playfair Display** (serif)
- Luxury accent: **Cinzel** (serif, selective use)
- UI/body: **Inter** (sans-serif)
- Loaded via Google Fonts with `next/font` for performance optimisation

**Design Principles:** Asymmetric, editorial layouts; generous whitespace; natural texture overlays; split-screen hero; horizontal scrolling product grids.

**Motion Language:** Slow, intentional transitions (300-600ms); scroll-revealed sections; no gratuitous or rapid animation.

All design tokens defined as CSS custom properties in `globals.css` and mapped to Tailwind utilities via `tailwind.config.ts`.

#### Alternatives Considered

| Alternative | Reason Rejected |
| :--- | :--- |
| **Generic e-commerce template** | Inconsistent with premium brand positioning |
| **Dark mode as primary** | Forest Green + Ivory creates a sophisticated light-mode identity; dark mode is a post-MVP enhancement |
| **Monospace for prices** | Rejected (DESIGN.md correction); price typography uses Inter with appropriate weight |

#### Consequences

- **Positive:** Documented design system ensures brand consistency without per-component design decisions.
- **Positive:** Design tokens make global theme changes trivial.
- **Negative:** Custom brand colours require manual WCAG contrast verification before release.
- **Constraint:** No ad-hoc colour values in component files; all values must reference design tokens.

#### Related

- `DESIGN.md` (entire document)
- `RULES.md` §5 (Tailwind/design-token usage), §13 (Accessibility)
- `TEST_PLAN.md` A11Y-001 to A11Y-005 (contrast verification)
- `TASKS.md` TV-05-002

---
## ADR-022

### Dependency and Over-Engineering Guardrails

**Status:** Decided
**Date:** Planning Phase
**Decided In:** RULES.md

#### Context

Two Valley must remain a maintainable, lean codebase. Unnecessary dependencies, premature abstraction, and library bloat degrade developer experience and security posture.

#### Decision

Adopt the **dependency guardrails** defined in `RULES.md` Section 15:

**Approved core dependencies** (no additional justification required):
`next`, `react`, `react-dom`, `typescript`, `@supabase/supabase-js`, `@supabase/ssr`, `@prisma/client`, `prisma`, `tailwindcss`, `postcss`, `autoprefixer`, `motion` (for `motion/react`), `three`, `@react-three/fiber`, `@react-three/drei`, `zustand`, `zod`.

**Explicitly prohibited:**
- `framer-motion` (use `motion/react` instead)
- `axios` (use native `fetch`)
- `lodash` (use native JS array/object methods)
- `moment` (use `date-fns` or native `Intl.DateTimeFormat`)
- Any ML library (`tensorflow`, `onnxruntime`, etc.) in MVP
- Any package duplicating approved list functionality

**New dependency rule:** Every proposed new package requires written justification covering: (1) what problem it solves, (2) why approved packages cannot solve it, (3) maintenance status, (4) bundle size impact.

#### Alternatives Considered

| Alternative | Reason Rejected |
| :--- | :--- |
| **No dependency policy** | Leads to dependency creep; increases bundle size, security surface, and maintenance burden |
| **Allow any dependency without review** | Same risks as no policy |

#### Consequences

- **Positive:** Lean, auditable dependency tree. Faster builds. Smaller client bundles. Reduced security audit surface.
- **Positive:** Forces use of built-in platform capabilities before reaching for libraries.
- **Negative:** Occasional friction when a useful library is not on the approved list.
- **Constraint:** `npm audit --production` returning zero critical/high CVEs is a hard deployment gate. Unapproved packages block deployment per `PERF-007`.

#### Related

- `RULES.md` §15 (Dependency guardrails)
- `SECURITY.md` §19 (Dependency and security update expectations)
- `TEST_PLAN.md` PERF-007
- `TASKS.md` TV-22-001 (Dependency audit)

---
## ADR-023

### Replace MVP 3D/WebGL with Optimized Imagery and Motion

**Status:** Decided (Supersedes ADR-007)
**Date:** Post-Audit Architecture Refinement
**Decided In:** Architecture Change Plan

#### Context
Three.js / React Three Fiber dependencies added ~500KB+ JS bundle footprint, increased WebGL initialization latency, and impacted mobile performance across responsive viewports.

#### Decision
Completely remove `@react-three/fiber`, `@react-three/drei`, `three`, and `@types/three` from the project. Replace 3D canvases with high-resolution, responsive static photography served via Cloudinary and Next.js `<Image>`, combined with subtle `motion/react` animations.

#### Consequences
- **Positive:** Eliminates ~500KB+ JS client bundle footprint.
- **Positive:** Instant initial page render with fast TTFB and improved LCP.
- **Positive:** Seamless responsive behavior across all mobile device screen widths without WebGL context losses.

---

## ADR-024

### Replace Supabase Storage with Cloudinary for Product Images

**Status:** Decided (Supersedes ADR-005)
**Date:** Post-Audit Architecture Refinement
**Decided In:** Architecture Change Plan

#### Context
Supabase Storage bucket management added unneeded complexity. Cloudinary provides automated responsive image resizing, format optimization (`f_auto`, `q_auto`), and global CDN edge distribution.

#### Decision
Adopt Cloudinary as the primary image storage and CDN optimization provider for product images. Admin uploads use server-signed signatures via `generateCloudinarySignatureAction()` protected by `assertAdminSession()`. The resulting secure HTTPS CDN URLs are stored in `ProductImage.url` in Prisma PostgreSQL.

#### Consequences
- **Positive:** Automatic WebP/AVIF format selection and image size optimization.
- **Positive:** Secure server-signed admin uploads with no exposed secrets.
- **Positive:** Zero database schema changes required — `ProductImage.url` continues to store string HTTPS URLs.

---

## ADR-025

### Customer Authentication Architecture Upgrade (Email + Password + Email OTP & Google OAuth)

**Status:** Decided (Supersedes previous Phone/SMS requirement)
**Date:** Post-Audit Authentication Refinement
**Decided In:** Authentication System Upgrade Requirement

#### Context
The customer authentication flow required refinement to prioritize standard, passwordless-capable email verification and modern Google OAuth single-sign-on without requiring third-party SMS providers or phone collection forms. Furthermore, strict separation between `CUSTOMER` and `ADMIN` roles must be maintained without any auto-promotion or credential leaks across route access points.

#### Decision
1. **Primary Authentication Authority:** Retain Supabase Auth (`@supabase/ssr`) as the single source of identity. Prisma `Profile` stores domain application data and user roles (`CUSTOMER` vs `ADMIN`).
2. **Registration & Verification Flow:** Customer registration collects Name, Email, Password, and Confirm Password (phone field eliminated). Registration executes `supabase.auth.signUp()` with email verification required. Upon registration, user is navigated to `/verify-email` to enter the 6-digit Email OTP via `supabase.auth.verifyOtp({ type: 'signup' })`.
3. **Google OAuth Flow:** Implement Google OAuth via `supabase.auth.signInWithOAuth()` targeting PKCE callback route `/auth/callback`. The callback exchanges authorization code for a session, syncs/creates a Prisma `Profile` (defaulting to `Role.CUSTOMER` and preserving existing `ADMIN` roles), and migrates guest sessions.
4. **Strict Role Isolation:** `/account` route enforces Supabase Auth session, email confirmation, and strict `Role.CUSTOMER` authorization. If an authenticated `ADMIN` user visits `/account`, they are automatically redirected to `/admin`.
5. **No SMS Provider:** Phone/SMS OTP is explicitly removed from registration, login schemas, and UI components.

#### Consequences
- **Positive:** Zero dependency on paid SMS gateways or telecom infrastructure.
- **Positive:** Native Supabase Auth handling of email confirmation and OAuth PKCE PKCE exchange without custom DB token tables.
- **Positive:** Bulletproof role isolation preventing customer/admin account role pollution.
- **Positive:** Seamless guest-to-authenticated wishlist and event migration.

---
## Future Considerations (Not MVP Decisions)

The following topics are **explicitly deferred** to post-MVP. A new ADR must be created and approved before any of these are implemented:

| Topic | Notes |
| :--- | :--- |
| **ML / AI Recommendations** | Post-MVP; requires EventLog data maturity and a new ADR. See ADR-018. |
| **Multi-Factor Authentication (MFA)** | Post-MVP enhancement to Supabase Auth. See ADR-003. |
| **Supabase Row-Level Security (RLS)** | Optional post-MVP hardening; does not protect Prisma queries. See ADR-004, SECURITY.md §8.2. |
| **Full Content Security Policy (CSP)** | Post-MVP; must not break Supabase Auth flows or payment provider redirects. See SECURITY.md §13.4. |
| **Dark Mode** | Post-MVP theme extension; design token system supports it. See ADR-021. |
| **AR / Interactive 3D Studio** | Post-MVP per PRD.md §15. |
| **Audit Log Table** | Structured admin mutation logging; post-MVP. See SECURITY.md §18.3. |
| **Data Retention Cleanup** | EventLog accumulation management; post-MVP scheduled job or admin tool. See SECURITY.md §16.4. |
| **Application-Layer Rate Limiting** | Post-MVP; platform defaults provide baseline. See SECURITY.md §10.4. |
| **Multi-Currency / International Shipping** | Post-MVP per PRD.md §15. |
| **Native Mobile Apps** | Out of scope for the current product. |

---
