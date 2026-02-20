"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { aboutImage, biographyShort, portfolioTeaser, sessionsTeaser, personalData } from "@/lib/data";

export default function HomePage() {
  return (
    <div className="w-full bg-black text-white">
      <HeroSection />
      <PortfolioTeaser />
      <IntroSection />
      <SessionsPreview />
      <SocialSection />
      <CTASection />
    </div>
  );
}

// ========================================
// 1. HERO — Dual Slideshow (Mobile-First)
// ========================================

// Mobile hero photos (portrait aspect ratio)
const mobileHeroImages = ["/he.jpg", "/he2.jpg", "/he3.jpg", "/he4.jpg"];
// Desktop hero photos (16:9 landscape)
const desktopHeroImages = ["/014A7144-2.jpg", "/014A7221-2.jpg", "/014A7227-2.jpg"];

function HeroSection() {
  const [y, setY] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [isMobile, setIsMobile] = useState(true); // Mobile-first default
  const bgRef = useRef<HTMLDivElement>(null);

  // Device detection + scroll
  useEffect(() => {
    const handleScroll = () => setY(window.scrollY);
    const handleResize = () => setIsMobile(window.innerWidth < 768);

    handleScroll();
    handleResize();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Parallax
  useEffect(() => {
    if (bgRef.current) {
      bgRef.current.style.transform = `translateY(${y * 0.15}px) scale(1.05)`;
    }
  }, [y]);

  // Auto slideshow
  const activeImages = isMobile ? mobileHeroImages : desktopHeroImages;

  useEffect(() => {
    setCurrentImage(0); // Reset on device change
  }, [isMobile]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % activeImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeImages.length]);

  return (
    <section className="relative w-full h-[100svh] overflow-hidden flex items-center justify-center bg-black">
      {/* Background Slideshow — Only renders one set based on device */}
      <div ref={bgRef} className="absolute inset-0 w-full h-full will-change-transform">
        {activeImages.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 w-full h-full transition-opacity duration-[1500ms] ease-in-out ${index === currentImage ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
          >
            <Image
              src={src}
              alt={`Robeanny Hero ${index + 1}`}
              fill
              priority={index === 0}
              className={`object-cover filter brightness-[0.55] ${isMobile ? "object-top" : "object-center"
                }`}
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <h1 className="font-serif text-[16vw] md:text-[10vw] lg:text-[8vw] text-white tracking-[0.1em] leading-[0.85] font-light mb-4 md:mb-6">
          ROBEANNY
        </h1>
        <p className="font-sans text-[9px] md:text-xs tracking-[0.4em] uppercase text-white/60 mb-8 md:mb-12">
          {personalData.subtitle}
        </p>
        <Link
          href="/portfolio"
          className="group font-sans text-[9px] md:text-xs tracking-[0.3em] uppercase border border-white/30 px-6 py-3 md:px-8 md:py-4 hover:bg-white hover:text-black transition-all duration-500"
        >
          Explore Portfolio
          <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {activeImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentImage(i)}
            className={`w-8 h-[2px] transition-all duration-500 ${i === currentImage ? "bg-white" : "bg-white/20"
              }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-pulse">
        <div className="w-px h-8 md:h-12 bg-gradient-to-b from-transparent to-white/40" />
        <span className="font-sans text-[7px] md:text-[8px] tracking-[0.3em] uppercase text-white/30">Scroll</span>
      </div>
    </section>
  );
}

// ========================================
// 2. PORTFOLIO TEASER — Curated Best Shots
// ========================================
function PortfolioTeaser() {
  return (
    <section className="w-full py-24 md:py-40 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-24">
          <h2 className="font-serif text-4xl md:text-6xl font-light tracking-tight">
            Selected <span className="italic">Work</span>
          </h2>
          <Link
            href="/portfolio"
            className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/50 hover:text-white transition-colors mt-4 md:mt-0 group"
          >
            View Full Portfolio
            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Asymmetric Editorial Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {portfolioTeaser.map((photo, i) => {
            // Alternate tall/wide for editorial feel
            const isTall = i === 0 || i === 3 || i === 6;
            return (
              <div
                key={photo.id}
                className={`relative overflow-hidden group cursor-pointer ${isTall ? "row-span-2" : ""
                  }`}
              >
                <div className={`relative w-full ${isTall ? "h-[500px] md:h-[700px]" : "h-[240px] md:h-[340px]"} overflow-hidden`}>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover transition-transform duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ========================================
// 3. INTRO — Who She Is (Short)
// ========================================
function IntroSection() {
  return (
    <section className="w-full py-24 md:py-40 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        {/* Photo */}
        <div className="w-full lg:w-5/12 h-[60vh] md:h-[70vh] max-h-[800px] relative overflow-hidden group">
          <Image
            src={aboutImage}
            alt="Robeanny Bastardo Liconte"
            fill
            className="object-cover object-top transition-transform duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        {/* Text */}
        <div className="w-full lg:w-7/12 flex flex-col">
          <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-white/40 mb-6">About</p>
          <h2 className="font-serif text-4xl md:text-6xl font-light mb-8 leading-[0.9]">
            The Model. <br /><span className="italic text-white/50">The Muse.</span>
          </h2>
          <p className="editorial-body text-lg md:text-xl text-white/70 max-w-lg mb-10 leading-relaxed">
            {biographyShort}
          </p>
          <Link
            href="/contact"
            className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/50 hover:text-white transition-colors group w-fit"
          >
            Get in Touch
            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ========================================
// 4. SESSIONS PREVIEW — Mini Grid
// ========================================
function SessionsPreview() {
  return (
    <section className="w-full py-24 md:py-40 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
          <h2 className="font-serif text-4xl md:text-6xl font-light tracking-tight">
            Latest <span className="italic">Sessions</span>
          </h2>
          <Link
            href="/sessions"
            className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/50 hover:text-white transition-colors mt-4 md:mt-0 group"
          >
            View All Sessions
            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {sessionsTeaser.map((url, i) => (
            <div key={i} className="relative h-[280px] md:h-[400px] overflow-hidden group cursor-pointer">
              <Image
                src={url}
                alt={`Robeanny Session ${i + 1}`}
                fill
                className="object-cover transition-transform duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========================================
// 5. SOCIAL — TikTok + Instagram Embeds + Links
// ========================================
function SocialSection() {
  return (
    <section className="w-full py-24 md:py-40 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto">
        <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-white/40 mb-6">Connect</p>
        <h2 className="font-serif text-4xl md:text-6xl font-light mb-16">
          Follow the <span className="italic">Journey</span>
        </h2>

        {/* TikTok + Instagram Embeds Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-16">
          {/* TikTok Embed */}
          <div className="w-full aspect-[9/14] md:aspect-[9/16] overflow-hidden border border-white/10 rounded-sm bg-black relative">
            <iframe
              src="https://www.tiktok.com/embed/@robeannybbl"
              className="w-full h-full border-0"
              loading="lazy"
              title="TikTok de Robeanny"
              allow="encrypted-media"
            />
            {/* TikTok label */}
            <div className="absolute top-4 left-4 font-sans text-[9px] tracking-[0.3em] uppercase text-white/50 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-sm">
              TikTok
            </div>
          </div>

          {/* Instagram Embed */}
          <div className="w-full aspect-[9/14] md:aspect-[9/16] overflow-hidden border border-white/10 rounded-sm bg-black relative">
            <iframe
              src="https://www.instagram.com/robeannybl/embed"
              className="w-full h-full border-0"
              loading="lazy"
              title="Instagram de Robeanny"
            />
            {/* Instagram label */}
            <div className="absolute top-4 left-4 font-sans text-[9px] tracking-[0.3em] uppercase text-white/50 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-sm">
              Instagram
            </div>
          </div>
        </div>

        {/* Social Links — 3 Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "LinkedIn", handle: "@robeanny", href: personalData.socials.linkedin, desc: "Professional network" },
            { label: "Patreon", handle: "robeanny", href: personalData.socials.patreon, desc: "Exclusive content" },
            { label: "Email", handle: personalData.email, href: `mailto:${personalData.email}`, desc: "Direct contact" },
          ].map((social) => (
            <a
              key={social.label}
              href={social.href}
              target={social.href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="group border border-white/10 p-6 md:p-8 hover:border-white/30 hover:bg-white/[0.02] transition-all duration-500 flex flex-col"
            >
              <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/30 mb-3">{social.desc}</span>
              <span className="font-serif text-2xl md:text-3xl text-white group-hover:text-white/80 transition-colors mb-2">{social.label}</span>
              <span className="font-sans text-xs text-white/30">{social.handle}</span>
              <span className="mt-auto pt-4 text-white/20 group-hover:text-white group-hover:translate-x-2 transition-all text-lg self-end">→</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========================================
// 6. CTA FINAL — Dramatic Close
// ========================================
function CTASection() {
  return (
    <section className="w-full py-32 md:py-48 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-[900px] mx-auto text-center flex flex-col items-center">
        <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light leading-[0.85] mb-8">
          Ready to create<br />
          something <span className="italic">beautiful</span>?
        </h2>
        <p className="editorial-body text-sm md:text-base text-white/50 max-w-md mb-12">
          Disponible para booking editorial, comercial y pasarelas a nivel mundial.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/book"
            className="font-sans text-[10px] tracking-[0.3em] uppercase border border-white bg-white text-black px-10 py-5 hover:bg-transparent hover:text-white transition-all duration-500"
          >
            Book a Session →
          </Link>
          <Link
            href="/contact"
            className="font-sans text-[10px] tracking-[0.3em] uppercase border border-white/30 px-10 py-5 hover:bg-white hover:text-black transition-all duration-500"
          >
            Get in Touch →
          </Link>
        </div>
      </div>
    </section>
  );
}
