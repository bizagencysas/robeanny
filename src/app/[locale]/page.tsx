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
  sessionPhotos,
  sessionsTeaser,
} from "@/lib/data";
import InstagramWidget from "@/components/ui/InstagramWidget";

gsap.registerPlugin(ScrollTrigger);

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
  const heroTextRef = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const heroScrollRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const portfolioCardsRef = useRef<HTMLDivElement[]>([]);
  const sessionsTrackRef = useRef<HTMLDivElement>(null);
  const sessionsSectionRef = useRef<HTMLDivElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaTitleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const toLocalePath = useMemo(
    () =>
      (href: string) => {
        if (locale === "en") return href === "/" ? "/en" : `/en${href}`;
        return href;
      },
    [locale]
  );

  // GSAP Scroll Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Parallax
      if (heroTextRef.current) {
        gsap.to(heroTextRef.current, {
          y: -120,
          opacity: 0.3,
          ease: "none",
          scrollTrigger: {
            trigger: heroTextRef.current,
            start: "top center",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      }

      if (heroImageRef.current) {
        gsap.to(heroImageRef.current, {
          y: 80,
          scale: 1.08,
          ease: "none",
          scrollTrigger: {
            trigger: heroImageRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      }

      // Hero scroll indicator
      if (heroScrollRef.current) {
        gsap.to(heroScrollRef.current, {
          opacity: 0,
          y: -20,
          scrollTrigger: {
            trigger: heroScrollRef.current,
            start: "top center",
            end: "+=200",
            scrub: true,
          },
        });
      }

      // Portfolio Cards 3D Reveal
      if (portfolioCardsRef.current.length > 0) {
        portfolioCardsRef.current.forEach((card, i) => {
          if (!card) return;
          gsap.fromTo(
            card,
            {
              opacity: 0,
              y: 100,
              rotateX: 12,
              scale: 0.92,
            },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              scale: 1,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 88%",
                end: "top 50%",
                toggleActions: "play none none reverse",
              },
              delay: i * 0.05,
            }
          );
        });
      }

      // Sessions Horizontal Scroll
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
      }

      // Social Section Reveal
      if (socialRef.current) {
        gsap.fromTo(
          socialRef.current,
          { opacity: 0, y: 80 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: socialRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // CTA Zoom Reveal
      if (ctaTitleRef.current) {
        gsap.fromTo(
          ctaTitleRef.current,
          { scale: 0.6, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ctaRef.current,
              start: "top 80%",
              end: "top 30%",
              scrub: 1,
            },
          }
        );
      }
    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="w-full overflow-hidden bg-black">
      {/* ===== HERO ===== */}
      <section className="relative h-[100svh] min-h-[700px] overflow-hidden flex items-center justify-center">
        {/* Background Image Slideshow */}
        <div ref={heroImageRef} className="absolute inset-0 w-full h-full">
          {heroImages.map((image, index) => (
            <Image
              key={image}
              src={image}
              alt={`Robeanny hero ${index + 1}`}
              fill
              priority={index === 0}
              className={`object-cover object-top transition-[opacity,transform] duration-[2000ms] ${
                index === activeSlide
                  ? "scale-100 opacity-100"
                  : "scale-[1.06] opacity-0"
              }`}
              sizes="100vw"
            />
          ))}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80" />
        </div>

        {/* Cinematic Vignette */}
        <div className="cinematic-vignette" />

        {/* Giant Title */}
        <div className="relative z-10 flex flex-col items-center text-center pointer-events-none px-4">
          <div ref={heroSubRef} className="mb-6">
            <span className="inline-flex items-center gap-3 text-[0.54rem] uppercase tracking-[0.5em] text-[#e8dcc8]/45">
              <span className="inline-block h-[1px] w-8 bg-[#c79a59]/40" />
              {tHero("subtitle")}
              <span className="inline-block h-[1px] w-8 bg-[#c79a59]/40" />
            </span>
          </div>

          <h1
            ref={heroTextRef}
            className="brand-display text-[clamp(4rem,18vw,16rem)] leading-[0.82] tracking-[0.08em] text-[#e8dcc8] will-change-transform"
            style={{ mixBlendMode: "difference" }}
          >
            ROBEANNY
          </h1>

          <p className="mt-6 max-w-md text-[0.82rem] leading-relaxed text-[#e8dcc8]/45 md:text-[0.92rem]">
            {tIntro("bio")}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3 pointer-events-auto">
            <Link href={toLocalePath("/portfolio")} className="luxury-button">
              {tHero("cta")}
              <span>→</span>
            </Link>
            <Link href={toLocalePath("/book")} className="luxury-button-secondary">
              {tCta("book")}
            </Link>
          </div>
        </div>

        {/* Slide Counter */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`h-[2px] transition-all duration-700 ${
                index === activeSlide
                  ? "w-8 bg-[#c79a59]"
                  : "w-3 bg-[#e8dcc8]/20 hover:bg-[#e8dcc8]/40"
              }`}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <div
          ref={heroScrollRef}
          className="absolute bottom-8 right-8 z-20 hidden md:flex flex-col items-center gap-2"
        >
          <span className="text-[0.48rem] uppercase tracking-[0.35em] text-[#e8dcc8]/30 [writing-mode:vertical-lr]">
            Scroll
          </span>
          <div className="h-12 w-[1px] bg-gradient-to-b from-[#c79a59]/40 to-transparent overflow-hidden">
            <div className="h-4 w-full bg-[#c79a59] animate-[scrollDown_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </section>

      {/* ===== PORTFOLIO TEASER ===== */}
      <section className="section-spacing relative">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(199,154,89,0.06), transparent 70%)", filter: "blur(100px)" }}
        />

        <div className="page-shell">
          <div ref={portfolioRef} className="mb-14 md:mb-20 max-w-2xl">
            <p className="label-kicker mb-5">{tPortfolio("title")}</p>
            <h2 className="brand-display text-[clamp(2.4rem,6vw,5rem)] leading-[0.88] text-[#e8dcc8]">
              {tPortfolio("title")}{" "}
              <span className="text-[#e8dcc8]/25">{tPortfolio("titleAccent")}</span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-[#e8dcc8]/40 max-w-lg">
              {tPortfolio("cta")}
            </p>
          </div>

          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
            style={{ perspective: "1200px" }}
          >
            {featuredPortfolio.map((photo, index) => (
              <Link
                href={toLocalePath("/portfolio")}
                key={photo.id}
                ref={(el) => {
                  if (el) portfolioCardsRef.current[index] = el as unknown as HTMLDivElement;
                }}
                className="tilt-card group relative overflow-hidden aspect-[3/4] bg-[#0a0a0a]"
                style={{ transformStyle: "preserve-3d" }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-3 group-hover:translate-y-0">
                  <span className="text-[0.5rem] uppercase tracking-[0.3em] text-[#e8dcc8]/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link href={toLocalePath("/portfolio")} className="luxury-button-secondary">
              {locale === "en" ? "View Full Portfolio" : "Ver Portfolio Completo"}
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SESSIONS — HORIZONTAL SCROLL ===== */}
      <section
        ref={sessionsSectionRef}
        className="horizontal-scroll-section relative h-screen"
      >
        {/* Ambient glow */}
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(199,154,89,0.08), transparent 70%)", filter: "blur(80px)" }}
        />

        <div className="absolute top-8 left-8 z-10 md:top-12 md:left-12">
          <p className="label-kicker mb-3">{tSessions("title")}</p>
          <h2 className="brand-display text-[clamp(1.8rem,4vw,3.5rem)] leading-[0.9] text-[#e8dcc8]">
            {tSessions("titleAccent")}
          </h2>
        </div>

        <div
          ref={sessionsTrackRef}
          className="horizontal-scroll-track items-center h-full pl-8 md:pl-48 pr-8"
        >
          {sessionsTeaser.map((image, index) => (
            <Link
              href={toLocalePath("/sessions")}
              key={image}
              className="group relative flex-shrink-0 overflow-hidden"
              style={{
                width: index === 0 ? "55vw" : "35vw",
                height: "70vh",
              }}
            >
              <Image
                src={image}
                alt={`Session ${index + 1}`}
                fill
                className="object-cover transition-transform duration-[1400ms] group-hover:scale-105"
                sizes="55vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
              <div className="absolute bottom-6 left-6">
                <span className="text-[0.5rem] uppercase tracking-[0.3em] text-[#e8dcc8]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {locale === "en" ? "View Session" : "Ver Sesión"} {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            </Link>
          ))}

          {/* End Card */}
          <div className="flex-shrink-0 flex items-center justify-center h-[70vh] w-[30vw]">
            <Link href={toLocalePath("/sessions")} className="luxury-button">
              {tSessions("cta")}
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== ABOUT SPLIT ===== */}
      <section className="section-spacing relative">
        <div className="page-shell grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="edge-fade relative aspect-[3/4] max-h-[600px] overflow-hidden">
            <Image
              src={aboutImage}
              alt="Robeanny portrait"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          <div className="flex flex-col gap-6 lg:pl-8">
            <p className="label-kicker">{locale === "en" ? "About" : "Acerca de"}</p>
            <h2 className="brand-display text-[clamp(2rem,5vw,4rem)] leading-[0.9] text-[#e8dcc8]">
              {personalData.name}
            </h2>
            <p className="text-sm leading-relaxed text-[#e8dcc8]/45 max-w-lg">
              {tIntro("bio")}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-2">
              {measurements.slice(0, 6).map((item) => (
                <div
                  key={item.label}
                  className="luxury-panel p-3.5"
                >
                  <p className="text-[0.46rem] uppercase tracking-[0.3em] text-[#e8dcc8]/30">
                    {item.label}
                  </p>
                  <p className="mt-1.5 text-sm text-[#e8dcc8]/75">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={toLocalePath("/book")} className="luxury-button">
                {tCta("book")}
              </Link>
              <a
                href={`mailto:${personalData.email}`}
                className="luxury-button-secondary"
              >
                {personalData.email}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SOCIAL ===== */}
      <section className="section-spacing relative border-t border-[#e8dcc8]/6">
        <div ref={socialRef} className="page-shell">
          <p className="label-kicker mb-5">{tSocial("label")}</p>
          <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <h2 className="brand-display text-[clamp(2.2rem,6vw,5rem)] leading-[0.88] text-[#e8dcc8]">
              {tSocial("title")}{" "}
              <span className="text-[#e8dcc8]/20">{tSocial("titleAccent")}</span>
            </h2>
            <Link href={toLocalePath("/contact")} className="luxury-button-secondary w-fit">
              {tCta("contact")}
            </Link>
          </div>

          <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
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

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
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
                className="luxury-panel p-5 transition-all duration-500 hover:border-[#c79a59]/30"
              >
                <p className="text-[0.52rem] uppercase tracking-[0.3em] text-[#e8dcc8]/30">
                  {item.label}
                </p>
                <p className="mt-2 text-sm text-[#e8dcc8]/70">{item.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section ref={ctaRef} className="section-spacing relative border-t border-[#e8dcc8]/6 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(199,154,89,0.08), transparent 60%)", filter: "blur(100px)" }}
        />

        <div className="page-shell relative z-10 text-center">
          <p className="label-kicker mb-6 justify-center">{personalData.profession}</p>
          <h2
            ref={ctaTitleRef}
            className="brand-display mx-auto max-w-5xl text-[clamp(2.8rem,9vw,7rem)] leading-[0.85] tracking-[0.06em] text-[#e8dcc8] will-change-transform"
          >
            {tCta("title1")} <br /> {tCta("title2")}
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-[#e8dcc8]/40 md:text-base">
            {tCta("subtitle")}
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link href={toLocalePath("/book")} className="luxury-button">
              {tCta("book")}
            </Link>
            <Link href={toLocalePath("/contact")} className="luxury-button-secondary">
              {tCta("contact")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
