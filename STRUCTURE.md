# Two Valley — Project Architecture & Folder Map

This document explains the internal organization of Frontend and Backend modules in Two Valley.

---

## 🎨 FRONTEND MODULES (`src/frontend/` & `src/app/`)

### 📄 Pages & Routes (`src/app/`)
- `src/app/(customer)/` — Customer-facing storefront pages
  - `page.tsx` — Homepage
  - `perfumes/page.tsx` — Artisanal Perfumes catalog
  - `teas/page.tsx` — Single-Estate Teas catalog
  - `product/[slug]/page.tsx` — Product Detail Page (PDP)
  - `collections/page.tsx` — Collections listing
  - `wishlist/page.tsx` — User saved wishlist
  - `checkout/page.tsx` — Order checkout flow
  - `account/page.tsx` — Customer profile & order history
  - `login/page.tsx` & `register/page.tsx` — Customer authentication
- `src/app/admin/` — Admin Portal dashboard
  - `(dashboard)/page.tsx` — Admin Analytics Overview
  - `(dashboard)/products/` — Product Management & Creation
  - `(dashboard)/orders/` — Order Fulfillment
  - `(dashboard)/inventory/` — Stock & Variant Inventory

### 🧩 UI Components & Hooks (`src/frontend/`)
- `src/frontend/components/catalog/`
  - `ProductCard.tsx` — Standard product item card
  - `PDPAddToCart.tsx` — PDP Variant selection & Add-to-cart block
  - `PDPGallery.tsx` — Image viewer & zoom
  - `RecommendationCarousel.tsx` — Product recommendations carousel
  - `WishlistGrid.tsx` — Wishlist items layout
  - `FilterSortPanel.tsx` — Scent/Tea facet filter panel
- `src/frontend/components/layout/`
  - `Header.tsx`, `Footer.tsx`, `SearchModal.tsx`, `HeroSlider.tsx`
- `src/frontend/components/3d/`
  - `FormulationVessel.tsx`, `PDP3DViewerClient.tsx` — Three.js 3D Canvas visualizers
- `src/frontend/components/admin/`
  - `ProductForm.tsx`, `InventoryTable.tsx`, `AdminSidebar.tsx`
- `src/frontend/hooks/`
  - `useFocusTrap.ts`, `useMediaQuery.ts`

---

## ⚙️ BACKEND MODULES (`src/backend/` & `prisma/`)

### 🗄️ Database & Models (`prisma/` & `src/backend/lib/db.ts`)
- `prisma/schema.prisma` — Database schema (Product, Variant, Order, Review, Profile)
- `src/backend/lib/db.ts` — Prisma client initialization instance

### ⚡ Server Actions (`src/backend/actions/`)
- `catalogActions.ts` — Catalog fetching, search, and filtering DB queries
- `checkoutActions.ts` — Order placement & payment calculation logic
- `wishlistActions.ts` — Wishlist CRUD operations
- `adminActions.ts` — Admin management actions
- `reviewActions.ts` — Review creation & approval workflows

### 🌐 REST API Endpoints (`src/app/api/`)
- `src/app/api/payments/webhook/` — Payment notification webhooks
- `src/app/api/telemetry/` — Customer event tracking API
- `src/app/api/recommendations/` — Recommendation algorithm API

### 🛠️ Backend Services & Serializers (`src/backend/lib/`)
- `serializers/productSerializer.ts` — RSC Server to Client DTO converter
- `recommendations.ts` — Jaccard & Price Proximity scoring algorithm
- `supabase/` — Supabase Auth server client configuration
