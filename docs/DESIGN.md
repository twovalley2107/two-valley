# Visual & User Experience Design Specification

## Project Name: Two Valley
**Brand Positioning:** Premium Natural Lifestyle E-Commerce (Perfumes & Craft Teas)  
**Document Version:** 1.1  
**Status:** Pending Review  

---

## 1. Brand Identity & Aesthetic Principles

**Two Valley** represents the harmonious intersection of natural purity and luxury refinement. The visual direction avoids template-driven e-commerce tropes (flat white grids, aggressive discount badges, generic pop-ups) in favor of a tranquil, sensory digital boutique.

### Core Aesthetic Pillars
1. **Natural Refinement:** Organic botanical motifs, serene spacing, and rich earth-toned palettes.
2. **Tactile Elegance:** Glassmorphism, subtle drop shadows, metallic gold accents, and warm ivory surfaces.
3. **Selective Immersive Motion:** Fluid page reveals, micro-interactions on hover, and selective 3D product viewports on key showcase areas.
4. **Sensory Storytelling:** Visual breakdowns of perfume scent pyramids (Top/Middle/Base notes) and tea steeping profiles (origin, steep time, caffeine level, flavour notes).

---

## 2. Color Palette & Design System Tokens

The design system is implemented via Tailwind CSS tokens extended with CSS custom properties.

### 2.1 Primary Brand Palette

```css
:root {
  /* Brand Primary Colors */
  --color-forest-green:  #1E3A2B; /* HSL(147, 32%, 17%) - Deep luxury botanical primary */
  --color-olive-green:   #4A5D4E; /* HSL(132, 11%, 33%) - Secondary earthy accent */
  --color-ivory-cream:   #FDFBF7; /* HSL(40, 40%, 98%)  - Primary light background base */
  --color-muted-gold:    #D4AF37; /* HSL(46, 65%, 52%)  - Premium metallic highlight */
  --color-warm-beige:    #F5EFE6; /* HSL(36, 43%, 93%)  - Subtle container & card background */

  /* Dark Mode / High Contrast Tokens */
  --color-charcoal-dark: #121915; /* HSL(140, 16%, 8%)  - Deep nocturnal background */
  --color-gold-glow:     #E5C158; /* HSL(44, 73%, 62%)  - Illuminated gold accent */

  /* Surface & Glassmorphism Tokens */
  --glass-background:    rgba(253, 251, 247, 0.75);
  --glass-border:        rgba(212, 175, 55, 0.2);
  --glass-blur:          blur(12px);

  /* Shadows & Elevations */
  --shadow-subtle:       0 4px 20px -2px rgba(30, 58, 43, 0.05);
  --shadow-elevated:     0 12px 36px -4px rgba(30, 58, 43, 0.12);
  --shadow-gold-glow:    0 0 24px rgba(212, 175, 55, 0.25);
}
```

### 2.2 Tailwind CSS Design System Integration (`tailwind.config.ts`)

```typescript
// Configured design tokens for Tailwind CSS
colors: {
  brand: {
    forest: "#1E3A2B",
    olive: "#4A5D4E",
    ivory: "#FDFBF7",
    gold: "#D4AF37",
    beige: "#F5EFE6",
    charcoal: "#121915",
  },
}
```

---

## 3. Typography & Hierarchy

Two Valley pairs a distinguished editorial serif for brand narrative with a clean, high-legibility sans-serif for UI controls, catalog data, and sensory attributes.

### 3.1 Font Strategy
* **Primary Editorial Serif (Headings & Brand Titles):** `Playfair Display`
* **Optional Luxury Accent Serif (Display Elements):** `Cinzel`
* **Primary UI & Body Sans-Serif (Controls, Body, Filters):** `Inter`

### 3.2 Typography Hierarchy Matrix

| Element | Font Family | Weight | Size (Desktop / Mobile) | Line Height | Case & Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Title (H1)** | Playfair Display | 600 (SemiBold) | 56px / 36px | 1.15 | Normal, -0.02em |
| **Section Header (H2)** | Playfair Display | 500 (Medium) | 40px / 28px | 1.2 | Normal, tracking-wide |
| **Subheader (H3)** | Playfair Display | 500 (Medium) | 24px / 20px | 1.3 | Normal |
| **Card Title (H4)** | Playfair Display | 600 (SemiBold) | 18px / 16px | 1.35 | Normal |
| **Body Primary** | Inter | 400 (Regular) | 16px / 15px | 1.6 | Normal |
| **Sensory Note Pills** | Inter | 500 (Medium) | 13px / 12px | 1.0 | Uppercase, +0.08em |
| **Button Label** | Inter | 600 (SemiBold) | 14px / 14px | 1.0 | Uppercase, +0.1em |
| **Price Tag** | Inter | 600 (SemiBold) | 18px / 16px | 1.0 | Normal |

---

## 4. Layout Architecture & Component Design

### 4.1 Global Navigation Header
* **Top Announcement Bar:** Subtle warm beige ticker displaying organic sourcing guarantees and free shipping threshold.
* **Sticky Navigation Bar:** Glassmorphic background (`backdrop-blur-md`) with Forest Green logo text, navigation links (Perfumes, Teas, Collections, Our Story), instant search modal trigger, wishlist icon with badge count, and slide-over cart button with item counter.

### 4.2 Hero Presentation Component
* **Desktop Layout:** Split grid layout featuring brand narrative text on the left and a selective interactive 3D Canvas viewport on the right.
* **Selective Interactive 3D Stage:** Suspended perfume bottle or tea leaf canister with subtle orbit controls, ambient lighting reflections, and soft shadow casting.
* **Call to Action:** Muted Gold primary button ("Explore Perfumes") and Forest Green secondary outline button ("Discover Teas").

### 4.3 Product Card Component Design
* **Container:** Warm Beige card base (`#F5EFE6`) with subtle border radii (`rounded-2xl`) and quiet border lines (`border-brand-gold/15`). Note: Product cards utilize 2D image previews and CSS/Motion tilt effects; 3D models are not required for individual product cards.
* **Visual States:**
  * **Hover Effect (`motion/react`):** 3D perspective tilt effect ($3^\circ$ elevation), card lift (`-4px`), and smooth image cross-fade to secondary product view.
  * **Quick Add Badge:** Floating glassmorphic "Quick View / Add to Cart" pill appearing smoothly on card hover.
* **Sensory Preview Footer:** Top notes preview pills for perfumes or flavor origin badge for teas.

### 4.4 Product Details Page (PDP) Experience
* **Media Gallery:** High-definition primary viewer with thumbnail carousel, zoom overlay, and selective 3D preview toggle where 3D assets exist.
* **Perfume Sensory Pyramid Widget:**
  * **Top Notes:** Fresh, volatile botanical accents (e.g., Bergamot, Cardamom).
  * **Heart/Middle Notes:** Rich floral or woody body (e.g., Jasmine, Cedarwood).
  * **Base Notes:** Long-lasting foundation notes (e.g., Sandalwood, Amber).
* **Tea Steeping Guide Widget:**
  * Visual iconography for ideal water temperature ($90^\circ\text{C}$), steep time (3–4 mins), tea origin (Assam/Darjeeling), and caffeine strength meter.
* **Contextual Metadata Badges:** `Mood` (e.g., Meditative), `Occasion` (e.g., Evening Gala), `Use Case`, and `Pairing Tags`.

### 4.5 Content-Based Recommendation Widgets
* **Widget 1: "You May Also Enjoy" (PDP):** Horizontally scrollable carousel featuring related products derived from Jaccard note similarity matching.
* **Widget 2: "Pairs Well With" (Cart & PDP):** Cross-category pairing banner (e.g., pairing a calming herbal tea with a relaxing woody perfume based on matching `mood` and `pairing_tags`).

### 4.6 Slide-Over Shopping Cart & Checkout UX
* **Slide-over Panel:** Animates fluidly from the right edge with backdrop blur.
* **Free Shipping Progress Bar:** Dynamic progress indicator filling towards free shipping threshold.
* **Cart Line Items:** High-res thumbnail, title, volume/weight variant tag, quantity selector, price, and delete trigger.
* **Checkout Flow:** Stepped checkout interface with a validated address form, order summary breakdown, and payment gateway container.

---

## 5. Motion, Micro-Interactions & 3D Performance Principles

### 5.1 Selective 3D Performance Principle
3D rendering is implemented strictly as a **selective premium enhancement**, reserved for high-impact brand touchpoints (such as the main Hero presentation and flagship PDP showcases). 3D models are **NOT** mandatory for every catalog item or every product card, keeping initial asset payload and GPU utilization low.

### 5.2 Motion Standards (`motion/react`)
All animations are powered by `motion/react`:

```typescript
import { motion, AnimatePresence } from "motion/react";
```

### 5.3 Motion Inventory Table

| Component | Trigger | Animation Description | Easing & Duration |
| :--- | :--- | :--- | :--- |
| **Page Transitions** | Route Change | Fade-in with subtle vertical slide-up ($10\text{px}$). | `cubic-bezier(0.16, 1, 0.3, 1)`, 400ms |
| **Product Card Tilt** | Mouse Move | 2D/3D transform tilt based on cursor offsets. | Dynamic spring (`stiffness: 300, damping: 20`) |
| **Slide-over Cart** | Cart Open | Horizontal translate from `100%` to `0%` with backdrop opacity. | `cubic-bezier(0.16, 1, 0.3, 1)`, 350ms |
| **Sensory Note Pills** | Scroll Reveal | Staggered fade and scale reveal ($0.95 \to 1.0$). | Stagger `0.05s`, 300ms |
| **Tea Steam Particle** | Continuous | Procedural vertical floating particle canvas. | Linear loop, 4000ms |

### 5.4 Mobile Motion & Performance Fallback
On screens $\le 768\text{px}$ or when device low-power mode is active:
* 3D Canvas viewports fallback to static WebP renders with subtle fade-in.
* Tilt perspective transforms on cards are disabled; replaced with lightweight touch scale (`active:scale-98`).

---

## 6. Admin Dashboard UX Design

The Admin interface (`/admin`) prioritizes clarity, data density, efficiency, and high operational safety.

* **Color Theme:** Dark Forest Green side navigation (`#1E3A2B`) paired with high-contrast light content workspace (`#FDFBF7`).
* **Product CRUD Panel:** Form tabs separating Basic Details, Inventory Variants, Sensory Notes, and Recommendation Metadata (`mood`, `occasion`, `pairing_tags`). Includes drag-and-drop Supabase Storage image uploader.
* **Inventory Dashboard:** Dense data table with color-coded status badges:
  * Green: In Stock ($>15$ units)
  * Muted Gold: Low Stock ($1 - 15$ units)
  * Dark Red: Out of Stock ($0$ units)
* **Analytics Charts:** Sales summaries, behavioral telemetry funnels, and recommendation widget CTR charts formatted with brand accent colors.

---

## 7. Accessibility & Responsive Breakpoints

### 7.1 Accessibility Requirements
* **Color Contrast Validation:** All final color combinations must be validated against WCAG 2.1 AA contrast requirements during implementation and QA.
* **Keyboard Navigation & Focus States:** Clear focus rings on interactive controls using Muted Gold (`#D4AF37`) outlines.
* **Screen Reader Support & ARIA:** ARIA labels on all icon-only buttons (search, cart, wishlist) and interactive canvas containers.
* **Reduced Motion Support:** Respects `prefers-reduced-motion: reduce` media query by disabling non-essential motion effects.

### 7.2 Responsive Viewport Matrix

| Breakpoint Name | Viewport Width | Layout Behavior |
| :--- | :--- | :--- |
| `sm` | 640px | Single-column product grid, mobile drawer navigation. |
| `md` | 768px | 2-column product grid, simplified motion fallbacks. |
| `lg` | 1024px | 3-column catalog grid, desktop header with inline navigation links. |
| `xl` | 1280px | 4-column catalog grid, full split-screen hero presentation. |
| `2xl` | 1536px+ | Max-width container centered with extended padding. |

---
