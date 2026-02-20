"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";

const navKeys = [
    { href: "/", key: "home" },
    { href: "/portfolio", key: "portfolio" },
    { href: "/book", key: "book" },
    { href: "/sessions", key: "sessions" },
    { href: "/journal", key: "journal" },
    { href: "/contact", key: "contact" },
] as const;

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("nav");

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 80);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => { setIsOpen(false); }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const switchLocale = (newLocale: string) => {
        // Strip current locale prefix from pathname, then prepend new locale
        const pathWithoutLocale = pathname.replace(/^\/(es|en)/, "") || "/";
        const newPath = newLocale === "es" ? pathWithoutLocale : `/en${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;
        router.push(newPath);
    };

    const isActive = (href: string) => {
        const cleanPath = pathname.replace(/^\/(es|en)/, "") || "/";
        return cleanPath === href;
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-black/80 backdrop-blur-md border-b border-white/5" : "bg-transparent"
                    }`}
            >
                <nav className="max-w-[1800px] mx-auto px-6 md:px-12 h-16 md:h-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="font-serif text-xl md:text-2xl tracking-[0.2em] text-white hover:opacity-70 transition-opacity z-50">
                        ROBEANNY
                    </Link>

                    {/* Desktop Nav + Lang Toggle */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navKeys.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`font-sans text-[11px] tracking-[0.2em] uppercase transition-opacity duration-300 ${isActive(link.href) ? "text-white opacity-100" : "text-white/50 hover:text-white hover:opacity-100"
                                    }`}
                            >
                                {t(link.key)}
                            </Link>
                        ))}

                        {/* Language Toggle */}
                        <div className="flex items-center gap-1 ml-4 border-l border-white/10 pl-6">
                            <button
                                onClick={() => switchLocale("es")}
                                className={`font-sans text-[10px] tracking-widest uppercase px-2 py-1 transition-colors ${locale === "es" ? "text-white" : "text-white/30 hover:text-white/60"
                                    }`}
                            >
                                ES
                            </button>
                            <span className="text-white/15 text-[10px]">/</span>
                            <button
                                onClick={() => switchLocale("en")}
                                className={`font-sans text-[10px] tracking-widest uppercase px-2 py-1 transition-colors ${locale === "en" ? "text-white" : "text-white/30 hover:text-white/60"
                                    }`}
                            >
                                EN
                            </button>
                        </div>
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden relative z-50 w-8 h-8 flex flex-col items-center justify-center gap-[6px]"
                        aria-label={isOpen ? "Close menu" : "Open menu"}
                    >
                        <span className={`block w-6 h-[1px] bg-white transition-all duration-300 ${isOpen ? "rotate-45 translate-y-[3.5px]" : ""}`} />
                        <span className={`block w-6 h-[1px] bg-white transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-[3.5px]" : ""}`} />
                    </button>
                </nav>
            </header>

            {/* Mobile Fullscreen Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center"
                    >
                        <nav className="flex flex-col items-center gap-8">
                            {navKeys.map((link, i) => (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    <Link
                                        href={link.href}
                                        className={`font-serif text-4xl md:text-5xl tracking-[0.1em] uppercase transition-opacity ${isActive(link.href) ? "text-white" : "text-white/40 hover:text-white"
                                            }`}
                                    >
                                        {t(link.key)}
                                    </Link>
                                </motion.div>
                            ))}
                        </nav>

                        {/* Language Toggle — Mobile */}
                        <div className="absolute bottom-20 flex items-center gap-4">
                            <button
                                onClick={() => switchLocale("es")}
                                className={`font-sans text-sm tracking-widest uppercase px-4 py-2 border transition-all ${locale === "es" ? "border-white text-white" : "border-white/20 text-white/30"
                                    }`}
                            >
                                Español
                            </button>
                            <button
                                onClick={() => switchLocale("en")}
                                className={`font-sans text-sm tracking-widest uppercase px-4 py-2 border transition-all ${locale === "en" ? "border-white text-white" : "border-white/20 text-white/30"
                                    }`}
                            >
                                English
                            </button>
                        </div>

                        <div className="absolute bottom-8 flex items-center gap-6 text-white/30 text-[10px] tracking-[0.3em] uppercase font-sans">
                            <a href="https://www.instagram.com/robeannybl" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
                            <span>·</span>
                            <a href="https://www.tiktok.com/@robeannybbl" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">TikTok</a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
