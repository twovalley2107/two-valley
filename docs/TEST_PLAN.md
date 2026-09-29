# Test Plan (TEST_PLAN.md)

## Project Name: Two Valley
**Document Version:** 1.0  
**Status:** Approved (v1.0)  
**Aligned With:** PRD.md, ARCHITECTURE.md, DESIGN.md, RULES.md, TASKS.md v1.1  

---

## Table of Contents

1. [Testing Philosophy & Strategy](#1-testing-philosophy--strategy)
2. [Testing Scope](#2-testing-scope)
3. [Test Environment Setup](#3-test-environment-setup)
4. [Unit Testing Expectations](#4-unit-testing-expectations)
5. [Integration Testing Expectations](#5-integration-testing-expectations)
6. [Authentication & Authorization Tests](#6-authentication--authorization-tests)
7. [Catalog, Search & Filter Tests](#7-catalog-search--filter-tests)
8. [Product Detail Page Tests](#8-product-detail-page-tests)
9. [Wishlist Tests](#9-wishlist-tests)
10. [Cart Tests](#10-cart-tests)
11. [Checkout, Payment & Order Tests](#11-checkout-payment--order-tests)
12. [Recommendation Engine Tests](#12-recommendation-engine-tests)
13. [Telemetry Tests](#13-telemetry-tests)
14. [Admin Flow Tests](#14-admin-flow-tests)
15. [Responsive & Mobile Tests](#15-responsive--mobile-tests)
16. [Accessibility Tests](#16-accessibility-tests)
17. [3D & Motion Fallback Tests](#17-3d--motion-fallback-tests)
18. [Security Test Cases](#18-security-test-cases)
19. [Performance Validation](#19-performance-validation)
20. [Production Smoke-Test Checklist](#20-production-smoke-test-checklist)
21. [Pass / Fail Rules & Acceptance Criteria](#21-pass--fail-rules--acceptance-criteria)
22. [Task Traceability Matrix](#22-task-traceability-matrix)

---

## 1. Testing Philosophy & Strategy

### 1.1 Guiding Principles

Two Valley is a **production-ready, premium e-commerce brand**. Testing must reflect that standard:

- **Correctness over coverage:** A passing test suite with meaningful assertions is more valuable than 100% line coverage with trivial checks.
- **Critical paths first:** Every customer-facing purchase flow and every admin mutation must be verified before any deployment.
- **Defense in depth:** Security tests are not optional. Authorization must be verified independently from the UI layer.
- **No ML in MVP:** Recommendation tests validate deterministic, content-based logic only. No ML model, AI ranking, or collaborative filtering is tested or expected.
- **Performance is a feature:** 3D and motion components must not degrade core page performance. Fallbacks must be verified explicitly.

### 1.2 Testing Layers (7 Categories)

The Two Valley test suite is organised into **7 testing-layer categories**, each with a distinct scope and toolset:

| Layer | Tooling (Recommended) | Purpose |
| :--- | :--- | :--- |
| **Unit** | Vitest | Pure functions, recommendation scoring, utilities |
| **Integration** | Vitest + Prisma test DB | Server Actions, database operations, webhook handling |
| **End-to-End (E2E)** | Playwright | Full customer and admin flows in a browser |
| **Type Checking** | `tsc --noEmit` | TypeScript correctness across the entire codebase |
| **Build Verification** | `next build` | Production build integrity, SSR boundary compliance |
| **Manual QA** | Browser + DevTools | Accessibility, responsive, 3D/motion, visual brand fidelity |
| **Security Audit** | Manual + DevTools | Auth, env vars, input sanitization, error responses |

### 1.3 Test Execution Sequence (9 Steps)

The 7 testing-layer categories above are executed in the following **9-step ordered sequence** before any production deployment. Some layers (e.g., Type Checking and Build Verification) are called out as dedicated steps in the sequence because they are hard prerequisites for the steps that follow them:

```
1. tsc --noEmit (TypeScript)
   ↓
2. Unit Tests (Vitest)
   ↓
3. Integration Tests (Vitest + DB)
   ↓
4. Production Build Verification (next build)
   ↓
5. End-to-End Tests (Playwright)
   ↓
6. Manual QA (Responsive, Accessibility, 3D/Motion)
   ↓
7. Security Audit
   ↓
8. Performance Validation
   ↓
9. Production Smoke Tests
```

> **IMPORTANT:** Production deployment (`TASKS.md` TV-23-001) is blocked until all 9 execution steps above have passed.
>
> **Terminology distinction:**
> - **7 testing-layer categories** — the methodology types defined in §1.2 (Unit, Integration, E2E, Type Checking, Build Verification, Manual QA, Security Audit).
> - **9-step execution sequence** — the ordered sequence above in which those layers are run, with Type Checking and Build Verification called out as explicit sequential gates.
> - **10 quality-gate tasks** — the specific `TASKS.md` task IDs that TV-23-001 depends on: TV-20-001, TV-20-002, TV-20-003, TV-20-004, TV-21-001, TV-21-002, TV-21-003, TV-22-001, TV-22-002, TV-22-003. These are the concrete implementation checkpoints; the testing layers and execution sequence are the methodology by which those tasks are validated.

### 1.4 Out of Scope (MVP)

The following are explicitly **not tested** in the MVP test plan:

- ML models, AI ranking, collaborative filtering (not in MVP per `PRD.md` Section 15)
- Native mobile apps
- Multi-currency or international shipping
- Subscription billing
- AR / Interactive 3D Studio

---

## 2. Testing Scope

### 2.1 In Scope for MVP

| Feature Area | Task Reference |
| :--- | :--- |
| Project setup and TypeScript strictness | TV-01-001 to TV-01-010 |
| Database schema and Prisma operations | TV-02-001 to TV-02-006 |
| Authentication and authorization | TV-03-001 to TV-03-005 |
| Product catalog (list, detail, search, filter) | TV-04-001, TV-06-001 to TV-06-004, TV-07-001 to TV-07-006 |
| Wishlist (guest + authenticated) | TV-08-001 to TV-08-002 |
| Cart (Zustand store + stock validation) | TV-09-001 to TV-09-003 |
| Checkout and payment webhook | TV-10-001 to TV-10-005 |
| Orders (history + detail) | TV-11-001 to TV-11-002 |
| Reviews and ratings | TV-12-001 to TV-12-002 |
| Recommendation engine (content-based only) | TV-13-001 to TV-13-004 |
| Telemetry event logging | TV-14-001 to TV-14-003 |
| Admin dashboard and management | TV-15-001 to TV-16-005 |
| Analytics views | TV-17-001 to TV-17-002 |
| 3D canvas and motion (with fallbacks) | TV-18-001 to TV-18-004 |
| Accessibility and responsive | TV-19-001 to TV-19-003 |
| Security review | TV-21-001 to TV-21-003 |
| Performance checks | TV-22-001 to TV-22-003 |

---

## 3. Test Environment Setup

### 3.1 Local Development Environment

- Node.js LTS (version consistent with `package.json` `engines` field)
- A dedicated **test Supabase project** separate from development and production
- A separate test PostgreSQL database with all Prisma migrations applied (`prisma migrate deploy`)
- `.env.test` file with test-specific credentials, never committed to source control
- Seed data applied via `prisma db seed` before each test run that requires database state

### 3.2 Environment Variable Requirements

| Variable | Test Value Requirement |
| :--- | :--- |
| `DATABASE_URL` | Points to isolated test PostgreSQL database |
| `DIRECT_URL` | Points to isolated test PostgreSQL database |
| `NEXT_PUBLIC_SUPABASE_URL` | Test Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Test Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Test Supabase service role key |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |
| `PAYMENT_GATEWAY_KEY` | Payment gateway sandbox/test key |
| `PAYMENT_GATEWAY_SECRET` | Payment gateway sandbox/test secret |
| `PAYMENT_WEBHOOK_SECRET` | Test webhook signing secret |

> `SUPABASE_SERVICE_ROLE_KEY`, `PAYMENT_GATEWAY_SECRET`, and `PAYMENT_WEBHOOK_SECRET` must **never** use the `NEXT_PUBLIC_` prefix even in test environments.

### 3.3 Seeded Test Data Requirements

Before running integration and E2E tests, the test database must contain:

- At minimum 3 perfume products (with `SensoryAttribute` records for top, heart, base notes)
- At minimum 2 tea products (with `steepingGuide`, `caffeineLevel`, `origin`)
- At minimum 1 product marked `isFeatured = true` in each category
- At minimum 1 product marked `isPublished = false` (to verify exclusion from catalog)
- At minimum 1 product with `stockQuantity = 0` (out-of-stock)
- At minimum 1 product with `stockQuantity ≤ 15` (low stock)
- At minimum 1 `CUSTOMER` profile and 1 `ADMIN` profile
- At minimum 1 approved review and 1 pending review

---

## 4. Unit Testing Expectations

Unit tests cover **pure functions and isolated logic** with no external dependencies (no database, no network calls).

### 4.1 Recommendation Scoring (`src/lib/recommendations.ts`)

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| UNIT-REC-001 | `getRecommendations` returns products sorted by descending similarity score | Highest-scored product appears first |
| UNIT-REC-002 | `getRecommendations` excludes the source product from results | Source `productId` not present in returned array |
| UNIT-REC-003 | `getRecommendations` excludes out-of-stock products from results | No product with `stockQuantity = 0` in results |
| UNIT-REC-004 | `getRecommendations` excludes unpublished products | No product with `isPublished = false` in results |
| UNIT-REC-005 | Jaccard score for two identical-category products with matching notes is higher than for different-category products | Score(same-category, matching notes) > Score(different category) |
| UNIT-REC-006 | Jaccard score returns `0` for products with zero attribute overlap | Score = 0 when no shared category, notes, mood, occasion, or price tier |
| UNIT-REC-007 | `getRecommendations` falls back to top-rated/featured products when fewer than 3 matches exceed threshold | Returns featured products in fallback case |
| UNIT-REC-008 | **No ML, AI, or probabilistic logic is used** — all scores are deterministic for identical inputs | Running the function twice with the same inputs returns identical results |

### 4.2 Telemetry Utility (`src/lib/telemetry.ts`)

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| UNIT-TEL-001 | `trackEvent` calls `navigator.sendBeacon` when available | `sendBeacon` invoked with correct endpoint and payload |
| UNIT-TEL-002 | `trackEvent` falls back to `fetch` with `keepalive: true` when `sendBeacon` unavailable | `fetch` called with `{ keepalive: true }` |
| UNIT-TEL-003 | `trackEvent` payload is typed as `TelemetryEvent` | TypeScript compilation passes with no type errors |

### 4.3 Cart Store (`src/lib/store/cartStore.ts`)

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| UNIT-CART-001 | `addItem` adds a new product to cart | Cart contains the added item |
| UNIT-CART-002 | `addItem` for an existing item increments quantity | Quantity increases by 1 |
| UNIT-CART-003 | `removeItem` removes product from cart | Cart does not contain the removed item |
| UNIT-CART-004 | `updateQuantity` sets exact quantity | Item quantity matches the set value |
| UNIT-CART-005 | `clearCart` empties all items | Cart array is empty after clear |
| UNIT-CART-006 | `getCartTotal` computes correct total | Total = sum of (price × quantity) for all items, no floating-point arithmetic errors |
| UNIT-CART-007 | Monetary values in cart are never raw `number` floating-point | All prices stored and returned as `string` or `Prisma.Decimal` representation |

### 4.4 TypeScript Type Check

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| UNIT-TS-001 | `tsc --noEmit` passes across entire project | Exit code `0`, zero errors |
| UNIT-TS-002 | No `any` type usage in `src/` source files | Zero `any` occurrences (verified by `tsc` strict mode) |
| UNIT-TS-003 | All monetary fields typed as `Prisma.Decimal` or `string`, not raw `number` | `tsc` strict null checks pass |

---

## 5. Integration Testing Expectations

Integration tests verify **server actions and API route handlers** against a real (test) database.

### 5.1 Catalog Server Actions

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| INT-CAT-001 | `getAllProducts` returns only `isPublished = true` products | Unpublished products excluded |
| INT-CAT-002 | `getProductBySlug` returns correct product with `SensoryAttribute[]`, `ProductImage[]`, `ProductVariant[]` | Full relations loaded |
| INT-CAT-003 | `getProductBySlug` returns null/not-found for invalid slug | `notFound()` or null returned |
| INT-CAT-004 | `getProductsByCategory` returns only products for that category | Correct category filter applied |
| INT-CAT-005 | `searchProducts` matches against product name | Results include name-matched products |
| INT-CAT-006 | `searchProducts` matches against tags and mood | Results include tag/mood-matched products |
| INT-CAT-007 | `getFilteredProducts` with `mood` filter returns only matching products | Mood filter applied correctly |
| INT-CAT-008 | `getFilteredProducts` with price range returns only products within range | Price boundary conditions correct |

### 5.2 Wishlist Server Actions

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| INT-WISH-001 | `addToWishlist` with `profileId` creates a `WishlistItem` | Record created in DB |
| INT-WISH-002 | `addToWishlist` duplicate (same `profileId` + `productId`) is rejected | Unique constraint enforced; no duplicate record |
| INT-WISH-003 | `addToWishlist` with `sessionId` (guest) creates a `WishlistItem` | Record created with `sessionId` |
| INT-WISH-004 | `addToWishlist` duplicate guest (same `sessionId` + `productId`) is rejected | Unique constraint enforced |
| INT-WISH-005 | `removeFromWishlist` deletes the correct item | Record removed from DB |
| INT-WISH-006 | `getWishlist` for authenticated user returns only their items | Correct `profileId` filter |
| INT-WISH-007 | `getWishlist` for guest returns only their `sessionId` items | Correct `sessionId` filter |

### 5.3 Cart Server Actions

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| INT-CART-001 | `validateCartStock` returns `valid: true` when all items have sufficient stock | Validation passes |
| INT-CART-002 | `validateCartStock` flags item with `stockQuantity = 0` | Out-of-stock item flagged |
| INT-CART-003 | `validateCartStock` flags item with quantity requested > available stock | Insufficient stock flagged |

### 5.4 Checkout & Order Server Actions

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| INT-CHK-001 | `initializeCheckout` creates an `Order` with `status = PENDING`, `paymentStatus = UNPAID` | Correct initial order state |
| INT-CHK-002 | `initializeCheckout` creates `OrderItem[]` records matching cart | All cart items reflected in `OrderItem` table |
| INT-CHK-003 | `initializeCheckout` stores `shippingAddress` as structured `Json`, not a flat string | `Order.shippingAddress` is a valid JSON object |
| INT-CHK-004 | `initializeCheckout` does **not** decrement `stockQuantity` at order creation | Stock unchanged until payment confirmed |
| INT-CHK-005 | Webhook handler with valid signature updates `Order.paymentStatus = PAID` | Order updated correctly |
| INT-CHK-006 | Webhook handler decrements `stockQuantity` atomically via Prisma transaction | Stock decremented correctly |
| INT-CHK-007 | Webhook handler with **invalid** signature returns HTTP 400 | Invalid signature rejected |
| INT-CHK-008 | Duplicate webhook event for the same `orderId` does **not** double-decrement stock | Idempotency enforced |

### 5.5 Review Server Actions

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| INT-REV-001 | `submitReview` creates a review with `isApproved = false` | New reviews await moderation |
| INT-REV-002 | `submitReview` from unauthenticated user is rejected | Unauthorized error returned |
| INT-REV-003 | `submitReview` with rating outside 1–5 is rejected by Zod | Validation error returned |
| INT-REV-004 | `getApprovedReviews` returns only `isApproved = true` reviews | Pending reviews excluded |

### 5.6 Telemetry API Route

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| INT-TEL-001 | `POST /api/telemetry` with valid `eventType` returns `202 Accepted` | Event logged in `EventLog` |
| INT-TEL-002 | `POST /api/telemetry` with invalid `eventType` returns `400 Bad Request` | Zod validation rejects unknown types |
| INT-TEL-003 | Guest event persists with `sessionId` only (`profileId` null) | `EventLog.profileId` is null for guest |
| INT-TEL-004 | Authenticated event persists with both `profileId` and `sessionId` | Both fields populated |

### 5.7 Recommendation API Route

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| INT-REC-001 | `GET /api/recommendations?productId=valid-id&limit=4` returns array of products | Correct typed response |
| INT-REC-002 | `GET /api/recommendations` without `productId` returns `400 Bad Request` | Missing param rejected |
| INT-REC-003 | `GET /api/recommendations?productId=invalid-id` returns `400 Bad Request` | Invalid param rejected |
| INT-REC-004 | Response does not include unpublished or admin-only products | Access control correct |
| INT-REC-005 | Returned recommendations are deterministic — same request returns same results | No random or probabilistic ordering |

---

## 6. Authentication & Authorization Tests

### 6.1 Customer Authentication

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| AUTH-001 | Valid email/password registers a new user | Supabase Auth user created; `Profile` record with `role = CUSTOMER` created |
| AUTH-002 | Registration with existing email is rejected | Supabase Auth returns error; no duplicate Profile |
| AUTH-003 | Registration with weak password is rejected | Zod validation error returned before Supabase call |
| AUTH-004 | Registered user can log in with correct credentials | Session cookie set; user redirected to `/account` |
| AUTH-005 | Login with incorrect password is rejected | Authentication error returned |
| AUTH-006 | Session cookie refreshed on every request via middleware | Cookie expiry extended on active sessions |
| AUTH-007 | Logged-in user can log out | Session destroyed; cookie cleared |
| AUTH-008 | Guest `session_id` cookie is generated for anonymous visitors | Cookie present in browser after first visit |

### 6.2 Admin Authorization

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| ADMIN-AUTH-001 | Unauthenticated request to `/admin` redirects to `/login` | HTTP redirect via Next.js middleware |
| ADMIN-AUTH-002 | Authenticated `CUSTOMER` role user accessing `/admin` is denied | Middleware redirect or 403 response |
| ADMIN-AUTH-003 | `ADMIN` role user can access all `/admin/*` routes | Full admin navigation accessible |
| ADMIN-AUTH-004 | Direct POST to admin Server Action without session returns Unauthorized error | `assertAdminSession()` throws and action aborts |
| ADMIN-AUTH-005 | Direct POST to admin Server Action with `CUSTOMER` session returns Forbidden error | `assertAdminSession()` throws `"Forbidden"` |
| ADMIN-AUTH-006 | `assertAdminSession()` is called as the **first operation** in every admin Server Action | Verified by code audit (TV-21-001) |
| ADMIN-AUTH-007 | Bypassing Next.js middleware does not grant admin access | Independent server-side auth verification catches bypass |

### 6.3 Guest Session Migration

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| AUTH-MIG-001 | Guest wishlist items migrate to authenticated user on login | Items visible in authenticated wishlist after login |
| AUTH-MIG-002 | Guest `EventLog` records associated with `profileId` on login | `EventLog.profileId` populated post-login |
| AUTH-MIG-003 | No data loss of pre-login wishlist or event history | All guest records present post-migration |

---

## 7. Catalog, Search & Filter Tests

### 7.1 Category Listing Pages

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| CAT-001 | `/perfumes` page renders all published perfume products | Only `isPublished = true` perfumes shown |
| CAT-002 | `/teas` page renders all published tea products | Only `isPublished = true` teas shown |
| CAT-003 | Out-of-stock products show an "Out of Stock" badge | Badge visible on product card |
| CAT-004 | Category page has correct SEO title and meta description | `<title>` and `<meta name="description">` present |

### 7.2 Product Card

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| CAT-005 | Product card renders product name, price, and primary image | All three fields visible |
| CAT-006 | Perfume product card renders sensory note pills | Top/heart/base note pills displayed |
| CAT-007 | Tea product card renders origin badge | Origin badge displayed |
| CAT-008 | Product card hover triggers tilt animation via `motion/react` | Animation fires on hover (desktop) |
| CAT-009 | Product card does **not** render a 3D canvas or model | No Three.js canvas on product cards |

### 7.3 Filter & Sort

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| FILTER-001 | Applying `fragranceFamily` filter on `/perfumes` updates displayed results | Only matching products shown |
| FILTER-002 | Applying `teaType` filter on `/teas` updates displayed results | Only matching products shown |
| FILTER-003 | Applying `mood` filter returns correct products across both categories | Mood-matched products returned |
| FILTER-004 | Applying price range filter excludes products outside range | Products outside price range hidden |
| FILTER-005 | Toggling "In Stock Only" hides out-of-stock products | Out-of-stock products removed from results |
| FILTER-006 | Sort by "Price Low → High" orders products correctly | Ascending price order verified |
| FILTER-007 | Sort by "Price High → Low" orders products correctly | Descending price order verified |
| FILTER-008 | Sort by "Rating" orders products by average review score | Highest-rated product appears first |
| FILTER-009 | Active filters update URL search params for shareability | URL reflects filter state |
| FILTER-010 | On mobile, filter panel collapses to a drawer/modal | Drawer accessible on viewport ≤ 768px |

### 7.4 Search

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| SEARCH-001 | Search modal opens on search icon click | Modal renders |
| SEARCH-002 | Typing a product name returns matching results | Products with matching name appear |
| SEARCH-003 | Typing a note/tag returns matching products | Products with matching sensory notes appear |
| SEARCH-004 | Typing a mood returns matching products | Mood-matched products appear |
| SEARCH-005 | Search query is debounced (300ms) | Server not called on every keystroke |
| SEARCH-006 | `Escape` key closes the search modal | Modal dismissed |
| SEARCH-007 | Keyboard arrow keys navigate search results | Focus moves through results |
| SEARCH-008 | `Enter` key on a selected result navigates to the PDP | Browser routes to product page |
| SEARCH-009 | Empty search input shows no results or a prompt | No results / "Start typing" state shown |

---

## 8. Product Detail Page Tests

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| PDP-001 | PDP renders correct product name, description, and price | Data matches seeded product |
| PDP-002 | PDP renders primary product image by default | `isPrimary = true` image shown |
| PDP-003 | Thumbnail click switches active gallery image | Active image updates |
| PDP-004 | Perfume PDP renders scent pyramid (top, heart, base notes) | Notes grouped by tier |
| PDP-005 | Tea PDP renders steeping guide (temperature, time, caffeine) | All steeping fields displayed |
| PDP-006 | Tea PDP caffeine level renders as visual meter | Meter reflects Low/Medium/High |
| PDP-007 | Mood, occasion, use_case, pairing_tags badges render when non-null | Badges visible for seeded metadata |
| PDP-008 | Mood/occasion badges do **not** render when fields are null | No empty badge elements |
| PDP-009 | Variant selector displays all variants for the product | All `ProductVariant[]` rendered |
| PDP-010 | Selecting a variant updates the displayed price | Price reflects `priceOverride` if set |
| PDP-011 | Out-of-stock variant selector button is disabled | Disabled state applied |
| PDP-012 | Add to Cart button adds the selected variant to Zustand store | Cart item count increases |
| PDP-013 | Add to Wishlist button calls `wishlistActions.addToWishlist` | Wishlist action invoked |
| PDP-014 | Invalid slug returns a 404 page | `notFound()` rendered |
| PDP-015 | PDP emits JSON-LD product schema in `<head>` | Structured data present in page source |
| PDP-016 | Recommendation carousel renders below main product content | "You May Also Enjoy" section visible |
| PDP-017 | Pairing widget renders a cross-category product when a match exists | "Pairs Well With" section visible |
| PDP-018 | Pairing widget is hidden when no cross-category match exists | Widget not rendered |
| PDP-019 | Approved reviews render in the review section | Approved review content visible |
| PDP-020 | Unauthenticated user sees "Login to review" prompt | Prompt rendered, form hidden |

---

## 9. Wishlist Tests

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| WISH-001 | Guest user can add a product to wishlist | Item appears in wishlist page |
| WISH-002 | Guest wishlist persists across page refreshes | Item still present after reload |
| WISH-003 | Authenticated user can add a product to wishlist | Item saved to DB with `profileId` |
| WISH-004 | Adding the same product twice is silently deduplicated | Only one entry per product in wishlist |
| WISH-005 | User can remove a product from wishlist | Item removed from list and DB |
| WISH-006 | "Move to Cart" adds the product to Zustand cart store | Cart item count increases |
| WISH-007 | Empty wishlist shows a meaningful empty state | "Your wishlist is empty" message visible |

---

## 10. Cart Tests

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| CART-001 | Adding a product opens the cart slide-over panel | Slide-over animates in from right |
| CART-002 | Cart slide-over renders all added line items | All cart items visible |
| CART-003 | Quantity increment increases item quantity | Quantity updates in UI and store |
| CART-004 | Quantity decrement decreases item quantity | Quantity decreases |
| CART-005 | Removing an item removes it from the cart | Item no longer in slide-over |
| CART-006 | Subtotal updates dynamically with quantity changes | Total recalculated correctly |
| CART-007 | Free shipping progress bar reflects current subtotal | Bar fills proportionally |
| CART-008 | Cart state persists across browser refreshes | Items still in cart after page reload |
| CART-009 | Clicking Checkout in slide-over routes to `/checkout` | Browser navigates to checkout page |

---

## 11. Checkout, Payment & Order Tests

### 11.1 Checkout Flow

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| CHK-001 | Address form validates all required fields before submission | Empty required field shows validation error |
| CHK-002 | Address form validates email format | Invalid email shows Zod error |
| CHK-003 | Order summary on checkout page reflects current cart | All cart items shown with correct prices |
| CHK-004 | `initializeCheckout` creates an Order with `PENDING` status | DB record created correctly |
| CHK-005 | `initializeCheckout` stores `shippingAddress` as structured JSON | `shippingAddress` object has `recipientName`, `addressLine1`, `city`, `country` |
| CHK-006 | Stock is **not** decremented at checkout initiation | `stockQuantity` unchanged in DB |
| CHK-007 | Payment gateway UI renders in the payment container slot | Provider UI or redirect shown |

### 11.2 Payment Webhook

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| CHK-008 | Valid signed webhook updates `Order.paymentStatus = PAID` | DB updated correctly |
| CHK-009 | Valid signed webhook updates `Order.status = PROCESSING` | DB updated correctly |
| CHK-010 | Valid signed webhook decrements `stockQuantity` | Stock reduced by ordered quantity |
| CHK-011 | Invalid webhook signature returns HTTP 400 | Webhook rejected |
| CHK-012 | Second identical webhook for same order does not double-decrement stock | Idempotency verified |

### 11.3 Order Confirmation

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| CHK-013 | Order confirmation page displays correct `orderNumber` | Correct order shown |
| CHK-014 | Order confirmation page shows itemized order summary | All items and prices visible |
| CHK-015 | Cart is cleared from Zustand store on confirmation page load | Cart empty after successful order |

### 11.4 Order History

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| CHK-016 | Authenticated user can view their order history | All their orders listed |
| CHK-017 | Orders sorted by date descending | Most recent order appears first |
| CHK-018 | Unauthenticated user accessing `/account/orders` is redirected to `/login` | Auth redirect applied |
| CHK-019 | Order detail page shows itemized items and structured shipping address | `shippingAddress` JSON deserialized correctly |
| CHK-020 | User cannot access another user's order by ID enumeration | 403 or not-found response for unauthorized order access |

---

## 12. Recommendation Engine Tests

> **Important:** All tests in this section validate **deterministic, content-based logic only**. No ML, AI ranking, collaborative filtering, or probabilistic scoring is tested or expected.

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| REC-001 | PDP "You May Also Enjoy" section renders 3–4 products | Correct count displayed |
| REC-002 | Recommended products share at least one attribute with the source product (category, notes, mood, occasion) | Products are genuinely related |
| REC-003 | Source product does not appear in its own recommendations | Self-recommendation absent |
| REC-004 | Out-of-stock products do not appear in recommendations | Stock filter applied |
| REC-005 | Unpublished products do not appear in recommendations | Publish filter applied |
| REC-006 | When fewer than 3 matching products found, fallback to top-rated/featured products | Fallback activates correctly |
| REC-007 | "Pairs Well With" widget shows a product from the opposite category | Cross-category match verified |
| REC-008 | "Pairs Well With" widget hidden when no cross-category match exists | Widget absent from DOM |
| REC-009 | Calling `getRecommendations` twice with identical inputs returns identical results | Determinism verified (no randomness) |
| REC-010 | No ML library, model, or AI ranking function is imported anywhere in the codebase | Confirmed by grep of `node_modules` imports and `src/` source files |

---

## 13. Telemetry Tests

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| TEL-001 | PDP page load fires `product_view` event | `EventLog` record with `eventType = product_view` created |
| TEL-002 | Search execution fires `search_query` event | `EventLog` record with `eventType = search_query` created |
| TEL-003 | Wishlist add action fires `wishlist_add` event | `EventLog` record created |
| TEL-004 | Cart add action fires `cart_add` event | `EventLog` record created |
| TEL-005 | Checkout page entry fires `checkout_start` event | `EventLog` record created |
| TEL-006 | Order confirmation page load fires `purchase_completed` event | `EventLog` record created |
| TEL-007 | Telemetry call does not block or visibly delay UI | Page interaction remains responsive during telemetry dispatch |
| TEL-008 | Guest event stored with `sessionId` only (`profileId` null) | Correct guest record in DB |
| TEL-009 | Authenticated event stored with both `profileId` and `sessionId` | Both fields populated in DB |
| TEL-010 | Invalid `eventType` rejected with HTTP 400 | Zod validation error returned |

---

## 14. Admin Flow Tests

### 14.1 Product Management

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| ADM-PROD-001 | Admin can create a new perfume product with all fields | Product visible in admin list and storefront |
| ADM-PROD-002 | Admin can create a new tea product with steeping guide | Product visible with correct steeping data |
| ADM-PROD-003 | Admin can update an existing product name and price | Updated values reflect on storefront |
| ADM-PROD-004 | Admin can upsert sensory attributes (notes) for a product | Notes updated and shown in scent pyramid |
| ADM-PROD-005 | Admin can upload a product image via Supabase Storage | Image URL stored and visible on PDP |
| ADM-PROD-006 | Admin can update recommendation metadata (`mood`, `occasion`, `useCase`, `pairingTags`) | Metadata saved and used by recommendation engine |
| ADM-PROD-007 | Admin can publish/unpublish a product | Published state controls storefront visibility |
| ADM-PROD-008 | Admin can delete a product | Product no longer visible in admin or storefront |

### 14.2 Inventory Management

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| ADM-INV-001 | Admin inventory page shows all product variants with stock | Complete stock list rendered |
| ADM-INV-002 | Low-stock items (≤ 15) highlighted in Muted Gold | Correct visual styling applied |
| ADM-INV-003 | Out-of-stock items (= 0) highlighted in red | Correct visual styling applied |
| ADM-INV-004 | Admin can update stock quantity inline | Updated quantity saved to DB |

### 14.3 Order Management

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| ADM-ORD-001 | Admin can view all orders with status filter | Orders filtered by `OrderStatus` |
| ADM-ORD-002 | Admin can update order status (e.g., `PROCESSING → SHIPPED`) | Status updated in DB |
| ADM-ORD-003 | Admin can add a tracking number to an order | `Order.trackingNumber` saved |
| ADM-ORD-004 | Status update is visible on the customer's order detail page | Customer view reflects admin action |

### 14.4 Review Moderation

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| ADM-REV-001 | Admin sees pending reviews in review moderation list | `isApproved = false` reviews listed |
| ADM-REV-002 | Admin approves a review — review becomes visible on PDP | `isApproved = true`; review appears on storefront |
| ADM-REV-003 | Admin rejects a review — review is deleted | Review removed from DB |

### 14.5 Analytics

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| ADM-ANA-001 | Revenue total reflects only `paymentStatus = PAID` orders | Unpaid/pending orders excluded from total |
| ADM-ANA-002 | Top 10 most-viewed products displayed from `EventLog` | Correctly aggregated from `product_view` events |
| ADM-ANA-003 | Top 10 search queries displayed from `EventLog` | Correctly aggregated from `search_query` events |

---

## 15. Responsive & Mobile Tests

All tests in this section must be verified at each defined breakpoint: **320px, 640px, 768px, 1024px, 1280px, 1536px+**.

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| RESP-001 | No horizontal scroll on any page at any breakpoint | Viewport width = content width |
| RESP-002 | Homepage hero stacks vertically on mobile (< 768px) | Split-grid collapses to single column |
| RESP-003 | Navigation collapses to hamburger drawer on mobile | Hamburger visible; drawer functional |
| RESP-004 | Cart slide-over is full-width on mobile | Slide-over fills viewport width |
| RESP-005 | Filter panel collapses to modal/drawer on mobile | Filter accessible via modal on small screens |
| RESP-006 | Product grid adapts: 1 column (mobile), 2 columns (tablet), 3–4 columns (desktop) | Column count correct per breakpoint |
| RESP-007 | PDP gallery thumbnail strip scrolls horizontally on mobile | No overflow clipping |
| RESP-008 | Checkout form is single-column on mobile | Form usable on small screens |
| RESP-009 | Admin sidebar collapses to top nav on small screens | Admin UI usable on tablet |
| RESP-010 | All touch targets meet 44×44px minimum | Verified on iOS/Android device or emulator |
| RESP-011 | Footer collapses from 4 columns (desktop) to 2 columns (mobile) | Responsive grid correct |

---

## 16. Accessibility Tests

All tests aligned with **WCAG 2.1 AA** standard as required by `DESIGN.md` and `RULES.md` Section 13.

### 16.1 Contrast

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| A11Y-001 | Body text on Ivory background meets ≥ 4.5:1 contrast ratio | Verified with contrast checker |
| A11Y-002 | Body text on Forest Green background meets ≥ 4.5:1 contrast ratio | Verified with contrast checker |
| A11Y-003 | Heading text on Ivory background meets ≥ 3:1 contrast ratio | Verified with contrast checker |
| A11Y-004 | Muted Gold text on Forest Green background meets ≥ 3:1 contrast ratio | Verified with contrast checker |
| A11Y-005 | Any failing color combinations are corrected before release | Zero failing combinations |

### 16.2 Keyboard Navigation

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| A11Y-006 | All interactive controls reachable via Tab key | Full keyboard traversal works |
| A11Y-007 | Cart slide-over traps focus when open | Tab cycles only within the slide-over panel |
| A11Y-008 | Search modal traps focus when open | Tab cycles only within the search modal |
| A11Y-009 | Filter drawer traps focus when open (mobile) | Tab cycles only within filter drawer |
| A11Y-010 | Focus returns to trigger element when modal/drawer is closed | Focus restored correctly |
| A11Y-011 | All form fields have associated `<label>` elements | No unlabelled inputs |

### 16.3 ARIA & Semantic HTML

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| A11Y-012 | All icon-only buttons have descriptive `aria-label` | Search, Cart, Wishlist, Close buttons labelled |
| A11Y-013 | 3D canvas containers have `aria-label` and `role="img"` | Canvas accessible to screen readers |
| A11Y-014 | Product images have descriptive `alt` text | `alt` attribute present and meaningful |
| A11Y-015 | Star rating inputs have accessible labels | Screen readers announce rating level |
| A11Y-016 | Page has a single `<h1>` per page | Heading hierarchy verified |
| A11Y-017 | Semantic HTML5 elements used (`<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`) | Correct semantic markup |

### 16.4 Reduced Motion

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| A11Y-018 | `prefers-reduced-motion: reduce` disables page transitions | No CSS/JS animations fire |
| A11Y-019 | `prefers-reduced-motion: reduce` disables scroll reveal animations | Elements appear without animation |
| A11Y-020 | `prefers-reduced-motion: reduce` disables 3D hero canvas (fallback to static image) | Static WebP displayed instead |

---

## 17. 3D & Motion Fallback Tests

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| 3D-001 | Hero 3D canvas loads successfully on desktop (≥ 769px) | R3F canvas renders without errors |
| 3D-002 | Hero displays static WebP fallback on mobile (≤ 768px) | No 3D canvas in DOM on mobile |
| 3D-003 | Hero displays static WebP fallback when `prefers-reduced-motion: reduce` is active | No 3D canvas in DOM |
| 3D-004 | Hero canvas loads client-side only (dynamic import with `ssr: false`) | No Three.js in SSR-rendered HTML |
| 3D-005 | Tea particle canvas renders on the Tea category page on desktop | Particle system visible |
| 3D-006 | Tea category page shows CSS keyframe fallback on mobile | Static CSS animation instead of canvas |
| 3D-007 | PDP 3D toggle button only appears when a 3D model asset path exists for the product | Button absent for products without 3D asset |
| 3D-008 | PDP 3D toggle dynamically loads the 3D canvas on click (not pre-loaded) | Network tab shows canvas loaded only after click |
| 3D-009 | PDP falls back to static image for products without a 3D asset | Static gallery shown |
| 3D-010 | `npm run build` succeeds with no Three.js / R3F SSR import errors | Build exits clean |
| 3D-011 | Three.js / R3F packages are **not** present in the initial client bundle | Verified via bundle analyzer |
| 3D-012 | No `framer-motion` package imported anywhere in the codebase | Grep confirms zero `framer-motion` imports |
| 3D-013 | All motion animations use `import { motion, AnimatePresence } from "motion/react"` | Verified by grep across `src/` |

---

## 18. Security Test Cases

### 18.1 Authentication & Authorization

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| SEC-001 | Unauthenticated direct HTTP POST to any admin Server Action returns Unauthorized | `assertAdminSession()` blocks the request |
| SEC-002 | `CUSTOMER` role user direct POST to admin Server Action returns Forbidden | `assertAdminSession()` role check blocks |
| SEC-003 | Admin session cookie tampered or forged returns Unauthorized | Invalid session detected by Supabase Auth |
| SEC-004 | `/admin/*` routes blocked by Next.js middleware without session | Redirect to `/login` |

### 18.2 Environment Variable Exposure

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| SEC-005 | `SUPABASE_SERVICE_ROLE_KEY` is absent from client-side JavaScript bundle | Verified via DevTools network inspection |
| SEC-006 | `PAYMENT_GATEWAY_SECRET` is absent from client-side JavaScript bundle | Verified via DevTools network inspection |
| SEC-007 | `PAYMENT_WEBHOOK_SECRET` is absent from client-side JavaScript bundle | Verified via DevTools network inspection |
| SEC-008 | `DATABASE_URL` is absent from client-side JavaScript bundle | Verified via DevTools network inspection |
| SEC-009 | Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` use `NEXT_PUBLIC_` prefix | Verified by reviewing `.env.example` |

### 18.3 Input Validation

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| SEC-010 | All Server Action inputs validated with Zod before processing | Zod schema validation present in every action |
| SEC-011 | All API Route Handler inputs validated with Zod before processing | Zod schema validation present in every handler |
| SEC-012 | SQL injection attempt via search query does not affect the database | Prisma parameterized queries prevent injection |
| SEC-013 | XSS payload in review `comment` field is sanitized or escaped | Payload not rendered as executable HTML |

### 18.4 Error Sanitization

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| SEC-014 | Prisma error stack trace is not visible in client-facing API responses | Only sanitized error message returned |
| SEC-015 | Database error details are not visible in Server Action error returns | `ActionResult` error field contains only user-safe message |
| SEC-016 | Internal server errors return HTTP 500 with generic message | No stack trace in response body |

### 18.5 Webhook Security

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| SEC-017 | Payment webhook validates signature before processing any payload | Unsigned webhook returns HTTP 400 |
| SEC-018 | Duplicate webhook event does not cause double stock decrement | Idempotency logic verified |

### 18.6 Order Access Control

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| SEC-019 | Customer cannot access another customer's order by guessing order ID | Ownership check enforced server-side |
| SEC-020 | Admin can access any order; customer can access only their own | Role-based access correctly applied |

---

## 19. Performance Validation

| Test Case ID | Description | Expected Result |
| :--- | :--- | :--- |
| PERF-001 | No raw `<img>` tags in JSX across the entire codebase | All images use `next/image` |
| PERF-002 | Hero image (`priority` prop set) loads as Largest Contentful Paint | LCP image has `priority` attribute |
| PERF-003 | No Cumulative Layout Shift (CLS) from images | `width` and `height` or `fill` prop set correctly on `next/image` |
| PERF-004 | Three.js / R3F not present in initial page JavaScript bundle | Verified via `@next/bundle-analyzer` |
| PERF-005 | No N+1 query patterns in product listing queries | Prisma `include` used; no sequential per-item queries |
| PERF-006 | Product listing page Prisma query uses selective `include` for required relations only | No unbounded relation includes |
| PERF-007 | No unnecessary or unapproved packages in `package.json` | `RULES.md` Section 15 dependency guardrails respected |

---

## 20. Production Smoke-Test Checklist

Execute this checklist **on the live production environment** after every production deployment.

### 20.1 Storefront

- [ ] Homepage loads at production URL with correct Two Valley brand styling
- [ ] Forest Green, Ivory, and Muted Gold color tokens render correctly
- [ ] Playfair Display (headings) and Inter (body) fonts load correctly
- [ ] Announcement bar visible above navigation
- [ ] Navigation links route to `/perfumes`, `/teas`, and account pages
- [ ] Featured collections section displays seeded featured products
- [ ] Hero section displays static image (or 3D canvas if applicable)

### 20.2 Product Catalog

- [ ] `/perfumes` page renders all published perfume products
- [ ] `/teas` page renders all published tea products
- [ ] Filter controls functional (apply `mood` filter, verify results)
- [ ] Sort controls functional (apply "Price Low → High", verify order)
- [ ] Search modal opens and returns relevant results

### 20.3 Product Detail Page

- [ ] Perfume PDP renders scent pyramid with all note tiers
- [ ] Tea PDP renders steeping guide with temperature and caffeine meter
- [ ] Product variant selector updates price on selection
- [ ] Add to Cart button increases cart badge count
- [ ] Recommendations visible in "You May Also Enjoy" section
- [ ] Review section renders approved reviews (if any seeded)

### 20.4 Wishlist & Cart

- [ ] Wishlist add functional (both guest and authenticated)
- [ ] Cart slide-over opens with correct line items and subtotal
- [ ] Quantity increment/decrement updates total
- [ ] Cart persists after browser refresh

### 20.5 Checkout & Payment

- [ ] Checkout page renders address form and order summary
- [ ] Address form validation fires on empty submit
- [ ] Payment gateway UI or redirect renders in payment container
- [ ] Test payment completes and triggers webhook
- [ ] Order confirmation page renders with correct order number
- [ ] Cart cleared after successful order
- [ ] `EventLog` table contains `purchase_completed` event for the test order

### 20.6 Authentication

- [ ] New user registration creates account and `Profile` record
- [ ] Existing user login successful; session cookie set
- [ ] Order history accessible at `/account/orders` for authenticated user
- [ ] Logout clears session

### 20.7 Admin

- [ ] Admin user can log in and access `/admin` dashboard
- [ ] KPI summary cards show correct counts
- [ ] `CUSTOMER` role user accessing `/admin` receives redirect (not dashboard access)
- [ ] Admin can edit a product and changes appear on storefront
- [ ] Admin can update an order status

### 20.8 3D & Motion

- [ ] Hero 3D canvas loads on desktop without console errors
- [ ] Mobile (≤ 768px) shows static WebP hero (no canvas)
- [ ] Tea particle canvas renders on `/teas` page on desktop
- [ ] Scroll reveal animations fire on section entry (desktop)

### 20.9 Telemetry

- [ ] `product_view` event recorded in production `EventLog` after visiting a PDP
- [ ] `cart_add` event recorded after adding a product to cart
- [ ] `purchase_completed` event recorded after test order completion

---

## 21. Pass / Fail Rules & Acceptance Criteria

### 21.1 Blocking (Must Pass Before Production Deployment)

The following categories are **hard blockers**. Production deployment **must not proceed** if any test in these categories fails:

| Category | Test IDs |
| :--- | :--- |
| TypeScript type check | UNIT-TS-001 to UNIT-TS-003 |
| Production build | 3D-010, 3D-012, 3D-013 |
| Admin authorization | ADMIN-AUTH-001 to ADMIN-AUTH-007 |
| Checkout & payment webhook | CHK-001 to CHK-015 |
| Webhook security | SEC-001 to SEC-003, SEC-017, SEC-018 |
| Environment variable exposure | SEC-005 to SEC-009 |
| Order access control | SEC-019, SEC-020 |
| Customer critical flows | CAT-001 to CAT-004, PDP-001, PDP-012, PDP-014, CART-001, CART-008 |

### 21.2 Non-Blocking (Must Be Resolved Before Public Launch)

The following categories must be resolved but may allow a controlled soft launch with restricted access:

| Category | Test IDs |
| :--- | :--- |
| Accessibility contrast | A11Y-001 to A11Y-005 |
| Responsive layout | RESP-001 to RESP-011 |
| 3D/motion fallbacks | 3D-001 to 3D-009, 3D-011 |
| Performance | PERF-001 to PERF-007 |

### 21.3 Acceptance Criteria Summary

| Gate | Required State |
| :--- | :--- |
| `tsc --noEmit` | Exit code 0, zero errors |
| `npm run build` | Exit code 0, no SSR errors, no `framer-motion` imports |
| All blocking test cases | PASS |
| All security test cases | PASS |
| Production smoke-test checklist | All items checked |

---

## 22. Task Traceability Matrix

| Test Section | TASKS.md Task IDs |
| :--- | :--- |
| Unit: Recommendation Scoring | TV-13-001 |
| Unit: Telemetry Utility | TV-14-002 |
| Unit: Cart Store | TV-09-001 |
| Unit: TypeScript Check | TV-20-001 |
| Integration: Catalog Actions | TV-04-001 |
| Integration: Wishlist Actions | TV-08-001 |
| Integration: Cart Actions | TV-09-002 |
| Integration: Checkout Actions | TV-10-002, TV-10-003 |
| Integration: Review Actions | TV-12-001 |
| Integration: Telemetry Route | TV-14-001 |
| Integration: Recommendations Route | TV-13-002 |
| Auth & Authorization Tests | TV-03-001 to TV-03-005, TV-21-001 |
| Catalog, Search, Filter Tests | TV-04-001, TV-06-001 to TV-06-004 |
| PDP Tests | TV-07-001 to TV-07-006 |
| Wishlist Tests | TV-08-001 to TV-08-002 |
| Cart Tests | TV-09-001 to TV-09-003 |
| Checkout & Order Tests | TV-10-001 to TV-10-005, TV-11-001 to TV-11-002 |
| Recommendation Tests | TV-13-001 to TV-13-004 |
| Telemetry Tests | TV-14-001 to TV-14-003 |
| Admin Flow Tests | TV-15-001 to TV-17-002 |
| Responsive Tests | TV-19-003 |
| Accessibility Tests | TV-19-001 to TV-19-002 |
| 3D & Motion Tests | TV-18-001 to TV-18-004, TV-22-002 |
| Security Tests | TV-21-001 to TV-21-003 |
| Performance Tests | TV-22-001 to TV-22-003 |
| Production Smoke Tests | TV-25-001 to TV-25-003 |

---
