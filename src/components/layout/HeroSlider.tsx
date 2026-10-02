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
      className="relative w-full overflow-hidden bg-brand-ivory text-brand-forest min-h-[320px] sm:min-h-[440px] lg:min-h-[480px] max-h-[520px] flex items-center justify-center border-b border-brand-gold/25"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slide Background Images with Soft Light Overlay Gradients */}
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
            className="object-cover object-center transform scale-105 transition-transform duration-[10000ms] opacity-35"
          />
          {/* Light luxury gradient backdrop for crisp readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-ivory/95 via-brand-ivory/85 to-brand-ivory/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ivory via-transparent to-brand-ivory/40" />
        </div>
      ))}

      {/* Main Container Content Overlay */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Brand Hero Text & CTAs */}
          <div className="lg:col-span-8 space-y-2.5 sm:space-y-6 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-brand-beige border border-brand-gold/40 backdrop-blur-md mx-auto lg:mx-0 w-fit">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-gold animate-pulse" />
              <span className="font-sans text-[10px] sm:text-xs font-semibold tracking-[0.15em] sm:tracking-[0.2em] uppercase text-brand-forest">
                {SLIDES[currentSlide].badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-xl sm:text-4xl lg:text-5xl font-bold text-brand-forest leading-[1.15] tracking-tight drop-shadow-sm">
              {SLIDES[currentSlide].title}
            </h1>

            {/* Subtitle */}
            <p className="font-sans text-xs sm:text-base lg:text-lg text-brand-olive max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal line-clamp-2 sm:line-clamp-none">
              {SLIDES[currentSlide].subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-4 pt-2 sm:pt-4 font-sans">
              <Link
                href={SLIDES[currentSlide].primaryCtaHref}
                className="w-auto px-3.5 py-2 sm:px-7 sm:py-3.5 rounded-lg sm:rounded-xl bg-brand-forest text-brand-ivory hover:bg-brand-olive font-semibold text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest shadow-md transition-all duration-200 text-center"
              >
                {SLIDES[currentSlide].primaryCtaText}
              </Link>
              <Link
                href={SLIDES[currentSlide].secondaryCtaHref}
                className="w-auto px-3.5 py-2 sm:px-7 sm:py-3.5 rounded-lg sm:rounded-xl border border-brand-forest text-brand-forest hover:bg-brand-beige font-semibold text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest transition-all duration-200 text-center backdrop-blur-sm"
              >
                {SLIDES[currentSlide].secondaryCtaText}
              </Link>
            </div>
          </div>

          {/* Right Column: Featured Product Card Showcase Overlay (Shown on Desktop) */}
          <div className="hidden lg:block lg:col-span-4 relative">
            <div className="relative mx-auto max-w-xs aspect-square bg-brand-ivory/90 rounded-2xl overflow-hidden border border-brand-gold/30 shadow-xl backdrop-blur-lg">
              <Image
                src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800"
                alt="Two Valley Scent & Tea Experience"
                fill
                priority
                sizes="320px"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Slider Controls (Prev / Next Buttons & Indicators) */}
      <div className="absolute bottom-4 left-0 right-0 z-30 flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Slide Indicators / Dots */}
        <div className="flex items-center space-x-2.5">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none ${
                idx === currentSlide
                  ? "w-8 bg-brand-gold"
                  : "w-2 bg-brand-forest/25 hover:bg-brand-forest/50"
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center space-x-2">
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="p-2 rounded-full bg-brand-ivory/90 border border-brand-gold/30 text-brand-forest hover:text-brand-gold hover:bg-brand-beige transition-colors focus:outline-none shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="p-2 rounded-full bg-brand-ivory/90 border border-brand-gold/30 text-brand-forest hover:text-brand-gold hover:bg-brand-beige transition-colors focus:outline-none shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
