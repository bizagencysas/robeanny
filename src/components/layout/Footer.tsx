"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

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

  const withLocale = (href: string) => {
    if (locale === "en") return href === "/" ? "/en" : `/en${href}`;
    return href;
  };

  return (
    <footer className="dark-stage border-t border-[#efe9de]/10">
      <div className="page-shell py-14 md:py-24">
        <div className="mb-10 grid gap-6 md:mb-14 md:gap-14 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div className="luxury-panel border-[#efe9de]/8 bg-[rgba(17,14,11,0.56)] p-5 md:border-0 md:bg-transparent md:p-0">
            <p className="label-kicker mb-4 md:mb-6">Editorial Signature</p>
            <h2 className="brand-display text-[clamp(2.2rem,6.8vw,5.5rem)] leading-[0.88] tracking-[0.09em] text-[#efe9de]">
              ROBEANNY
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#efe9de]/58">
              Fashion editorials, campaign direction, and booking experiences crafted with precision and a modern high-fashion perspective.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:gap-6">
            <div className="luxury-panel border-[#efe9de]/8 bg-[rgba(17,14,11,0.56)] p-4 md:border-0 md:bg-transparent md:p-0">
              <p className="mb-4 text-[0.62rem] uppercase tracking-[0.3em] text-[#efe9de]/45">Navigation</p>
              <nav className="flex flex-col gap-2.5">
                {footerNavKeys.map((link) => (
                  <Link
                    key={link.href}
                    href={withLocale(link.href)}
                    className="text-sm text-[#efe9de]/62 transition-colors hover:text-[#efe9de]"
                  >
                    {tNav(link.key)}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="luxury-panel border-[#efe9de]/8 bg-[rgba(17,14,11,0.56)] p-4 md:border-0 md:bg-transparent md:p-0">
              <p className="mb-4 text-[0.62rem] uppercase tracking-[0.3em] text-[#efe9de]/45">Social</p>
              <div className="flex flex-col gap-2.5">
                {socialLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#efe9de]/62 transition-colors hover:text-[#efe9de]"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-[#efe9de]/12" />

        <div className="mt-8 flex flex-col gap-4 text-[0.62rem] uppercase tracking-[0.24em] text-[#efe9de]/45 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
            <a
              href="https://love.robeanny.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[#efe9de]"
            >
              {tFooter("support")}
            </a>
            <a
              href="mailto:me@robeanny.com"
              className="transition-colors hover:text-[#efe9de]"
            >
              me@robeanny.com
            </a>
          </div>
          <p>{tFooter("rights")}</p>
        </div>
      </div>
    </footer>
  );
}
