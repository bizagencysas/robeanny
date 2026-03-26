"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const footerNavKeys = [
  { href: "/", key: "home" },
  { href: "/portfolio", key: "portfolio" },
  { href: "/book", key: "book" },
  { href: "/sessions", key: "sessions" },
  { href: "/journal", key: "journal" },
  { href: "/contact", key: "contact" },
] as const;

const socialLinks = [
  { href: "https://www.instagram.com/robeannybl", label: "Instagram" },
  { href: "https://www.tiktok.com/@robeannybbl", label: "TikTok" },
  { href: "https://www.linkedin.com/in/robeanny/", label: "LinkedIn" },
  { href: "https://www.patreon.com/robeanny", label: "Patreon" },
];

export default function Footer() {
  const locale = useLocale();
  const tNav = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const footerRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLHeadingElement>(null);

  const withLocale = (href: string) => {
    if (locale === "en") return href === "/" ? "/en" : `/en${href}`;
    return href;
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Brand reveal
      if (brandRef.current) {
        gsap.fromTo(
          brandRef.current,
          { y: 80, opacity: 0, clipPath: "inset(100% 0 0 0)" },
          {
            y: 0,
            opacity: 1,
            clipPath: "inset(0% 0 0 0)",
            duration: 1.2,
            ease: "power4.out",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="relative border-t border-[#e8dcc8]/6 bg-black">
      <div className="page-shell py-20 md:py-32">
        {/* Top: Large Brand + Navigation */}
        <div className="mb-14 grid gap-12 md:mb-24 md:gap-20 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <p className="label-kicker mb-6">Editorial Signature</p>
            <h2
              ref={brandRef}
              className="brand-display text-[clamp(3.5rem,10vw,8rem)] leading-[0.8] tracking-[0.06em] text-[#e8dcc8]"
            >
              ROBEANNY
            </h2>
            <p className="mt-6 max-w-xl text-[0.82rem] leading-relaxed text-[#e8dcc8]/25">
              Fashion editorials, campaign direction, and booking experiences
              crafted with precision and a modern high-fashion perspective.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:gap-10">
            <div>
              <p className="mb-5 text-[0.48rem] uppercase tracking-[0.35em] text-[#e8dcc8]/20">
                Navigation
              </p>
              <nav className="flex flex-col gap-3">
                {footerNavKeys.map((link) => (
                  <Link
                    key={link.href}
                    href={withLocale(link.href)}
                    className="text-[0.82rem] text-[#e8dcc8]/35 transition-colors duration-300 hover:text-[#c79a59]"
                  >
                    {tNav(link.key)}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <p className="mb-5 text-[0.48rem] uppercase tracking-[0.35em] text-[#e8dcc8]/20">
                Social
              </p>
              <div className="flex flex-col gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.82rem] text-[#e8dcc8]/35 transition-colors duration-300 hover:text-[#c79a59]"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gradient Divider */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#c79a59]/15 to-transparent" />

        {/* Bottom Row */}
        <div className="mt-8 flex flex-col gap-4 text-[0.48rem] uppercase tracking-[0.28em] text-[#e8dcc8]/18 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-8">
            <a href="https://love.robeanny.com/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#c79a59]">
              {tFooter("support")}
            </a>
            <a href="mailto:me@robeanny.com" className="transition-colors hover:text-[#c79a59]">
              me@robeanny.com
            </a>
          </div>
          <p>{tFooter("rights")}</p>
        </div>
      </div>
    </footer>
  );
}
