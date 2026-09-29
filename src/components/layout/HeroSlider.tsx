"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  bgImageUrl: string;
  show3DOverlay?: boolean;
}

const SLIDES: HeroSlide[] = [
  {
    id: "botanical-purity",
    badge: "Highland Botanicals & Extraits",
    title: "Botanical Elegance Meets High-Altitude Purity",
    subtitle:
      "Handcrafted extrait de parfum and single-estate mountain teas, harvested from pristine valleys and blended for serene sensory living.",
    primaryCtaText: "Explore Perfumes",
    primaryCtaHref: "/perfumes",
    secondaryCtaText: "Discover Teas",
    secondaryCtaHref: "/teas",
    bgImageUrl:
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=2000&auto=format&fit=crop",
    show3DOverlay: true,
  },
  {
    id: "mountain-teas",
    badge: "Single-Estate Mountain Harvests",
    title: "Rare Whole-Leaf Flushes Plucked Above 6,000 Feet",
    subtitle:
      "Directly traded from mist-veiled mountain gardens. Unblended single-origin teas celebrated for deep terroir and restorative clarity.",
    primaryCtaText: "Discover Teas",
    primaryCtaHref: "/teas",
    secondaryCtaText: "Curated Collections",
    secondaryCtaHref: "/collections",
    bgImageUrl:
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=2000&auto=format&fit=crop",
    show3DOverlay: false,
  },
  {
    id: "sensory-rituals",
    badge: "Sensory Living & Fine Scent",
    title: "Complementary Rituals for Mind, Body & Sanctuary",
    subtitle:
      "Designed as dual sensory rituals — pairing grounding extrait de parfum with warming mountain teas for serene daily mindfulness.",
    primaryCtaText: "Our Story & Philosophy",
    primaryCtaHref: "/story",
    secondaryCtaText: "Explore Perfumes",
    secondaryCtaHref: "/perfumes",
    bgImageUrl:
      "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?q=80&w=2000&auto=format&fit=crop",
    show3DOverlay: false,
  },
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;

    // Check prefers-reduced-motion
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 7000);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  return (
    <section
      aria-label="Two Valley Hero Showcase"
      className="relative w-full overflow-hidden bg-brand-charcoal text-brand-ivory min-h-[75vh] sm:min-h-[82vh] lg:min-h-[86vh] flex items-center justify-center border-b border-brand-gold/25"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slide Background Images with Overlay Dark Gradients */}
      {SLIDES.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <Image
            src={slide.bgImageUrl}
            alt={slide.title}
            fill
            priority={idx === 0}
            sizes="100vw"
            className="object-cover object-center transform scale-105 transition-transform duration-[10000ms]"
          />
          {/* Multi-stage luxury gradient backdrop for high contrast readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-charcoal/90 via-brand-charcoal/75 to-brand-charcoal/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-transparent to-brand-charcoal/50" />
        </div>
      ))}

      {/* Main Container Content Overlay */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Brand Hero Text & CTAs */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-brand-gold/15 border border-brand-gold/35 backdrop-blur-md mx-auto lg:mx-0 w-fit">
              <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
              <span className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-brand-gold">
                {SLIDES[currentSlide].badge}
              </span>
            </div>

            {/* Title (Typography: Playfair Display 56-72px desktop / 36-44px mobile) */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-7xl font-bold text-brand-ivory leading-[1.12] tracking-tight drop-shadow-md">
              {SLIDES[currentSlide].title}
            </h1>

            {/* Subtitle */}
            <p className="font-sans text-base sm:text-lg lg:text-xl text-brand-ivory/85 max-w-2xl mx-auto lg:mx-0 leading-relaxed drop-shadow-sm font-normal">
              {SLIDES[currentSlide].subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 font-sans">
              <Link
                href={SLIDES[currentSlide].primaryCtaHref}
                className="w-full sm:w-auto px-9 py-4.5 rounded-xl bg-brand-gold text-brand-charcoal hover:bg-brand-gold/90 font-semibold text-xs sm:text-sm uppercase tracking-widest shadow-xl hover:shadow-brand-gold/20 transition-all duration-200 text-center"
              >
                {SLIDES[currentSlide].primaryCtaText}
              </Link>
              <Link
                href={SLIDES[currentSlide].secondaryCtaHref}
                className="w-full sm:w-auto px-9 py-4.5 rounded-xl border-2 border-brand-ivory/80 text-brand-ivory hover:bg-brand-ivory hover:text-brand-charcoal font-semibold text-xs sm:text-sm uppercase tracking-widest transition-all duration-200 text-center backdrop-blur-sm"
              >
                {SLIDES[currentSlide].secondaryCtaText}
              </Link>
            </div>
          </div>

          {/* Right Column: Featured Product Card Showcase Overlay (Shown on Desktop) */}
          <div className="hidden lg:block lg:col-span-4 relative">
            <div className="relative mx-auto max-w-sm aspect-square bg-brand-charcoal/80 rounded-3xl overflow-hidden border border-brand-gold/30 shadow-2xl backdrop-blur-lg">
              <Image
                src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800"
                alt="Two Valley Scent & Tea Experience"
                fill
                priority
                sizes="400px"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Slider Controls (Prev / Next Buttons & Indicators) */}
      <div className="absolute bottom-6 left-0 right-0 z-30 flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Slide Indicators / Dots */}
        <div className="flex items-center space-x-3">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none ${
                idx === currentSlide
                  ? "w-10 bg-brand-gold"
                  : "w-2.5 bg-brand-ivory/40 hover:bg-brand-ivory/70"
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center space-x-3">
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="p-2.5 rounded-full bg-brand-charcoal/60 border border-brand-gold/30 text-brand-ivory hover:text-brand-gold hover:bg-brand-charcoal transition-colors focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="p-2.5 rounded-full bg-brand-charcoal/60 border border-brand-gold/30 text-brand-ivory hover:text-brand-gold hover:bg-brand-charcoal transition-colors focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
