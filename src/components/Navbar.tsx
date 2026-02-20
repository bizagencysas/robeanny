"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import LanguageToggle from "./LanguageToggle";

export default function Navbar() {
    const t = useTranslations("nav");
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const links = [
        { href: "#about", label: t("about") },
        { href: "#portfolio", label: t("portfolio") },
        { href: "#sessions", label: t("sessions") },
        { href: "#social", label: t("social") },
        { href: "#support", label: t("support") },
        { href: "#contact", label: t("contact") },
    ];

    useEffect(() => {
        const handleScroll = () => {
            // V2 spec: Appear only after 100px scroll
            setScrolled(window.scrollY > 100);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollTo = (id: string) => {
        setMobileMenuOpen(false);
        const element = document.querySelector(id);
        if (element) {
            const top = element.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top, behavior: "smooth" });
        }
    };

    return (
        <>
            <AnimatePresence>
                {scrolled && (
                    <motion.nav
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed top-0 left-0 right-0 z-[80] bg-black/40 backdrop-blur-[20px] saturate-[180%] py-4"
                    >
                        <div className="container mx-auto px-6 max-w-[1400px] flex items-center justify-between">
                            <button
                                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                className="text-xl md:text-2xl font-serif tracking-[0.3em] font-light text-white uppercase"
                            >
                                ROBEANNY
                            </button>

                            {/* Desktop Links */}
                            <div className="hidden lg:flex items-center">
                                <div className="flex space-x-8 mr-8">
                                    {links.map((link) => (
                                        <button
                                            key={link.href}
                                            onClick={() => scrollTo(link.href)}
                                            className="text-[0.75rem] font-sans font-light tracking-[0.2em] text-white/70 hover:text-white transition-colors uppercase"
                                        >
                                            {link.label}
                                        </button>
                                    ))}
                                </div>
                                <LanguageToggle />
                            </div>

                            {/* Mobile Menu Minimalist Toggle */}
                            <button
                                className="lg:hidden w-8 h-8 flex flex-col justify-center items-end space-y-[4px] group"
                                onClick={() => setMobileMenuOpen(true)}
                                aria-label="Open menu"
                            >
                                <span className="w-6 h-[1px] bg-white transition-transform group-hover:w-8" />
                                <span className="w-8 h-[1px] bg-white" />
                                <span className="w-4 h-[1px] bg-white transition-transform group-hover:w-8" />
                            </button>
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>

            {/* V2 Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6"
                    >
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="absolute top-8 right-6 w-8 h-8 flex flex-col justify-center items-center"
                            aria-label="Close menu"
                        >
                            <span className="w-8 h-[1px] bg-white rotate-45 absolute" />
                            <span className="w-8 h-[1px] bg-white -rotate-45 absolute" />
                        </button>

                        <div className="flex flex-col items-center space-y-10 mb-16">
                            {links.map((link, i) => (
                                <motion.button
                                    key={link.href}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 * i + 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                    onClick={() => scrollTo(link.href)}
                                    className="text-4xl sm:text-5xl font-serif tracking-widest text-white uppercase hover:text-white/60 transition-colors"
                                >
                                    {link.label}
                                </motion.button>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                        >
                            <LanguageToggle />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
