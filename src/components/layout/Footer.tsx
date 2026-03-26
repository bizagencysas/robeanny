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
    <footer className="relative border-t border-[#e8dcc8]/6 bg-black">
      <div className="page-shell py-16 md:py-28">
        {/* Top: Large Brand + Navigation */}
        <div className="mb-12 grid gap-10 md:mb-20 md:gap-16 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <p className="label-kicker mb-5">Editorial Signature</p>
            <h2 className="brand-display text-[clamp(2.8rem,8vw,6.5rem)] leading-[0.84] tracking-[0.1em] text-[#e8dcc8]">
              ROBEANNY
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-[#e8dcc8]/35">
              Fashion editorials, campaign direction, and booking experiences
              crafted with precision and a modern high-fashion perspective.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:gap-8">
            <div>
              <p className="mb-4 text-[0.56rem] uppercase tracking-[0.32em] text-[#e8dcc8]/25">
                Navigation
              </p>
              <nav className="flex flex-col gap-2.5">
                {footerNavKeys.map((link) => (
                  <Link
                    key={link.href}
                    href={withLocale(link.href)}
                    className="text-sm text-[#e8dcc8]/45 transition-colors duration-300 hover:text-[#c79a59]"
                  >
                    {tNav(link.key)}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <p className="mb-4 text-[0.56rem] uppercase tracking-[0.32em] text-[#e8dcc8]/25">
                Social
              </p>
              <div className="flex flex-col gap-2.5">
                {socialLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#e8dcc8]/45 transition-colors duration-300 hover:text-[#c79a59]"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#e8dcc8]/10 to-transparent" />

        {/* Bottom Row */}
        <div className="mt-8 flex flex-col gap-4 text-[0.56rem] uppercase tracking-[0.24em] text-[#e8dcc8]/25 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-8">
            <a
              href="https://love.robeanny.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[#c79a59]"
            >
              {tFooter("support")}
            </a>
            <a
              href="mailto:me@robeanny.com"
              className="transition-colors hover:text-[#c79a59]"
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
