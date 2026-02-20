"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { aboutImage, portfolioTeaser, sessionsTeaser, personalData } from "@/lib/data";

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
const mobileHeroImages = ["/he.jpg", "/he2.jpg", "/he3.jpg", "/he4.jpg"];
const desktopHeroImages = ["/014A7144-2.jpg", "/014A7221-2.jpg", "/014A7227-2.jpg"];

function HeroSection() {
  const [y, setY] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [isMobile, setIsMobile] = useState(true);
  const bgRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("hero");

  useEffect(() => {
    const handleScroll = () => setY(window.scrollY);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleScroll();
    handleResize();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    return () => { window.removeEventListener("scroll", handleScroll); window.removeEventListener("resize", handleResize); };
  }, []);

  useEffect(() => { if (bgRef.current) bgRef.current.style.transform = `translateY(${y * 0.15}px) scale(1.05)`; }, [y]);

  const activeImages = isMobile ? mobileHeroImages : desktopHeroImages;
  useEffect(() => { setCurrentImage(0); }, [isMobile]);
  useEffect(() => {
    const interval = setInterval(() => setCurrentImage((prev) => (prev + 1) % activeImages.length), 4000);
    return () => clearInterval(interval);
  }, [activeImages.length]);

  return (
    <section className="relative w-full h-[100svh] overflow-hidden flex items-center justify-center bg-black">
      <div ref={bgRef} className="absolute inset-0 w-full h-full will-change-transform">
        {activeImages.map((src, index) => (
          <div key={src} className={`absolute inset-0 w-full h-full transition-opacity duration-[1500ms] ease-in-out ${index === currentImage ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
            <Image src={src} alt={`Robeanny Hero ${index + 1}`} fill priority={index === 0} className={`object-cover filter brightness-[0.55] ${isMobile ? "object-top" : "object-center"}`} sizes="100vw" />
          </div>
        ))}
      </div>
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <h1 className="font-serif text-[16vw] md:text-[10vw] lg:text-[8vw] text-white tracking-[0.1em] leading-[0.85] font-light mb-4 md:mb-6">ROBEANNY</h1>
        <p className="font-sans text-[9px] md:text-xs tracking-[0.4em] uppercase text-white/60 mb-8 md:mb-12">{t("subtitle")}</p>
        <Link href="/portfolio" className="group font-sans text-[9px] md:text-xs tracking-[0.3em] uppercase border border-white/30 px-6 py-3 md:px-8 md:py-4 hover:bg-white hover:text-black transition-all duration-500">
          {t("cta")} <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {activeImages.map((_, i) => (<button key={i} onClick={() => setCurrentImage(i)} className={`w-8 h-[2px] transition-all duration-500 ${i === currentImage ? "bg-white" : "bg-white/20"}`} aria-label={`Slide ${i + 1}`} />))}
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-pulse">
        <div className="w-px h-8 md:h-12 bg-gradient-to-b from-transparent to-white/40" />
        <span className="font-sans text-[7px] md:text-[8px] tracking-[0.3em] uppercase text-white/30">{t("scroll")}</span>
      </div>
    </section>
  );
}

// ========================================
// 2. PORTFOLIO TEASER
// ========================================
function PortfolioTeaser() {
  const t = useTranslations("portfolioTeaser");
  return (
    <section className="w-full py-24 md:py-40 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-24">
          <h2 className="font-serif text-4xl md:text-6xl font-light tracking-tight">{t("title")} <span className="italic">{t("titleAccent")}</span></h2>
          <Link href="/portfolio" className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/50 hover:text-white transition-colors mt-4 md:mt-0 group">
            {t("cta")} <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
        <div className="columns-2 md:columns-3 gap-3 md:gap-4">
          {portfolioTeaser.map((photo, i) => {
            const heights = ["h-[320px]", "h-[420px]", "h-[360px]", "h-[440px]", "h-[300px]", "h-[380px]", "h-[350px]", "h-[400px]"];
            return (
              <div key={photo.id} className="break-inside-avoid mb-3 md:mb-4 overflow-hidden group cursor-pointer">
                <div className={`relative w-full ${heights[i]} overflow-hidden`}>
                  <Image src={photo.src} alt={photo.alt} fill className="object-cover transition-transform duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" sizes="(max-width: 768px) 50vw, 33vw" />
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
// 3. INTRO
// ========================================
function IntroSection() {
  const t = useTranslations("intro");
  return (
    <section className="w-full py-24 md:py-40 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        <div className="w-full lg:w-5/12 h-[500px] md:h-[700px] relative overflow-hidden">
          <Image src={aboutImage} alt="Robeanny Bastardo" fill className="object-cover object-top" sizes="(max-width: 1024px) 100vw, 50vw" />
        </div>
        <div className="w-full lg:w-7/12 flex flex-col">
          <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-white/40 mb-6">{t("label")}</p>
          <h2 className="font-serif text-4xl md:text-6xl font-light mb-8 leading-[0.9]">{t("title1")} <br /><span className="italic text-white/50">{t("title2")}</span></h2>
          <p className="editorial-body text-lg md:text-xl text-white/70 max-w-lg mb-10 leading-relaxed">{t("bio")}</p>
          <Link href="/contact" className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/50 hover:text-white transition-colors group w-fit">
            {t("cta")} <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ========================================
// 4. SESSIONS PREVIEW
// ========================================
function SessionsPreview() {
  const t = useTranslations("sessions");
  return (
    <section className="w-full py-24 md:py-40 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
          <h2 className="font-serif text-4xl md:text-6xl font-light tracking-tight">{t("title")} <span className="italic">{t("titleAccent")}</span></h2>
          <Link href="/sessions" className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/50 hover:text-white transition-colors mt-4 md:mt-0 group">
            {t("cta")} <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {sessionsTeaser.map((url, i) => (
            <div key={i} className="relative h-[280px] md:h-[400px] overflow-hidden group cursor-pointer">
              <Image src={url} alt={`Robeanny Session ${i + 1}`} fill className="object-cover transition-transform duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" sizes="(max-width: 768px) 50vw, 33vw" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========================================
// 5. SOCIAL
// ========================================
function SocialSection() {
  const t = useTranslations("social");
  return (
    <section className="w-full py-24 md:py-40 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto">
        <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-white/40 mb-6">{t("label")}</p>
        <h2 className="font-serif text-4xl md:text-6xl font-light mb-12 md:mb-16">{t("title")} <span className="italic">{t("titleAccent")}</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="w-full h-[480px] md:h-[520px] overflow-hidden border border-white/10 rounded-sm relative">
            <iframe src="https://www.tiktok.com/embed/@robeannybbl" className="w-full h-full border-0" loading="lazy" title="TikTok de Robeanny" allow="encrypted-media" />
          </div>
          <div className="w-full h-[480px] md:h-[520px] overflow-hidden border border-white/10 rounded-sm relative">
            <iframe src="https://www.instagram.com/robeannybl/embed" className="w-full h-full border-0" loading="lazy" title="Instagram de Robeanny" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {[
            { label: "LinkedIn", handle: "@robeanny", href: personalData.socials.linkedin },
            { label: "Patreon", handle: "robeanny", href: personalData.socials.patreon },
            { label: "Email", handle: "me@robeanny.com", href: `mailto:${personalData.email}` },
          ].map((social) => (
            <a key={social.label} href={social.href} target={social.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" className="group border border-white/10 px-4 py-5 md:px-6 md:py-6 hover:border-white/30 hover:bg-white/[0.02] transition-all duration-500 text-center">
              <span className="font-serif text-base md:text-xl text-white group-hover:text-white/80 transition-colors block mb-1">{social.label}</span>
              <span className="font-sans text-[8px] md:text-[10px] tracking-widest text-white/25 block truncate">{social.handle}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========================================
// 6. CTA FINAL
// ========================================
function CTASection() {
  const t = useTranslations("cta");
  return (
    <section className="w-full py-32 md:py-48 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-[900px] mx-auto text-center flex flex-col items-center">
        <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light leading-[0.85] mb-8">{t("title1")}<br />{t("title2")}?</h2>
        <p className="editorial-body text-sm md:text-base text-white/50 max-w-md mb-12">{t("subtitle")}</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/book" className="font-sans text-[10px] tracking-[0.3em] uppercase border border-white bg-white text-black px-10 py-5 hover:bg-transparent hover:text-white transition-all duration-500">{t("book")}</Link>
          <Link href="/contact" className="font-sans text-[10px] tracking-[0.3em] uppercase border border-white/30 px-10 py-5 hover:bg-white hover:text-black transition-all duration-500">{t("contact")}</Link>
        </div>
      </div>
    </section>
  );
}
