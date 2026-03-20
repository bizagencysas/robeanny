"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";

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

  const normalizedPath = useMemo(() => {
    const clean = stripLocale(pathname || "/");
    return clean || "/";
  }, [pathname]);

  const toLocalePath = (href: string, targetLocale: string) => {
    if (targetLocale === "en") return href === "/" ? "/en" : `/en${href}`;
    return href;
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const switchLocale = (nextLocale: string) => {
    router.push(toLocalePath(normalizedPath, nextLocale));
  };

  const isActive = (href: string) => normalizedPath === href;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled || isOpen
            ? "border-b border-black/10 bg-[rgba(250,247,242,0.88)] backdrop-blur-xl"
            : "bg-[rgba(250,247,242,0.36)] backdrop-blur-[10px] xl:bg-transparent xl:backdrop-blur-0"
        }`}
      >
        <nav className="page-shell flex h-[68px] items-center justify-between xl:h-[74px]">
          <Link
            href={toLocalePath("/", locale)}
            className="brand-display text-[1.05rem] tracking-[0.22em] text-[#171513] transition-opacity hover:opacity-65 md:text-[1.3rem] md:tracking-[0.24em]"
          >
            ROBEANNY
          </Link>

          <div className="hidden items-center gap-8 xl:flex">
            {navKeys.map((link) => (
              <Link
                key={link.href}
                href={toLocalePath(link.href, locale)}
                className={`text-[0.64rem] uppercase tracking-[0.28em] transition-colors ${
                  isActive(link.href)
                    ? "text-[#171513]"
                    : "text-[#171513]/55 hover:text-[#171513]"
                }`}
              >
                {t(link.key)}
              </Link>
            ))}

            <div className="ml-3 flex items-center gap-2 border-l border-black/15 pl-5">
              <button
                onClick={() => switchLocale("es")}
                className={`text-[0.63rem] uppercase tracking-[0.24em] transition-colors ${
                  locale === "es"
                    ? "text-[#171513]"
                    : "text-[#171513]/45 hover:text-[#171513]"
                }`}
              >
                ES
              </button>
              <span className="text-[0.63rem] text-[#171513]/22">/</span>
              <button
                onClick={() => switchLocale("en")}
                className={`text-[0.63rem] uppercase tracking-[0.24em] transition-colors ${
                  locale === "en"
                    ? "text-[#171513]"
                    : "text-[#171513]/45 hover:text-[#171513]"
                }`}
              >
                EN
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="relative flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-black/14 bg-[rgba(255,249,241,0.76)] backdrop-blur xl:hidden"
          >
            <span
              className={`h-px w-6 bg-[#171513] transition-all duration-300 ${
                isOpen ? "translate-y-[3.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-6 bg-[#171513] transition-all duration-300 ${
                isOpen ? "-translate-y-[3.5px] -rotate-45" : ""
              }`}
            />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 dark-stage"
          >
            <div className="page-shell flex h-full flex-col justify-between pb-8 pt-24 md:pb-10 md:pt-28">
              <div className="grid gap-6">
                <div className="luxury-panel border-[#efe9de]/14 bg-[rgba(19,15,12,0.52)] p-5 text-[#efe9de]">
                  <p className="mb-3 text-[0.56rem] uppercase tracking-[0.3em] text-[#efe9de]/48">
                    {locale === "en" ? "Editorial Navigation" : "Navegacion Editorial"}
                  </p>
                  <p className="max-w-sm text-sm leading-relaxed text-[#efe9de]/66">
                    {locale === "en"
                      ? "Explore the portfolio, book a session, or move directly into Robeanny's visual world."
                      : "Explora el portfolio, reserva una sesion o entra directo al universo visual de Robeanny."}
                  </p>
                </div>

                <nav className="flex flex-col gap-2">
                {navKeys.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ delay: index * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={toLocalePath(link.href, locale)}
                      className={`group flex items-center justify-between border-b border-[#efe9de]/12 py-3 transition-colors ${
                        isActive(link.href)
                          ? "text-[#efe9de]"
                          : "text-[#efe9de]/58 hover:text-[#efe9de]"
                      }`}
                    >
                      <span className="brand-display block text-[clamp(1.8rem,9vw,4.3rem)] leading-[0.95] tracking-[0.05em]">
                        {t(link.key)}
                      </span>
                      <span className="text-[0.58rem] uppercase tracking-[0.28em] text-[#efe9de]/34 transition-colors group-hover:text-[#efe9de]/70">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </Link>
                  </motion.div>
                ))}
                </nav>
              </div>

              <div className="grid gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => switchLocale("es")}
                    className={`rounded-full border px-4 py-2 text-[0.62rem] uppercase tracking-[0.24em] transition-colors ${
                      locale === "es"
                        ? "border-[#efe9de] text-[#efe9de]"
                        : "border-[#efe9de]/30 text-[#efe9de]/50"
                    }`}
                  >
                    Espanol
                  </button>
                  <button
                    onClick={() => switchLocale("en")}
                    className={`rounded-full border px-4 py-2 text-[0.62rem] uppercase tracking-[0.24em] transition-colors ${
                      locale === "en"
                        ? "border-[#efe9de] text-[#efe9de]"
                        : "border-[#efe9de]/30 text-[#efe9de]/50"
                    }`}
                  >
                    English
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[0.6rem] uppercase tracking-[0.28em] text-[#efe9de]/45">
                  <a
                    href="https://www.instagram.com/robeannybl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#efe9de]"
                  >
                    Instagram
                  </a>
                  <span className="text-[#efe9de]/30">•</span>
                  <a
                    href="https://www.tiktok.com/@robeannybbl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#efe9de]"
                  >
                    TikTok
                  </a>
                  <span className="text-[#efe9de]/30">•</span>
                  <a
                    href="mailto:me@robeanny.com"
                    className="hover:text-[#efe9de]"
                  >
                    Email
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
