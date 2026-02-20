"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Instagram, Linkedin } from "lucide-react";

export default function Contact() {
    const t = useTranslations("contact");

    return (
        <section id="contact" className="py-24 md:py-32 w-full min-h-[80vh] flex flex-col items-center justify-center relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-dark-gray to-black">
            <div className="container mx-auto px-6 max-w-4xl text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-7xl font-serif text-white tracking-[0.2em] uppercase mb-4"
                >
                    {t("title")}
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-platinum/60 font-sans font-light text-sm md:text-base tracking-widest mb-20"
                >
                    {t("subtitle")}
                </motion.p>

                <div className="flex flex-col items-center space-y-12">
                    {/* Email row */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 w-full pb-12 border-b border-white/10 relative group"
                    >
                        <span className="text-white/40 font-sans text-xs tracking-[0.2em] font-light">
                            {t("emailLabel")}
                        </span>
                        <a
                            href="mailto:me@robeanny.com"
                            className="font-serif text-3xl md:text-5xl text-white relative flex justify-center w-max"
                        >
                            me@robeanny.com
                            {/* Highlight Underline */}
                            <span className="absolute -bottom-2 md:-bottom-4 left-0 w-0 h-[1px] bg-accent transition-all duration-500 group-hover:w-full"></span>
                        </a>
                    </motion.div>

                    {/* WhatsApp row */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col items-center pt-8"
                    >
                        <span className="text-white/40 font-sans text-xs tracking-[0.2em] font-light mb-8">
                            {t("whatsappLabel")}
                        </span>
                        <a
                            href="https://wa.me/573004846270"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative overflow-hidden group border border-white/20 bg-transparent px-12 py-5 rounded-full flex items-center justify-center transition-all hover:border-accent"
                        >
                            <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"></div>
                            <span className="relative z-10 font-sans text-sm tracking-[0.2em] text-white group-hover:text-black uppercase transition-colors duration-500">
                                {t("ctaBtn")}
                            </span>
                        </a>
                    </motion.div>
                </div>

                {/* Social Icons row */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="mt-24 flex justify-center space-x-8"
                >
                    <a href="https://www.instagram.com/robeannybl" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-accent transition-colors duration-300 p-2">
                        <Instagram className="w-6 h-6" />
                    </a>
                    <a href="https://www.linkedin.com/in/robeanny/" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-accent transition-colors duration-300 p-2">
                        <Linkedin className="w-6 h-6" />
                    </a>
                    {/* Custom TikTok icon could be added here, fallback to a path */}
                    <a href="https://www.tiktok.com/@robeannybbl" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-accent transition-colors duration-300 p-2 flex items-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68a6.34 6.34 0 0 0 6.27 6.32 6.32 6.32 0 0 0 6.16-5.37V13.1a8.27 8.27 0 0 0 5.57 2.11v-3.41a4.93 4.93 0 0 1-3.41-5.11Z" />
                        </svg>
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
