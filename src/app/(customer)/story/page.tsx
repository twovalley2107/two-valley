import { Metadata } from "next";
import { BrandStory } from "@/components/layout/BrandStory";

export const metadata: Metadata = {
  title: "Our Story & Philosophy — Two Valley",
  description: "Learn about Two Valley's botanical sourcing, steam distillation, and single-estate tea philosophy.",
};

export default function StoryPage() {
  return (
    <div className="min-h-screen bg-brand-ivory font-sans">
      {/* Story Editorial Header */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-brand-gold/15 bg-brand-beige/30">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="font-sans text-xs font-semibold tracking-[0.25em] uppercase text-brand-gold">
            Our Heritage & Craft
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-brand-forest">
            The Two Valley Sanctuary
          </h1>
          <p className="font-sans text-base sm:text-lg text-brand-olive leading-relaxed">
            Where floral fields meet mist-veiled tea slopes. Exploring the natural harmony between scent, taste, and high-altitude purity.
          </p>
        </div>
      </section>

      {/* Brand Storytelling Section */}
      <BrandStory />
    </div>
  );
}
