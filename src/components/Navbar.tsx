"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import LanguageToggle from "./LanguageToggle";
import { Menu, X } from "lucide-react";

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
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollTo = (id: string) => {
        setMobileMenuOpen(false);
        const element = document.querySelector(id);
        if (element) {
            const top = element.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: "smooth" });
        }
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`fixed top-0 left-0 right-0 z-[80] transition-all duration-300 ${scrolled ? "bg-black/70 backdrop-blur-md py-4" : "bg-transparent py-6"
                    }`}
            >
                <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="text-2xl font-serif tracking-[0.3em] font-light text-white uppercase hover:text-platinum transition-colors"
                    >
                        ROBEANNY
                    </button>

                    {/* Desktop Links */}
                    <div className="hidden lg:flex items-center space-x-8">
                        <div className="flex space-x-6 mr-4">
                            {links.map((link) => (
                                <button
                                    key={link.href}
                                    onClick={() => scrollTo(link.href)}
                                    className="text-sm font-sans font-light tracking-wide text-platinum/80 hover:text-white transition-colors relative group"
                                >
                                    {link.label}
                                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover:w-full" />
                                </button>
                            ))}
                        </div>
                        <div className="h-4 w-[1px] bg-white/20"></div>
                        <LanguageToggle />
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden text-white"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: "-100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "-100%" }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 z-[100] bg-near-black flex flex-col items-center justify-center p-6"
                    >
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="absolute top-6 right-6 text-white"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <div className="flex flex-col items-center space-y-8 mb-12">
                            {links.map((link, i) => (
                                <motion.button
                                    key={link.href}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * i + 0.2 }}
                                    onClick={() => scrollTo(link.href)}
                                    className="text-3xl font-serif tracking-widest text-white uppercase hover:text-accent transition-colors"
                                >
                                    {link.label}
                                </motion.button>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <LanguageToggle />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
