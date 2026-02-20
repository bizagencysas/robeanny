"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/book", label: "Book" },
    { href: "/sessions", label: "Sessions" },
    { href: "/journal", label: "Journal" },
    { href: "/contact", label: "Contact" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 80);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    return (
        <>
            <header
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled
                        ? "bg-black/80 backdrop-blur-md border-b border-white/5"
                        : "bg-transparent"
                    }`}
            >
                <nav className="max-w-[1800px] mx-auto px-6 md:px-12 h-16 md:h-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="font-serif text-xl md:text-2xl tracking-[0.2em] text-white hover:opacity-70 transition-opacity z-50"
                    >
                        ROBEANNY
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`font-sans text-[11px] tracking-[0.2em] uppercase transition-opacity duration-300 ${pathname === link.href
                                        ? "text-white opacity-100"
                                        : "text-white/50 hover:text-white hover:opacity-100"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden relative z-50 w-8 h-8 flex flex-col items-center justify-center gap-[6px] group"
                        aria-label={isOpen ? "Close menu" : "Open menu"}
                    >
                        <span
                            className={`block w-6 h-[1px] bg-white transition-all duration-300 ${isOpen ? "rotate-45 translate-y-[3.5px]" : ""
                                }`}
                        />
                        <span
                            className={`block w-6 h-[1px] bg-white transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-[3.5px]" : ""
                                }`}
                        />
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
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{
                                        delay: i * 0.06,
                                        duration: 0.5,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                >
                                    <Link
                                        href={link.href}
                                        className={`font-serif text-4xl md:text-5xl tracking-[0.1em] uppercase transition-opacity ${pathname === link.href
                                                ? "text-white"
                                                : "text-white/40 hover:text-white"
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </nav>

                        {/* Social links in mobile menu */}
                        <div className="absolute bottom-12 flex items-center gap-6 text-white/30 text-[10px] tracking-[0.3em] uppercase font-sans">
                            <a href="https://www.instagram.com/robeannybl" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
                            <span>·</span>
                            <a href="https://www.tiktok.com/@robeannybbl" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">TikTok</a>
                            <span>·</span>
                            <a href="https://www.linkedin.com/in/robeanny/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
