# Security Model (SECURITY.md)

## Project Name: Two Valley
**Document Version:** 1.0  
**Status:** Approved (v1.0)  
**Aligned With:** PRD.md, ARCHITECTURE.md, DESIGN.md, RULES.md, TASKS.md v1.1, TEST_PLAN.md v1.0  

---

## Table of Contents

1. [Security Principles & Threat Model](#1-security-principles--threat-model)
2. [Supabase Authentication Security](#2-supabase-authentication-security)
3. [Session & Cookie Security](#3-session--cookie-security)
4. [Customer vs Admin Authorization](#4-customer-vs-admin-authorization)
5. [Independent Admin Authorization — Defense in Depth](#5-independent-admin-authorization--defense-in-depth)
6. [Guest Session Security](#6-guest-session-security)
7. [Prisma & Database Security](#7-prisma--database-security)
8. [Data-Access & Row-Level Security Considerations](#8-data-access--row-level-security-considerations)
9. [Input Validation with Zod](#9-input-validation-with-zod)
10. [API & Server Action Security](#10-api--server-action-security)
11. [Payment & Webhook Security](#11-payment--webhook-security)
12. [Environment Variable & Secret Management](#12-environment-variable--secret-management)
13. [XSS, CSRF & Injection Protections](#13-xss-csrf--injection-protections)
14. [Error Handling & Information Disclosure](#14-error-handling--information-disclosure)
15. [File & Image Upload Security](#15-file--image-upload-security)
16. [Telemetry & Privacy Considerations](#16-telemetry--privacy-considerations)
17. [Order & Customer-Data Access Controls](#17-order--customer-data-access-controls)
18. [Security Logging & Audit Considerations](#18-security-logging--audit-considerations)
19. [Dependency & Security Update Expectations](#19-dependency--security-update-expectations)
20. [Pre-Production Security Checklist](#20-pre-production-security-checklist)
21. [Production Security Checklist](#21-production-security-checklist)
22. [Incident Response Basics](#22-incident-response-basics)
23. [Security Acceptance Criteria](#23-security-acceptance-criteria)

---

## 1. Security Principles & Threat Model

### 1.1 Guiding Security Principles

Two Valley is a production e-commerce platform handling customer accounts, order data, and payment flows. The security model is built on the following principles:

| Principle | Description |
| :--- | :--- |
| **Zero Trust** | No request is trusted by default, regardless of origin. Every sensitive operation is independently authenticated and authorized server-side. |
| **Defense in Depth** | Multiple independent security layers protect each sensitive boundary. No single layer is relied upon exclusively. |
| **Least Privilege** | Components, services, and users are granted only the minimum permissions required to perform their function. |
| **Fail Secure** | When authorization or validation fails, the system denies access and returns a safe error. It does not silently allow the operation to proceed. |
| **Secrets Never Leave the Server** | All credentials, signing keys, and service role tokens remain exclusively in server-side execution environments. |
| **No Security Through Obscurity** | Security guarantees must hold even if an attacker knows the codebase structure. |

### 1.2 Threat Model Summary

The following are the primary threats the Two Valley security model is designed to address:

| Threat | Description | Mitigated By |
| :--- | :--- | :--- |
| **Unauthorized admin access** | Attacker attempts to access `/admin` routes or mutate admin data | Next.js middleware + independent `assertAdminSession()` in every admin handler |
| **Privilege escalation** | Authenticated customer attempts to call admin Server Actions | `assertAdminSession()` verifies `Profile.role === 'ADMIN'` independently |
| **Session hijacking** | Attacker steals or forges session cookies | Supabase Auth `@supabase/ssr` secure cookie handling; HTTPS enforcement |
| **Order/data enumeration** | Customer guesses another customer's order ID to view their data | Server-side ownership check on every order data access |
| **Payment webhook spoofing** | Attacker sends fake payment confirmation to trigger stock release | Gateway signature verification before any state mutation |
| **Secret key exposure** | Server-side secrets leaked into client bundle | Strict `NEXT_PUBLIC_` prefix discipline; bundle audit |
| **Input injection** | Attacker submits malicious data via forms or API calls | Zod schema validation; Prisma parameterized queries |
| **XSS payload injection** | Attacker stores malicious scripts via user-generated content | React's default JSX escaping; no `dangerouslySetInnerHTML` on user content |
| **Information disclosure** | Stack traces, DB errors, or internal details exposed in responses | Sanitized error responses in all handlers |
| **Malicious file upload** | Attacker uploads executable or oversized content to storage | Supabase Storage policies; file type and size validation |
| **Dependency vulnerabilities** | Third-party packages introduce known CVEs | Regular `npm audit`; approved dependency list per `RULES.md` Section 15 |

### 1.3 Out of Scope (MVP)

The following are explicitly outside the security scope of the MVP:

- PCI DSS, SOC 2, or formal compliance certifications
- DDoS mitigation beyond platform-level (Vercel/Supabase defaults)
- Hardware security modules or custom cryptography
- Advanced threat intelligence or SIEM platforms
- ML-based anomaly detection
- Multi-factor authentication (deferred to post-MVP)

---

## 2. Supabase Authentication Security

### 2.1 Authentication Delegation

Two Valley delegates all customer authentication to **Supabase Auth**. No custom password hashing, JWT signing, or token management is implemented by the application.

- Password hashing is handled exclusively by Supabase Auth internally.
- JWTs are issued and verified by Supabase Auth; the application never manually decodes them without using the official `@supabase/ssr` library.
- Email confirmation is enabled via Supabase Auth project settings for new registrations.

### 2.2 Supabase Client Separation

Two distinct Supabase client types are used, and they must **never be substituted for each other**:

| Client | File | Used In | Key Point |
| :--- | :--- | :--- | :--- |
| **Browser client** | `src/lib/supabase/client.ts` | Client Components only | Created with `createBrowserClient`; uses anon key |
| **Server client** | `src/lib/supabase/server.ts` | Server Components, Server Actions, Route Handlers | Created with `createServerClient`; reads/writes session cookies |

> **Rule:** The server client must be used for all session validation in server-side code. Using the browser client on the server would bypass proper cookie-based session handling.

### 2.3 Supabase Service Role Key

The `SUPABASE_SERVICE_ROLE_KEY` bypasses all Supabase Row-Level Security policies and grants full database access.

- It is used **only in server-side contexts** where elevated access is explicitly required.
- It **must never** be passed to any client component, exposed in API responses, or stored in `NEXT_PUBLIC_*` variables.
- It is classified as a **Critical Secret** per Section 12.

### 2.4 Profile Table Integrity

- The `Profile` table is the application's authoritative source of user roles and account state.
- Every registered Supabase Auth user must have a corresponding `Profile` record with `role = CUSTOMER`.
- `Profile.id` must exactly match `auth.users.id` (UUID). No orphaned auth users without a Profile are permitted.
- The `Profile.role` field is the sole source of truth for role-based authorization decisions.

---

## 3. Session & Cookie Security

### 3.1 Session Management

- Supabase Auth session management is handled by `@supabase/ssr`, which stores the session in **server-managed, HTTP-only cookies**.
- The `src/middleware.ts` refreshes Supabase session cookies on every request to prevent expiry-based session drops.
- Sessions are server-validated on each sensitive operation; possession of a session cookie alone is not sufficient to bypass server-side authorization checks.

### 3.2 Cookie Security Requirements

Two Valley uses two distinct cookie types with different security requirements:

#### Supabase Auth Session Cookies (managed by `@supabase/ssr`)

`@supabase/ssr` sets and manages the Supabase session cookies server-side. The following attributes apply and must not be manually overridden to less restrictive values:

| Cookie Attribute | Required Value | Reason |
| :--- | :--- | :--- |
| `HttpOnly` | `true` | Prevents JavaScript access to the session token |
| `Secure` | `true` (production) | Cookie only transmitted over HTTPS |
| `SameSite` | `Lax` or `Strict` | Reduces CSRF exposure |
| `Path` | `/` | Available to all routes |

#### Guest `session_id` Cookie (application-managed)

The guest `session_id` cookie is **intentionally readable by client-side JavaScript** so the browser client can include it in telemetry and wishlist calls. It is therefore set **without** the `HttpOnly` flag by design. This is appropriate because:

- The `session_id` is not an authentication credential and grants no privileged access.
- It is a random UUID with no inherent value to an attacker beyond linking anonymous events.
- `Secure` (HTTPS-only) should still be enforced on the `session_id` cookie in production.
- The guest cookie carries no authentication authority and is never used to bypass authorization checks.

### 3.3 Session Refresh

- The `src/middleware.ts` calls the Supabase session refresh helper on every request matching the middleware route pattern.
- Stale sessions are renewed transparently; expired sessions redirect to `/login`.
- Admin sessions are subject to the same refresh logic, but admin authorization is re-verified independently on every admin request (see Section 5).

---

## 4. Customer vs Admin Authorization

### 4.1 Role Definitions

Two roles are defined in the `Profile.role` enum:

| Role | Description | Access |
| :--- | :--- | :--- |
| `CUSTOMER` | Registered customer | Own orders, own wishlist, own account, public catalog |
| `ADMIN` | Platform administrator | All admin routes, all orders, all user data, product/inventory/review management |

### 4.2 Customer Authorization Boundaries & Role Isolation

Authenticated customers may access customer portal routes (`/account`, `/account/orders`, `/wishlist`).
To guarantee strict role isolation:
- **OAuth Auto-Promotion Prevention:** Google OAuth signups processed via `/auth/callback` default strictly to `Role.CUSTOMER`. They NEVER auto-promote to `ADMIN`.
- **Customer Route Protection:** `/account` enforces active session, confirmed email, and `Role.CUSTOMER` profile role. Authenticated admin users attempting to visit `/account` are redirected to `/admin` to eliminate cross-role session confusion.
- **Removal of Phone/SMS Surface:** Phone numbers and SMS OTP authentication are removed from input validation schemas, database expectations, and UI forms, eliminating SMS spoofing and toll-fraud attack vectors.

- Their own `Profile` data
- Their own `Order` and `OrderItem` records (ownership-verified per request)
- Their own `WishlistItem` records (tied to `profileId`)
- All published (`isPublished = true`) `Product` records
- All approved (`isApproved = true`) `Review` records
- Public catalog, search, filter, and recommendation endpoints

Customers must **never** be able to access:

- Another customer's orders, wishlist, or profile data
- Any `/admin/*` routes or admin Server Actions
- Unpublished products or unapproved reviews
- `SUPABASE_SERVICE_ROLE_KEY` or any other platform secret

### 4.3 Admin Authorization Boundaries

Admin users may access everything a customer can access, plus:

- All `/admin/*` routes and pages
- All admin Server Actions (`createProduct`, `updateProduct`, `deleteProduct`, `approveReview`, etc.)
- All `Order` records regardless of owning customer
- All `Review` records including pending ones
- All `Profile` records (read-only listing)
- Inventory management (stock quantity updates)
- Analytics and `EventLog` aggregations

---

## 5. Independent Admin Authorization — Defense in Depth

### 5.1 The Two-Layer Admin Security Model

Admin access is protected by **two independent security layers** that must both pass:

```
Layer 1 — Next.js Middleware (src/middleware.ts)
  ↓ Request-level: redirects unauthenticated users away from /admin/*
  ↓ (Can be bypassed by direct Server Action or API calls)

Layer 2 — assertAdminSession() (server-side, per-operation)
  ↓ Operation-level: independently verifies session + Profile.role === 'ADMIN'
  ↓ (Cannot be bypassed; runs within the trusted server execution context)
```

> **Critical Rule:** Layer 1 (middleware) is a UX convenience and a first-line defence. It does **not** replace Layer 2. Layer 2 (`assertAdminSession()`) is the **authoritative** security gate and must be present in every admin operation regardless of middleware.

### 5.2 `assertAdminSession()` — Required Behaviour

The `assertAdminSession()` function must:

1. Retrieve the current session using the **server-side Supabase client** (`createServerClient`).
2. Verify the session exists and has not expired.
3. Query `Profile` from the Prisma database using `session.user.id`.
4. Verify `Profile.role === 'ADMIN'`.
5. **Throw** a typed `"Unauthorized"` error if no valid session exists.
6. **Throw** a typed `"Forbidden"` error if the session belongs to a `CUSTOMER` role user.
7. Return the verified user only on full success.

### 5.3 Mandatory Placement

`assertAdminSession()` must be called as the **first executable line** in:

- Every admin Server Action in `src/actions/adminActions.ts`
- Every admin API Route Handler in `src/app/api/admin/`
- The admin layout (`src/app/admin/layout.tsx`) for rendering-level protection

Calling it later in the function body (after data reads or mutations have begun) is a security defect.

### 5.4 Prohibited Patterns

The following patterns are explicitly prohibited in admin handlers:

```typescript
// PROHIBITED: Trusting middleware alone
export async function deleteProduct(id: string) {
  // No assertAdminSession() — relies on middleware only
  await db.product.delete({ where: { id } });
}

// PROHIBITED: Calling assertAdminSession() after data access
export async function updateOrder(id: string, data: unknown) {
  const order = await db.order.findUnique({ where: { id } }); // data accessed before auth check
  await assertAdminSession();
  // ...
}

// REQUIRED: assertAdminSession() is the first call
export async function deleteProduct(id: string) {
  await assertAdminSession(); // Must be first
  await db.product.delete({ where: { id } });
}
```

### 5.5 Bypass Resistance

The admin security model must remain secure even if:

- The Next.js middleware is misconfigured or absent
- An attacker crafts a direct HTTP POST to a Server Action endpoint
- An attacker has a valid `CUSTOMER` session cookie
- The `/admin` UI is not the entry point (e.g., direct API call)

Because `assertAdminSession()` runs inside the trusted Node.js server environment and independently queries the `Profile` table, none of these bypass scenarios are effective.

---

## 6. Guest Session Security

### 6.1 Guest Session ID

Anonymous visitors receive a `session_id` cookie that identifies their browser session for wishlist and telemetry purposes. This is **not** an authentication mechanism.

- The `session_id` is a randomly generated UUID assigned on first visit.
- It is set as a standard (non-HttpOnly) browser cookie so client-side code can read it for display purposes, but it carries no authentication authority.
- Guest `session_id` values are never used to grant access to authenticated-only resources.

### 6.2 Guest Data Isolation

- Guest `WishlistItem` records are stored with `profileId = null` and keyed by `sessionId`.
- Guest `EventLog` records are stored with `profileId = null` and keyed by `sessionId`.
- Guest records are visible only when the same `sessionId` cookie is present.

### 6.3 Guest-to-Authenticated Migration

On login, guest data is migrated to the authenticated profile:

- Guest `WishlistItem` records are updated from `sessionId` to `profileId`.
- Guest `EventLog` records are associated with `profileId`.
- The migration is performed server-side via a Server Action triggered after successful login.
- The migration does not grant the authenticated user access to any other guest's data.

### 6.4 Session ID Collision Resistance

- `session_id` values must be generated using a cryptographically random UUID generator (e.g., `crypto.randomUUID()`), not `Math.random()`.
- Collision probability with UUID v4 is negligible for the expected user volume.

---

## 7. Prisma & Database Security

### 7.1 Connection String Security

| Variable | Classification | Usage |
| :--- | :--- | :--- |
| `DATABASE_URL` | Critical Secret | Prisma connection pool (via PgBouncer in Supabase) |
| `DIRECT_URL` | Critical Secret | Direct Prisma migrations; not used in runtime queries |

Both variables must:
- Never use the `NEXT_PUBLIC_` prefix.
- Never appear in client-side code or be logged.
- Be stored only in server-side environment variables.

### 7.2 Parameterized Queries

Prisma generates parameterized SQL queries for all database operations. This prevents SQL injection by construction. Raw SQL via `$queryRaw` or `$executeRaw` must be avoided unless absolutely necessary; if used, values must always be passed as Prisma template literals (not string concatenation).

### 7.3 Prisma Singleton

The `src/lib/db.ts` Prisma singleton prevents connection pool exhaustion. It must never be instantiated per-request in production.

### 7.4 Schema-Level Constraints

The Prisma schema enforces the following integrity constraints relevant to security:

- `WishlistItem`: `@@unique([profileId, productId])` and `@@unique([sessionId, productId])` prevent duplicate entries and constrain data ownership.
- `Order.shippingAddress`: typed as `Json` (structured object) — never a raw serialized string, which could enable injection via JSON parsing edge cases.
- All monetary fields use `Decimal @db.Decimal(10, 2)` — prevents arithmetic overflow manipulation.

### 7.5 Database Migrations

- `prisma migrate deploy` (not `migrate dev`) must be used in production to apply migrations.
- Migrations must be reviewed before application to production to detect unintended schema changes.
- The Prisma migration history must be committed to source control.

---

## 8. Data-Access & Row-Level Security Considerations

### 8.1 Application-Layer Data Access Control — Primary Enforcement

Two Valley enforces data access control at the **application layer** via Server Actions and Route Handlers. This is the **mandatory, primary enforcement mechanism** for all data access security.

Prisma connects to Supabase PostgreSQL using the `DATABASE_URL` (pooled) or `DIRECT_URL` (migrations), which operate at the database superuser / service level. This means:

> **Critical:** Prisma queries are **NOT subject to Supabase Row-Level Security (RLS) policies**, regardless of whether RLS is enabled on a table. RLS operates at the SQL session level using Supabase's JWT claims context, which Prisma's direct connection does not carry. Application-layer `profileId` scoping in Prisma `where` conditions is therefore the **sole mandatory enforcement** for data isolation on all Prisma queries.

Every query for user-specific data must include an explicit ownership condition:

```typescript
// Mandatory pattern — always scope to the authenticated user's profile
const orders = await db.order.findMany({
  where: { profileId: session.user.id }, // Never omit this filter
});
```

Omitting the `profileId` filter on a customer-facing Prisma query is a **critical data exposure defect**.

### 8.2 Supabase Row-Level Security (RLS) — Optional Post-MVP Hardening

Supabase PostgreSQL supports Row-Level Security policies, which can protect **direct Supabase client access** (via the Supabase JS client using anon or user JWTs). For Two Valley's architecture:

- RLS policies do **not** protect Prisma-based queries (see §8.1 above).
- RLS policies **can** protect any future direct Supabase client queries that are introduced using the user's JWT context (e.g., real-time subscriptions or client-side Supabase queries).
- Enabling RLS on sensitive tables as an additional safeguard against direct database access or accidental client query exposure is a **recommended post-MVP hardening measure**, not an MVP requirement.

> **Note:** The `SUPABASE_SERVICE_ROLE_KEY` bypasses all RLS policies by design. It must only be used in server-side admin contexts where full access is intentional and independently authorized via `assertAdminSession()`.

### 8.3 Customer-Owned Data Queries

All Prisma queries for customer-owned data in customer-facing Server Actions must enforce ownership via the `where` condition:

```typescript
// Mandatory: profileId scoping is the application's data isolation guarantee
const orders = await db.order.findMany({
  where: { profileId: session.user.id }, // RLS does NOT provide this — the app must
});
```

### 8.4 Admin Data Queries

Admin Prisma queries may access all records without the `profileId` scope, but only after `assertAdminSession()` has verified the admin role. Admin queries must never be placed in customer-facing Server Actions or Route Handlers.

---

## 9. Input Validation with Zod

### 9.1 Validation Requirement

**All** user-controlled input entering the system through Server Actions or API Route Handlers must be validated with a Zod schema before any processing, database access, or business logic execution.

Zod is an **approved core dependency** per `RULES.md` Section 11.

### 9.2 Where Zod Must Be Applied

| Entry Point | Zod Required |
| :--- | :--- |
| Every Server Action accepting user input | ✅ Yes |
| Every API Route Handler (`POST`, `PUT`, `PATCH`, `DELETE`) body | ✅ Yes |
| Every API Route Handler URL query parameter of significance | ✅ Yes |
| All checkout address fields | ✅ Yes |
| All review submission fields | ✅ Yes |
| All admin product creation/edit fields | ✅ Yes |
| All telemetry event payloads | ✅ Yes |

### 9.3 Validation-First Pattern

```typescript
// Required pattern in every Server Action
export async function submitReview(input: unknown): Promise<ActionResult<Review>> {
  // 1. Validate first — before auth or DB access
  const parsed = ReviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  // 2. Authenticate/authorize
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  // 3. Process with validated data only
  const review = await db.review.create({ data: parsed.data });
  return { success: true, data: review };
}
```

### 9.4 Strict Schema Design

Zod schemas must be defined with explicit allowed values:

- Use `z.enum([...])` for enumerated values (e.g., `eventType`, `orderStatus`).
- Use `z.string().min(1).max(N)` for text fields with sensible length bounds.
- Use `z.number().int().min(1).max(5)` for rating fields.
- Reject unknown properties: prefer `.strict()` on object schemas for admin inputs.
- Never use `z.any()` or `z.unknown()` as a substitute for proper schema definition.

---

## 10. API & Server Action Security

### 10.1 Server Actions Security Rules

Per `RULES.md` Section 10, all Server Actions must:

1. Begin with authorization verification (session check or `assertAdminSession()`).
2. Validate all input with Zod before processing.
3. Return typed `ActionResult<T>` — never throw unhandled exceptions to the client.
4. Never expose raw Prisma errors, stack traces, or internal details in the returned error message.
5. Use only server-side Prisma client (`src/lib/db.ts`) — never a client-side data fetch.

### 10.2 API Route Handler Security Rules

All `src/app/api/` Route Handlers must:

1. Validate all inputs (body, query params) with Zod at the start of the handler.
2. Verify session/authorization for any handler accessing user-specific or admin data.
3. Return appropriate HTTP status codes: `400` for invalid input, `401` for missing session, `403` for insufficient role, `404` for not found, `500` for server errors.
4. Never return raw error objects or stack traces in the JSON response body.

### 10.3 Public vs Protected Endpoints

| Endpoint Category | Auth Required | Notes |
| :--- | :--- | :--- |
| `GET /api/recommendations` | No | Public catalog data only; never returns unpublished products |
| `POST /api/telemetry` | No (session optional) | Accepts guest requests; `profileId` populated only if session present |
| `POST /api/payments/webhook` | No (signature-based) | Verified by webhook signature, not session |
| All `/api/admin/*` routes | Yes — Admin only | `assertAdminSession()` required |

### 10.4 Rate Limiting

Rate limiting is not implemented at the application layer in the MVP. The platform's default rate limiting (Vercel edge, Supabase API limits) provides baseline protection. If abuse patterns emerge post-launch, rate limiting should be added as a post-MVP enhancement.

---

## 11. Payment & Webhook Security

### 11.1 Provider-Neutral Architecture

Two Valley's payment integration uses a `PaymentAdapter` interface (`src/lib/payments/types.ts`). No specific payment provider is selected in this document; security requirements apply to any provider implementing the interface.

### 11.2 Webhook Signature Verification

Payment webhooks are the only externally-triggered mechanism that mutates order state and decrements stock. This makes them a high-value attack target.

**Mandatory requirements for the webhook handler (`src/app/api/payments/webhook/route.ts`):**

1. **Verify the signature first** — before reading or trusting any payload field.
2. Use `PaymentAdapter.verifyWebhookSignature()` which must use the provider's official signature verification method (e.g., HMAC-SHA256 comparison using the raw request body and `PAYMENT_WEBHOOK_SECRET`).
3. Return **HTTP 400** immediately if signature verification fails — do not log the payload or continue processing.
4. Process the payload only after successful signature verification.

```typescript
// Required webhook handler structure
export async function POST(req: Request) {
  const rawBody = await req.text(); // Raw body for signature verification
  const signature = req.headers.get("x-payment-signature") ?? "";

  const isValid = adapter.verifyWebhookSignature(rawBody, signature, process.env.PAYMENT_WEBHOOK_SECRET!);
  if (!isValid) {
    return new Response("Invalid signature", { status: 400 }); // Fail immediately
  }

  // Only now parse and process the payload
  const event = JSON.parse(rawBody);
  // ... handle event
}
```

### 11.3 Idempotency

The webhook handler must be idempotent. Processing the same webhook event twice must not:

- Decrement `stockQuantity` more than the ordered amount.
- Update `Order.paymentStatus` from `PAID` to `PAID` in a way that triggers duplicate side-effects.

Implementation approach: check `Order.paymentStatus` before applying updates. If already `PAID`, acknowledge the webhook and return without re-processing.

### 11.4 Stock Decrement Atomicity

`stockQuantity` must be decremented inside a **Prisma transaction** that also updates `Order.status` and `Order.paymentStatus`. This prevents partial state (e.g., order marked PAID but stock not decremented, or stock decremented but order not marked PAID).

### 11.5 Webhook Secret Classification

`PAYMENT_WEBHOOK_SECRET` is a **Critical Secret** (see Section 12). It must:

- Never use `NEXT_PUBLIC_` prefix.
- Never appear in client-side code, logs, or error responses.
- Be rotated if exposure is suspected.

### 11.6 Payment Data Handling

- Two Valley never stores raw payment card numbers, CVVs, or full PAN data.
- All sensitive payment data is handled exclusively by the payment provider's hosted UI or SDK.
- The application stores only: `Order.paymentStatus`, payment reference IDs or transaction IDs returned by the provider, and order totals already computed from the Two Valley catalog.

---

## 12. Environment Variable & Secret Management

### 12.1 Secret Classification

| Variable | Classification | Exposure Level |
| :--- | :--- | :--- |
| `DATABASE_URL` | Critical Secret | Server only |
| `DIRECT_URL` | Critical Secret | Server only |
| `SUPABASE_SERVICE_ROLE_KEY` | Critical Secret | Server only |
| `PAYMENT_GATEWAY_SECRET` | Critical Secret | Server only |
| `PAYMENT_WEBHOOK_SECRET` | Critical Secret | Server only |
| `PAYMENT_GATEWAY_KEY` | Secret | Server only |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Client + Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Client + Server |
| `NEXT_PUBLIC_APP_URL` | Public | Client + Server |

### 12.2 `NEXT_PUBLIC_` Prefix Rules

**Only** variables explicitly intended for client-side exposure may use the `NEXT_PUBLIC_` prefix. As of the approved architecture, these are:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

All other variables must **not** use this prefix. Adding `NEXT_PUBLIC_` to any Critical Secret or server-only variable is a **critical security defect**.

### 12.3 Environment File Rules

| File | Committed to Git | Purpose |
| :--- | :--- | :--- |
| `.env.example` | ✅ Yes | Template with placeholder values and comments only |
| `.env.local` | ❌ No | Local development secrets (in `.gitignore`) |
| `.env` | ❌ No | Must be in `.gitignore` |
| `.env.test` | ❌ No | Test environment secrets (in `.gitignore`) |
| `.env.production` | ❌ No | Never committed; set via deployment platform |

### 12.4 Secret Rotation Policy

- Secrets must be rotated if: accidental exposure in logs, committed to source control, or shared with an unauthorized party.
- After rotation, the old secret must be revoked and the new secret deployed before the old one expires.
- Rotation steps for each secret:
  - `SUPABASE_SERVICE_ROLE_KEY`: Regenerate in Supabase dashboard → update deployment env vars.
  - `PAYMENT_WEBHOOK_SECRET`: Regenerate in payment provider dashboard → update deployment env vars.
  - `DATABASE_URL` / `DIRECT_URL`: Rotate in Supabase database settings → update deployment env vars.

### 12.5 `.env.example` Integrity

The `.env.example` file must:

- Contain only placeholder values (e.g., `your-supabase-url-here`), never real credentials.
- Include an inline comment on each variable explaining its purpose and where to obtain the value.
- Be reviewed before every commit to ensure no real credentials were accidentally included.

---

## 13. XSS, CSRF & Injection Protections

### 13.1 Cross-Site Scripting (XSS)

**React's default JSX escaping** provides the primary XSS protection. All user-generated content rendered in JSX is automatically escaped.

Rules to preserve this protection:

- **Never** use `dangerouslySetInnerHTML` with user-controlled content (review comments, product descriptions entered by admin, etc.).
- If rich text rendering is ever required (post-MVP), it must use a dedicated sanitization library. No HTML sanitization libraries are included in the MVP.
- All `<img>` tags must use `next/image` (which applies `Content-Security-Policy`-compatible rendering).

### 13.2 Cross-Site Request Forgery (CSRF)

Next.js App Router Server Actions include built-in CSRF protection via the `Origin` header check. Additionally:

- Session cookies are set with `SameSite: Lax` (or `Strict`) which mitigates the majority of CSRF attack vectors.
- Webhook endpoints that accept external POST requests (payment gateway webhooks) rely on signature verification rather than CSRF tokens, which is the correct pattern for server-to-server communication.

### 13.3 SQL Injection

Prisma's query builder generates parameterized SQL queries for all model operations. This eliminates SQL injection by construction for all standard Prisma operations.

Prohibited patterns:
- `db.$queryRaw` with string template literals containing user input (unsafe).
- String concatenation to build query conditions.

If `$queryRaw` is absolutely necessary, it must use Prisma's tagged template literal syntax:
```typescript
// Safe: Prisma parameterizes the value
await db.$queryRaw`SELECT * FROM "Product" WHERE slug = ${slug}`;

// PROHIBITED: String concatenation enables injection
await db.$queryRaw(`SELECT * FROM "Product" WHERE slug = '${slug}'`);
```

### 13.4 Content Security Policy (CSP)

**MVP Requirement:** Do not disable or weaken any of Next.js's default security response headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`). These are set automatically by Next.js in production and must remain active.

**Post-MVP / Recommended Hardening:** A fully customised Content Security Policy configured via `next.config.ts` response headers is a recommended post-MVP security enhancement. When implemented, it should include at minimum:

- `default-src 'self'`
- `script-src 'self'` (add nonces for inline scripts required by Google Fonts or third-party payment SDKs)
- `img-src 'self' [supabase-storage-domain]`
- `connect-src 'self' [supabase-url]`

Do not implement a custom CSP in the MVP without thorough testing, as an overly restrictive policy can break legitimate application functionality (e.g., Supabase Auth flows, payment provider redirects).

---

## 14. Error Handling & Information Disclosure

### 14.1 Server Action Error Returns

All Server Actions must return a typed `ActionResult<T>`:

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }; // Error string must be user-safe
```

The `error` string field must contain only a user-safe, sanitized message. It must never contain:

- Prisma error messages with table/column names
- Stack traces
- Internal system paths
- Database connection details

### 14.2 API Route Handler Error Responses

API Route Handlers must catch all errors and return structured JSON responses without internal details:

```typescript
try {
  // ... handler logic
} catch (error) {
  console.error("Internal error:", error); // Log server-side only
  return Response.json({ error: "Internal server error" }, { status: 500 });
  // Never: return Response.json({ error: error.message, stack: error.stack })
}
```

### 14.3 Error Logging

- Errors must be logged **server-side** with full detail for debugging purposes.
- `console.error()` is the baseline in MVP; structured logging (e.g., to a log aggregator) is a post-MVP enhancement.
- Logs must never be written to client-accessible locations.

### 14.4 Development vs Production Error Detail

- In development (`NODE_ENV === 'development'`), Next.js may surface more detailed error overlays — this is acceptable.
- In production (`NODE_ENV === 'production'`), all error responses to clients must be sanitized. The Next.js production build suppresses stack traces in the browser by default; this default must not be disabled.

---

## 15. File & Image Upload Security

### 15.1 Upload Provider

Product images and uploaded assets are stored in **Supabase Storage**. No custom file-handling server infrastructure is introduced.

### 15.2 Upload Validation Requirements

All file uploads (product images via admin) must be validated **before** uploading to Supabase Storage:

| Validation | Requirement |
| :--- | :--- |
| **File type** | Only `image/jpeg`, `image/png`, `image/webp`, `image/avif` accepted |
| **File size** | Maximum file size enforced (recommended: 10MB per image) |
| **File name** | Names must be sanitized (no path traversal characters: `../`, `//`) |

### 15.3 Supabase Storage Security

- Supabase Storage **bucket policies** must be configured to:
  - Allow **authenticated uploads** only from admin contexts (via service role or authenticated admin session).
  - Allow **public read** of product images (for storefront display).
  - Deny all other write operations.
- The public CDN URL format returned by Supabase Storage is the only URL used in `ProductImage` records — no file paths or internal storage paths are stored.

### 15.4 Admin-Only Uploads

Only authenticated `ADMIN` users may upload product images. Upload actions in `adminActions.ts` must call `assertAdminSession()` before initiating the Supabase Storage upload.

### 15.5 Malware Scanning

Automated malware scanning of uploaded files is outside the MVP scope. The file type and size restrictions above provide a baseline. Post-MVP, a virus scanning integration (e.g., via Supabase Storage hooks) may be added.

---

## 16. Telemetry & Privacy Considerations

### 16.1 Telemetry Data Minimisation

The Two Valley telemetry system (`EventLog`) is designed for product analytics, not personal data collection. The data stored per event is:

| Field | Content | Sensitivity |
| :--- | :--- | :--- |
| `eventType` | Enumerated event type string | Low |
| `metadata` | Product ID, search query string, etc. | Low–Medium |
| `sessionId` | Anonymous browser session UUID | Low |
| `profileId` | Authenticated user UUID (nullable) | Medium |
| `createdAt` | Timestamp | Low |

### 16.2 No PII in Telemetry Metadata

The `metadata` field must **not** contain:

- Customer name, email, or contact details
- Payment card information
- Full shipping addresses
- Any government-issued identification

Metadata is intended to carry only product-level identifiers (product IDs, category slugs, search query strings).

### 16.3 Guest Telemetry

Guest telemetry events use only the anonymous `sessionId`. No attempt is made to identify or fingerprint the guest beyond this cookie-based session identifier.

### 16.4 Data Retention

A formal data retention policy is outside the MVP scope. `EventLog` records accumulate indefinitely in MVP. A data retention cleanup mechanism (scheduled job or admin tool) should be added post-MVP.

### 16.5 Analytics Access

`EventLog` data is accessible only to `ADMIN` users via the admin analytics dashboard, gated by `assertAdminSession()`. It is never exposed to customers or public endpoints.

---

## 17. Order & Customer-Data Access Controls

### 17.1 Order Ownership Verification

Every server-side query for order data in customer-facing contexts must include an explicit ownership check:

```typescript
const order = await db.order.findUnique({
  where: {
    id: orderId,
    profileId: session.user.id, // Ownership enforced by query condition
  },
});

if (!order) {
  // Returns not-found regardless of whether the order exists under a different profileId
  // This prevents order existence enumeration
  throw new Error("Order not found");
}
```

This pattern prevents:
- **Order ID enumeration:** An attacker cannot determine if a given order ID exists under a different customer's account, because the combined `id + profileId` condition either matches or returns null.
- **Insecure Direct Object Reference (IDOR):** An order ID alone is not sufficient to access order data.

### 17.2 Order Number vs Order ID

- `Order.id` is the internal UUID primary key — never exposed in URLs or UI elements.
- `Order.orderNumber` is a human-readable sequential reference used in the UI and confirmation emails.
- Even `orderNumber` queries on customer-facing pages must include `profileId` scoping to prevent enumeration.

### 17.3 Customer Profile Data

- Customers can view and update only their own `Profile`.
- Profile updates (name, preferences) are performed via authenticated Server Actions that scope the `update` query to `session.user.id`.
- Admins can view all profiles via the admin dashboard (read-only listing); they may not update arbitrary customer profiles except via designated admin actions.

### 17.4 Shipping Address Privacy

`Order.shippingAddress` is stored as structured `Json` and contains recipient personal data (name, address, contact). It is:

- Accessible to the owning `CUSTOMER` (via their own order detail page, scoped by `profileId`).
- Accessible to `ADMIN` users (for fulfilment purposes, gated by `assertAdminSession()`).
- Never returned in public endpoints or recommendation/catalog API responses.

---

## 18. Security Logging & Audit Considerations

### 18.1 MVP Logging Approach

In the MVP, security-relevant events are logged server-side using `console.error()` / `console.warn()`. These appear in the platform's log stream (e.g., Vercel function logs) and are accessible to the development team.

### 18.2 Security Events to Log

The following events must be logged server-side when they occur:

| Event | Log Level | Information to Log |
| :--- | :--- | :--- |
| Failed `assertAdminSession()` — unauthorized | `warn` | Timestamp, route attempted, session presence (yes/no) |
| Failed `assertAdminSession()` — wrong role | `warn` | Timestamp, route attempted, `profileId` |
| Invalid webhook signature | `warn` | Timestamp, source IP (from headers) |
| Validation error on admin mutation | `warn` | Timestamp, action name, validation failure reason |
| Uncaught server error | `error` | Timestamp, error message, stack trace (server-only) |

> **Important:** Log entries must never include raw secrets, session tokens, payment card data, or full shipping addresses.

### 18.3 Audit Trail (Post-MVP)

A formal audit trail (structured logging of all admin mutations to a dedicated audit log table or external service) is a post-MVP enhancement. In the MVP, Vercel function logs serve as the baseline audit record.

### 18.4 Log Retention

Log retention is managed by the deployment platform (Vercel). Default log retention periods apply. Long-term log archival is a post-MVP concern.

---

## 19. Dependency & Security Update Expectations

### 19.1 Approved Dependency Discipline

Per `RULES.md` Section 15, new dependencies require justification and must not be introduced without team review. This minimises the attack surface from third-party packages.

### 19.2 `npm audit` Cadence

- `npm audit` must be run before every production deployment.
- `npm audit --production` must return zero **critical** or **high** severity vulnerabilities before proceeding.
- **Critical** vulnerabilities block deployment.
- **High** vulnerabilities should be resolved before deployment; if a patch is unavailable, the risk must be explicitly acknowledged and documented in `DECISIONS.md`.
- **Moderate** and **low** vulnerabilities should be tracked and addressed within a reasonable window (e.g., next sprint).

### 19.3 Dependency Update Process

1. Run `npm audit` to identify vulnerabilities.
2. Run `npm update` for patch-level updates within semver constraints.
3. For major version updates, review the package changelog for breaking changes and test thoroughly.
4. Commit `package-lock.json` with every dependency change to ensure reproducible installs.

### 19.4 Supply Chain Awareness

- Prefer packages with active maintenance, wide adoption, and a track record of responsible vulnerability disclosure.
- Do not introduce packages from unknown or unmaintained authors.
- The approved dependency list in `RULES.md` Section 15 is the reference; additions require explicit justification.

---

## 20. Pre-Production Security Checklist

Complete all items before the first production deployment (aligned with `TASKS.md` TV-23-001 quality gate):

### 20.1 Authorization

- [ ] `assertAdminSession()` is called as the **first line** in every admin Server Action — verified by code audit (TV-21-001)
- [ ] `assertAdminSession()` is called in the admin layout (`src/app/admin/layout.tsx`)
- [ ] Direct POST to an admin Server Action without session returns Unauthorized (tested: SEC-001)
- [ ] Direct POST to an admin Server Action with `CUSTOMER` session returns Forbidden (tested: SEC-002)
- [ ] Next.js middleware redirects unauthenticated `/admin/*` requests to `/login` (tested: ADMIN-AUTH-001)
- [ ] Bypassing middleware does not grant admin access (tested: ADMIN-AUTH-007)

### 20.2 Environment Variables

- [ ] No `NEXT_PUBLIC_` prefix on `SUPABASE_SERVICE_ROLE_KEY` (verified: SEC-009)
- [ ] No `NEXT_PUBLIC_` prefix on `PAYMENT_GATEWAY_SECRET` (verified: SEC-009)
- [ ] No `NEXT_PUBLIC_` prefix on `PAYMENT_WEBHOOK_SECRET` (verified: SEC-009)
- [ ] No `NEXT_PUBLIC_` prefix on `DATABASE_URL` or `DIRECT_URL` (verified: SEC-009)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` absent from client-side JavaScript bundle (tested: SEC-005)
- [ ] `PAYMENT_GATEWAY_SECRET` absent from client-side JavaScript bundle (tested: SEC-006)
- [ ] `DATABASE_URL` absent from client-side JavaScript bundle (tested: SEC-008)
- [ ] `.env.example` contains no real credentials (manual review)
- [ ] `.env.local` and `.env` are in `.gitignore` (verified in git status)

### 20.3 Input Validation

- [ ] All Server Actions have Zod schema validation as the first step (verified: SEC-010)
- [ ] All API Route Handlers have Zod schema validation (verified: SEC-011)
- [ ] No `z.any()` or untyped input processing in production code (code review)

### 20.4 Payment Security

- [ ] Webhook handler verifies signature before processing any payload (tested: SEC-017)
- [ ] Invalid webhook signature returns HTTP 400 (tested: CHK-011)
- [ ] Duplicate webhook does not double-decrement stock (tested: CHK-012)
- [ ] `PAYMENT_WEBHOOK_SECRET` environment variable set in production platform

### 20.5 Error Sanitization

- [ ] No Prisma stack traces visible in API responses (tested: SEC-014)
- [ ] No database error details in Server Action error returns (tested: SEC-015)
- [ ] All error responses return generic messages in production mode (tested: SEC-016)

### 20.6 Data Access Controls

- [ ] Order detail queries include `profileId` ownership filter (code review)
- [ ] Order number queries on customer pages include `profileId` scoping (code review)
- [ ] No customer-facing endpoint returns admin-only or unpublished data (verified: INT-REC-004)

### 20.7 Dependencies

- [ ] `npm audit --production` returns zero critical/high vulnerabilities
- [ ] No unapproved packages present in `package.json`
- [ ] `package-lock.json` committed and up-to-date

### 20.8 Build & Secrets

- [ ] `npm run build` exits cleanly in production mode
- [ ] No secrets logged during build process
- [ ] Production environment variables set via deployment platform (not committed files)

---

## 21. Production Security Checklist

Run after each production deployment:

### 21.1 Access Control Smoke Tests

- [ ] Admin login with `ADMIN` role account grants access to `/admin` dashboard
- [ ] Login with `CUSTOMER` role account is denied access to `/admin` (redirect to login or 403)
- [ ] Unauthenticated browser access to `/admin` redirects to `/login`
- [ ] Customer can view their own order history at `/account/orders`
- [ ] Customer attempting to access another customer's order URL receives not-found response

### 21.2 Webhook Verification

- [ ] Payment gateway webhook endpoint (`/api/payments/webhook`) responds to gateway ping
- [ ] Test payment transaction creates `Order` with `PAID` status and decrements stock correctly
- [ ] Manually sending an unsigned webhook POST returns HTTP 400

### 21.3 Secret Exposure Verification

- [ ] Browser DevTools → Network → inspect main JS bundle: no service role key, payment secret, or database URL visible
- [ ] Browser DevTools → Application → Cookies: session cookie has `HttpOnly` flag set
- [ ] Browser DevTools → Application → Cookies: session cookie has `Secure` flag set (HTTPS environment)

### 21.4 Error Response Verification

- [ ] Navigate to a non-existent route (`/this-does-not-exist`): returns 404 page without stack trace
- [ ] POST to `/api/telemetry` with invalid `eventType`: returns 400 without internal error detail
- [ ] POST to an admin Server Action without session: returns Unauthorized without internal error detail

---

## 22. Incident Response Basics

### 22.1 Scope

This section outlines a minimal incident response process appropriate for the MVP phase. A formal incident response plan should be developed post-launch as the user base grows.

### 22.2 Incident Classification

| Severity | Description | Examples |
| :--- | :--- | :--- |
| **Critical** | Active exploitation or confirmed data breach | Secret key exposed in production, unauthorized admin access confirmed |
| **High** | Serious vulnerability identified, no confirmed exploitation | `npm audit` critical CVE, auth bypass discovered in testing |
| **Medium** | Potential vulnerability, low exploitation likelihood | Moderate CVE in dependency, non-critical information disclosure |
| **Low** | Informational, no immediate risk | Expired SSL certificate warning, minor log anomaly |

### 22.3 Immediate Response Steps (Critical / High)

1. **Contain:** Immediately rotate or revoke the affected secret/credential. If admin accounts are compromised, disable the admin `Profile.role` for affected accounts.
2. **Assess:** Determine the scope of access the attacker may have obtained (orders read, data exfiltrated, mutations made).
3. **Remediate:** Deploy a patch addressing the root cause. Re-run the full security checklist (Section 20) before restoring production.
4. **Notify:** Notify affected customers if their personal data (order details, email, shipping address) was accessed. This is a legal and ethical obligation.
5. **Document:** Record the incident details, timeline, root cause, and remediation steps in `DECISIONS.md` for future reference.

### 22.4 Secret Exposure Response

If a Critical Secret (`SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `PAYMENT_GATEWAY_SECRET`, `PAYMENT_WEBHOOK_SECRET`) is exposed:

1. Immediately regenerate the secret in the issuing platform (Supabase dashboard, payment provider dashboard).
2. Update the production deployment environment variable with the new secret and redeploy.
3. Verify the old secret is revoked and no longer accepted.
4. Review server logs for any unauthorized use of the secret during the exposure window.

### 22.5 Contact Points

- **Platform:** Supabase support (for database and auth issues) — [supabase.com/support](https://supabase.com/support)
- **Deployment:** Vercel support (for deployment and edge issues) — [vercel.com/support](https://vercel.com/support)
- **Payment:** Contact the chosen payment gateway provider's emergency support channel.

---

## 23. Security Acceptance Criteria

The following criteria must all be met before Two Valley is considered production-ready from a security perspective. These directly correspond to the security test cases in `TEST_PLAN.md` Section 18 and the blocking gates in Section 21.1.

| Criterion | Test Reference | Status |
| :--- | :--- | :--- |
| `assertAdminSession()` called first in all admin Server Actions | SEC-001, ADMIN-AUTH-006 | Pending |
| Admin bypass resistance verified | ADMIN-AUTH-007, SEC-002 | Pending |
| No Critical Secret uses `NEXT_PUBLIC_` prefix | SEC-009 | Pending |
| No Critical Secret present in client-side JS bundle | SEC-005 to SEC-008 | Pending |
| All Server Actions and Route Handlers validated with Zod | SEC-010, SEC-011 | Pending |
| SQL injection via Prisma parameterized queries — no raw concatenation | SEC-012 | Pending |
| XSS payload in review comment is escaped — not executed | SEC-013 | Pending |
| Prisma/DB stack traces absent from API responses | SEC-014, SEC-015 | Pending |
| Payment webhook signature verified before processing | SEC-017, CHK-011 | Pending |
| Webhook idempotency confirmed — no double stock decrement | SEC-018, CHK-012 | Pending |
| Customer order access control prevents IDOR | SEC-019, CHK-020 | Pending |
| Admin can access all orders; customer limited to own orders | SEC-020 | Pending |
| `npm audit --production` returns zero critical/high CVEs | TV-22-003 (dependency check) | Pending |
| Pre-production security checklist fully completed | Section 20 | Pending |
| Production security checklist completed post-deployment | Section 21 | Pending |

---
