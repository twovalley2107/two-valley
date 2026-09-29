import { HeroSlider } from "@/components/layout/HeroSlider";
import { BrandMarquee } from "@/components/layout/BrandMarquee";
import { FeaturedCollections } from "@/components/catalog/FeaturedCollections";
import { BrandStory } from "@/components/layout/BrandStory";
import { SensoryRituals } from "@/components/layout/SensoryRituals";
import { FinalCTA } from "@/components/layout/FinalCTA";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 3. Full-Width Hero Slider */}
      <HeroSlider />

      {/* 4. Brand & Promise Marquee Ticker */}
      <BrandMarquee />

      {/* 5. Featured Collections */}
      <FeaturedCollections />

      {/* 6. Brand Story & Sourcing Philosophy */}
      <BrandStory />

      {/* 8. Sensory Rituals & Pairing Section */}
      <SensoryRituals />

      {/* 9. Final Full-Width CTA */}
      <FinalCTA />
    </div>
  );
}
