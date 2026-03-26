"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import gsap from "gsap";

const navKeys = [
  { href: "/", key: "home" },
  { href: "/portfolio", key: "portfolio" },
  { href: "/book", key: "book" },
  { href: "/sessions", key: "sessions" },
  { href: "/journal", key: "journal" },
  { href: "/contact", key: "contact" },
] as const;

const stripLocale = (path: string) => {
  if (path === "/en") return "/";
  return path.startsWith("/en/") ? path.slice(3) : path;
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("nav");
  const menuLinksRef = useRef<HTMLAnchorElement[]>([]);

  const normalizedPath = useMemo(() => {
    const clean = stripLocale(pathname || "/");
    return clean || "/";
  }, [pathname]);

  const toLocalePath = (href: string, targetLocale: string) => {
    if (targetLocale === "en") return href === "/" ? "/en" : `/en${href}`;
    return href;
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Animate menu links when menu opens
  useEffect(() => {
    if (isOpen && menuLinksRef.current.length > 0) {
      gsap.fromTo(
        menuLinksRef.current,
        { y: 80, opacity: 0, rotateX: 25 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.7,
          stagger: 0.06,
          ease: "power3.out",
          delay: 0.15,
        }
      );
    }
  }, [isOpen]);

  const switchLocale = (nextLocale: string) => {
    router.push(toLocalePath(normalizedPath, nextLocale));
  };

  const isActive = (href: string) => normalizedPath === href;

  return (
    <>
      {/* Fixed Header */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ${
          scrolled
            ? "border-b border-[#e8dcc8]/6 bg-[rgba(0,0,0,0.75)] backdrop-blur-2xl"
            : "bg-transparent"
        }`}
      >
        <nav className="page-shell flex h-[72px] items-center justify-between xl:h-[80px]">
          <Link
            href={toLocalePath("/", locale)}
            className="brand-display text-[1.1rem] tracking-[0.24em] text-[#e8dcc8] transition-opacity hover:opacity-60 md:text-[1.35rem] md:tracking-[0.28em]"
          >
            ROBEANNY
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-9 xl:flex">
            {navKeys.map((link) => (
              <Link
                key={link.href}
                href={toLocalePath(link.href, locale)}
                className={`relative text-[0.6rem] uppercase tracking-[0.3em] transition-all duration-300 ${
                  isActive(link.href)
                    ? "text-[#e8dcc8]"
                    : "text-[#e8dcc8]/40 hover:text-[#e8dcc8]"
                }`}
              >
                {t(link.key)}
                {isActive(link.href) && (
                  <span className="absolute -bottom-1.5 left-0 right-0 h-[1px] bg-[#c79a59]" />
                )}
              </Link>
            ))}

            <div className="ml-4 flex items-center gap-3 border-l border-[#e8dcc8]/10 pl-6">
              <button
                onClick={() => switchLocale("es")}
                className={`text-[0.58rem] uppercase tracking-[0.24em] transition-colors ${
                  locale === "es"
                    ? "text-[#e8dcc8]"
                    : "text-[#e8dcc8]/30 hover:text-[#e8dcc8]"
                }`}
              >
                ES
              </button>
              <span className="text-[0.58rem] text-[#e8dcc8]/15">|</span>
              <button
                onClick={() => switchLocale("en")}
                className={`text-[0.58rem] uppercase tracking-[0.24em] transition-colors ${
                  locale === "en"
                    ? "text-[#e8dcc8]"
                    : "text-[#e8dcc8]/30 hover:text-[#e8dcc8]"
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="relative flex h-12 w-12 flex-col items-center justify-center gap-[6px] xl:hidden"
          >
            <span
              className={`h-[1px] w-6 bg-[#e8dcc8] transition-all duration-500 ${
                isOpen ? "translate-y-[3.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-[1px] w-6 bg-[#e8dcc8] transition-all duration-500 ${
                isOpen ? "-translate-y-[3.5px] -rotate-45" : ""
              }`}
            />
          </button>
        </nav>
      </header>

      {/* Fullscreen Overlay Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 flex flex-col"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.97) 0%, rgba(6,4,2,0.98) 100%)",
            }}
          >
            <div
              className="page-shell flex h-full flex-col justify-center"
              style={{ perspective: "600px" }}
            >
              <nav className="flex flex-col gap-1">
                {navKeys.map((link, index) => (
                  <div key={link.href} className="overflow-hidden">
                    <Link
                      ref={(el) => {
                        if (el) menuLinksRef.current[index] = el;
                      }}
                      href={toLocalePath(link.href, locale)}
                      onClick={() => setIsOpen(false)}
                      className={`group flex items-center justify-between border-b border-[#e8dcc8]/6 py-4 transition-colors ${
                        isActive(link.href)
                          ? "text-[#e8dcc8]"
                          : "text-[#e8dcc8]/40 hover:text-[#e8dcc8]"
                      }`}
                      style={{ opacity: 0 }}
                    >
                      <span className="brand-display block text-[clamp(2.2rem,10vw,5rem)] leading-[0.92] tracking-[0.06em]">
                        {t(link.key)}
                      </span>
                      <span className="text-[0.5rem] uppercase tracking-[0.3em] text-[#c79a59]/40 transition-colors group-hover:text-[#c79a59]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </Link>
                  </div>
                ))}
              </nav>

              <div className="mt-12 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => switchLocale("es")}
                  className={`rounded-full border px-5 py-2.5 text-[0.54rem] uppercase tracking-[0.26em] transition-all ${
                    locale === "es"
                      ? "border-[#c79a59]/50 text-[#e8dcc8]"
                      : "border-[#e8dcc8]/10 text-[#e8dcc8]/30"
                  }`}
                >
                  Español
                </button>
                <button
                  onClick={() => switchLocale("en")}
                  className={`rounded-full border px-5 py-2.5 text-[0.54rem] uppercase tracking-[0.26em] transition-all ${
                    locale === "en"
                      ? "border-[#c79a59]/50 text-[#e8dcc8]"
                      : "border-[#e8dcc8]/10 text-[#e8dcc8]/30"
                  }`}
                >
                  English
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-5 text-[0.52rem] uppercase tracking-[0.28em] text-[#e8dcc8]/25">
                <a
                  href="https://www.instagram.com/robeannybl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#c79a59]"
                >
                  Instagram
                </a>
                <span className="text-[#e8dcc8]/10">·</span>
                <a
                  href="https://www.tiktok.com/@robeannybbl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#c79a59]"
                >
                  TikTok
                </a>
                <span className="text-[#e8dcc8]/10">·</span>
                <a
                  href="mailto:me@robeanny.com"
                  className="transition-colors hover:text-[#c79a59]"
                >
                  Email
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
