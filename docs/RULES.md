# Project Engineering & Coding Standards (RULES.md)

## Project Name: Two Valley
**Brand Positioning:** Premium Natural Lifestyle E-Commerce (Perfumes & Craft Teas)  
**Document Version:** 1.1  
**Status:** Pending Review  

---

## 1. Overview & Purpose

This document establishes the binding engineering standards, coding conventions, architectural boundaries, and operational rules for the **Two Valley** project. Every team member and automated assistant must strictly adhere to these guidelines to maintain clean, scalable, type-safe, and visually exquisite code.

---

## 2. Core Engineering Philosophy & Vibe Coding Principles

1. **Plan Before Execution:** Always establish approved specifications (`PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `RULES.md`) before creating application files or writing code.
2. **Zero Over-Engineering:** Build strictly for current requirements. Do not invent complex abstractions, microservices, or machine learning pipelines unless explicitly mandated by the PRD.
3. **No Dependency Bloat:** Rely on approved, core stack technologies (Next.js, Tailwind, Prisma, Supabase, Motion, R3F, Zod). Do not introduce unvetted third-party packages.
4. **Empirical Verification:** Never declare a feature or bug fix complete without running builds, type checks, or runtime verification.

---

## 3. TypeScript & Type Safety Rules

* **Strict Mode Enabled:** `tsconfig.json` must enforce `"strict": true`, `"noImplicitAny": true`, `"strictNullChecks": true`, and `"noUnusedLocals": true`.
* **Explicit Types Required:** Avoid using `any` under any circumstances. Use `unknown` with runtime type narrowing or generic parameter constraints when types are uncertain.
* **Centralized Domain Types (`src/types/index.ts`):** Define shared interfaces for products, sensory attributes, cart line items, orders, telemetry payloads, and payment gateway interfaces in `src/types/index.ts`.
* **Prisma Type Inference:** Export and reuse Prisma-generated types (`import type { Product, Order, Profile } from '@prisma/client'`) for database entities rather than creating duplicate manual type definitions.

---

## 4. Component Architecture Rules

### 4.1 Server Components by Default
* All Next.js App Router components (`page.tsx`, `layout.tsx`, static sections) must remain **React Server Components (RSC)** by default to maximize SEO and eliminate client bundle bloat.
* Do **NOT** add `'use client'` at the top of a file unless the component genuinely requires client-side interactivity, React state (`useState`, `useReducer`), browser APIs, dynamic 3D rendering, or animation triggers.

### 4.2 Client Component Boundaries ('use client')
* Isolate interactive elements into granular, focused client components.
* Keep client component sub-trees as small as possible. Pass server-fetched data down to client components via typed props rather than fetching data inside client components.

```typescript
// GOOD: Server Component fetching data and passing down props
// src/app/(customer)/product/[slug]/page.tsx (Server Component)
import { getProductBySlug } from '@/actions/catalogActions';
import { PDPInteractiveSection } from '@/components/catalog/PDPInteractiveSection';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  return (
    <main>
      <ProductHeader product={product} /> {/* Server Component */}
      <PDPInteractiveSection product={product} /> {/* Client Component */}
    </main>
  );
}
```

---

## 5. Naming & File/Folder Conventions

### 5.1 Naming Conventions
* **React Components:** PascalCase (`ProductCard.tsx`, `PerfumeBottleCanvas.tsx`).
* **Server Actions & Utilities:** camelCase (`catalogActions.ts`, `telemetry.ts`, `storage.ts`).
* **CSS / Style Files:** kebab-case or standard module naming (`globals.css`, `brand.module.css`).
* **Folder Names:** kebab-case (`(customer)`, `product-details`, `api/telemetry`).
* **Database Models (Prisma):** PascalCase for model names (`Product`, `SensoryAttribute`); camelCase for field names (`stockQuantity`, `salePrice`).

### 5.2 Folder Structure Discipline
All source code must reside inside `src/` organized strictly according to the approved architecture layout:
* `src/actions/`: Type-safe Server Actions.
* `src/app/`: Next.js App Router pages, layouts, and API routes.
* `src/components/`: Modular UI, divided into `3d/`, `admin/`, `cart/`, `catalog/`, `checkout/`, `layout/`, `ui/`.
* `src/lib/`: Backend database singletons, payment adapters, storage helpers, Supabase clients.
* `src/types/`: Domain-wide TypeScript interfaces.

---

## 6. Styling & Design Token Rules

* **Primary Styling Engine:** Tailwind CSS utility classes combined with custom CSS design tokens.
* **Strict Palette Usage:** Use defined brand color utilities exclusively (`bg-brand-forest`, `bg-brand-ivory`, `text-brand-gold`, `bg-brand-beige`, `bg-brand-olive`). Do **NOT** introduce arbitrary hex colors in component classes.
* **Custom CSS Variables (`src/app/globals.css`):** Keep design tokens centralized:
  * `--color-forest-green`: `#1E3A2B`
  * `--color-olive-green`: `#4A5D4E`
  * `--color-ivory-cream`: `#FDFBF7`
  * `--color-muted-gold`: `#D4AF37`
  * `--color-warm-beige`: `#F5EFE6`
* **Typography Rule:** Headings use `Playfair Display` (or `Cinzel` for luxury accents). Body and UI elements use `Inter`. Do **NOT** use `Montserrat` or custom monospace fonts for price tags.

---

## 7. Motion & 3D Performance Rules

### 7.1 Motion Import Standard
* All UI animations must use **Motion for React v12+**:
  ```typescript
  import { motion, AnimatePresence } from "motion/react";
  ```
* Do **NOT** import from the deprecated `framer-motion` package name.

### 7.2 3D Canvas Isolation & Selective Enhancement
* **Selective Usage:** 3D rendering is a selective enhancement for hero displays and flagship PDP showcases. Product cards and basic listings must use 2D media and CSS hover tilts.
* **Dynamic Client-Only Loading:** All Three.js / React Three Fiber canvas components must be dynamically imported with `ssr: false`:
  ```typescript
  import dynamic from 'next/dynamic';
  
  export const PerfumeBottleViewer = dynamic(
    () => import('./PerfumeBottleCanvasInner'),
    { ssr: false, loading: () => <StaticProductFallbackImage /> }
  );
  ```
* **Mobile / Low-Power Fallback:** On screens $\le 768\text{px}$ or when `prefers-reduced-motion: reduce` is active, 3D canvases must automatically unmount and render a static WebP image fallback to preserve GPU battery life.

---

## 8. Supabase & Auth Security Rules

* **Supabase Client Helpers (`@supabase/ssr`):**
  * Browser context: Use `createBrowserClient()`.
  * Server context (RSC, Server Actions, Route Handlers): Use `createServerClient()`.
* **Zero Custom Hashing:** Rely entirely on Supabase Auth for credential handling and session management. Do **NOT** create custom password hashing or manual JWT signers.
* **Role Verification:** User roles (`CUSTOMER` vs `ADMIN`) are stored in the `Profile` database table linked to `auth.users.id`.
* **Guest Session Persistence:** Generate a persistent `session_id` cookie for anonymous visitors to track carts, wishlists, and telemetry prior to authentication.

---

## 9. Database & Prisma Rules

### 9.1 Monetary Precision (No Floats)
* All financial fields (`price`, `salePrice`, `priceOverride`, `subtotal`, `tax`, `shippingFee`, `total`, `unitPrice`, `totalPrice`) **MUST** use native PostgreSQL `Decimal` (`@db.Decimal(10, 2)`).
* Floating-point primitive types (`number`) must be converted to `Decimal` string representations before persisting to prevent rounding errors.

### 9.2 Structured JSON Fields
* `Order.shippingAddress` **MUST** be modeled as a native PostgreSQL `Json` object containing recipient name, address lines, city, state, postal code, country, and contact phone. Do not serialize address objects into plain text strings.

### 9.3 Wishlist Uniqueness Constraints
* `WishlistItem` must enforce dual unique index constraints in `schema.prisma`:
  * `@@unique([profileId, productId])` for authenticated users.
  * `@@unique([sessionId, productId])` for guest users.

---

## 10. API & Server Action Rules

### 10.1 Independent Admin Authorization (Defense in Depth)
* Next.js middleware (`src/middleware.ts`) provides an initial request-level protection layer for `/admin/*` routes.
* **MANDATORY:** Every admin Server Action (`src/actions/adminActions.ts`) and protected admin API Route Handler (`src/app/api/admin/*`) **MUST re-verify the user's session and check `Profile.role === 'ADMIN'` independently** before performing data operations.

```typescript
// Mandatory guard helper pattern
export async function assertAdminSession() {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");

  const profile = await db.profile.findUnique({
    where: { id: user.id },
    select: { role: true }
  });
  if (!profile || profile.role !== "ADMIN") throw new Error("Forbidden");
  
  return user;
}
```

### 10.2 Return Signature Standard
Server Actions should return predictable, typed result objects:
```typescript
export type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };
```

---

## 11. Validation, Error Handling & Logging

* **Approved Core Validation Dependency (Zod):** Zod is explicitly designated as an approved core project dependency for input validation. Validate all incoming user inputs (login forms, checkout address forms, product CRUD) using Zod schemas before database processing, fully consistent with the project's dependency guardrails.
* **User-Facing Error Messages:** Sanitized error strings returned to the client. Internal database stack traces must never leak to the UI.
* **Error Boundaries:** Use Next.js `error.tsx` boundaries at route segment roots to gracefully catch runtime errors.

---

## 12. Accessibility (a11y) Requirements

* **Contrast QA Validation:** All final rendered color combinations must be validated against WCAG 2.1 AA contrast requirements ($4.5:1$ text contrast minimum) during implementation and QA.
* **Keyboard Focus Indicators:** Interactive controls must feature visible Muted Gold (`#D4AF37`) focus rings.
* **Screen Reader ARIA:** All icon buttons (search trigger, cart toggle, wishlist heart) and 3D canvas viewports must have explicit `aria-label` descriptors.
* **Reduced Motion Query:** Respect `prefers-reduced-motion` media queries by disabling unneeded transitions and particle canvas animations.

---

## 13. Responsive & Mobile Requirements

* **Mobile-First Layouts:** Build layouts starting from $320\text{px}$ viewport width up to $1536\text{px}+$.
* **Touch Target Sizes:** Interactive buttons and links on touch devices must have a minimum touch target size of $44 \times 44\text{px}$.
* **Image Optimization:** Always use `next/image` with explicit `sizes` props, responsive `srcset`, WebP/AVIF generation, and layout placeholders to prevent Cumulative Layout Shift (CLS).

---

## 14. Security & Environment Variable Rules

* **Secret Environment Variables:** Secrets such as `SUPABASE_SERVICE_ROLE_KEY` and `PAYMENT_GATEWAY_SECRET` must **NEVER** be prefixed with `NEXT_PUBLIC_`.
* **Public Client Keys:** Only safe client credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) may use the `NEXT_PUBLIC_` prefix.
* **Git Safety:** `.env` and `.env.local` must be listed in `.gitignore`. Commit only `.env.example` with sanitized placeholder values.

---

## 15. Dependency & Over-Engineering Guardrails

* **Zero Unnecessary Packages:** Do not install utility packages for trivial tasks (e.g., do not install `lodash` for simple array operations; do not install external address autocomplete services).
* **Approved Core Stack:** Next.js, React 19, TypeScript, Tailwind CSS, Prisma ORM, Supabase (`@supabase/ssr`, `@supabase/supabase-js`), Motion (`motion/react`), Three.js / React Three Fiber, and Zod.
* **Payment Provider Neutrality:** Keep payment gateway code isolated behind the `PaymentAdapter` interface (`src/lib/payments/adapter.ts`).
* **No Machine Learning in MVP:** Keep recommendation logic strictly content-based (Jaccard note similarity + attribute matching). Do not install ML libraries.

---

## 16. Testing & Quality Assurance Expectations

* **Type Check Verification:** Run `tsc --noEmit` before proposing changes to verify type clean builds.
* **Build Verification:** Execute `npm run build` to ensure zero compilation or Server Component boundary errors.
* **Flow Verification:** Test key customer flows (Catalog filtering, PDP notes view, Cart slide-over, Checkout address form) and admin flows (Product CRUD, Order updates) thoroughly.

---
