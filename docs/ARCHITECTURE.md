# Technical Architecture Document

## Project Name: Two Valley
**Brand Positioning:** Premium Natural Lifestyle E-Commerce (Perfumes & Craft Teas)  
**Document Version:** 2.1  
**Status:** Pending Review  

---

## 1. System Architecture Overview

Two Valley is engineered as a high-performance, luxury full-stack e-commerce application. The architecture seamlessly integrates visual refinement (Forest Green, Olive Green, Ivory/Cream, Muted Gold, Warm Beige) with robust enterprise backend infrastructure.

The core technology stack utilizes **Next.js (App Router)** with **TypeScript**, **Tailwind CSS combined with CSS Custom Properties**, **Supabase Auth** for identity management, **Prisma ORM with Supabase PostgreSQL** for data persistence, **Cloudinary Storage** for media assets, and **Motion (`motion/react`)** for smooth UI transitions and responsive product visual storytelling.

### Architectural Blueprint
```
                                 +-----------------------------------+
                                 |         Client Browser            |
                                 |  (Desktop / Mobile Responsive)    |
                                 +-----------------+-----------------+
                                                   |
                                         HTTPS / JSON / RSC
                                                   |
                                                   v
+--------------------------------------------------+--------------------------------------------------+
|                                    Next.js App Router (Fullstack)                                  |
|                                                                                                     |
|  +--------------------------------+  +--------------------------------+  +-----------------------+  |
|  |       Server Components        |  |         Client Components      |  |     Middleware &      |  |
|  |     (Catalog, PDP, SEO, SSG)   |  |   (Cart, 3D Canvas, Motion)    |  |    Supabase Auth      |  |
|  +---------------+----------------+  +---------------+----------------+  +-----------+-----------+  |
|                  |                                   |                               |              |
|                  +------------------+----------------+-------------------------------+              |
|                                     |                                                               |
|                                     v                                                               |
|  +----------------------------------+------------------------------------------------------------+  |
|  |                            Server Actions / API Route Handlers                                |  |
|  |  - Supabase Auth Service   - Cart & Checkout Service       - Recommendation Engine (Content-Based)|  |
|  |  - Catalog Service     - Payment Gateway Adapter       - Telemetry Analytics Logger           |  |
|  |  - Admin Controller    - Supabase Storage Adapter      - User & Wishlist Controller           |  |
|  |  * (Independent ADMIN Re-verification on Server Actions & Route Handlers)                      |  |
|  +----------------------------------+------------------------------------------------------------+  |
+-------------------------------------+---------------------------------------------------------------+
                                      |
                            Prisma ORM / Supabase Client
                                      |
                                      v
+-------------------------------------+---------------------------------------------------------------+
|                                Supabase Backend Services                                            |
|                                                                                                     |
|  +--------------------------------+  +--------------------------------+  +-----------------------+  |
|  |      Supabase PostgreSQL       |  |         Supabase Auth          |  |   Supabase Storage    |  |
|  |   (Dev & Production DB)        |  |    (User Sessions & OAuth)     |  |   (Product Media Bucket)  |  |
|  +--------------------------------+  +--------------------------------+  +-----------------------+  |
+-----------------------------------------------------------------------------------------------------+
```

---

## 2. Technical Stack & Decision Rationale

| Layer | Technology Selected | Rationale for Two Valley |
| :--- | :--- | :--- |
| **Framework** | **Next.js (App Router, React 19, TypeScript)** | Unified full-stack architecture. Server-Side Rendering (SSR) and Static Site Generation (SSG) deliver near-instant initial page loads and superior SEO for luxury catalog items. Server Actions provide type-safe backend mutations. |
| **Styling** | **Tailwind CSS + CSS Custom Properties** | Combines utility-first rapid layout capabilities with bespoke brand CSS design tokens (`forest-green`, `olive-green`, `ivory-cream`, `muted-gold`, `warm-beige`) for precision luxury visual design. |
| **Database** | **Supabase PostgreSQL (Dev & Prod)** | High-performance relational database supporting complex queries across catalog items, sensory attributes, variant pricing, order items, and behavioral analytics. Eliminates DB drift by using PostgreSQL across all environments. |
| **ORM** | **Prisma ORM** | Provides end-to-end TypeScript type safety, auto-generated migration flows, and expressive relational querying. Integrates natively with Supabase PostgreSQL via connection pooling. |
| **Authentication** | **Supabase Auth (`@supabase/ssr`)** | Built-in secure authentication, email/password handling, magic links, session management, and HTTP-only cookie synchronization with Next.js App Router middleware. Manages credential security out of the box. |
| **Storage** | **Cloudinary Storage** | Production-ready object storage and CDN optimization for product imagery and brand assets, integrated with signed server upload actions. |
| **Imagery & Motion** | **Cloudinary CDN & Motion (`motion/react`)** | High-resolution responsive product photography combined with declarative `motion/react` page transitions and UI micro-interactions. |
| **Animation & Motion** | **Motion (`motion/react`)** | Provides fluid scroll reveal animations, tilt interactions on product cards, glassmorphic slide-over cart transitions, and adaptive mobile motion fallbacks. |
| **State Management** | **Zustand + React Context** | Minimalist, high-performance client state management for cart items, wishlist state, active filters, and 3D view modes with persistent `localStorage` syncing. |

---

## 3. Frontend Architecture

The frontend architecture prioritizes visual excellence, instant responsiveness, accessibility, and high performance on both desktop and mobile devices.

### 3.1 Styling & Brand Design System (`tailwind.config.ts`)
Brand colors and typography are defined as custom design tokens within Tailwind CSS:

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          forest: "#1E3A2B",
          olive: "#4A5D4E",
          ivory: "#FDFBF7",
          gold: "#D4AF37",
          beige: "#F5EFE6",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cinzel", "Playfair Display", "serif"],
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
```

### 3.2 Global CSS Variables (`src/app/globals.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-forest-green: #1E3A2B;
  --color-olive-green:  #4A5D4E;
  --color-ivory-cream:  #FDFBF7;
  --color-muted-gold:   #D4AF37;
  --color-warm-beige:   #F5EFE6;
}
```

### 3.3 Component Tiering Strategy
1. **Server Components (Default):** Catalog pages, PDP layout, static brand storytelling sections, blog posts. Zero bundle weight on the client.
2. **Interactive Client Components (`'use client'`):**
   * Slide-over Cart & Quantity Selectors.
   * Filter / Sort controls & Instant Search bar.
   * Interactive 3D product viewports & Canvas containers.
   * Animated components using `motion/react`.
   * User profile management forms & Admin data tables.

---

## 4. Backend Architecture & API Structure

Backend functionality is implemented using **Next.js Server Actions** for internal state mutations and **App Router API Routes** (`/api/*`) for client telemetry and payment webhooks.

### 4.1 Server Actions (`src/actions/*`)
* `catalogActions.ts`: Fetch catalog items, execute search, retrieve filtered products.
* `cartActions.ts`: Validate stock availability, compute line items, apply discounts.
* `checkoutActions.ts`: Initialize order, process payment gateway payload, clear cart.
* `wishlistActions.ts`: Add/remove items from guest or user wishlist.
* `adminActions.ts`: CRUD for products/categories, inventory adjustments, order status updates.  
  *(Note: All admin Server Actions strictly perform independent session re-authentication and role verification prior to execution).*

### 4.2 API Route Handlers (`src/app/api/*`)
* `POST /api/telemetry`: Asynchronously logs customer interaction events (`product_view`, `search_query`, `cart_add`, etc.).
* `POST /api/payments/webhook`: Technology-agnostic payment gateway notification handler for verifying transaction signatures and updating order statuses.
* `GET /api/recommendations`: Content-based recommendation endpoint.

---

## 5. Database Architecture & Schema Design

The relational schema is managed by **Prisma ORM** backed by **Supabase PostgreSQL**.

### 5.1 Monetary Field Precision & Standards
To prevent IEEE 754 binary floating-point rounding errors inherent to standard float types (e.g., `$19.99 + $0.01` resulting in `20.000000000000004`), all financial fields across products, variants, orders, and order items strictly use PostgreSQL native `Decimal` types (`@db.Decimal(10, 2)`). This ensures exact 2-decimal-place arithmetic precision for currency calculations.

### 5.2 Structured Shipping Address Storage
The `Order.shippingAddress` field is modeled as a native PostgreSQL JSON object (`Json` in Prisma). This provides structured, type-safe storage for recipient details without string-serialization hacks:
```typescript
interface ShippingAddressStructure {
  recipientName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  contactPhone: string;
  contactEmail: string;
}
```

### 5.3 Complete Prisma Schema Specification (`prisma/schema.prisma`)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  CUSTOMER
  ADMIN
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  UNPAID
  PAID
  REFUNDED
  FAILED
}

model Profile {
  id        String   @id // Maps directly to Supabase Auth User UUID (auth.users.id)
  email     String   @unique
  name      String?
  role      Role     @default(CUSTOMER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  orders        Order[]
  wishlistItems WishlistItem[]
  reviews       Review[]
  eventLogs     EventLog[]
}

model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  image       String?
  products    Product[]
}

model Product {
  id               String   @id @default(cuid())
  name             String
  slug             String   @unique
  sku              String   @unique
  description      String
  price            Decimal  @db.Decimal(10, 2)
  salePrice        Decimal? @db.Decimal(10, 2)
  stockQuantity    Int      @default(0)
  isFeatured       Boolean  @default(false)
  categoryId       String
  category         Category @relation(fields: [categoryId], references: [id])
  
  // Sensory & Recommendation Metadata
  fragranceFamily  String?  // Woody, Floral, Fresh, Spice
  teaType          String?  // CTC Chai Patti, Loose Leaf, Green, Infusion
  origin           String?  // Assam, Darjeeling, etc.
  caffeineLevel    String?  // High, Medium, Low, Free
  steepingGuide    String?  // Summary text or JSON guide
  mood             String?  // Meditative, Energetic, Romantic, Refreshing
  occasion         String?  // Evening Gala, Morning Ritual, Daily Wear, Gifting
  useCase          String?  // Workday Focus, Post-Workout Relaxation
  pairingTags      String?  // Comma-separated or JSON list of cross-pairing tags
  tags             String?  // Comma-separated taxonomy tags

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  variants         ProductVariant[]
  images           ProductImage[]
  sensoryAttributes SensoryAttribute[]
  wishlistItems    WishlistItem[]
  orderItems       OrderItem[]
  reviews          Review[]
}

model ProductVariant {
  id            String   @id @default(cuid())
  productId     String
  product       Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  volumeWeight  String   // e.g. "50ml", "100ml", "100g", "250g"
  priceOverride Decimal? @db.Decimal(10, 2)
  stockQuantity Int      @default(0)
  sku           String   @unique
}

model ProductImage {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String   // Supabase Storage public URL
  altText   String?
  isPrimary Boolean  @default(false)
  sortOrder Int      @default(0)
}

model SensoryAttribute {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  attributeType String // TOP_NOTE, HEART_NOTE, BASE_NOTE, FLAVOUR_NOTE
  name      String
}

model WishlistItem {
  id        String   @id @default(cuid())
  profileId String?
  sessionId String?
  productId String
  profile   Profile? @relation(fields: [profileId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  // Uniqueness Strategies:
  // Authenticated users: One entry per product per profile
  // Guest users: One entry per product per session
  @@unique([profileId, productId])
  @@unique([sessionId, productId])
  @@index([profileId])
  @@index([sessionId])
}

model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique
  profileId       String?
  sessionId       String?
  profile         Profile?      @relation(fields: [profileId], references: [id])
  status          OrderStatus   @default(PENDING)
  paymentStatus   PaymentStatus @default(UNPAID)
  paymentProvider String?
  paymentTxnId    String?
  subtotal        Decimal       @db.Decimal(10, 2)
  tax             Decimal       @db.Decimal(10, 2)
  shippingFee     Decimal       @db.Decimal(10, 2)
  total           Decimal       @db.Decimal(10, 2)
  shippingAddress Json          // Structured JSON storing full recipient details
  contactEmail    String
  contactPhone    String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  items           OrderItem[]
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  variantName String?  // Stores volume/weight snapshot
  quantity    Int
  unitPrice   Decimal  @db.Decimal(10, 2)
  totalPrice  Decimal  @db.Decimal(10, 2)
}

model Review {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  profileId String
  profile   Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  rating    Int      // 1 to 5
  title     String?
  comment   String
  isApproved Boolean @default(false)
  createdAt DateTime @default(now())
}

model EventLog {
  id        String   @id @default(cuid())
  sessionId String
  profileId String?
  profile   Profile? @relation(fields: [profileId], references: [id])
  eventType String   // product_view, search_query, wishlist_add, cart_add, purchase_completed
  metadata  String?  // JSON string storing contextual details
  createdAt DateTime @default(now())

  @@index([sessionId])
  @@index([profileId])
  @@index([eventType])
}
```

---

## 6. Authentication & Authorization Strategy

Authentication is managed exclusively via **Supabase Auth** (`@supabase/ssr`), eliminating custom password hashing, custom JWTs, or manual cookie session tables.

* **Client & Server Integration:**
  * `createBrowserClient()` handles auth states on client components.
  * `createServerClient()` reads and refreshes cookies securely inside Server Components, Server Actions, and Route Handlers.
* **Supported Customer Authentication Methods:**
  1. **Email + Password Registration with Email OTP Verification:** Registration collects Name, Email, and Password (phone number removed). After registration, users are prompted for a 6-digit OTP sent to their email, verified via `supabase.auth.verifyOtp({ type: 'signup' })`.
  2. **Google OAuth (PKCE Flow):** Initiated via `supabase.auth.signInWithOAuth()` pointing to PKCE callback route `/auth/callback`. The handler exchanges the code for a session, syncs/creates a Prisma `Profile` (defaulting to `Role.CUSTOMER`), and preserves pre-existing `ADMIN` permissions.
* **Role-Based Authorization Strategy:**
  * User profile records are stored in the `Profile` table, synced with `auth.users.id`.
  * The `Profile.role` field dictates permissions (`CUSTOMER` vs `ADMIN`).
  * `/account` enforces active session, email verification, and `Role.CUSTOMER` role check. Authenticated admins attempting to access `/account` are redirected to `/admin`.

### 6.1 Strict Admin Authorization & Defense in Depth
To enforce a rigid security boundary, Two Valley applies a **Zero Trust / Defense-in-Depth** model for administrative actions:

1. **Edge Middleware Guard (`src/middleware.ts`):** Intercepts incoming requests to `/admin/*` routes. Verifies the active Supabase session and redirects non-admin users to `/login`.
2. **Mandatory Action-Level Verification:** Middleware is **NEVER** relied upon as the sole security boundary. Every admin Server Action (`src/actions/adminActions.ts`) and every admin API Route Handler (`src/app/api/admin/*`) MUST independently execute an authorization check before processing logic:

```typescript
// Pattern enforced on every Admin Server Action / API Handler
export async function assertAdminSession() {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error("Unauthorized: Session invalid");
  }

  const profile = await db.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!profile || profile.role !== "ADMIN") {
    throw new Error("Forbidden: Admin privileges required");
  }

  return user;
}
```

* **Guest-to-Authenticated Session Migration:**
  * Upon Supabase login, registration, or Google OAuth callback, server logic updates any `WishlistItem` or `EventLog` records matching the visitor's `session_id` to attach `profileId = user.id`.

### 6.2 Supabase Dashboard Setup Requirements for Auth
For full production functionality, the following manual configuration must be enabled in the Supabase Dashboard:
- **Email OTP Provider:** Enabled under Auth Settings -> Email Templates & Providers.
- **Google OAuth Provider:** Enabled under Authentication -> Providers -> Google, configured with Google Cloud Console OAuth 2.0 Client ID & Secret, with Redirect URI set to `https://<YOUR-SUPABASE-PROJECT>.supabase.co/auth/v1/callback`.
- **Site URL & Redirect URLs:** Site URL set to `https://<YOUR-DOMAIN>` and Redirect URLs whitelist containing `https://<YOUR-DOMAIN>/auth/callback` and `http://localhost:3000/auth/callback`.

---

## 7. Product & Catalog Data Flow

```
+------------------+         +-----------------------+         +-----------------------+
|  User / Client   |         |  Next.js Page / RSC   |         | Supabase PostgreSQL   |
+--------+---------+         +-----------+-----------+         +-----------+-----------+
         |                               |                               |
         |  1. Request Category / PDP    |                               |
         |------------------------------>|  2. Query Catalog with Notes  |
         |                               |------------------------------>|
         |                               |  3. Return Product & Variants |
         |                               |<------------------------------|
         |  4. Render HTML + JSON-LD     |                               |
         |<------------------------------|                               |
         |                               |                               |
         |  5. Apply Sensory Note Filter |                               |
         |------------------------------>|  6. Execute Filter Server Act |
         |                               |------------------------------>|
         |  7. Return Filtered Items     |                               |
         |<------------------------------|                               |
```

---

## 8. Cart & Checkout Flow (Technology-Agnostic)

The checkout process is designed to be payment-provider-neutral. The backend exposes a clean `PaymentAdapter` interface, isolating checkout logic from specific gateway SDKs.

```
                                +-------------------+
                                |   Client Cart     |
                                +---------+---------+
                                          |
                                          | 1. Proceed to Checkout
                                          v
                                +-------------------+
                                | Checkout Action   |
                                | (Validate Stock)  |
                                +---------+---------+
                                          |
                                          | 2. Create Order (Status: PENDING)
                                          v
                                +-------------------+
                                |  PaymentAdapter   |
                                |  Initialize()     |
                                +---------+---------+
                                          |
                        +-----------------+-----------------+
                        |                                   |
                        v                                   v
             (Redirect Flow)                      (Embedded Modal Flow)
    Returns Hosted Payment Gateway URL          Returns Payment Session Token
                        |                                   |
                        +-----------------+-----------------+
                                          |
                                          | 3. Customer Completes Payment
                                          v
                                +-------------------+
                                | Webhook Handler   |
                                | /api/payments/... |
                                +---------+---------+
                                          |
                                          | 4. Verify Signature & Update Order
                                          |    (Status: PAID, Stock Decremented)
                                          v
                                +-------------------+
                                | Order Receipt Page|
                                +-------------------+
```

### Payment Adapter Interface Specification (`src/lib/payments/types.ts`)
```typescript
export interface PaymentInitParams {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  returnUrl: string;
}

export interface PaymentInitResult {
  transactionId: string;
  redirectUrl?: string;
  clientToken?: string;
}

export interface PaymentAdapter {
  createPaymentSession(params: PaymentInitParams): Promise<PaymentInitResult>;
  verifyWebhookSignature(rawBody: string, signature: string): Promise<boolean>;
  parseWebhookPayload(body: any): { orderId: string; status: 'PAID' | 'FAILED'; txnId: string };
}
```

---

## 9. Recommendation Engine Architecture (Content-Based)

The MVP recommendation system uses a **deterministic content-matching engine** executed via Prisma queries or lightweight in-memory scoring.

### Similarity Algorithm Scoring ($S_{A,B}$)
For a given target product $A$ and catalog candidate product $B$:

$$S(A, B) = w_1 \cdot C(A,B) + w_2 \cdot N(A,B) + w_3 \cdot M(A,B) + w_4 \cdot P(A,B) + w_5 \cdot T(A,B)$$

Where:
* **Category Match $C(A,B)$ (Weight $w_1 = 0.30$):** $1.0$ if same category (`Perfume` vs `Perfume`), $0.0$ otherwise.
* **Sensory Notes Match $N(A,B)$ (Weight $w_2 = 0.35$):** Jaccard similarity index of fragrance/flavour notes:
  $$N(A,B) = \frac{|\text{Notes}_A \cap \text{Notes}_B|}{|\text{Notes}_A \cup \text{Notes}_B|}$$
* **Mood & Occasion Match $M(A,B)$ (Weight $w_3 = 0.20$):** Fraction of matching `mood`, `occasion`, and `use_case` tags.
* **Price Tier Proximity $P(A,B)$ (Weight $w_4 = 0.10$):** $1.0 - \frac{|\text{Price}_A - \text{Price}_B|}{\max(\text{Price}_A, \text{Price}_B)}$ if within $\pm 25\%$ price band.
* **Cross-Pairing Tag Match $T(A,B)$ (Weight $w_5 = 0.05$):** Matches explicit `pairing_tags` (used for cross-category recommendations like Tea PDP suggesting a complementary Perfume).

### Recommendation Fallback Rules
If candidates matching $S(A,B) > 0.3$ fall below 3 products:
1. Fall back to top-rated / best-selling items in the same category.
2. Ensure no duplicate SKUs or out-of-stock items are rendered.

---

## 10. User Behaviour Tracking Telemetry Architecture

Telemetry events are dispatched asynchronously using `navigator.sendBeacon` or unblocking background `fetch()` calls to ensure zero UI impact.

### 10.1 Telemetry Event Pipeline
```
[User Action: Click / Search / View]
        |
        v
Client Telemetry Tracker Utility (`src/lib/telemetry.ts`)
        | (Non-blocking async beacon)
        v
API Route: POST /api/telemetry
        | (Extracts session_id cookie + Supabase profileId)
        v
Prisma EventLog Persistence (Indexed Async Queue)
```

---

## 11. Admin Architecture

The Admin module is housed under `/admin` and protected by server-side middleware verifying `Profile.role === 'ADMIN'`. Additionally, every admin server action re-verifies `Profile.role === 'ADMIN'` independently.

### Core Administrative Modules
1. **Catalog Management:** Rich table interface for managing products, categories, sensory notes, variants, and pairing tags. Integrated with Supabase Storage for product media uploads.
2. **Inventory Dashboard:** Real-time stock levels with low-stock warnings and batch quantity updates.
3. **Order Processing Hub:** Order filter view by status (`PENDING`, `PROCESSING`, `SHIPPED`), tracking number assignment, and customer notifications.
4. **Analytics Summary Panel:** Sales performance metrics, event telemetry summaries, and recommendation widget CTRs.

---

## 12. 3D & Motion Design Architecture

Visual storytelling is a core brand pillar of Two Valley. Motion design utilizes **Motion (`motion/react`)**, while 3D interactions utilize **React Three Fiber / Three.js**.

### 12.1 Dynamic 3D Module Isolation
To preserve fast initial page load times, Three.js / React Three Fiber components are client-side dynamically imported:
```typescript
// src/components/3d/PerfumeBottleCanvas.tsx
import dynamic from 'next/dynamic';

export const PerfumeBottleViewer = dynamic(
  () => import('./PerfumeBottleCanvasInner'),
  { ssr: false, loading: () => <StaticProductFallbackImage /> }
);
```

### 12.2 Motion (`motion/react`) & Adaptive Performance Matrix

```typescript
// Example Motion import convention across Two Valley components:
import { motion } from "motion/react";
```

| Component / Interaction | Desktop (Large Screen) | Mobile ($\le 768\text{px}$) / Low-Power Mode |
| :--- | :--- | :--- |
| **Hero Product Presentation** | Full 3D canvas with interactive orbit control & lighting. | High-definition WebP static render with subtle fade. |
| **Tea Steam / Particle Motion** | Canvas particle system (floating tea leaves/steam). | Lightweight CSS keyframe opacity animation. |
| **Product Card Interaction** | Perspective tilt effect on hover (`motion/react`). | Touch-active scale transform (`0.98`). |
| **Scroll Reveal & Parallax** | Scroll reveal transitions (`motion/react`). | Simple opacity scroll reveal. |

---

## 13. Image & Asset Storage Architecture

Asset management uses **Supabase Storage** behind an abstract storage interface to decouple application code from vendor specifics.

### Abstract Storage Interface (`src/lib/storage.ts`)
```typescript
export interface StorageService {
  uploadFile(file: File | Buffer, path: string, contentType?: string): Promise<string>;
  getPublicUrl(path: string): string;
  deleteFile(path: string): Promise<void>;
}
```

* **Supabase Storage Implementation:** Images uploaded to the `product-images` bucket on Supabase Storage.
* **Optimization Pipeline:** Next.js `next/image` handles WebP/AVIF format optimization, responsive resizing, and blur placeholders.

---

## 14. Security Boundaries & Data Protection

* **Data Transmission:** HTTPS strictly enforced across all client, API, and database endpoints.
* **Authentication Security:** Delegated to Supabase Auth (OAuth 2.0, PKCE flow, encrypted session tokens in HTTP-only cookies).
* **Defense in Depth Authorization:** Every administrative Server Action and protected API Route Handler independently asserts `Profile.role === 'ADMIN'` before executing logic.
* **Input Validation:** All server action inputs and API request bodies validated using strict schema parsing (e.g., `Zod`).
* **Database Access:** Parametrized SQL generated by Prisma ORM prevents SQL injection vulnerabilities; Supabase connection strings protected via secret environment variables.

---

## 15. Environment Variables Configuration

The environment configuration is specified in `.env.example`.

```env
# Supabase PostgreSQL Connection Strings
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Supabase API Credentials
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Payment Gateway Keys (Technology-Agnostic Placeholders)
PAYMENT_GATEWAY_KEY="pk_test_placeholder"
PAYMENT_GATEWAY_SECRET="sk_test_placeholder"
PAYMENT_WEBHOOK_SECRET="whsec_placeholder"
```

---

## 16. Project Folder Structure

```
two-valley/
├── docs/
│   ├── PRD.md
│   └── ARCHITECTURE.md
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── assets/
│       ├── brand/
│       └── textures/
├── src/
│   ├── actions/
│   │   ├── adminActions.ts
│   │   ├── cartActions.ts
│   │   ├── catalogActions.ts
│   │   ├── checkoutActions.ts
│   │   └── wishlistActions.ts
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (customer)/
│   │   │   ├── account/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   ├── perfumes/
│   │   │   ├── teas/
│   │   │   ├── product/[slug]/
│   │   │   ├── wishlist/
│   │   │   └── page.tsx
│   │   ├── admin/
│   │   │   ├── analytics/
│   │   │   ├── inventory/
│   │   │   ├── orders/
│   │   │   ├── products/
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   ├── payments/
│   │   │   │   └── webhook/
│   │   │   ├── recommendations/
│   │   │   └── telemetry/
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── 3d/
│   │   │   ├── PerfumeBottleCanvas.tsx
│   │   │   └── TeaParticleCanvas.tsx
│   │   ├── admin/
│   │   ├── cart/
│   │   ├── catalog/
│   │   ├── checkout/
│   │   ├── layout/
│   │   └── ui/
│   ├── lib/
│   │   ├── db.ts
│   │   ├── payments/
│   │   │   ├── adapter.ts
│   │   │   └── types.ts
│   │   ├── recommendations.ts
│   │   ├── storage.ts
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── middleware.ts
│   │   │   └── server.ts
│   │   └── telemetry.ts
│   ├── types/
│   │   └── index.ts
├── tailwind.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 17. Development & Deployment Architecture

### 17.1 Development Workflow
1. **Supabase Setup:** Supabase PostgreSQL instance configured for dev environment.
2. **Prisma Migrations:** `prisma migrate dev` executes schema changes against Supabase PostgreSQL.
3. **Catalog Seeding:** `prisma/seed.ts` populates initial launch catalog (8–9 perfumes, 5–6 teas) with complete sensory notes, prices, and metadata.

### 17.2 Production Deployment Strategy
* **Hosting Platform:** Vercel or containerized Node.js environment.
* **Database Migration:** `prisma migrate deploy` executed during build step.
* **Edge CDN Caching:** Next.js static asset caching and media delivery via Supabase Storage + Edge CDN.

---
