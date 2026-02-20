"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRef } from "react";

// Minimal SVG Icons
const InstagramIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);

const TikTokIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
    </svg>
);

export default function Social() {
    const t = useTranslations("social");
    const containerRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // Parallax the giant watermark
    const yTransform = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

    return (
        <section id="social" ref={containerRef} className="py-32 bg-black w-full min-h-[70vh] flex flex-col items-center justify-center relative overflow-hidden">

            {/* V2 Giant Watermark Background */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none opacity-5"
                style={{ y: yTransform }}
            >
                <div className="text-[25vw] font-serif leading-none text-white whitespace-nowrap font-bold tracking-tighter">
                    SOCIAL
                </div>
            </motion.div>

            <div className="container mx-auto px-6 max-w-6xl relative z-10 flex flex-col items-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-2xl md:text-4xl font-sans font-light text-white tracking-[0.4em] uppercase text-center mb-16 md:mb-24"
                >
                    {t("title")}
                </motion.h2>

                <div className="flex flex-col md:flex-row gap-12 md:gap-32 w-full justify-center items-center">
                    {/* V2 Minimal Instagram Link */}
                    <motion.a
                        href="https://www.instagram.com/robeannybl"
                        target="_blank"
                        rel="noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="group flex flex-col items-center gap-6"
                    >
                        <div className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center text-white/50 group-hover:text-white group-hover:border-white transition-all duration-500 group-hover:scale-110">
                            <InstagramIcon />
                        </div>
                        <span className="font-sans text-xs tracking-[0.3em] uppercase text-white/50 group-hover:text-white transition-colors duration-500">
                            Instagram
                        </span>
                    </motion.a>

                    {/* V2 Minimal TikTok Link */}
                    <motion.a
                        href="https://www.tiktok.com/@robeannybbl"
                        target="_blank"
                        rel="noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="group flex flex-col items-center gap-6"
                    >
                        <div className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center text-white/50 group-hover:text-white group-hover:border-white transition-all duration-500 group-hover:scale-110">
                            <TikTokIcon />
                        </div>
                        <span className="font-sans text-xs tracking-[0.3em] uppercase text-white/50 group-hover:text-white transition-colors duration-500">
                            TikTok
                        </span>
                    </motion.a>
                </div>
            </div>
        </section>
    );
}
