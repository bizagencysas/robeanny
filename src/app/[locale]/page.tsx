"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  aboutImage,
  measurements,
  personalData,
  portfolioPhotos,
  sessionsTeaser,
} from "@/lib/data";
import InstagramWidget from "@/components/ui/InstagramWidget";
import TextScramble from "@/components/ui/TextScramble";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const heroImages = [
  "/014A7144-2.jpg",
  "/014A7221-2.jpg",
  "/014A7227-2.jpg",
  "/he.jpg",
  "/he2.jpg",
  "/he3.jpg",
  "/he4.jpg",
];

const featuredPortfolio = portfolioPhotos.slice(0, 8).map((photo, index) => ({
  id: index + 1,
  src: photo.src,
  alt: photo.alt,
}));

export default function HomePage() {
  const locale = useLocale();
  const tHero = useTranslations("hero");
  const tPortfolio = useTranslations("portfolioTeaser");
  const tIntro = useTranslations("intro");
  const tSessions = useTranslations("sessions");
  const tSocial = useTranslations("social");
  const tCta = useTranslations("cta");

  const [activeSlide, setActiveSlide] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  // Hero refs
  const heroRef = useRef<HTMLElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroImageContainerRef = useRef<HTMLDivElement>(null);
  const heroCTARef = useRef<HTMLDivElement>(null);

  // Section refs
  const marqueeRef = useRef<HTMLDivElement>(null);
  const portfolioSectionRef = useRef<HTMLElement>(null);
  const portfolioTitleRef = useRef<HTMLDivElement>(null);
  const portfolioCardsRef = useRef<HTMLDivElement[]>([]);
  const aboutSectionRef = useRef<HTMLElement>(null);
  const aboutImageRef = useRef<HTMLDivElement>(null);
  const aboutTextRef = useRef<HTMLDivElement>(null);
  const sessionsTrackRef = useRef<HTMLDivElement>(null);
  const sessionsSectionRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  const ctaTitleRef = useRef<HTMLHeadingElement>(null);
  const socialSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const toLocalePath = useMemo(
    () => (href: string) => {
      if (locale === "en") return href === "/" ? "/en" : `/en${href}`;
      return href;
    },
    [locale]
  );

  // ===== GSAP MASTER TIMELINE =====
  useEffect(() => {
    const ctx = gsap.context(() => {
      // ---- HERO: Title clip-path reveal ----
      if (heroTitleRef.current) {
        gsap.fromTo(
          heroTitleRef.current,
          { clipPath: "inset(100% 0 0 0)", y: 60 },
          {
            clipPath: "inset(0% 0 0 0)",
            y: 0,
            duration: 1.4,
            ease: "power4.out",
            delay: 0.8,
          }
        );
      }

      // Hero CTA stagger
      if (heroCTARef.current) {
        const elements = heroCTARef.current.children;
        gsap.fromTo(
          elements,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 1.6 }
        );
      }

      // Hero parallax on scroll — more aggressive
      if (heroTitleRef.current) {
        gsap.to(heroTitleRef.current, {
          y: -300,
          scale: 0.7,
          opacity: 0,
          rotateX: 15,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      if (heroImageContainerRef.current) {
        gsap.to(heroImageContainerRef.current, {
          y: 200,
          scale: 1.25,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      }

      // ---- MARQUEE: Infinite scroll with scroll-velocity skew ----
      if (marqueeRef.current) {
        const marqueeInner = marqueeRef.current.querySelector(".marquee-inner") as HTMLElement;
        if (marqueeInner) {
          gsap.to(marqueeInner, {
            xPercent: -50,
            repeat: -1,
            duration: 22,
            ease: "linear",
          });

          // Scroll-velocity-driven skew: faster scroll = more skew
          ScrollTrigger.create({
            trigger: marqueeRef.current,
            start: "top bottom",
            end: "bottom top",
            onUpdate: (self) => {
              const velocity = self.getVelocity();
              const skewAmount = gsap.utils.clamp(-8, 8, velocity / 200);
              gsap.to(marqueeInner, {
                skewX: skewAmount,
                duration: 0.3,
                overwrite: true,
              });
            },
          });
        }
      }

      // ---- PORTFOLIO: Section clip-path reveal (diagonal wipe) ----
      if (portfolioSectionRef.current) {
        gsap.fromTo(
          portfolioSectionRef.current,
          { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" },
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: portfolioSectionRef.current,
              start: "top 90%",
              end: "top 40%",
              scrub: 1,
            },
          }
        );
      }

      // Portfolio title
      if (portfolioTitleRef.current) {
        gsap.fromTo(
          portfolioTitleRef.current,
          { opacity: 0, y: 80, clipPath: "inset(100% 0 0 0)" },
          {
            opacity: 1,
            y: 0,
            clipPath: "inset(0% 0 0 0)",
            duration: 1.2,
            ease: "power4.out",
            scrollTrigger: {
              trigger: portfolioTitleRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Portfolio cards — staggered 3D with rotation
      portfolioCardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, y: 160, rotateX: 20, rotateZ: i % 2 === 0 ? -3 : 3, scale: 0.8 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            rotateZ: 0,
            scale: 1,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 95%",
              toggleActions: "play none none none",
            },
            delay: (i % 4) * 0.08,
          }
        );

        // Scroll-driven parallax on each card (different speeds create depth)
        gsap.to(card, {
          y: -(20 + (i % 3) * 15),
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });

      // ---- ABOUT: Split reveal ----
      if (aboutImageRef.current) {
        gsap.fromTo(
          aboutImageRef.current,
          { clipPath: "inset(100% 0 0 0)", scale: 1.2 },
          {
            clipPath: "inset(0% 0 0 0)",
            scale: 1,
            duration: 1.4,
            ease: "power4.inOut",
            scrollTrigger: {
              trigger: aboutSectionRef.current,
              start: "top 70%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      if (aboutTextRef.current) {
        const textChildren = aboutTextRef.current.children;
        gsap.fromTo(
          textChildren,
          { opacity: 0, y: 50, rotateX: 10 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: aboutSectionRef.current,
              start: "top 55%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // ---- SESSIONS: Horizontal scroll with scale ----
      if (sessionsTrackRef.current && sessionsSectionRef.current) {
        const track = sessionsTrackRef.current;
        const totalScrollWidth = track.scrollWidth - window.innerWidth;

        gsap.to(track, {
          x: -totalScrollWidth,
          ease: "none",
          scrollTrigger: {
            trigger: sessionsSectionRef.current,
            start: "top top",
            end: () => `+=${totalScrollWidth}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Images scale up as they enter center of viewport
        const sessionImages = track.querySelectorAll(".session-card");
        sessionImages.forEach((img) => {
          gsap.fromTo(
            img,
            { scale: 0.85, rotateY: -5 },
            {
              scale: 1,
              rotateY: 0,
              ease: "power2.out",
              scrollTrigger: {
                trigger: img,
                containerAnimation: gsap.getById?.("sessionsScroll") || undefined,
                start: "left center",
                end: "center center",
                scrub: 1,
              },
            }
          );
        });
      }

      // ---- SOCIAL: Staggered reveal ----
      if (socialSectionRef.current) {
        gsap.fromTo(
          socialSectionRef.current,
          { clipPath: "inset(0 0 100% 0)" },
          {
            clipPath: "inset(0 0 0% 0)",
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: socialSectionRef.current,
              start: "top 85%",
              end: "top 40%",
              scrub: 1,
            },
          }
        );
      }

      // ---- CTA: Dramatic zoom + rotation ----
      if (ctaTitleRef.current) {
        gsap.fromTo(
          ctaTitleRef.current,
          { scale: 0.3, opacity: 0, rotateX: 25, filter: "blur(10px)" },
          {
            scale: 1,
            opacity: 1,
            rotateX: 0,
            filter: "blur(0px)",
            ease: "power3.out",
            scrollTrigger: {
              trigger: ctaRef.current,
              start: "top 90%",
              end: "top 25%",
              scrub: 1,
            },
          }
        );
      }
    }, mainRef);

    return () => ctx.revert();
  }, []);

  // ---- MAGNETIC BUTTON EFFECT ----
  useEffect(() => {
    const buttons = document.querySelectorAll(".magnetic-btn");
    const handlers = new Map<Element, (e: MouseEvent) => void>();
    const leaveHandlers = new Map<Element, () => void>();

    buttons.forEach((btn) => {
      const onMove = (e: MouseEvent) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.35, y: y * 0.35, duration: 0.3, ease: "power2.out" });
      };
      const onLeave = () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      };
      (btn as HTMLElement).addEventListener("mousemove", onMove as EventListener);
      (btn as HTMLElement).addEventListener("mouseleave", onLeave);
      handlers.set(btn, onMove);
      leaveHandlers.set(btn, onLeave);
    });

    return () => {
      buttons.forEach((btn) => {
        const h = handlers.get(btn);
        const l = leaveHandlers.get(btn);
        if (h) (btn as HTMLElement).removeEventListener("mousemove", h as EventListener);
        if (l) (btn as HTMLElement).removeEventListener("mouseleave", l);
      });
    };
  }, []);

  // ---- SCROLL-VELOCITY IMAGE SKEW (global) ----
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let lastTime = Date.now();
    let rafId: number;

    const skewImages = () => {
      const now = Date.now();
      const dt = Math.max(now - lastTime, 1);
      const velocity = (window.scrollY - lastScrollY) / dt;
      const skewVal = gsap.utils.clamp(-4, 4, velocity * 8);

      document.querySelectorAll(".velocity-skew").forEach((el) => {
        gsap.to(el, {
          skewY: skewVal,
          duration: 0.4,
          ease: "power2.out",
          overwrite: true,
        });
      });

      lastScrollY = window.scrollY;
      lastTime = now;
      rafId = requestAnimationFrame(skewImages);
    };

    rafId = requestAnimationFrame(skewImages);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div ref={mainRef} className="w-full overflow-hidden bg-black">
      {/* ===== HERO ===== */}
      <section ref={heroRef} className="relative h-[100svh] min-h-[700px] overflow-hidden flex items-center justify-center">
        {/* Background */}
        <div ref={heroImageContainerRef} className="absolute inset-[-10%] w-[120%] h-[120%]">
          {heroImages.map((image, index) => (
            <Image
              key={image}
              src={image}
              alt={`Robeanny hero ${index + 1}`}
              fill
              priority={index === 0}
              className={`object-cover object-top transition-[opacity,transform] duration-[2000ms] ${
                index === activeSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
              sizes="120vw"
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black" />
        </div>

        {/* Animated vignette */}
        <div className="cinematic-vignette" />

        {/* Scan lines overlay */}
        <div className="absolute inset-0 z-[6] pointer-events-none opacity-[0.03]" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)",
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center pointer-events-none px-4 w-full" style={{ perspective: "1200px" }}>
          {/* Kicker */}
          <span className="inline-flex items-center gap-3 mb-4 text-[0.5rem] uppercase tracking-[0.6em] text-[#c79a59]/60">
            <span className="inline-block h-[1px] w-10 bg-[#c79a59]/30" />
            <TextScramble text={tHero("subtitle")} delay={1800} speed={35} />
            <span className="inline-block h-[1px] w-10 bg-[#c79a59]/30" />
          </span>

          {/* Giant Title with clip-path reveal */}
          <h1
            ref={heroTitleRef}
            className="brand-display text-[clamp(5rem,22vw,20rem)] leading-[0.78] tracking-[0.06em] text-[#e8dcc8] will-change-transform"
            style={{ clipPath: "inset(100% 0 0 0)", transformStyle: "preserve-3d" }}
          >
            ROBEANNY
          </h1>

          {/* Subtitle */}
          <p className="mt-5 max-w-md text-[0.78rem] leading-relaxed text-[#e8dcc8]/35 md:text-[0.88rem]">
            {tIntro("bio")}
          </p>

          {/* CTAs */}
          <div ref={heroCTARef} className="mt-8 flex flex-wrap justify-center gap-3 pointer-events-auto">
            <Link href={toLocalePath("/portfolio")} className="magnetic-btn luxury-button">
              {tHero("cta")} <span>→</span>
            </Link>
            <Link href={toLocalePath("/book")} className="magnetic-btn luxury-button-secondary">
              {tCta("book")}
            </Link>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`transition-all duration-700 ${
                index === activeSlide
                  ? "w-10 h-[2px] bg-[#c79a59]"
                  : "w-2 h-[2px] bg-[#e8dcc8]/15 hover:bg-[#e8dcc8]/30"
              }`}
            />
          ))}
        </div>

        {/* Scroll badge — vertical text */}
        <div className="absolute bottom-8 right-8 z-20 hidden md:flex flex-col items-center gap-3">
          <span className="text-[0.42rem] uppercase tracking-[0.4em] text-[#e8dcc8]/20 [writing-mode:vertical-lr]">
            Scroll to explore
          </span>
          <div className="h-14 w-[1px] bg-gradient-to-b from-[#c79a59]/30 to-transparent overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-5 bg-[#c79a59]/60 animate-[scrollPulse_2.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </section>

      {/* ===== MARQUEE TEXT BAND ===== */}
      <div
        ref={marqueeRef}
        className="relative overflow-hidden border-y border-[#e8dcc8]/6 py-6 md:py-8"
      >
        <div className="marquee-inner flex items-center whitespace-nowrap gap-16 will-change-transform">
          {[...Array(2)].map((_, repeat) => (
            <div key={repeat} className="flex items-center gap-16 shrink-0">
              {["Editorial", "Campaign", "Runway", "Fashion", "Content", "Booking", "Studio"].map(
                (word) => (
                  <span key={word + repeat} className="flex items-center gap-16">
                    <span className="brand-display text-[clamp(2rem,5vw,4rem)] text-[#e8dcc8]/[0.06] tracking-[0.1em]">
                      {word}
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#c79a59]/20 shrink-0" />
                  </span>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ===== PORTFOLIO TEASER with section clip-path reveal ===== */}
      <section ref={portfolioSectionRef} className="section-spacing relative">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(199,154,89,0.06), transparent 60%)", filter: "blur(120px)" }}
        />

        <div className="page-shell">
          <div ref={portfolioTitleRef} className="mb-16 md:mb-24">
            <p className="label-kicker mb-5">{tPortfolio("title")}</p>
            <h2 className="brand-display text-[clamp(3rem,8vw,7rem)] leading-[0.82] text-[#e8dcc8]">
              {tPortfolio("title")}{" "}
              <span className="text-[#e8dcc8]/15">{tPortfolio("titleAccent")}</span>
            </h2>
          </div>

          {/* 3D Perspective Grid with RGB split hover */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3"
            style={{ perspective: "1200px" }}
          >
            {featuredPortfolio.map((photo, index) => {
              const isLarge = index === 0 || index === 5;
              return (
                <Link
                  href={toLocalePath("/portfolio")}
                  key={photo.id}
                  ref={(el) => {
                    if (el) portfolioCardsRef.current[index] = el as unknown as HTMLDivElement;
                  }}
                  className={`group relative overflow-hidden bg-[#080808] velocity-skew rgb-split-hover ${
                    isLarge ? "col-span-2 row-span-2 aspect-[4/5]" : "aspect-[3/4]"
                  }`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                    sizes={isLarge ? "50vw" : "25vw"}
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[600ms]" />
                  {/* Index */}
                  <div className="absolute bottom-4 left-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="text-[0.48rem] uppercase tracking-[0.4em] text-[#e8dcc8]/60">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  {/* Corner accent */}
                  <div className="absolute top-0 left-0 w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-[#c79a59]/40" />
                    <div className="absolute top-0 left-0 h-full w-[1px] bg-[#c79a59]/40" />
                  </div>
                  {/* Bottom-right corner accent */}
                  <div className="absolute bottom-0 right-0 w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute bottom-0 right-0 w-full h-[1px] bg-[#c79a59]/40" />
                    <div className="absolute bottom-0 right-0 h-full w-[1px] bg-[#c79a59]/40" />
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-14 flex justify-center">
            <Link href={toLocalePath("/portfolio")} className="magnetic-btn luxury-button-secondary group">
              <span>{locale === "en" ? "View Full Portfolio" : "Ver Portfolio Completo"}</span>
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== ABOUT — CINEMATIC SPLIT ===== */}
      <section ref={aboutSectionRef} className="section-spacing relative overflow-hidden">
        <div className="page-shell grid gap-0 lg:grid-cols-2 lg:items-stretch">
          {/* Image with clip-path reveal */}
          <div
            ref={aboutImageRef}
            className="relative min-h-[500px] lg:min-h-[700px] overflow-hidden velocity-skew"
            style={{ clipPath: "inset(100% 0 0 0)" }}
          >
            <Image
              src={aboutImage}
              alt="Robeanny portrait"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40 hidden lg:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:hidden" />
          </div>

          {/* Text panel */}
          <div
            ref={aboutTextRef}
            className="flex flex-col justify-center gap-6 bg-[#060606] p-8 md:p-12 lg:p-16"
            style={{ perspective: "800px" }}
          >
            <p className="label-kicker">{locale === "en" ? "About" : "Acerca de"}</p>
            <h2 className="brand-display text-[clamp(2.2rem,5vw,4.5rem)] leading-[0.85] text-[#e8dcc8]">
              {personalData.name}
            </h2>
            <p className="text-[0.88rem] leading-[1.8] text-[#e8dcc8]/35 max-w-lg">
              {tIntro("bio")}
            </p>

            {/* Measurements — minimal grid */}
            <div className="grid grid-cols-3 gap-[1px] bg-[#e8dcc8]/6 mt-4">
              {measurements.slice(0, 6).map((item) => (
                <div key={item.label} className="bg-[#060606] p-4 group/cell hover:bg-[#0d0d0d] transition-colors duration-300">
                  <p className="text-[0.42rem] uppercase tracking-[0.35em] text-[#e8dcc8]/20 group-hover/cell:text-[#c79a59]/50 transition-colors">
                    {item.label}
                  </p>
                  <p className="mt-1 text-[0.85rem] text-[#e8dcc8]/60">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={toLocalePath("/book")} className="magnetic-btn luxury-button">
                {tCta("book")}
              </Link>
              <a href={`mailto:${personalData.email}`} className="magnetic-btn luxury-button-secondary">
                {personalData.email}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MARQUEE BAND 2 — reverse direction ===== */}
      <div className="overflow-hidden border-y border-[#e8dcc8]/6 py-5">
        <div className="flex items-center whitespace-nowrap gap-10 animate-[marqueeReverse_20s_linear_infinite]">
          {[...Array(3)].map((_, r) => (
            <div key={r} className="flex items-center gap-10 shrink-0">
              <span className="brand-display text-[clamp(1.2rem,3vw,2.4rem)] text-[#e8dcc8]/[0.04] tracking-[0.15em]">
                MEDELLÍN · COLOMBIA · EDITORIAL · PROFESSIONAL MODEL · BOOKING AVAILABLE
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== SESSIONS — HORIZONTAL SCROLL ===== */}
      <section
        ref={sessionsSectionRef}
        className="horizontal-scroll-section relative h-screen"
      >
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(199,154,89,0.06), transparent 60%)", filter: "blur(100px)" }}
        />

        <div className="absolute top-10 left-8 z-10 md:top-14 md:left-14">
          <p className="label-kicker mb-3">{tSessions("title")}</p>
          <h2 className="brand-display text-[clamp(2rem,5vw,4rem)] leading-[0.88] text-[#e8dcc8]">
            {tSessions("titleAccent")}
          </h2>
        </div>

        <div
          ref={sessionsTrackRef}
          className="horizontal-scroll-track items-center h-full pl-8 md:pl-56 pr-8"
        >
          {sessionsTeaser.map((image, index) => (
            <Link
              href={toLocalePath("/sessions")}
              key={image}
              className="session-card group relative flex-shrink-0 overflow-hidden velocity-skew"
              style={{
                width: index === 0 ? "55vw" : index % 2 === 0 ? "30vw" : "40vw",
                height: "72vh",
              }}
            >
              <Image
                src={image}
                alt={`Session ${index + 1}`}
                fill
                className="object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
                sizes="55vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-[600ms]" />

              {/* Hover reveal */}
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                <div className="h-[1px] w-10 bg-[#c79a59]/40 mb-3" />
                <span className="text-[0.48rem] uppercase tracking-[0.35em] text-[#e8dcc8]/50">
                  {locale === "en" ? "Session" : "Sesión"} {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Corner accents */}
              <div className="absolute top-3 left-3 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-[#c79a59]/30" />
                <div className="absolute top-0 left-0 h-full w-[1px] bg-[#c79a59]/30" />
              </div>
              <div className="absolute bottom-3 right-3 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute bottom-0 right-0 w-full h-[1px] bg-[#c79a59]/30" />
                <div className="absolute bottom-0 right-0 h-full w-[1px] bg-[#c79a59]/30" />
              </div>
            </Link>
          ))}

          {/* End CTA */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center h-[72vh] w-[35vw] gap-6">
            <span className="brand-display text-[clamp(1.5rem,3vw,2.5rem)] text-[#e8dcc8]/15 tracking-[0.1em]">
              {tSessions("title")}
            </span>
            <Link href={toLocalePath("/sessions")} className="magnetic-btn luxury-button">
              {tSessions("cta")} <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SOCIAL — clip-path reveal ===== */}
      <section ref={socialSectionRef} className="section-spacing relative border-t border-[#e8dcc8]/6">
        <div className="page-shell">
          <p className="label-kicker mb-5">{tSocial("label")}</p>
          <div className="mb-14 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <h2 className="brand-display text-[clamp(2.4rem,7vw,5.5rem)] leading-[0.85] text-[#e8dcc8]">
              {tSocial("title")}{" "}
              <span className="text-[#e8dcc8]/12">{tSocial("titleAccent")}</span>
            </h2>
            <Link href={toLocalePath("/contact")} className="magnetic-btn luxury-button-secondary w-fit">
              {tCta("contact")}
            </Link>
          </div>

          <div className="grid gap-3 md:gap-4 lg:grid-cols-2">
            <div className="luxury-panel h-[400px] overflow-hidden p-0 sm:h-[480px] md:h-[520px]">
              <iframe
                src="https://www.tiktok.com/embed/@robeannybbl"
                className="h-full w-full border-0"
                loading="lazy"
                title="TikTok de Robeanny"
                allow="encrypted-media"
              />
            </div>
            <div className="luxury-panel h-[480px] overflow-hidden p-0 sm:h-[500px] md:h-[520px]">
              <InstagramWidget />
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              { label: "Instagram", value: "@robeannybl", href: personalData.socials.instagram },
              { label: "TikTok", value: "@robeannybbl", href: personalData.socials.tiktok },
              { label: "LinkedIn", value: "/in/robeanny", href: personalData.socials.linkedin },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group luxury-panel p-5 transition-all duration-500 hover:border-[#c79a59]/25"
              >
                <p className="text-[0.48rem] uppercase tracking-[0.35em] text-[#e8dcc8]/20 group-hover:text-[#c79a59]/50 transition-colors">
                  {item.label}
                </p>
                <p className="mt-2 text-sm text-[#e8dcc8]/55 group-hover:text-[#e8dcc8]/80 transition-colors">{item.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA — DRAMATIC ZOOM with rotation + blur ===== */}
      <section ref={ctaRef} className="relative py-32 md:py-48 overflow-hidden border-t border-[#e8dcc8]/6">
        {/* Multiple ambient glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(199,154,89,0.07), transparent 50%)", filter: "blur(120px)" }}
        />
        <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(199,154,89,0.04), transparent 60%)", filter: "blur(80px)" }}
        />

        <div className="page-shell relative z-10 text-center" style={{ perspective: "800px" }}>
          <p className="label-kicker mb-6 justify-center">{personalData.profession}</p>
          <h2
            ref={ctaTitleRef}
            className="brand-display mx-auto max-w-6xl text-[clamp(3.5rem,12vw,10rem)] leading-[0.8] tracking-[0.04em] text-[#e8dcc8] will-change-transform"
          >
            {tCta("title1")} <br /> {tCta("title2")}
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-[0.85rem] leading-relaxed text-[#e8dcc8]/30 md:text-[0.95rem]">
            {tCta("subtitle")}
          </p>

          <div className="mt-14 flex flex-wrap justify-center gap-4">
            <Link href={toLocalePath("/book")} className="magnetic-btn luxury-button">
              {tCta("book")}
            </Link>
            <Link href={toLocalePath("/contact")} className="magnetic-btn luxury-button-secondary">
              {tCta("contact")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
