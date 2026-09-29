# Project Development Task Breakdown (TASKS.md)

## Project Name: Two Valley
**Brand Positioning:** Premium Natural Lifestyle E-Commerce (Perfumes & Craft Teas)  
**Document Version:** 1.1  
**Status:** Pending Review  

---

## Legend

| Field | Description |
| :--- | :--- |
| **Task ID** | Unique task identifier (`TV-PHASE-###`) |
| **Phase** | Development phase number and name |
| **Task Name** | Short descriptive label |
| **Objective** | What this task accomplishes |
| **Dependencies** | Task IDs that must be complete first |
| **Expected Output** | Concrete files or artifacts produced |
| **Acceptance Criteria** | Conditions that define task completion |
| **Priority** | `Critical` / `High` / `Medium` / `Low` |
| **Scope** | `MVP` / `Future` |
| **Status** | `Pending` / `In Progress` / `Complete` |

---

## Phase 1 — Project Initialization & Environment Setup

---

### TV-01-001
- **Phase:** 1 — Project Initialization
- **Task Name:** Scaffold Next.js Application
- **Objective:** Initialize the Two Valley Next.js 14+ App Router project with TypeScript, Tailwind CSS, and correct project directory structure.
- **Dependencies:** None
- **Expected Output:** Working Next.js project at `two-valley/` with App Router enabled, TypeScript strict mode configured, Tailwind CSS installed and configured with brand design tokens.
- **Acceptance Criteria:**
  - `npx create-next-app` scaffolded with App Router, TypeScript, Tailwind CSS.
  - `tsconfig.json` has `"strict": true`, `"noImplicitAny": true`, `"strictNullChecks": true`, `"noUnusedLocals": true`.
  - `tailwind.config.ts` extended with `brand.*` color tokens matching `DESIGN.md` palette.
  - `src/app/globals.css` contains all CSS custom property design tokens.
  - `npm run dev` starts without errors.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-01-002
- **Phase:** 1 — Project Initialization
- **Task Name:** Configure Folder Structure
- **Objective:** Establish the full `src/` folder architecture per `ARCHITECTURE.md` Section 16.
- **Dependencies:** TV-01-001
- **Expected Output:** Empty placeholder files/folders created for `src/actions/`, `src/app/(auth)/`, `src/app/(customer)/`, `src/app/admin/`, `src/app/api/`, `src/components/3d/`, `src/components/admin/`, `src/components/cart/`, `src/components/catalog/`, `src/components/checkout/`, `src/components/layout/`, `src/components/ui/`, `src/lib/supabase/`, `src/lib/payments/`, `src/types/`.
- **Acceptance Criteria:**
  - Folder tree matches the approved architecture layout exactly.
  - `src/types/index.ts` exists as a starter file.
  - No application logic present; structure only.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-01-003
- **Phase:** 1 — Project Initialization
- **Task Name:** Configure Environment Variables & `.env.example`
- **Objective:** Create `.env.example` with all required environment variable placeholders and ensure `.env.local` is git-ignored.
- **Dependencies:** TV-01-001
- **Expected Output:** `.env.example` with placeholder values for `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`, `PAYMENT_GATEWAY_KEY`, `PAYMENT_GATEWAY_SECRET`, `PAYMENT_WEBHOOK_SECRET`.
- **Acceptance Criteria:**
  - `.env.example` committed to repository with sanitized placeholder values only.
  - `.env.local` and `.env` listed in `.gitignore`.
  - `SUPABASE_SERVICE_ROLE_KEY` and `PAYMENT_GATEWAY_SECRET` do NOT use `NEXT_PUBLIC_` prefix.
  - Each variable includes an inline comment describing its purpose.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-01-004
- **Phase:** 1 — Project Initialization
- **Task Name:** Install Approved Core Dependencies
- **Objective:** Install all approved core packages as specified in `RULES.md` Section 15.
- **Dependencies:** TV-01-001
- **Expected Output:** `package.json` containing Prisma, Supabase (`@supabase/supabase-js`, `@supabase/ssr`), Motion (`motion`), Three.js, React Three Fiber (`@react-three/fiber`, `@react-three/drei`), Zustand, and Zod.
- **Acceptance Criteria:**
  - All packages install without peer dependency conflicts.
  - No unapproved packages present.
  - `npm run dev` still starts cleanly post-install.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-01-005
- **Phase:** 1 — Project Initialization
- **Task Name:** Configure Global CSS & Typography
- **Objective:** Import Google Fonts (`Playfair Display`, `Cinzel`, `Inter`) and apply global typography and reset styles.
- **Dependencies:** TV-01-001, TV-01-002
- **Expected Output:** `src/app/globals.css` and `src/app/layout.tsx` with Next.js `next/font/google` imports for all approved typefaces.
- **Acceptance Criteria:**
  - `Playfair Display` renders on heading elements.
  - `Inter` renders on body/UI elements.
  - `Cinzel` available as optional luxury accent via CSS class.
  - Font loading uses `next/font/google` (no CDN `<link>` tags).
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-01-006
- **Phase:** 1 — Project Initialization
- **Task Name:** Create `docs/TEST_PLAN.md`
- **Objective:** Document the project's testing strategy, scope, and QA acceptance criteria covering all major customer and admin flows.
- **Dependencies:** None (documentation task, can be drafted in parallel with scaffolding)
- **Expected Output:** `docs/TEST_PLAN.md` covering: test scope (flows to test), test environment setup, customer flow test cases (catalog, PDP, cart, checkout, auth, wishlist, recommendations, telemetry), admin flow test cases (product CRUD, inventory, orders, review moderation), accessibility test checklist, and responsive breakpoint test matrix.
- **Acceptance Criteria:**
  - All critical customer and admin flows represented as test cases.
  - Test plan references approved task IDs from `TASKS.md` for traceability.
  - No application code written.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-01-007
- **Phase:** 1 — Project Initialization
- **Task Name:** Create `docs/SECURITY.md`
- **Objective:** Document the Two Valley security model, threat boundaries, authorization rules, and security checklist for implementation and review.
- **Dependencies:** None (documentation task)
- **Expected Output:** `docs/SECURITY.md` covering: authentication boundary (Supabase Auth), admin authorization model (`assertAdminSession()` pattern), environment variable classification (public vs secret), webhook signature verification requirements, input validation requirements (Zod), error sanitization rules, HTTPS enforcement, and pre-deployment security checklist.
- **Acceptance Criteria:**
  - Document references `ARCHITECTURE.md` Section 14 and `RULES.md` Sections 8, 10, 14.
  - Security checklist items map to Phase 21 task IDs.
  - No application code written.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-01-008
- **Phase:** 1 — Project Initialization
- **Task Name:** Create `docs/DECISIONS.md`
- **Objective:** Establish a living Architectural Decision Record (ADR) log documenting all significant technical decisions made for Two Valley.
- **Dependencies:** None (documentation task)
- **Expected Output:** `docs/DECISIONS.md` with initial ADR entries for: framework choice (Next.js App Router), database choice (Supabase PostgreSQL over SQLite), ORM choice (Prisma), auth choice (Supabase Auth over custom JWT), styling approach (Tailwind + CSS custom properties), animation library (Motion `motion/react`), recommendation approach (content-based, no ML in MVP), payment abstraction (PaymentAdapter interface, provider-neutral).
- **Acceptance Criteria:**
  - Each ADR entry includes: decision title, date, context, decision made, rationale, and alternatives considered.
  - Document kept up-to-date as new significant decisions are made.
  - No application code written.
- **Priority:** Medium
- **Scope:** MVP
- **Status:** Complete

---

### TV-01-009
- **Phase:** 1 — Project Initialization
- **Task Name:** Create `docs/MEMORY.md`
- **Objective:** Create a living project memory and context document summarizing key project facts, approved decisions, and important reference points for ongoing development.
- **Dependencies:** TV-01-006, TV-01-007, TV-01-008
- **Expected Output:** `docs/MEMORY.md` containing: project overview summary, approved tech stack, brand palette hex values, key architectural constraints, approved dependency list, current phase status, links to all planning documents (`PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `RULES.md`, `TASKS.md`, `TEST_PLAN.md`, `SECURITY.md`, `DECISIONS.md`).
- **Acceptance Criteria:**
  - Serves as a fast-reference context document for any developer or AI assistant resuming work.
  - Updated at the end of each completed phase.
  - No application code written.
- **Priority:** Medium
- **Scope:** MVP
- **Status:** Complete

---

### TV-01-010
- **Phase:** 1 — Project Initialization
- **Task Name:** Create `README.md`
- **Objective:** Write the project `README.md` at the repository root covering project overview, local setup instructions, environment variable configuration, development workflow, and project documentation index.
- **Dependencies:** TV-01-001, TV-01-003
- **Expected Output:** `README.md` at repository root with: project description, prerequisites (Node.js, npm, Supabase CLI), local setup steps (`npm install`, `.env.local` setup, `prisma migrate dev`, `prisma db seed`, `npm run dev`), environment variable table referencing `.env.example`, documentation index (links to all `docs/*.md` files), and contribution notes.
- **Acceptance Criteria:**
  - A developer following `README.md` instructions can run the project locally from scratch.
  - All setup commands are accurate and match the approved architecture.
  - No application code written.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

## Phase 2 — Database / Prisma / Supabase Setup

---

### TV-02-001
- **Phase:** 2 — Database Setup
- **Task Name:** Create Supabase Project
- **Objective:** Provision a Supabase project for Two Valley and obtain all required connection strings and API keys.
- **Dependencies:** TV-01-003
- **Expected Output:** Active Supabase project with PostgreSQL database. `.env.local` populated with real `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- **Acceptance Criteria:**
  - Supabase project accessible via dashboard.
  - Connection strings tested and operational.
  - Service role key secured (never client-exposed).
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-02-002
- **Phase:** 2 — Database Setup
- **Task Name:** Define Prisma Schema
- **Objective:** Write the complete `prisma/schema.prisma` per the approved schema in `ARCHITECTURE.md` Section 5.3.
- **Dependencies:** TV-01-004, TV-02-001
- **Expected Output:** `prisma/schema.prisma` containing `Profile`, `Category`, `Product`, `ProductVariant`, `ProductImage`, `SensoryAttribute`, `WishlistItem`, `Order`, `OrderItem`, `Review`, and `EventLog` models with all correct field types, enums, relations, indexes, and constraints.
- **Acceptance Criteria:**
  - All monetary fields use `Decimal @db.Decimal(10, 2)`.
  - `Order.shippingAddress` typed as `Json`.
  - `WishlistItem` has `@@unique([profileId, productId])` and `@@unique([sessionId, productId])`.
  - `EventLog` has indexes on `sessionId`, `profileId`, `eventType`.
  - `prisma validate` passes with zero errors.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-02-003
- **Phase:** 2 — Database Setup
- **Task Name:** Run Initial Prisma Migration
- **Objective:** Execute the first Prisma migration against Supabase PostgreSQL to create all database tables.
- **Dependencies:** TV-02-002
- **Expected Output:** Migration files in `prisma/migrations/` and all tables created in Supabase PostgreSQL.
- **Acceptance Criteria:**
  - `prisma migrate dev` runs without errors.
  - All tables visible in Supabase dashboard table editor.
  - `prisma studio` opens and displays all models.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-02-004
- **Phase:** 2 — Database Setup
- **Task Name:** Configure Prisma Client Singleton
- **Objective:** Create the `src/lib/db.ts` Prisma client singleton to prevent connection pool exhaustion in development.
- **Dependencies:** TV-02-003
- **Expected Output:** `src/lib/db.ts` exporting a singleton `db` instance of `PrismaClient` with global caching for development environments.
- **Acceptance Criteria:**
  - `import { db } from '@/lib/db'` works in Server Components and Server Actions.
  - No multiple Prisma client instances created during hot reload.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-02-005
- **Phase:** 2 — Database Setup
- **Task Name:** Configure Supabase Client Helpers
- **Objective:** Create `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, and `src/lib/supabase/middleware.ts` using `@supabase/ssr`.
- **Dependencies:** TV-01-004, TV-02-001
- **Expected Output:** Three Supabase helper files: browser client (`createBrowserClient`), server client (`createServerClient`), and middleware session refresher.
- **Acceptance Criteria:**
  - Browser client correctly initialized for client components.
  - Server client reads/refreshes session cookies in RSC and Server Actions.
  - No raw Supabase credentials hardcoded; uses environment variables only.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-02-006
- **Phase:** 2 — Database Setup
- **Task Name:** Create Seed Script
- **Objective:** Write `prisma/seed.ts` to populate the initial Two Valley catalog (8–9 perfumes, 5–6 teas) with complete sensory attributes, metadata, images, and pricing.
- **Dependencies:** TV-02-003, TV-02-004
- **Expected Output:** `prisma/seed.ts` with complete launch catalog data including `Category`, `Product`, `ProductVariant`, `ProductImage`, `SensoryAttribute` records. Each product includes `mood`, `occasion`, `useCase`, `pairingTags`, `tags`.
- **Acceptance Criteria:**
  - `prisma db seed` executes without errors.
  - All seeded products visible in `prisma studio`.
  - Perfume products have `top_notes`, `middle_notes`, `base_notes` as `SensoryAttribute` records.
  - Tea products have `flavour_notes` and `steepingGuide` populated.
  - All `price` fields are valid `Decimal` values.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

## Phase 3 — Authentication & Authorization

---

### TV-03-001
- **Phase:** 3 — Authentication
- **Task Name:** Configure Next.js Middleware for Auth & Session
- **Objective:** Implement `src/middleware.ts` to refresh Supabase session cookies on all requests and protect `/admin/*` routes.
- **Dependencies:** TV-02-005
- **Expected Output:** `src/middleware.ts` with Supabase session refresh logic and route matcher redirecting unauthenticated users away from `/admin/*`.
- **Acceptance Criteria:**
  - Session cookies refreshed automatically on each request.
  - Unauthenticated requests to `/admin/*` redirect to `/login`.
  - Customer-facing routes remain publicly accessible.
  - Guest `session_id` cookie generated and persisted for anonymous visitors.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-03-002
- **Phase:** 3 — Authentication
- **Task Name:** Build Login & Register Pages (UI + Logic)
- **Objective:** Create `src/app/(auth)/login/` and `src/app/(auth)/register/` pages with Supabase Auth integration.
- **Dependencies:** TV-03-001, TV-01-005
- **Expected Output:** Functional login and register pages using Supabase Auth email/password sign-in and sign-up. Validated with Zod schemas. Styled with Two Valley brand design.
- **Acceptance Criteria:**
  - New users can register and receive a confirmation email.
  - Existing users can log in and receive a valid session cookie.
  - Form validation errors display correctly (empty fields, invalid email, weak password).
  - Successful login redirects authenticated users to `/account`.
  - No custom password hashing; delegates entirely to Supabase Auth.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-03-003
- **Phase:** 3 — Authentication
- **Task Name:** Profile Table Sync (Supabase Auth → Prisma Profile)
- **Objective:** Implement logic to create a `Profile` record in the Prisma database whenever a new Supabase Auth user registers.
- **Dependencies:** TV-03-002, TV-02-004
- **Expected Output:** Server Action or Supabase database trigger that creates a `Profile` row (with `id` = `auth.users.id`, `email`, `role: CUSTOMER`) on user registration.
- **Acceptance Criteria:**
  - After registration, a `Profile` record exists in the database with `role = CUSTOMER`.
  - `Profile.id` exactly matches the Supabase Auth `user.id` (UUID).
  - No orphaned `auth.users` records without corresponding `Profile` rows.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-03-004
- **Phase:** 3 — Authentication
- **Task Name:** Implement `assertAdminSession()` Guard
- **Objective:** Create the reusable `assertAdminSession()` helper in `src/lib/supabase/server.ts` or `src/actions/adminActions.ts` per `RULES.md` Section 10.1.
- **Dependencies:** TV-03-003
- **Expected Output:** Exported `assertAdminSession()` function that verifies Supabase session and checks `Profile.role === 'ADMIN'`, throwing typed errors on failure.
- **Acceptance Criteria:**
  - Function returns authenticated user on success.
  - Throws `"Unauthorized"` when session is missing or invalid.
  - Throws `"Forbidden"` when user's `Profile.role !== 'ADMIN'`.
  - Called as first line in every admin Server Action and admin API Route Handler.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-03-005
- **Phase:** 3 — Authentication
- **Task Name:** Guest Session Migration on Login
- **Objective:** Implement server action logic that migrates `WishlistItem`, `Order`, and `EventLog` records from guest `session_id` to authenticated `profileId` on login/registration.
- **Dependencies:** TV-03-002, TV-02-004
- **Expected Output:** Server Action triggered post-login that updates guest records to associate with `profileId = user.id`.
- **Acceptance Criteria:**
  - Guest wishlist items visible in authenticated user's wishlist after login.
  - Guest event logs associated with the authenticated profile post-login.
  - No data loss of pre-login cart or wishlist activity.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

## Phase 4 — Product / Catalog System

---

### TV-04-001
- **Phase:** 4 — Product Catalog
- **Task Name:** Catalog Server Actions
- **Objective:** Implement `src/actions/catalogActions.ts` with typed server actions for product retrieval, filtering, sorting, and search.
- **Dependencies:** TV-02-004, TV-02-006
- **Expected Output:** `catalogActions.ts` with functions: `getAllProducts`, `getProductBySlug`, `getProductsByCategory`, `searchProducts`, `getFilteredProducts` (by `fragranceFamily`, `teaType`, `mood`, `occasion`, `caffeineLevel`, price range).
- **Acceptance Criteria:**
  - All functions return fully typed Prisma results including `SensoryAttribute[]`, `ProductImage[]`, and `ProductVariant[]` relations.
  - `tsc --noEmit` passes with zero errors.
  - Out-of-stock products can be optionally excluded from results.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-04-002
- **Phase:** 4 — Product Catalog
- **Task Name:** Centralized TypeScript Domain Types
- **Objective:** Define all shared domain interfaces in `src/types/index.ts`.
- **Dependencies:** TV-02-002
- **Expected Output:** `src/types/index.ts` containing `ProductWithRelations`, `CartLineItem`, `ShippingAddressStructure`, `TelemetryEvent`, `ActionResult<T>`, `PaymentInitParams`, `PaymentInitResult`, `PaymentAdapter` interface.
- **Acceptance Criteria:**
  - All types reused across actions, components, and API routes.
  - No duplicate interface definitions elsewhere in the codebase.
  - All monetary values typed as `Prisma.Decimal` or `string` (not raw `number`).
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

## Phase 5 — Home Page & Premium UI

---

### TV-05-001
- **Phase:** 5 — Home Page
- **Task Name:** Global Layout & Navigation
- **Objective:** Build `src/app/layout.tsx` and `src/components/layout/Header.tsx` with the Two Valley brand navigation.
- **Dependencies:** TV-01-005, TV-04-001
- **Expected Output:** Sticky glassmorphic navigation with logo, Perfumes/Teas/Collections/Our Story links, search trigger, wishlist icon with badge, and cart slide-over trigger.
- **Acceptance Criteria:**
  - Header is sticky on scroll with glassmorphic `backdrop-blur-md` styling.
  - All brand color tokens applied correctly (no arbitrary hex values in JSX).
  - Navigation links route correctly to category pages.
  - Cart badge count reflects Zustand store state.
  - Mobile: Navigation collapses to a drawer/hamburger.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-05-002
- **Phase:** 5 — Home Page
- **Task Name:** Announcement Bar
- **Objective:** Build the top announcement ticker bar displaying organic sourcing message and free shipping threshold.
- **Dependencies:** TV-05-001
- **Expected Output:** `src/components/layout/AnnouncementBar.tsx` styled with warm beige background and subtle typography.
- **Acceptance Criteria:**
  - Renders above the navigation header.
  - Styled per `DESIGN.md` Section 4.1.
  - Dismissible on mobile without impacting navigation layout.
- **Priority:** Medium
- **Scope:** MVP
- **Status:** Complete

---

### TV-05-003
- **Phase:** 5 — Home Page
- **Task Name:** Hero Section (Static Layout)
- **Objective:** Build the homepage hero section with split-grid brand narrative text and a static high-quality product image placeholder (3D canvas added in Phase 18).
- **Dependencies:** TV-05-001
- **Expected Output:** `src/components/layout/HeroSection.tsx` with Forest Green brand heading, brand narrative text, dual CTA buttons, and static product imagery.
- **Acceptance Criteria:**
  - Matches `DESIGN.md` Section 4.2 split-grid layout.
  - CTA buttons use correct Muted Gold (primary) and Forest Green outline (secondary) styling.
  - Static image uses `next/image` with `priority` loading for LCP optimization.
  - Responsive: Stacks vertically on mobile.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-05-004
- **Phase:** 5 — Home Page
- **Task Name:** Featured Collections Section
- **Objective:** Build a curated featured products section on the homepage displaying `isFeatured = true` products from both categories.
- **Dependencies:** TV-04-001, TV-05-001
- **Expected Output:** `src/components/catalog/FeaturedCollections.tsx` (Server Component) querying `isFeatured` products from both Perfumes and Teas.
- **Acceptance Criteria:**
  - Renders server-side without client bundle.
  - Displays at least 2 featured products per category.
  - Product card component reused from catalog component.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-05-005
- **Phase:** 5 — Home Page
- **Task Name:** Brand Storytelling Section
- **Objective:** Build the brand narrative section on the homepage covering natural extraction, organic sourcing, and two product pillars.
- **Dependencies:** TV-05-001
- **Expected Output:** Static `src/components/layout/BrandStory.tsx` section with editorial typography, botanical imagery, and Warm Beige background.
- **Acceptance Criteria:**
  - Renders as a React Server Component.
  - Typography matches hierarchy from `DESIGN.md` Section 3.2.
  - All images use `next/image` with lazy loading.
- **Priority:** Medium
- **Scope:** MVP
- **Status:** Complete

---

### TV-05-006
- **Phase:** 5 — Home Page
- **Task Name:** Footer
- **Objective:** Build the global footer with brand navigation, social links, legal links, and brand color styling.
- **Dependencies:** TV-05-001
- **Expected Output:** `src/components/layout/Footer.tsx` with Forest Green background, Ivory typography, column navigation, and brand identity.
- **Acceptance Criteria:**
  - Renders consistently across all customer-facing pages.
  - No broken links.
  - Responsive 2-column on mobile, 4-column on desktop.
- **Priority:** Medium
- **Scope:** MVP
- **Status:** Complete

---

## Phase 6 — Product Listing & Filtering

---

### TV-06-001
- **Phase:** 6 — Product Listing
- **Task Name:** Category Listing Pages
- **Objective:** Build `/perfumes` and `/teas` category page routes rendering all products in that category using a Server Component.
- **Dependencies:** TV-04-001, TV-05-001
- **Expected Output:** `src/app/(customer)/perfumes/page.tsx` and `src/app/(customer)/teas/page.tsx`.
- **Acceptance Criteria:**
  - Both pages render products server-side.
  - Correct products rendered per category.
  - Uses shared `ProductCard` component.
  - Page titles and meta descriptions set for SEO.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-06-002
- **Phase:** 6 — Product Listing
- **Task Name:** Product Card Component
- **Objective:** Build the `src/components/catalog/ProductCard.tsx` client component with hover tilt, image cross-fade, sensory note pills, and Quick View overlay.
- **Dependencies:** TV-04-001, TV-01-004
- **Expected Output:** Reusable `ProductCard` component accepting `ProductWithRelations` typed props.
- **Acceptance Criteria:**
  - Matches `DESIGN.md` Section 4.3 card specification.
  - Hover tilt uses `motion/react` (not `framer-motion`).
  - Product image uses `next/image` with `sizes` prop.
  - Sensory note pills (perfume) or origin badge (tea) render in card footer.
  - No 3D models used on product cards.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-06-003
- **Phase:** 6 — Product Listing
- **Task Name:** Filter & Sort Controls (Client Component)
- **Objective:** Build the `src/components/catalog/FilterSortPanel.tsx` client component with faceted filter UI and sort dropdown.
- **Dependencies:** TV-04-001
- **Expected Output:** Filter panel with:
  - Perfumes: `fragranceFamily`, `mood`, `occasion`, price range, availability.
  - Teas: `teaType`, `origin`, `caffeineLevel`, `mood`, `occasion`, price range, availability.
  - Sort: Newest, Price Low→High, Price High→Low, Popularity, Rating.
- **Acceptance Criteria:**
  - Filters trigger `getFilteredProducts` Server Action and update displayed results without full page reload.
  - URL search params updated for shareable filtered URLs.
  - Mobile: Filters collapse to a modal/drawer.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-06-004
- **Phase:** 6 — Product Listing
- **Task Name:** Instant Search
- **Objective:** Build `src/components/layout/SearchModal.tsx` (client component) with a search modal that queries `searchProducts` server action.
- **Dependencies:** TV-04-001, TV-05-001
- **Expected Output:** Full-screen modal search with instant results as the user types, matching product name, notes, tags, mood, occasion.
- **Acceptance Criteria:**
  - Debounced search queries (300ms) to avoid excessive server action calls.
  - Results show product name, category, and primary image.
  - Keyboard navigation of search results (arrow keys, Enter to navigate).
  - `Escape` key closes modal.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

## Phase 7 — Product Detail Page (PDP)

---

### TV-07-001
- **Phase:** 7 — Product Detail Page
- **Task Name:** PDP Route & Static Generation
- **Objective:** Build `src/app/(customer)/product/[slug]/page.tsx` with static generation via `generateStaticParams`.
- **Dependencies:** TV-04-001, TV-04-002
- **Expected Output:** Dynamically routed PDP page using `getProductBySlug` with `generateStaticParams` for all catalog slugs.
- **Acceptance Criteria:**
  - Pages pre-rendered at build time for all catalog products.
  - Correct product data renders per slug.
  - `notFound()` invoked for invalid slugs.
  - JSON-LD product schema emitted for SEO.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-07-002
- **Phase:** 7 — Product Detail Page
- **Task Name:** PDP Media Gallery
- **Objective:** Build `src/components/catalog/PDPGallery.tsx` with high-definition image viewer, thumbnail carousel, and zoom overlay.
- **Dependencies:** TV-07-001
- **Expected Output:** Client component image gallery with thumbnail strip, enlarged active image view, and zoom-on-hover overlay. Static placeholder for 3D toggle button.
- **Acceptance Criteria:**
  - All images served via `next/image`.
  - Primary image (`isPrimary = true`) displays by default.
  - Thumbnail click switches active image.
  - Zoom overlay functional on desktop.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-07-003
- **Phase:** 7 — Product Detail Page
- **Task Name:** Perfume Sensory Pyramid Widget
- **Objective:** Build `src/components/catalog/ScentPyramid.tsx` displaying top, heart, and base notes visually.
- **Dependencies:** TV-07-001
- **Expected Output:** Visual pyramid component rendering `SensoryAttribute` records by type (`TOP_NOTE`, `HEART_NOTE`, `BASE_NOTE`).
- **Acceptance Criteria:**
  - Renders only for Perfume category products.
  - Notes displayed as styled pills grouped by pyramid tier.
  - Matches `DESIGN.md` Section 4.4 specification.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-07-004
- **Phase:** 7 — Product Detail Page
- **Task Name:** Tea Steeping Guide Widget
- **Objective:** Build `src/components/catalog/SteepingGuide.tsx` displaying tea origin, temperature, steep time, and caffeine level visually.
- **Dependencies:** TV-07-001
- **Expected Output:** Steeping guide widget with iconography for temperature, time, origin, and caffeine meter.
- **Acceptance Criteria:**
  - Renders only for Tea category products.
  - Reads `steepingGuide`, `origin`, `caffeineLevel` from product data.
  - Caffeine level displayed as a visual meter (Low / Medium / High).
  - Matches `DESIGN.md` Section 4.4.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-07-005
- **Phase:** 7 — Product Detail Page
- **Task Name:** PDP Metadata Badges
- **Objective:** Build contextual `mood`, `occasion`, `use_case`, and `pairing_tags` badge display on the PDP.
- **Dependencies:** TV-07-001
- **Expected Output:** Badge row component rendering optional metadata from the `Product` model.
- **Acceptance Criteria:**
  - Badges only appear when the corresponding metadata field is non-null.
  - Styled with brand Warm Beige background and Olive Green text.
- **Priority:** Medium
- **Scope:** MVP
- **Status:** Complete

---

### TV-07-006
- **Phase:** 7 — Product Detail Page
- **Task Name:** PDP Variant Selector & Add to Cart
- **Objective:** Build the variant size selector (50ml/100ml or 100g/250g) and Add to Cart client component on the PDP.
- **Dependencies:** TV-07-001, TV-02-004
- **Expected Output:** Client component with variant selection (`ProductVariant[]`), quantity input, Add to Cart button, and Add to Wishlist button.
- **Acceptance Criteria:**
  - Selected variant updates the displayed price.
  - Out-of-stock variants are disabled.
  - Add to Cart dispatches to Zustand cart store.
  - Add to Wishlist calls `wishlistActions`.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

## Phase 8 — Wishlist

---

### TV-08-001
- **Phase:** 8 — Wishlist
- **Task Name:** Wishlist Server Actions
- **Objective:** Implement `src/actions/wishlistActions.ts` with `addToWishlist`, `removeFromWishlist`, `getWishlist` functions supporting both guest (`session_id`) and authenticated (`profileId`) users.
- **Dependencies:** TV-02-004, TV-03-001
- **Expected Output:** Type-safe server actions enforcing `@@unique([profileId, productId])` and `@@unique([sessionId, productId])` constraints.
- **Acceptance Criteria:**
  - Duplicate wishlist entries rejected (no duplicate product per user/session).
  - Guest wishlists persist across page loads via `session_id` cookie.
  - Authenticated wishlists associated with `profileId`.
  - `ActionResult<T>` return type used consistently.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-08-002
- **Phase:** 8 — Wishlist
- **Task Name:** Wishlist Page
- **Objective:** Build `src/app/(customer)/wishlist/page.tsx` rendering the user's saved items.
- **Dependencies:** TV-08-001, TV-06-002
- **Expected Output:** Wishlist page with product cards, remove button, and "Move to Cart" action.
- **Acceptance Criteria:**
  - Renders items for both guest and authenticated users.
  - Empty state message shown when wishlist is empty.
  - Remove and Move to Cart functional.
- **Priority:** Medium
- **Scope:** MVP
- **Status:** Complete

---

## Phase 9 — Cart

---

### TV-09-001
- **Phase:** 9 — Cart
- **Task Name:** Zustand Cart Store
- **Objective:** Implement the global Zustand cart store in `src/lib/store/cartStore.ts` with `localStorage` persistence.
- **Dependencies:** TV-01-004
- **Expected Output:** `cartStore.ts` with `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `getCartTotal` functions and `localStorage` syncing.
- **Acceptance Criteria:**
  - Cart state persists across browser refreshes.
  - Correct quantity and price calculations (no floating-point arithmetic; convert Decimal to display string).
  - Type-safe `CartLineItem` items per `src/types/index.ts`.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-09-002
- **Phase:** 9 — Cart
- **Task Name:** Cart Server Actions (Stock Validation)
- **Objective:** Implement `src/actions/cartActions.ts` with server-side stock validation before checkout progression.
- **Dependencies:** TV-02-004, TV-09-001
- **Expected Output:** `validateCartStock` server action that verifies all cart items against current `stockQuantity` values in the database.
- **Acceptance Criteria:**
  - Returns detailed validation result for each line item.
  - Flags out-of-stock or insufficient-stock items.
  - Used as gateway before proceeding to checkout.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-09-003
- **Phase:** 9 — Cart
- **Task Name:** Slide-Over Cart UI
- **Objective:** Build `src/components/cart/CartSlideOver.tsx` as a client component slide-over panel animated with `motion/react`.
- **Dependencies:** TV-09-001, TV-05-001
- **Expected Output:** Animated slide-over panel with cart line items, quantity selectors, free shipping progress bar, subtotal, and Checkout CTA.
- **Acceptance Criteria:**
  - Slides in from right using `motion/react` (not `framer-motion`).
  - Backdrop blur active when open.
  - Quantity changes update Zustand store.
  - Free shipping progress bar fills dynamically.
  - Responsive on mobile (full-width panel).
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

## Phase 10 — Checkout & Payment Abstraction

---

### TV-10-001
- **Phase:** 10 — Checkout
- **Task Name:** Payment Adapter Interface & Types
- **Objective:** Define the `PaymentAdapter` interface and related types in `src/lib/payments/types.ts` per `ARCHITECTURE.md` Section 8.
- **Dependencies:** TV-04-002
- **Expected Output:** `src/lib/payments/types.ts` with `PaymentInitParams`, `PaymentInitResult`, and `PaymentAdapter` interface as specified.
- **Acceptance Criteria:**
  - Interface is provider-neutral with no hardcoded payment SDK references.
  - All types exported and referenced in `src/types/index.ts`.
  - `tsc --noEmit` passes.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-10-002
- **Phase:** 10 — Checkout
- **Task Name:** Checkout Server Action (Order Creation)
- **Objective:** Implement `src/actions/checkoutActions.ts` with order creation logic: stock validation → `Order` record creation (status: `PENDING`) → `PaymentAdapter.createPaymentSession()`.
- **Dependencies:** TV-09-002, TV-10-001, TV-02-004
- **Expected Output:** `initializeCheckout` server action that creates an `Order` and `OrderItem[]` records and returns a payment session result.
- **Acceptance Criteria:**
  - `Order.shippingAddress` stored as structured `Json` matching `ShippingAddressStructure`.
  - `Order.status = PENDING` and `Order.paymentStatus = UNPAID` on creation.
  - Stock not decremented until payment confirmed via webhook.
  - Returns `ActionResult<PaymentInitResult>`.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-10-003
- **Phase:** 10 — Checkout
- **Task Name:** Payment Webhook Handler
- **Objective:** Implement `src/app/api/payments/webhook/route.ts` to receive payment confirmation, verify the gateway signature, and update Order status and stock.
- **Dependencies:** TV-10-002
- **Expected Output:** POST Route Handler that: verifies webhook signature via `PaymentAdapter.verifyWebhookSignature()`, updates `Order.paymentStatus = PAID`, `Order.status = PROCESSING`, and decrements `stockQuantity`.
- **Acceptance Criteria:**
  - Signature verification fails hard (returns 400) on invalid signatures.
  - Stock decremented atomically in a Prisma transaction.
  - Idempotent — duplicate webhook events for same `orderId` do not double-decrement stock.
  - No specific payment provider SDK referenced.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-10-004
- **Phase:** 10 — Checkout
- **Task Name:** Checkout Page UI
- **Objective:** Build `src/app/(customer)/checkout/page.tsx` with the multi-step checkout UI: address form → order review → payment.
- **Dependencies:** TV-10-002, TV-09-001
- **Expected Output:** Client component checkout flow with a validated address form (Zod), order summary panel, and payment gateway container slot.
- **Acceptance Criteria:**
  - Address form validated with Zod before submission.
  - No external address autocomplete services used.
  - Order summary reflects Zustand cart state.
  - Payment gateway container renders the provider's hosted UI or redirect.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-10-005
- **Phase:** 10 — Checkout
- **Task Name:** Order Confirmation Page
- **Objective:** Build the order confirmation page shown after successful payment.
- **Dependencies:** TV-10-003
- **Expected Output:** `src/app/(customer)/checkout/confirmation/page.tsx` displaying order number, summary, and estimated delivery messaging.
- **Acceptance Criteria:**
  - Reads confirmed order data from database by `orderNumber` query param.
  - Shows itemized order summary and shipping address.
  - Cart cleared from Zustand store on render.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

## Phase 11 — Orders

---

### TV-11-001
- **Phase:** 11 — Orders
- **Task Name:** Account Order History Page
- **Objective:** Build `src/app/(customer)/account/orders/page.tsx` displaying a logged-in user's order history.
- **Dependencies:** TV-03-002, TV-10-003
- **Expected Output:** Authenticated Server Component page listing all orders with `orderNumber`, `status`, `total`, `createdAt`, and item summary.
- **Acceptance Criteria:**
  - Requires active Supabase Auth session; redirects to `/login` if unauthenticated.
  - Orders sorted by `createdAt` descending.
  - Status badge rendered with appropriate color per `OrderStatus` enum.
- **Priority:** High
- **Scope:** MVP
- **Status:** Pending

---

### TV-11-002
- **Phase:** 11 — Orders
- **Task Name:** Account Order Detail Page
- **Objective:** Build the individual order detail view per order.
- **Dependencies:** TV-11-001
- **Expected Output:** Order detail page showing itemized `OrderItem[]`, `shippingAddress` (parsed from Json), `paymentStatus`, and order timeline.
- **Acceptance Criteria:**
  - Accessible only to the owning `Profile` (prevents order ID enumeration).
  - `shippingAddress` Json correctly deserialized and displayed.
- **Priority:** Medium
- **Scope:** MVP
- **Status:** Pending

---

## Phase 12 — Reviews & Ratings

---

### TV-12-001
- **Phase:** 12 — Reviews
- **Task Name:** Review Server Actions
- **Objective:** Implement `src/actions/reviewActions.ts` with `submitReview` and `getApprovedReviews` functions.
- **Dependencies:** TV-02-004, TV-03-002
- **Expected Output:** `submitReview` creates a `Review` record with `isApproved = false` (pending moderation). `getApprovedReviews` fetches `isApproved = true` reviews for a product.
- **Acceptance Criteria:**
  - Only authenticated users (validated Supabase session) can submit reviews.
  - Review rating validated (1–5 integer) via Zod.
  - New reviews set `isApproved = false` by default.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-12-002
- **Phase:** 12 — Reviews
- **Task Name:** PDP Review Section
- **Objective:** Build `src/components/catalog/ReviewSection.tsx` displaying approved reviews and a submit review form.
- **Dependencies:** TV-12-001, TV-07-001
- **Expected Output:** Review list with star rating display, reviewer name, date, and comment. Review submission form for authenticated users.
- **Acceptance Criteria:**
  - Only `isApproved = true` reviews visible to customers.
  - Average star rating calculated and displayed at PDP header.
  - Unauthenticated users see a "Login to review" prompt.
- **Priority:** Medium
- **Scope:** MVP
- **Status:** Complete

---

## Phase 13 — Content-Based Recommendation Engine

---

### TV-13-001
- **Phase:** 13 — Recommendations
- **Task Name:** Implement Recommendation Scoring Algorithm
- **Objective:** Build `src/lib/recommendations.ts` with the deterministic content-based Jaccard similarity scoring per `ARCHITECTURE.md` Section 9.
- **Dependencies:** TV-04-001, TV-04-002
- **Expected Output:** `getRecommendations(productId, limit)` function implementing the weighted similarity score $S(A,B) = w_1 C + w_2 N + w_3 M + w_4 P + w_5 T$ and returning the top `limit` products sorted by score.
- **Acceptance Criteria:**
  - Scores computed across all catalog products using deterministic attribute matching (category, sensory notes, mood, occasion, price tier, pairing tags).
  - No ML libraries, ML models, collaborative filtering, or AI ranking are introduced in MVP. Recommendations remain deterministic/content-based.
  - Fallback to top-rated/featured items when fewer than 3 matches exceed threshold.
  - Out-of-stock products excluded from recommendations.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-13-002
- **Phase:** 13 — Recommendations
- **Task Name:** Recommendation API Route
- **Objective:** Implement `src/app/api/recommendations/route.ts` as a GET handler accepting `productId` and returning scored recommendations.
- **Dependencies:** TV-13-001
- **Expected Output:** `GET /api/recommendations?productId=xxx&limit=4` returning typed JSON array.
- **Acceptance Criteria:**
  - Returns correct `ProductWithRelations[]` for any valid product ID using deterministic content-based scoring only.
  - No ML libraries, ML models, collaborative filtering, or AI ranking are introduced in MVP. Recommendations remain deterministic/content-based.
  - Returns 400 on missing or invalid `productId`.
  - Does not expose admin-only or unpublished products.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-13-003
- **Phase:** 13 — Recommendations
- **Task Name:** "You May Also Enjoy" PDP Widget
- **Objective:** Build `src/components/catalog/RecommendationCarousel.tsx` rendering same-category product recommendations on the PDP.
- **Dependencies:** TV-13-002, TV-07-001, TV-06-002
- **Expected Output:** Horizontally scrollable product carousel fetching from `GET /api/recommendations`.
- **Acceptance Criteria:**
  - Displays 3–4 relevant products sourced from deterministic content-based recommendations only.
  - No ML libraries, ML models, collaborative filtering, or AI ranking are introduced in MVP. Recommendations remain deterministic/content-based.
  - Uses existing `ProductCard` component.
  - Fallback to top-rated products if insufficient matches.
  - Does not show the currently viewed product in recommendations.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-13-004
- **Phase:** 13 — Recommendations
- **Task Name:** "Pairs Well With" Cross-Category Widget
- **Objective:** Build `src/components/catalog/PairingWidget.tsx` using `pairing_tags` and `mood` matching to suggest cross-category products.
- **Dependencies:** TV-13-001, TV-07-001
- **Expected Output:** Widget shown on PDP and Cart recommending a complementary product from the opposite category (e.g., Perfume → Tea or Tea → Perfume).
- **Acceptance Criteria:**
  - Cross-category match uses `pairing_tags` and `mood` overlap via deterministic attribute matching.
  - No ML libraries, ML models, collaborative filtering, or AI ranking are introduced in MVP. Recommendations remain deterministic/content-based.
  - Only shown when a valid cross-category match exists.
  - Elegant empty state when no pairing match found.
- **Priority:** Medium
- **Scope:** MVP
- **Status:** Complete

---

## Phase 14 — User Behaviour Telemetry

---

### TV-14-001
- **Phase:** 14 — Telemetry
- **Task Name:** Telemetry API Route
- **Objective:** Implement `src/app/api/telemetry/route.ts` as a POST handler persisting `EventLog` records.
- **Dependencies:** TV-02-004, TV-03-001
- **Expected Output:** `POST /api/telemetry` accepting `{ eventType, metadata }`, extracting `session_id` cookie and optionally `profileId` from Supabase session, and persisting to `EventLog`.
- **Acceptance Criteria:**
  - Validated with Zod (`eventType` must be one of the approved event types).
  - Non-blocking: Always returns `202 Accepted` immediately.
  - Guest events use `session_id`; authenticated events also populate `profileId`.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-14-002
- **Phase:** 14 — Telemetry
- **Task Name:** Client Telemetry Utility
- **Objective:** Build `src/lib/telemetry.ts` with a client-side `trackEvent` helper using `navigator.sendBeacon`.
- **Dependencies:** TV-14-001
- **Expected Output:** `trackEvent(eventType, metadata)` function dispatching non-blocking async beacons to `POST /api/telemetry`.
- **Acceptance Criteria:**
  - Uses `navigator.sendBeacon` when available; falls back to async `fetch` with `keepalive: true`.
  - Does not block UI thread.
  - Typed `TelemetryEvent` payload per `src/types/index.ts`.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-14-003
- **Phase:** 14 — Telemetry
- **Task Name:** Instrument Key User Events
- **Objective:** Add `trackEvent` calls at all 8 required telemetry touchpoints across the application.
- **Dependencies:** TV-14-002, TV-07-001, TV-09-001, TV-08-001, TV-06-004, TV-10-005
- **Expected Output:** `product_view` on PDP load, `search_query` on search execution, `wishlist_add` on wishlist action, `wishlist_remove` on wishlist removal, `cart_add` on cart action, `cart_remove` on cart removal, `checkout_start` on checkout entry, `purchase_completed` on order confirmation.
- **Acceptance Criteria:**
  - All 8 event types firing correctly (verified in Supabase `EventLog` table).
  - No UI performance degradation from telemetry calls.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

## Phase 15 — Admin Dashboard

---

### TV-15-001
- **Phase:** 15 — Admin Dashboard
- **Task Name:** Admin Layout & Navigation
- **Objective:** Build `src/app/admin/layout.tsx` with the admin sidebar navigation and shared layout.
- **Dependencies:** TV-03-004, TV-01-005
- **Expected Output:** Admin layout with Forest Green sidebar, navigation links (Products, Inventory, Orders, Users, Reviews, Analytics), and breadcrumb header.
- **Acceptance Criteria:**
  - `assertAdminSession()` called in layout to gate access.
  - Sidebar navigation highlights active route.
  - Responsive (collapses to top nav on small screens).
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-15-002
- **Phase:** 15 — Admin Dashboard
- **Task Name:** Admin Dashboard Overview Page
- **Objective:** Build `src/app/admin/page.tsx` with a high-level KPI summary (total orders, revenue, low-stock alerts, pending reviews).
- **Dependencies:** TV-15-001, TV-02-004
- **Expected Output:** Admin overview page with summary cards for: today's orders, total revenue, low-stock product count, and pending review count.
- **Acceptance Criteria:**
  - All metrics queried server-side via `assertAdminSession()`-gated Server Actions.
  - Low-stock threshold: `stockQuantity ≤ 15`.
  - No data mutation on this page (read-only).
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

## Phase 16 — Admin Product / Inventory / Order / User / Review Management

---

### TV-16-001
- **Phase:** 16 — Admin Management
- **Task Name:** Admin Product CRUD Actions
- **Objective:** Implement all admin product management Server Actions: `createProduct`, `updateProduct`, `deleteProduct`, `upsertSensoryAttributes`, `upsertProductVariants`.
- **Dependencies:** TV-03-004, TV-02-004
- **Expected Output:** `src/actions/adminActions.ts` with complete product CRUD server actions all calling `assertAdminSession()` as first operation.
- **Acceptance Criteria:**
  - All actions validate inputs via Zod schemas.
  - Monetary fields accept string/Decimal inputs, not raw `number`.
  - `SensoryAttribute` records upserted atomically with product.
  - Returns typed `ActionResult<T>`.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-16-002
- **Phase:** 16 — Admin Management
- **Task Name:** Admin Product List & Edit UI
- **Objective:** Build `src/app/admin/products/page.tsx` and `src/app/admin/products/[id]/page.tsx` for product management.
- **Dependencies:** TV-16-001, TV-15-001
- **Expected Output:** Tabular product list with search/filter. Edit form with tabs: Basic Details, Sensory Notes, Variants, Images, Recommendation Metadata.
- **Acceptance Criteria:**
  - Supabase Storage image upload integrated into the Images tab.
  - All form fields validated before submission.
  - Edit saves update the database and immediately reflect on the storefront.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-16-003
- **Phase:** 16 — Admin Management
- **Task Name:** Admin Inventory Dashboard
- **Objective:** Build `src/app/admin/inventory/page.tsx` with real-time stock table and batch update capability.
- **Dependencies:** TV-15-001, TV-16-001
- **Expected Output:** Stock management table with color-coded status badges (Green/Gold/Red) and inline quantity update.
- **Acceptance Criteria:**
  - Stocks accurately reflect `ProductVariant.stockQuantity`.
  - Low-stock items ($\le 15$) highlighted in Muted Gold.
  - Out-of-stock items ($= 0$) highlighted in red.
  - Batch quantity update supported.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-16-004
- **Phase:** 16 — Admin Management
- **Task Name:** Admin Order Management
- **Objective:** Build `src/app/admin/orders/page.tsx` and order detail view with fulfillment actions.
- **Dependencies:** TV-15-001, TV-10-003
- **Expected Output:** Order list with status filter, detail view, tracking number assignment, and status update actions.
- **Acceptance Criteria:**
  - Orders filterable by `OrderStatus` enum values.
  - Tracking number field updates `Order` record.
  - Status transitions follow logical order (e.g., `PROCESSING → SHIPPED → DELIVERED`).
  - All mutations gated by `assertAdminSession()`.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-16-005
- **Phase:** 16 — Admin Management
- **Task Name:** Admin Review Moderation
- **Objective:** Build `src/app/admin/reviews/page.tsx` to list pending and approved reviews with approve/reject actions.
- **Dependencies:** TV-15-001, TV-12-001
- **Expected Output:** Review moderation table showing product, reviewer, rating, comment, and approve/reject actions.
- **Acceptance Criteria:**
  - Pending reviews listed by default.
  - Approve action sets `isApproved = true`; reject deletes the review.
  - Approved reviews immediately appear on the PDP.
- **Priority:** Medium
- **Scope:** MVP
- **Status:** Complete

---

### TV-16-006
- **Phase:** 16 — Admin Management
- **Task Name:** Admin Customer Management
- **Objective:** Build `src/app/admin/customers/page.tsx` and `src/app/admin/customers/[id]/page.tsx` for customer directory and order history summary.
- **Dependencies:** TV-15-001, TV-03-004
- **Expected Output:** Searchable customer list with pagination, detail view showing profile metadata, total paid expenditure, and customer order history summary.
- **Acceptance Criteria:**
  - Searchable by customer name or email.
  - Exposes minimum necessary PII; strictly excludes auth tokens, secrets, and passwords.
  - Displays customer role; role modification disabled in UI for privilege escalation protection.
  - All operations gated by `assertAdminSession()`.
- **Priority:** Medium
- **Scope:** MVP
- **Status:** Complete

---

## Phase 17 — Analytics & Recommendation Analytics

---

### TV-17-001
- **Phase:** 17 — Analytics
- **Task Name:** Sales Analytics Dashboard
- **Objective:** Build `src/app/admin/analytics/page.tsx` with sales metrics: total revenue, AOV, conversion funnel, and top-selling SKUs.
- **Dependencies:** TV-15-001, TV-02-004, TV-14-003
- **Expected Output:** Analytics page with revenue summary cards and top products table.
- **Acceptance Criteria:**
  - Revenue totals aggregate only `paymentStatus = PAID` orders.
  - AOV calculated as `total_revenue / count_of_paid_orders`.
  - Monetary values formatted correctly from `Decimal`.
  - Gated by `assertAdminSession()`.
- **Priority:** Medium
- **Scope:** MVP
- **Status:** Complete

---

### TV-17-002
- **Phase:** 17 — Analytics
- **Task Name:** Behavioural Telemetry Summary
- **Objective:** Build event analytics view showing most-viewed products, top search queries, and add-to-cart drop-off metrics from `EventLog`.
- **Dependencies:** TV-17-001, TV-14-003
- **Expected Output:** Behavioural analytics table/cards querying aggregated `EventLog` data.
- **Acceptance Criteria:**
  - Top 10 most-viewed products displayed.
  - Top 10 most-searched queries displayed.
  - Data queried server-side with `assertAdminSession()` guard.
- **Priority:** Medium
- **Scope:** MVP
- **Status:** Complete

---

## Phase 18 — 3D / Motion Implementation

---

### TV-18-001
- **Phase:** 18 — 3D & Motion
- **Task Name:** Page Transition & Scroll Reveal Animations
- **Objective:** Implement site-wide page transitions and scroll reveal animations using `motion/react`.
- **Dependencies:** TV-05-001, TV-06-001, TV-07-001
- **Expected Output:** Page fade/slide transitions on route change. Staggered scroll reveal for product cards, section headers, and sensory note pills.
- **Acceptance Criteria:**
  - All animation imports use `import { motion, AnimatePresence } from "motion/react"`.
  - No `framer-motion` package import used anywhere.
  - `prefers-reduced-motion` disables transitions.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-18-002
- **Phase:** 18 — 3D & Motion
- **Task Name:** Hero 3D Canvas (Selective)
- **Objective:** Build `src/components/3d/HeroCanvas.tsx` with a dynamic React Three Fiber scene for the homepage hero viewport.
- **Dependencies:** TV-05-003, TV-01-004
- **Expected Output:** Dynamically imported (`ssr: false`) R3F canvas with perfume bottle or canister model, ambient orbit, and soft lighting. Static WebP fallback on mobile.
- **Acceptance Criteria:**
  - Canvas loaded only client-side (dynamic import with `ssr: false`).
  - Static WebP fallback renders immediately on mobile ($\le 768\text{px}$) or when `prefers-reduced-motion: reduce` is active.
  - No 3D canvas appears on non-hero pages unless explicitly added.
  - `npm run build` succeeds (no SSR Three.js import errors).
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-18-003
- **Phase:** 18 — 3D & Motion
- **Task Name:** Tea Steam / Particle Canvas (Selective)
- **Objective:** Build `src/components/3d/TeaParticleCanvas.tsx` with floating tea leaf / steam particle motion for the Tea category showcase section.
- **Dependencies:** TV-06-001, TV-01-004
- **Expected Output:** Dynamically imported client-only canvas with procedural floating particle system. Lightweight CSS keyframe fallback on mobile.
- **Acceptance Criteria:**
  - Canvas loaded only client-side.
  - Particle system does not impact 60fps on desktop.
  - CSS keyframe opacity animation used as mobile fallback.
- **Priority:** Medium
- **Scope:** MVP
- **Status:** Complete

---

### TV-18-004
- **Phase:** 18 — 3D & Motion
- **Task Name:** PDP 3D Viewer Toggle (Selective)
- **Objective:** Add the selective 3D product toggle button to the PDP gallery where 3D assets exist.
- **Dependencies:** TV-07-002, TV-18-002
- **Expected Output:** 3D toggle button in `PDPGallery` that swaps the static image viewer for the dynamic 3D canvas viewport when clicked.
- **Acceptance Criteria:**
  - Toggle button only shown when a 3D model asset path is available for the product.
  - 3D canvas dynamically loaded on toggle (not pre-loaded).
  - Falls back to static image when no 3D asset is available.
- **Priority:** Medium
- **Scope:** MVP
- **Status:** Complete

---

## Phase 19 — Accessibility & Responsive Implementation

---

### TV-19-001
- **Phase:** 19 — Accessibility & Responsive
- **Task Name:** ARIA Labels & Keyboard Navigation Audit
- **Objective:** Audit and implement ARIA labels on all icon-only controls and ensure complete keyboard navigation across all interactive flows.
- **Dependencies:** All UI phases (5–18)
- **Expected Output:** Verified `aria-label` on search trigger, cart toggle, wishlist buttons, and 3D canvas containers. Full tab-through navigation working on all forms, modals, and slide-over panels.
- **Acceptance Criteria:**
  - All icon-only interactive controls have descriptive `aria-label`.
  - Cart slide-over, search modal, and filter drawer properly trap focus when open.
  - Focus returns to trigger element on close.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-19-002
- **Phase:** 19 — Accessibility & Responsive
- **Task Name:** WCAG 2.1 AA Contrast Validation
- **Objective:** Validate all rendered color combinations against WCAG 2.1 AA contrast requirements using a contrast-checking tool.
- **Dependencies:** All UI phases
- **Expected Output:** Documented contrast ratios for all major color pairings (text on Ivory, text on Forest Green, gold on Forest Green, etc.).
- **Acceptance Criteria:**
  - All primary text/background pairings achieve $\ge 4.5:1$ contrast ratio.
  - All heading combinations achieve $\ge 3:1$ contrast ratio.
  - Any failing combinations corrected before release.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

### TV-19-003
- **Phase:** 19 — Accessibility & Responsive
- **Task Name:** Responsive Layout QA
- **Objective:** Verify all pages render correctly across all 5 defined breakpoints: 320px, 640px, 768px, 1024px, 1280px, 1536px+.
- **Dependencies:** All UI phases
- **Expected Output:** Verified responsive behavior across all breakpoints for: Header, Hero, Category Pages, PDP, Cart, Checkout, Account, Admin.
- **Acceptance Criteria:**
  - No horizontal scroll on any page at any breakpoint.
  - Touch targets meet 44×44px minimum on mobile.
  - Navigation drawers/modals functional on touch devices.
  - 3D motion fallbacks active at $\le 768\text{px}$.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete

---

## Phase 20 — Testing & QA

---

### TV-20-001
- **Phase:** 20 — Testing & QA
- **Task Name:** TypeScript Type Check
- **Objective:** Run a full `tsc --noEmit` check and resolve all TypeScript errors.
- **Dependencies:** All development phases
- **Expected Output:** Zero TypeScript errors across the entire codebase.
- **Acceptance Criteria:**
  - `tsc --noEmit` exits with code `0`.
  - No `any` type usages in source files.
  - All Prisma-generated types used correctly (no manual overrides that hide type errors).
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Pending

---

### TV-20-002
- **Phase:** 20 — Testing & QA
- **Task Name:** Production Build Verification
- **Objective:** Execute `npm run build` and resolve all build errors, Server Component boundary violations, and bundle size warnings.
- **Dependencies:** TV-20-001
- **Expected Output:** Successful production build with no errors or critical warnings.
- **Acceptance Criteria:**
  - `npm run build` exits cleanly.
  - No `'use client'` boundary violations.
  - No Three.js / R3F SSR import errors (all 3D imports are dynamic).
  - No `framer-motion` imports (only `motion/react`).
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Pending

---

### TV-20-003
- **Phase:** 20 — Testing & QA
- **Task Name:** Core Customer Flow Verification
- **Objective:** Manually verify all critical customer flows end-to-end.
- **Dependencies:** TV-20-002
- **Expected Output:** Verified and documented test pass results for all customer flows.
- **Acceptance Criteria:**
  - Product discovery → filtering → PDP → Add to Cart → Checkout → Order Confirmation works end-to-end.
  - Guest checkout flow completes without authentication.
  - Wishlist persists across page reloads for guest users.
  - Search returns relevant results.
  - Recommendations appear on PDP and are sourced from deterministic content-based logic only (no ML).
  - Telemetry events recorded in `EventLog` table.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Pending

---

### TV-20-004
- **Phase:** 20 — Testing & QA
- **Task Name:** Admin Flow Verification
- **Objective:** Verify all critical admin flows end-to-end.
- **Dependencies:** TV-20-002
- **Expected Output:** Verified admin flow test results.
- **Acceptance Criteria:**
  - Non-admin users cannot access any `/admin/*` route or call admin Server Actions.
  - Product CRUD creates/updates/deletes correctly with all sensory and metadata fields.
  - Order status updates reflect on customer order history.
  - Review approval makes review visible on PDP.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Pending

---

## Phase 21 — Security Review

---

### TV-21-001
- **Phase:** 21 — Security Review
- **Task Name:** Admin Authorization Audit
- **Objective:** Verify that every admin Server Action and admin API Route Handler calls `assertAdminSession()` before data operations.
- **Dependencies:** TV-20-002
- **Expected Output:** Documented audit of all admin entry points confirming independent authorization verification.
- **Acceptance Criteria:**
  - Zero admin Server Actions or Route Handlers that skip `assertAdminSession()`.
  - Unauthenticated direct POST to admin routes returns 401/403.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Pending

---

### TV-21-002
- **Phase:** 21 — Security Review
- **Task Name:** Environment Variable Security Audit
- **Objective:** Verify that no secret environment variables are exposed to the client bundle.
- **Dependencies:** TV-20-002
- **Expected Output:** Confirmed audit that `SUPABASE_SERVICE_ROLE_KEY`, `PAYMENT_GATEWAY_SECRET`, `PAYMENT_WEBHOOK_SECRET`, and `DATABASE_URL` are not prefixed with `NEXT_PUBLIC_` and do not appear in client-side JavaScript bundles.
- **Acceptance Criteria:**
  - Browser DevTools network inspection shows no secret keys in client bundle.
  - `NEXT_PUBLIC_` prefix applied only to `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Pending

---

### TV-21-003
- **Phase:** 21 — Security Review
- **Task Name:** Input Validation & Error Sanitization Audit
- **Objective:** Verify Zod validation is applied to all user-facing inputs and that stack traces do not leak to clients.
- **Dependencies:** TV-20-002
- **Expected Output:** Confirmed audit coverage of Zod validation across all forms, Server Actions, and API routes.
- **Acceptance Criteria:**
  - All Server Actions and API Route handlers have Zod schema validation.
  - Client-facing error responses return sanitized messages only.
  - No Prisma stack traces, SQL errors, or internal server details visible in API responses.
- **Priority:** High
- **Scope:** MVP
- **Status:** Pending

---

## Phase 22 — Performance Optimization

---

### TV-22-001
- **Phase:** 22 — Performance
- **Task Name:** Image Optimization Audit
- **Objective:** Verify all images use `next/image` with correct `sizes`, `priority`, WebP/AVIF output, and blur placeholders.
- **Dependencies:** TV-20-002
- **Expected Output:** All `<img>` tags replaced with `next/image`. Hero and above-fold images have `priority` prop.
- **Acceptance Criteria:**
  - No raw `<img>` tags in JSX.
  - LCP images have `priority` loading.
  - No Cumulative Layout Shift (CLS) from images.
- **Priority:** High
- **Scope:** MVP
- **Status:** Pending

---

### TV-22-002
- **Phase:** 22 — Performance
- **Task Name:** Client Bundle Analysis
- **Objective:** Analyze the Next.js client bundle and verify 3D libraries are not present in the initial bundle.
- **Dependencies:** TV-20-002
- **Expected Output:** Bundle analysis confirming Three.js / R3F only loaded on-demand via dynamic imports.
- **Acceptance Criteria:**
  - Three.js / R3F not present in initial page bundle.
  - Total initial JS bundle within acceptable limits.
  - No unnecessary polyfills or duplicate dependencies.
- **Priority:** High
- **Scope:** MVP
- **Status:** Pending

---

### TV-22-003
- **Phase:** 22 — Performance
- **Task Name:** Prisma Query Optimization
- **Objective:** Review Prisma queries for N+1 patterns and optimize with `include`/`select` to fetch only required relational data.
- **Dependencies:** TV-20-002
- **Expected Output:** Reviewed and optimized Prisma queries in `catalogActions.ts`, `checkoutActions.ts`, and admin actions.
- **Acceptance Criteria:**
  - No N+1 query patterns in product listing pages.
  - All product queries use selective `include` for only required relations.
- **Priority:** Medium
- **Scope:** MVP
- **Status:** Pending

---

## Phase 23 — Deployment Preparation

---

### TV-23-001
- **Phase:** 23 — Deployment Preparation
- **Task Name:** Production Environment Configuration
- **Objective:** Configure all production environment variables in the deployment platform with live Supabase credentials and production application URL.
- **Dependencies:** TV-20-001, TV-20-002, TV-20-003, TV-20-004, TV-21-001, TV-21-002, TV-21-003, TV-22-001, TV-22-002, TV-22-003
- **Expected Output:** Production environment variables set in deployment platform (Vercel or equivalent). Production Supabase project separate from development.
- **Acceptance Criteria:**
  - All Phase 20 QA tasks (type check, build, customer flow, admin flow) completed successfully.
  - All Phase 21 security review tasks completed successfully.
  - All Phase 22 performance tasks completed successfully.
  - Production `DATABASE_URL` points to production Supabase PostgreSQL.
  - `NEXT_PUBLIC_APP_URL` set to production domain.
  - No development credentials used in production.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Pending

---

### TV-23-002
- **Phase:** 23 — Deployment Preparation
- **Task Name:** Production Database Migration
- **Objective:** Run `prisma migrate deploy` against the production Supabase PostgreSQL instance.
- **Dependencies:** TV-23-001
- **Expected Output:** All migrations applied to production database. All tables present and correct.
- **Acceptance Criteria:**
  - `prisma migrate deploy` exits cleanly against production database.
  - All tables verified in production Supabase dashboard.
  - Seed script run for initial catalog population (if production launch).
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Pending

---

### TV-23-003
- **Phase:** 23 — Deployment Preparation
- **Task Name:** Admin Account Provisioning
- **Objective:** Create the first ADMIN user in the production database.
- **Dependencies:** TV-23-002
- **Expected Output:** A `Profile` record with `role = ADMIN` created in the production database for the designated admin user.
- **Acceptance Criteria:**
  - Admin user can log in and access `/admin` on production.
  - No ADMIN accounts accidentally created during development remain in production database.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Pending

---

## Phase 24 — Production Deployment

---

### TV-24-001
- **Phase:** 24 — Production Deployment
- **Task Name:** Deploy to Production
- **Objective:** Trigger the production deployment build and deployment pipeline.
- **Dependencies:** TV-23-001, TV-23-002, TV-23-003
- **Expected Output:** Live production deployment accessible at the configured production domain.
- **Acceptance Criteria:**
  - Production build completes without errors.
  - Application accessible at production URL over HTTPS.
  - All environment variables correctly loaded (no missing key errors).
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Pending

---

### TV-24-002
- **Phase:** 24 — Production Deployment
- **Task Name:** Payment Webhook Configuration
- **Objective:** Register the production payment webhook endpoint (`https://[domain]/api/payments/webhook`) with the payment gateway provider.
- **Dependencies:** TV-24-001
- **Expected Output:** Webhook registered with payment gateway pointing to production endpoint. Webhook secret configured in production environment.
- **Acceptance Criteria:**
  - Webhook ping from payment gateway receives 200 response.
  - Test payment transaction triggers correct Order status update in production database.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Pending

---

## Phase 25 — Post-Deployment Verification

---

### TV-25-001
- **Phase:** 25 — Post-Deployment Verification
- **Task Name:** Production Smoke Test — Customer Flows
- **Objective:** Execute core customer flow smoke tests on the live production environment.
- **Dependencies:** TV-24-001, TV-24-002
- **Expected Output:** Verified production test pass for all critical customer flows.
- **Acceptance Criteria:**
  - Homepage loads with correct brand styling.
  - Product catalog filters and search functional.
  - PDP renders correct product data, notes, and recommendations.
  - Cart, checkout (with test payment), and order confirmation complete end-to-end.
  - Telemetry events appear in production `EventLog` table.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Pending

---

### TV-25-002
- **Phase:** 25 — Post-Deployment Verification
- **Task Name:** Production Smoke Test — Admin Flows
- **Objective:** Verify all admin capabilities work correctly on production.
- **Dependencies:** TV-24-001
- **Expected Output:** Verified admin flow smoke test results on production.
- **Acceptance Criteria:**
  - Admin login and `/admin` access works for designated admin user.
  - Product edit, inventory update, and order fulfillment actions work correctly.
  - Non-admin account access to `/admin` routes correctly refused.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Pending

---

### TV-25-003
- **Phase:** 25 — Post-Deployment Verification
- **Task Name:** 3D & Motion Verification on Production
- **Objective:** Confirm that 3D canvases load correctly on production and mobile fallbacks activate properly.
- **Dependencies:** TV-24-001
- **Expected Output:** Verified 3D rendering on desktop and confirmed static WebP fallbacks on mobile.
- **Acceptance Criteria:**
  - Hero 3D canvas loads on desktop without errors.
  - Mobile ($\le 768\text{px}$) receives static WebP hero image (no 3D canvas loaded).
  - Tea particle canvas renders on Tea category page on desktop.
  - No Three.js console errors in production.
- **Priority:** High
- **Scope:** MVP
- **Status:** Complete (Superseded by static photography per ADR-023)

---

## Phase 26 — Customer Authentication Architecture Upgrade

### TV-26-001
- **Phase:** 26 — Customer Authentication Architecture Upgrade
- **Task Name:** Email + Password Registration with Email OTP Verification
- **Objective:** Implement customer registration with Name, Email, Password (removing phone number requirement) and 6-digit Email OTP verification via Supabase Auth.
- **Dependencies:** TV-02-001
- **Expected Output:** Updated `registerSchema`, `registerAction`, `verifyEmailOtpAction`, `resendEmailOtpAction`, `/register` page, `/verify-email` page.
- **Acceptance Criteria:**
  - Registration collects Name, Email, Password, Confirm Password (no phone number).
  - Creates user via `supabase.auth.signUp()`.
  - User receives 6-digit Email OTP and is redirected to `/verify-email`.
  - `/verify-email` verifies code via `supabase.auth.verifyOtp()`, syncs Prisma `Profile` with `CUSTOMER` role, and redirects to `/account`.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-26-002
- **Phase:** 26 — Customer Authentication Architecture Upgrade
- **Task Name:** Google OAuth Integration (PKCE Callback)
- **Objective:** Implement Google OAuth login and signup using Supabase Auth and PKCE exchange callback route `/auth/callback`.
- **Dependencies:** TV-26-001
- **Expected Output:** `loginWithGoogleAction`, `/auth/callback` route handler, "Continue with Google" buttons on `/login` and `/register`.
- **Acceptance Criteria:**
  - "Continue with Google" triggers `signInWithOAuth()` with PKCE flow targeting `/auth/callback`.
  - `/auth/callback` exchanges code for session, creates/syncs Prisma `Profile` (defaulting to `Role.CUSTOMER`), preserves existing `ADMIN` role, and migrates guest session.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

### TV-26-003
- **Phase:** 26 — Customer Authentication Architecture Upgrade
- **Task Name:** Strict CUSTOMER vs ADMIN Role Isolation
- **Objective:** Enforce strict access control on `/account` and prevent cross-role session confusion or auto-promotion.
- **Dependencies:** TV-26-002
- **Expected Output:** `/account/page.tsx` with role guard, `Header.tsx` with role-aware buttons.
- **Acceptance Criteria:**
  - `/account` requires valid session, confirmed email, and `Role.CUSTOMER`.
  - Authenticated `ADMIN` users attempting to access `/account` are redirected to `/admin`.
  - Google OAuth signups never auto-promote to `ADMIN`.
- **Priority:** Critical
- **Scope:** MVP
- **Status:** Complete

---

## Future Scope Tasks (Post-MVP)

> These tasks are documented for awareness but are **explicitly excluded from the initial MVP**. Do not begin implementation until PRD approval for the next phase.

| Task ID | Task Name | Rationale for Deferral |
| :--- | :--- | :--- |
| TV-F-001 | ML/Hybrid Recommendation Engine | Requires sufficient `EventLog` behavioral data volume. No ML libraries, ML models, collaborative filtering, or AI ranking in MVP per `PRD.md` Section 15. |
| TV-F-002 | Subscription Tea Delivery System | Requires recurring billing payment gateway support. |
| TV-F-003 | Custom Gift Box Builder | Complex product bundling logic out of MVP scope. |
| TV-F-004 | Multi-Currency & International Shipping | Requires shipping calculator integration. |
| TV-F-005 | Loyalty & Rewards Program | Requires points accounting system. |
| TV-F-006 | Native Mobile Apps (iOS/Android) | Web-only per `PRD.md` Section 15. |
| TV-F-007 | AR / Interactive 3D Studio | Advanced creative investment for post-launch. |

---
