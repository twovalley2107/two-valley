import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Two Valley database...");

  // 1. Clean existing records (seed safety)
  await prisma.sensoryAttribute.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.eventLog.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  // 2. Create Primary Categories
  const perfumeCategory = await prisma.category.create({
    data: {
      name: "Artisanal Perfumes",
      slug: "artisanal-perfumes",
      description: "Handcrafted botanical extrait de parfum bridging high-altitude blossoms and rare woods.",
      image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop",
    },
  });

  const teaCategory = await prisma.category.create({
    data: {
      name: "Single-Estate Teas",
      slug: "single-estate-teas",
      description: "Rare-harvest, single-estate tea leaves harvested from pristine mountain valleys.",
      image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1000&auto=format&fit=crop",
    },
  });

  // 3. Perfume SKUs (8 SKUs)
  const perfumesData = [
    {
      name: "Valley Mist Extrait",
      slug: "valley-mist-extrait",
      sku: "TV-PERF-001",
      description: "An evocative morning fragrance capturing damp pine needles, wild cardamom, and crisp mountain air.",
      price: new Prisma.Decimal("145.00"),
      stockQuantity: 45,
      isFeatured: true,
      categoryId: perfumeCategory.id,
      fragranceFamily: "Fresh Woody",
      mood: "Refreshing & Meditative",
      occasion: "Morning Ritual, Daily Wear",
      useCase: "Workday Focus, Morning Calm",
      pairingTags: "Darjeeling First Flush Tea",
      tags: "fresh, woody, cardamom, pine",
      variants: [
        { volumeWeight: "50ml", priceOverride: new Prisma.Decimal("145.00"), stockQuantity: 25, sku: "TV-PERF-001-50ML" },
        { volumeWeight: "100ml", priceOverride: new Prisma.Decimal("220.00"), stockQuantity: 20, sku: "TV-PERF-001-100ML" },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800", altText: "Valley Mist Bottle", isPrimary: true, sortOrder: 0 },
      ],
      sensory: [
        { attributeType: "TOP_NOTE", name: "Wild Cardamom & Bergamot" },
        { attributeType: "HEART_NOTE", name: "Alpine Pine & White Iris" },
        { attributeType: "BASE_NOTE", name: "Himalayan Cedar & Ambergris" },
      ],
    },
    {
      name: "Sandalwood Reserve",
      slug: "sandalwood-reserve",
      sku: "TV-PERF-002",
      description: "Deep, creamy Mysore sandalwood enriched with warm vanilla bean and subtle smoky incense.",
      price: new Prisma.Decimal("180.00"),
      stockQuantity: 30,
      isFeatured: true,
      categoryId: perfumeCategory.id,
      fragranceFamily: "Woody Oriental",
      mood: "Warm & Regal",
      occasion: "Evening Gala, Special Occasions",
      useCase: "Night Out, Intimate Gathering",
      pairingTags: "Assam Orthodox Black Tea",
      tags: "sandalwood, warm, luxury, incense",
      variants: [
        { volumeWeight: "50ml", priceOverride: new Prisma.Decimal("180.00"), stockQuantity: 15, sku: "TV-PERF-002-50ML" },
        { volumeWeight: "100ml", priceOverride: new Prisma.Decimal("260.00"), stockQuantity: 15, sku: "TV-PERF-002-100ML" },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800", altText: "Sandalwood Reserve Bottle", isPrimary: true, sortOrder: 0 },
      ],
      sensory: [
        { attributeType: "TOP_NOTE", name: "Nutmeg & Sweet Orange" },
        { attributeType: "HEART_NOTE", name: "Mysore Sandalwood & Cedar" },
        { attributeType: "BASE_NOTE", name: "Vanilla Bean & Vetiver" },
      ],
    },
    {
      name: "Jasmine Dusk",
      slug: "jasmine-dusk",
      sku: "TV-PERF-003",
      description: "Night-blooming royal jasmine intertwined with velvety damask rose and pink pepper accents.",
      price: new Prisma.Decimal("160.00"),
      stockQuantity: 40,
      isFeatured: false,
      categoryId: perfumeCategory.id,
      fragranceFamily: "Floral Intense",
      mood: "Romantic & Captivating",
      occasion: "Evening Dinner, Date Night",
      useCase: "Special Evenings",
      pairingTags: "High-Mountain White Tea",
      tags: "jasmine, floral, rose, pink pepper",
      variants: [
        { volumeWeight: "50ml", priceOverride: new Prisma.Decimal("160.00"), stockQuantity: 20, sku: "TV-PERF-003-50ML" },
        { volumeWeight: "100ml", priceOverride: new Prisma.Decimal("235.00"), stockQuantity: 20, sku: "TV-PERF-003-100ML" },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=800", altText: "Jasmine Dusk Bottle", isPrimary: true, sortOrder: 0 },
      ],
      sensory: [
        { attributeType: "TOP_NOTE", name: "Pink Peppercorn & Neroli" },
        { attributeType: "HEART_NOTE", name: "Night Jasmine & Damask Rose" },
        { attributeType: "BASE_NOTE", name: "Soft Musk & Cashmere Wood" },
      ],
    },
    {
      name: "Oud Horizon",
      slug: "oud-horizon",
      sku: "TV-PERF-004",
      description: "Precious Assam agarwood oud layered with leather, saffron, and rich caramelized amber.",
      price: new Prisma.Decimal("210.00"),
      stockQuantity: 25,
      isFeatured: true,
      categoryId: perfumeCategory.id,
      fragranceFamily: "Woody Spice",
      mood: "Opulent & Mysterious",
      occasion: "Gala Events, Formal Dinners",
      useCase: "Statement Fragrance",
      pairingTags: "Smoky Lapsang Souchong",
      tags: "oud, leather, saffron, amber",
      variants: [
        { volumeWeight: "50ml", priceOverride: new Prisma.Decimal("210.00"), stockQuantity: 10, sku: "TV-PERF-004-50ML" },
        { volumeWeight: "100ml", priceOverride: new Prisma.Decimal("310.00"), stockQuantity: 15, sku: "TV-PERF-004-100ML" },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800", altText: "Oud Horizon Bottle", isPrimary: true, sortOrder: 0 },
      ],
      sensory: [
        { attributeType: "TOP_NOTE", name: "Golden Saffron & Thyme" },
        { attributeType: "HEART_NOTE", name: "Assam Oud & Suede" },
        { attributeType: "BASE_NOTE", name: "Dark Amber & Patchouli" },
      ],
    },
    {
      name: "Citrus Grove",
      slug: "citrus-grove",
      sku: "TV-PERF-005",
      description: "Sun-drenched Calabrian bergamot, mandarin leaf, and sparkling vetiver for radiant vitality.",
      price: new Prisma.Decimal("130.00"),
      stockQuantity: 50,
      isFeatured: false,
      categoryId: perfumeCategory.id,
      fragranceFamily: "Citrus Fresh",
      mood: "Energetic & Joyful",
      occasion: "Daytime Casual, Summer Outdoors",
      useCase: "Daily Refreshment",
      pairingTags: "Himalayan Green Tea",
      tags: "citrus, bergamot, mandarin, fresh",
      variants: [
        { volumeWeight: "50ml", priceOverride: new Prisma.Decimal("130.00"), stockQuantity: 30, sku: "TV-PERF-005-50ML" },
        { volumeWeight: "100ml", priceOverride: new Prisma.Decimal("195.00"), stockQuantity: 20, sku: "TV-PERF-005-100ML" },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800", altText: "Citrus Grove Bottle", isPrimary: true, sortOrder: 0 },
      ],
      sensory: [
        { attributeType: "TOP_NOTE", name: "Calabrian Bergamot & Lemon Leaf" },
        { attributeType: "HEART_NOTE", name: "Grapefruit Blossom & Mint" },
        { attributeType: "BASE_NOTE", name: "Clean Vetiver & White Cedar" },
      ],
    },
    {
      name: "Amber Solace",
      slug: "amber-solace",
      sku: "TV-PERF-006",
      description: "Comforting resinous golden amber paired with roasted tonka bean and subtle benzoin warmth.",
      price: new Prisma.Decimal("155.00"),
      stockQuantity: 35,
      isFeatured: false,
      categoryId: perfumeCategory.id,
      fragranceFamily: "Amber Warm",
      mood: "Cozy & Reassuring",
      occasion: "Autumnal Evenings, Relaxation",
      useCase: "Unwinding at Home",
      pairingTags: "Cardamom Spiced Chai",
      tags: "amber, tonka, warm, cozy",
      variants: [
        { volumeWeight: "50ml", priceOverride: new Prisma.Decimal("155.00"), stockQuantity: 20, sku: "TV-PERF-006-50ML" },
        { volumeWeight: "100ml", priceOverride: new Prisma.Decimal("225.00"), stockQuantity: 15, sku: "TV-PERF-006-100ML" },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=800", altText: "Amber Solace Bottle", isPrimary: true, sortOrder: 0 },
      ],
      sensory: [
        { attributeType: "TOP_NOTE", name: "Coriander Seed & Sweet Anise" },
        { attributeType: "HEART_NOTE", name: "Golden Amber & Benzoin Resin" },
        { attributeType: "BASE_NOTE", name: "Roasted Tonka & Vanilla Pod" },
      ],
    },
    {
      name: "Velvet Fig",
      slug: "velvet-fig",
      sku: "TV-PERF-007",
      description: "Lush Mediterranean fig fruit, green fig leaf, and creamy coconut milk over cedarwood.",
      price: new Prisma.Decimal("150.00"),
      stockQuantity: 35,
      isFeatured: false,
      categoryId: perfumeCategory.id,
      fragranceFamily: "Green Fruity",
      mood: "Sophisticated & Lush",
      occasion: "Weekend Brunch, Afternoon Tea",
      useCase: "Casual Elegance",
      pairingTags: "High-Mountain White Tea",
      tags: "fig, green, coconut, cedar",
      variants: [
        { volumeWeight: "50ml", priceOverride: new Prisma.Decimal("150.00"), stockQuantity: 20, sku: "TV-PERF-007-50ML" },
        { volumeWeight: "100ml", priceOverride: new Prisma.Decimal("220.00"), stockQuantity: 15, sku: "TV-PERF-007-100ML" },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?q=80&w=800", altText: "Velvet Fig Bottle", isPrimary: true, sortOrder: 0 },
      ],
      sensory: [
        { attributeType: "TOP_NOTE", name: "Green Fig Leaf & Black Currant" },
        { attributeType: "HEART_NOTE", name: "Ripe Fig Fruit & Coconut Nectar" },
        { attributeType: "BASE_NOTE", name: "Cedarwood & Musk" },
      ],
    },
    {
      name: "Alpine Vetiver",
      slug: "alpine-vetiver",
      sku: "TV-PERF-008",
      description: "Earthy Haitian vetiver sharpened with grapefruit zest and crushed oakmoss.",
      price: new Prisma.Decimal("165.00"),
      stockQuantity: 30,
      isFeatured: false,
      categoryId: perfumeCategory.id,
      fragranceFamily: "Earthy Woody",
      mood: "Grounded & Distinctive",
      occasion: "Business Meetings, Outdoor Exploration",
      useCase: "Professional Wear",
      pairingTags: "Himalayan Green Tea",
      tags: "vetiver, earth, oakmoss, grapefruit",
      variants: [
        { volumeWeight: "50ml", priceOverride: new Prisma.Decimal("165.00"), stockQuantity: 15, sku: "TV-PERF-008-50ML" },
        { volumeWeight: "100ml", priceOverride: new Prisma.Decimal("240.00"), stockQuantity: 15, sku: "TV-PERF-008-100ML" },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=800", altText: "Alpine Vetiver Bottle", isPrimary: true, sortOrder: 0 },
      ],
      sensory: [
        { attributeType: "TOP_NOTE", name: "Grapefruit Zest & Pink Pepper" },
        { attributeType: "HEART_NOTE", name: "Haitian Vetiver & Nutmeg" },
        { attributeType: "BASE_NOTE", name: "Oakmoss & Smoked Birch" },
      ],
    },
  ];

  for (const item of perfumesData) {
    const { variants, images, sensory, ...productData } = item;
    const createdProduct = await prisma.product.create({
      data: {
        ...productData,
        variants: { create: variants },
        images: { create: images },
        sensoryAttributes: { create: sensory },
      },
    });
    console.log(`Created perfume: ${createdProduct.name}`);
  }

  // 4. Tea SKUs (5 SKUs)
  const teasData = [
    {
      name: "Darjeeling First Flush (Spring Reserve)",
      slug: "darjeeling-first-flush-spring-reserve",
      sku: "TV-TEA-001",
      description: "The 'Champagne of Teas' — delicate spring harvest with muscatel grape and floral blossom notes.",
      price: new Prisma.Decimal("48.00"),
      stockQuantity: 60,
      isFeatured: true,
      categoryId: teaCategory.id,
      teaType: "Single Estate Loose Leaf",
      origin: "Darjeeling (Kurseong Valley, Elevation 6,000ft)",
      caffeineLevel: "Medium",
      steepingGuide: "Temperature: 85°C (185°F) | Steep Time: 3 mins | Leaf Quantity: 2.5g per 200ml",
      mood: "Refined & Uplifting",
      occasion: "Morning Ritual, Afternoon Reading",
      useCase: "Morning Elevation",
      pairingTags: "Valley Mist Extrait",
      tags: "darjeeling, first flush, muscatel, floral",
      variants: [
        { volumeWeight: "100g Tin", priceOverride: new Prisma.Decimal("48.00"), stockQuantity: 35, sku: "TV-TEA-001-100G" },
        { volumeWeight: "250g Pouch", priceOverride: new Prisma.Decimal("95.00"), stockQuantity: 25, sku: "TV-TEA-001-250G" },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=800", altText: "Darjeeling First Flush Canister", isPrimary: true, sortOrder: 0 },
      ],
      sensory: [
        { attributeType: "FLAVOUR_NOTE", name: "Muscatel Grape" },
        { attributeType: "FLAVOUR_NOTE", name: "Wild Peach Blossom" },
        { attributeType: "FLAVOUR_NOTE", name: "Crisp Spring Grass" },
      ],
    },
    {
      name: "Assam Golden Tippy (CTC Spiced Blend)",
      slug: "assam-golden-tippy-ctc-spiced-blend",
      sku: "TV-TEA-002",
      description: "Robust full-bodied Assam black tea enriched with crushed green cardamom, cinnamon bark, and ginger root.",
      price: new Prisma.Decimal("36.00"),
      stockQuantity: 75,
      isFeatured: true,
      categoryId: teaCategory.id,
      teaType: "CTC Chai Patti Spiced",
      origin: "Upper Assam (Brahmaputra Valley)",
      caffeineLevel: "High",
      steepingGuide: "Temperature: 100°C (212°F) | Steep Time: 4-5 mins with milk & honey | Leaf Quantity: 3g per 200ml",
      mood: "Invigorating & Bold",
      occasion: "Breakfast Chai, Cold Evenings",
      useCase: "Energy Boost",
      pairingTags: "Sandalwood Reserve",
      tags: "assam, ctc, chai patti, spiced, cardamom",
      variants: [
        { volumeWeight: "250g Pouch", priceOverride: new Prisma.Decimal("36.00"), stockQuantity: 45, sku: "TV-TEA-002-250G" },
        { volumeWeight: "500g Value Pack", priceOverride: new Prisma.Decimal("65.00"), stockQuantity: 30, sku: "TV-TEA-002-500G" },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=800", altText: "Assam Spiced Chai Canister", isPrimary: true, sortOrder: 0 },
      ],
      sensory: [
        { attributeType: "FLAVOUR_NOTE", name: "Malty Molasses" },
        { attributeType: "FLAVOUR_NOTE", name: "Green Cardamom" },
        { attributeType: "FLAVOUR_NOTE", name: "Warm Cinnamon Bark" },
      ],
    },
    {
      name: "High-Mountain White Peony",
      slug: "high-mountain-white-peony",
      sku: "TV-TEA-003",
      description: "Rare silver bud white tea dried under gentle mountain sun. Silky texture with natural honey sweetness.",
      price: new Prisma.Decimal("62.00"),
      stockQuantity: 30,
      isFeatured: false,
      categoryId: teaCategory.id,
      teaType: "Rare White Tea Buds",
      origin: "High Himalayan Slopes (Elevation 7,200ft)",
      caffeineLevel: "Low",
      steepingGuide: "Temperature: 75°C (167°F) | Steep Time: 4 mins | Leaf Quantity: 3g per 200ml",
      mood: "Serene & Pure",
      occasion: "Evening Unwinding, Mindful Tea Ceremony",
      useCase: "Meditative Relaxation",
      pairingTags: "Jasmine Dusk",
      tags: "white tea, silver needle, honey, delicate",
      variants: [
        { volumeWeight: "75g Gift Tin", priceOverride: new Prisma.Decimal("62.00"), stockQuantity: 15, sku: "TV-TEA-003-75G" },
        { volumeWeight: "150g Pouch", priceOverride: new Prisma.Decimal("110.00"), stockQuantity: 15, sku: "TV-TEA-003-150G" },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1563822249510-096739401777?q=80&w=800", altText: "White Peony Tea Canister", isPrimary: true, sortOrder: 0 },
      ],
      sensory: [
        { attributeType: "FLAVOUR_NOTE", name: "Wild Honey" },
        { attributeType: "FLAVOUR_NOTE", name: "Apricot Nectar" },
        { attributeType: "FLAVOUR_NOTE", name: "Chestnut Blossom" },
      ],
    },
    {
      name: "Himalayan Green Needle",
      slug: "himalayan-green-needle",
      sku: "TV-TEA-004",
      description: "Pan-roasted emerald green tea leaves offering vibrant vegetal clarity and toasted rice warmth.",
      price: new Prisma.Decimal("42.00"),
      stockQuantity: 55,
      isFeatured: false,
      categoryId: teaCategory.id,
      teaType: "Organic Whole Leaf Green",
      origin: "Kangra Valley",
      caffeineLevel: "Medium",
      steepingGuide: "Temperature: 80°C (176°F) | Steep Time: 2.5 mins | Leaf Quantity: 2.5g per 200ml",
      mood: "Focus & Revitalizing",
      occasion: "Post-Workout, Workday Focus",
      useCase: "Antioxidant Boost",
      pairingTags: "Citrus Grove",
      tags: "green tea, himalayan, toasted, organic",
      variants: [
        { volumeWeight: "100g Tin", priceOverride: new Prisma.Decimal("42.00"), stockQuantity: 30, sku: "TV-TEA-004-100G" },
        { volumeWeight: "250g Pouch", priceOverride: new Prisma.Decimal("82.00"), stockQuantity: 25, sku: "TV-TEA-004-250G" },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?q=80&w=800", altText: "Himalayan Green Needle Canister", isPrimary: true, sortOrder: 0 },
      ],
      sensory: [
        { attributeType: "FLAVOUR_NOTE", name: "Fresh Steamed Greens" },
        { attributeType: "FLAVOUR_NOTE", name: "Toasted Chestnut" },
        { attributeType: "FLAVOUR_NOTE", name: "Sweet Bamboo" },
      ],
    },
    {
      name: "Kashmiri Kahwa Saffron Blend",
      slug: "kashmiri-kahwa-saffron-blend",
      sku: "TV-TEA-005",
      description: "Traditional green tea infusion infused with Kashmiri saffron strands, crushed almonds, and green cardamom.",
      price: new Prisma.Decimal("55.00"),
      stockQuantity: 40,
      isFeatured: true,
      categoryId: teaCategory.id,
      teaType: "Saffron Spiced Green Infusion",
      origin: "Kashmir Valley",
      caffeineLevel: "Medium-Low",
      steepingGuide: "Temperature: 90°C (194°F) | Steep Time: 3-4 mins | Leaf Quantity: 3g per 200ml",
      mood: "Luxurious & Warming",
      occasion: "Festive Celebrations, Winter Evenings",
      useCase: "Celebratory Tea",
      pairingTags: "Oud Horizon",
      tags: "kahwa, saffron, kashmir, almond, cardamom",
      variants: [
        { volumeWeight: "100g Luxury Tin", priceOverride: new Prisma.Decimal("55.00"), stockQuantity: 25, sku: "TV-TEA-005-100G" },
        { volumeWeight: "200g Refill Pouch", priceOverride: new Prisma.Decimal("98.00"), stockQuantity: 15, sku: "TV-TEA-005-200G" },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1571934811356-5cc561d6821f?q=80&w=800", altText: "Kashmiri Kahwa Canister", isPrimary: true, sortOrder: 0 },
      ],
      sensory: [
        { attributeType: "FLAVOUR_NOTE", name: "Kashmiri Saffron" },
        { attributeType: "FLAVOUR_NOTE", name: "Sweet Almond" },
        { attributeType: "FLAVOUR_NOTE", name: "Cardamom & Cinnamon" },
      ],
    },
  ];

  for (const item of teasData) {
    const { variants, images, sensory, ...productData } = item;
    const createdProduct = await prisma.product.create({
      data: {
        ...productData,
        variants: { create: variants },
        images: { create: images },
        sensoryAttributes: { create: sensory },
      },
    });
    console.log(`Created tea: ${createdProduct.name}`);
  }

  console.log("Seeding complete! Initial launch catalog successfully created.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
