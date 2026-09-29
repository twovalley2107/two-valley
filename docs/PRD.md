# Product Requirements Document (PRD)

## Project Name: Two Valley
**Brand Positioning:** Premium Natural Lifestyle E-Commerce (Perfumes & Craft Teas)  
**Document Version:** 1.1  
**Status:** Draft / Pending Review  

---

## 1. Product Overview
**Two Valley** is a luxury natural lifestyle e-commerce brand specializing in two core product verticals:
1. **Premium Perfumes:** Artisanal, natural fragrance profiles crafted from high-grade botanicals.
2. **Premium Tea / Chai Patti:** Handpicked single-estate teas, organic blends, and luxury chai patti.

The platform is designed to offer a tranquil, immersive, and sensory shopping experience. Built around an aesthetic identity of natural refinement (Forest Green, Olive Green, Ivory/Cream, Muted Gold, Warm Beige), Two Valley balances high-touch visual storytelling with seamless digital commerce functionality.

---

## 2. Problem / Opportunity
* **Problem:** Most online tea and perfume storefronts rely on generic e-commerce templates, cluttering the customer experience with aggressive sales banners, low-quality imagery, and confusing navigation. Furthermore, niche luxury fragrance and organic tea buyers find it difficult to explore artisanal products based on sensory notes (e.g., top/middle/base scent notes, tea origin, steep profiles).
* **Opportunity:** Two Valley provides a curated, high-elegance digital boutique that elevates natural lifestyle products through rich sensory presentation, 3D interactions, intuitive attribute-based recommendations, and an effortless shopping journey.

---

## 3. Target Users
1. **Conscious Luxury Consumers:** Individuals seeking natural, organic, high-end perfumes and artisanal teas for personal indulgence or gifting.
2. **Sensory Enthusiasts (Tea & Fragrance Connoisseurs):** Buyers who evaluate products based on detailed notes, origin stories, botanical purity, and flavor/fragrance pairings.
3. **Gift Buyers:** Shoppers looking for premium, beautifully presented items for special occasions.
4. **Store Administrators:** Internal managers overseeing product catalog, inventory, order processing, customer reviews, and analytics.

---

## 4. Product Goals
* Establish a luxury digital brand identity that sets Two Valley apart from conventional mass-market e-commerce stores.
* Deliver an intuitive user interface with fast search, sensory filtering (scent/flavour notes), and smooth checkout.
* Provide subtle 3D interactions and motion design that enhance product storytelling without degrading performance.
* Provide smart, content-based related product recommendations for both guest and logged-in visitors without requiring machine learning models in MVP.
* Collect clean user interaction telemetry to enable data-driven inventory management and future hybrid recommendation models.
* Maintain a scalable foundation capable of growing from a launch catalog to expanded artisanal collections.

---

## 5. User Goals
* Easily discover perfumes and teas matching personal olfactory or taste preferences.
* Interact with 3D product previews and visual storytelling to evaluate luxury products online.
* Read transparent, sensory product details (ingredients, fragrance notes, tea origin, brewing guide, recommended mood/occasion).
* Experience a smooth, friction-free purchase flow across mobile and desktop devices.
* Manage personal wishlists, profile details, and track active order statuses effortlessly.

---

## 6. Core User Journeys
1. **Discovery & Exploration Journey:**
   * Visitor lands on homepage $\rightarrow$ Experiences visual storytelling and 3D hero presentation $\rightarrow$ Selects Perfume or Tea category $\rightarrow$ Filters by fragrance/flavour notes, mood, occasion, and price range $\rightarrow$ Views Product Details.
2. **Product Detail & Recommendation Journey:**
   * Customer views single product $\rightarrow$ Explores high-resolution media, subtle 3D product interaction, scent/flavour profiles, and usage notes $\rightarrow$ Views Content-Based Related Product Recommendations and pairings $\rightarrow$ Adds items to Cart or Wishlist.
3. **Cart & Checkout Journey:**
   * Customer reviews cart $\rightarrow$ Enters shipping & contact details (Guest or Logged-in) $\rightarrow$ Completes payment via payment gateway $\rightarrow$ Receives order confirmation with tracking information.
4. **Account & Order Management Journey:**
   * Returning user logs in $\rightarrow$ Views order history, re-orders past favorites, manages saved shipping addresses and wishlist.
5. **Admin Management Journey:**
   * Admin authenticates $\rightarrow$ Manages catalog (products/categories/metadata) $\rightarrow$ Monitors inventory levels $\rightarrow$ Fulfills orders $\rightarrow$ Evaluates sales and behavioral analytics.

---

## 7. Customer-Facing Features

### 7.1 Landing Page & Visual Experience
* **Hero Banner & Brand Narrative:** Interactive, high-impact aesthetic showcasing key collections with premium product presentation.
* **Featured Collections:** Curated highlights for Perfumes and Teas.
* **Brand Storytelling Section:** Educational section on natural extraction, organic sourcing, and sustainability.

### 7.2 3D Interactions & Motion Design Experience
* **Premium Hero Presentation:** Elevated showcase for flagship products featuring smooth lighting and subtle depth effects.
* **Subtle Product 3D Interaction:** Interactive 3D representation for perfume bottles and product packaging where appropriate.
* **Tea Leaf / Steam Visual Motion:** Atmospheric particle or steam motion effects accompanying tea collection showcases.
* **Product Card Hover & Tilt:** Subtle micro-interactions and tilt perspective changes on card hover states.
* **Scroll Reveal & Parallax:** Smooth scroll-driven transitions and parallax background layers for narrative pacing.
* **Mobile Motion Optimization:** Automatic reduction or lightweight fallback of heavy motion effects on mobile devices to preserve high performance and battery efficiency.

### 7.3 Navigation & Catalog Browsing
* **Category Pages:** Dedicated landing hubs for Perfumes and Tea / Chai Patti.
* **Filtering & Sorting:**
  * **Perfumes:** Filter by scent family (Woody, Floral, Citrus, Oriental), note intensity, mood, occasion, price, availability.
  * **Teas:** Filter by tea type (Black, Green, Herbal, Chai Patti), origin, caffeine level, mood, occasion, price, availability.
  * **Sorting:** Newest, Price (Low to High / High to Low), Popularity, Customer Rating.
* **Instant Search:** Keyword search matching titles, scent/flavour notes, mood, occasion, tags, and ingredients.

### 7.4 Product Details Page (PDP)
* High-definition product imagery and 3D view capabilities.
* Sensory Profile Breakdown:
  * **Perfume PDP:** Top notes, Heart/Middle notes, Base notes, Longevity indicator, Mood, Occasion, Recommended use cases.
  * **Tea PDP:** Flavor profile, Tasting notes, Tea origin, Organic certification, Steeping/Brewing instructions, Mood, Occasion.
* Quantity selection, Add to Cart, Add to Wishlist.
* Customer Ratings & Verified Purchase Reviews.
* Content-Based Related Recommendations & Product Pairing block ("Pairs Well With").

### 7.5 Cart & Checkout
* **Slide-over Shopping Cart:** Real-time item count, price update, tax calculations, free shipping progress bar.
* **Streamlined Checkout:**
  * Guest checkout support.
  * Multi-step address input, payment processing via secure payment gateway interface, order review.
  * Order confirmation page and email receipt generation.

### 7.6 User Accounts & Self-Service
* Authentication (Sign Up, Login, Password Reset).
* Profile management (Name, Email, Address book).
* Order history with detailed status breakdown (Pending, Processing, Shipped, Delivered).
* Wishlist management (Save for later, Move to cart).

---

## 8. Admin Features

### 8.1 Catalog & Inventory Management
* CRUD operations for Products and Categories.
* Attribute & metadata management (Fragrance notes, Flavor profiles, Tea origins, Mood, Occasion, Use case, Pairing tags, Volume/Weight variants).
* Real-time stock tracking with low-stock alerts.

### 8.2 Order & Customer Management
* Order list filtering by status (Unfulfilled, Processing, Completed, Cancelled).
* Order fulfillment workflows (assign tracking numbers, update shipping statuses).
* Customer account management and viewable customer purchase histories.

### 8.3 Moderation & Content
* Review moderation (Approve, reject, or flag customer reviews).

### 8.4 Analytics & Reporting
* **Sales Analytics:** Total revenue, average order value (AOV), top-selling SKUs, conversion funnel.
* **Behavioral Telemetry:** Aggregate metrics on product views, add-to-cart rates, wishlist additions, search keywords.
* **Recommendation Performance:** Click-through rate (CTR) and conversion rate from recommendation widgets.

---

## 9. Product Catalogue Requirements

### 9.1 Initial Catalog Capacity
* **Perfumes:** 8–9 distinct fragrance SKUs (e.g., 50ml / 100ml size variants).
* **Teas / Chai Patti:** 5–6 distinct tea SKUs (e.g., 100g / 250g weight variants).

### 9.2 Product Data Model Attributes
* Basic attributes: `id`, `name`, `slug`, `sku`, `category`, `price`, `sale_price`, `stock_quantity`, `description`, `images`.
* Classification tags: `tags` (e.g., "Organic", "Bestseller", "Gift Set", "Single Estate").
* **Sensory & Recommendation Metadata (Optional / Enhancing):**
  * `mood` (e.g., Meditative, Energetic, Romantic, Refreshing)
  * `occasion` (e.g., Evening Gala, Morning Ritual, Daily Wear, Gifting)
  * `use_case` (e.g., Workday Focus, Post-Workout Relaxation, Special Event)
  * `pairing_tags` (e.g., "Pairs with Woody Fragrance", "Pairs with Floral Infusion")
* **Perfume-Specific Attributes:**
  * `top_notes` (e.g., Bergamot, Cardamom)
  * `middle_notes` (e.g., Cedarwood, Jasmine)
  * `base_notes` (e.g., Amber, Sandalwood, Vetiver)
  * `fragrance_family` (e.g., Woody, Floral, Fresh, Spice)
* **Tea-Specific Attributes:**
  * `flavour_notes` (e.g., Malty, Smoky, Honey, Floral)
  * `tea_type` (e.g., CTC Chai Patti, Loose Leaf Black, Green, Infusion)
  * `origin` (e.g., Assam, Darjeeling, Nilgiri)
  * `caffeine_level` (e.g., High, Medium, Low, Caffeine-Free)
  * `steeping_guide` (Temperature, Time, Water-to-Tea ratio)

---

## 10. Recommendation Requirements

### 10.1 MVP Strategy: Content-Based Filtering (No Machine Learning)
For the initial release, product recommendations will strictly rely on deterministic content-matching algorithms based on attribute similarity. Machine learning models are explicitly excluded from the MVP.

* **Matching Parameters:**
  1. Primary Category match (Perfume vs Tea).
  2. Attribute & Metadata Similarity:
     * Overlapping fragrance/flavour notes.
     * Shared `mood`, `occasion`, and `use_case`.
     * Explicit `pairing_tags` (for cross-category recommendations).
     * Price tier similarity ($\pm 25\%$ range).
     * Matching taxonomy tags.
* **Widget Placement:**
  * **PDP Widget:** "You May Also Enjoy" (3–4 related items in same category).
  * **Cart/PDP Cross-Pairing Widget:** "Pairs Well With" (cross-category suggestions based on matching `mood`, `occasion`, or `pairing_tags`).

### 10.2 Future Architecture Readiness
* Catalog data schemas and event tracking telemetry will store structured metadata to enable future personalized or hybrid machine learning recommendation models post-MVP.

---

## 11. User Behaviour Tracking Requirements

### 11.1 Telemetry Events
To support analytics and future recommendation capabilities, the system must track the following events:
1. `product_view`: Triggered when a PDP is loaded.
2. `search_query`: Triggered when a search is executed (logs query string and result count).
3. `wishlist_add` / `wishlist_remove`: Triggered when items are saved or removed.
4. `cart_add` / `cart_remove`: Triggered when items are added/removed from cart.
5. `checkout_start`: Triggered when user enters checkout.
6. `purchase_completed`: Triggered on successful order placement.

### 11.2 Identity Tracking
* **Authenticated Users:** Linked via `user_id`.
* **Guest Users:** Linked via persistent `session_id` stored in client-side storage. Upon user authentication/registration, `session_id` event history must be associated with the newly identified `user_id`.

---

## 12. Non-Functional Requirements

### 12.1 Performance & Responsiveness
* Fast load times ($\ge 85$ target performance rating).
* Mobile-first responsive visual layout supporting screens down to 320px width.
* Adaptive rendering of 3D assets and animation effects based on device hardware capabilities.

### 12.2 Aesthetics & UX
* Premium visual theme conforming to brand guidelines: Forest Green (`#1E3A2B`), Olive Green (`#4A5D4E`), Ivory/Cream (`#FDFBF7`), Muted Gold (`#D4AF37`), Warm Beige (`#F5EFE6`).
* Refined micro-interactions, elevated typography, interactive tilt states, and fluid transitions.

### 12.3 Security & Compliance
* Encrypted data transmission across all endpoints (HTTPS / TLS).
* Secure authentication and credential protection.
* Payment processing delegated to standard PCI-DSS compliant payment gateway integration.

### 12.4 Maintainability & Architecture Boundary
* Technical implementation decisions (frameworks, database design, 3D render engine, payment processor SDKs) are strictly out of scope for the PRD and will be specified in `ARCHITECTURE.md`.

---

## 13. MVP Scope

### Included in MVP:
* Full visual design implementation incorporating Two Valley brand identity and color palette.
* Customer storefront with Home, Category, PDP, Cart, Checkout, Auth, and Account pages.
* Subtle 3D product interactions, motion effects, and lightweight mobile motion fallbacks.
* Initial Catalog: 8–9 perfumes, 5–6 tea items with complete sensory and pairing attributes (`mood`, `occasion`, `use_case`, `pairing_tags`).
* Category filtering by sensory attributes, search, and sorting.
* Deterministic content-based recommendation engine (No Machine Learning).
* Payment-gateway-agnostic checkout flow.
* Basic behavioral telemetry logging (`user_id` & `session_id`).
* Admin Dashboard (Product/Metadata CRUD, Stock, Orders, Basic Analytics).
* Responsive desktop and mobile experiences.

---

## 14. Future Scope (Post-MVP)

* Machine Learning / Collaborative Filtering hybrid recommendation engine.
* Custom Gift Box Builder (mix-and-match perfumes + teas in custom luxury packaging).
* Subscription model for recurring tea deliveries.
* Multi-currency & international shipping support.
* Loyalty program and reward points system.
* Expanded AR / interactive 3D studio experience.

---

## 15. Out-of-Scope Features (Explicitly Excluded from Initial MVP)

* Machine Learning recommendation algorithms or dynamic AI rankers.
* Native mobile apps (iOS / Android) — web-only responsive application initially.
* Multi-vendor marketplace features.
* Automated supplier inventory reordering integration.
* Multi-warehouse logistics routing.

---

## 16. Success Criteria

* **User Experience:** Zero critical bugs in search, 3D interaction fallbacks, cart, checkout, or auth flows.
* **Catalog Completeness:** 100% of initial catalog populated with rich sensory notes and optional metadata (`mood`, `occasion`, `use_case`, `pairing_tags`).
* **Performance:** Smooth 60fps animations on desktop, reduced lightweight motion on mobile with high performance scores.
* **Recommendation Relevance:** Relevant content-based recommendations rendered across PDP and cart widgets using tag matching.
* **Admin Capability:** Complete administrative control over catalog, inventory, order statuses, and analytics summaries.

---

## 17. Major Assumptions

1. Initial product catalog remains focused on launch volume (8–9 perfumes, 5–6 teas).
2. Content-based rule matching produces sufficient recommendation quality for initial catalog size without requiring ML.
3. Payment integration will utilize a standard payment gateway abstraction without vendor lock-in defined at the PRD stage.
4. Client devices support basic WebGL/canvas capabilities, with graceful CSS/image fallbacks on legacy hardware.

---

## 18. Major Risks & Mitigation Strategies

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Heavy 3D/Motion Degrading Mobile Performance** | High risk of slow page loads or UI stutter on lower-end mobile devices. | Implement device detection to automatically apply reduced, lightweight motion and static asset fallbacks on mobile. |
| **Recommendation Cold-Start** | Risk of insufficient attribute matches for recommendations. | Fall back to top-rated items in the same category if attribute matching yields $<3$ items. |
| **Guest-to-Auth Telemetry Disconnect** | Incomplete user journey history when guest authenticates. | Automatically attach existing `session_id` history to the authenticated `user_id` upon login/registration. |
| **Scope Creep into Technical Stack** | Mixing PRD goals with tech implementation. | Keep technology selection (frameworks, DB, payment APIs) strictly confined to `ARCHITECTURE.md`. |

---
