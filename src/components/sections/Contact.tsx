"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRef } from "react";

export default function Contact() {
    const t = useTranslations("contact");
    const containerRef = useRef<HTMLElement>(null);

    // V2: Scroll-driven Tracking Expansion effect
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "center center"]
    });

    const trackingBase = useTransform(scrollYProgress, [0, 1], ["0.5em", "1em"]);
    const trackingSmooth = useSpring(trackingBase, { stiffness: 100, damping: 20 });

    return (
        <section id="contact" ref={containerRef} className="py-24 md:py-40 w-full min-h-[90vh] flex flex-col items-center justify-center relative bg-black">

            {/* V2 Minimal Background */}
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-white/[0.02] to-transparent pointer-events-none" />

            <div className="container mx-auto px-6 max-w-4xl text-center relative z-10 flex flex-col items-center">
                <motion.h2
                    initial={{ opacity: 0, filter: "blur(10px)" }}
                    whileInView={{ opacity: 1, filter: "blur(0px)" }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="text-4xl md:text-7xl lg:text-8xl font-serif text-white uppercase mb-8"
                    style={{ letterSpacing: trackingSmooth }}
                >
                    {t("title")}
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 1 }}
                    className="text-platinum/40 font-sans font-light text-xs md:text-sm tracking-[0.6em] uppercase mb-24"
                >
                    {t("subtitle")}
                </motion.p>

                <div className="flex flex-col items-center space-y-20 w-full">

                    {/* V2 Email Lockup */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                        className="flex flex-col items-center group cursor-pointer"
                    >
                        <span className="text-white/30 font-sans text-[10px] tracking-[0.4em] mb-4 uppercase">
                            {t("emailLabel")}
                        </span>
                        <a
                            href="mailto:me@robeanny.com"
                            className="font-serif text-2xl md:text-5xl text-white relative overflow-hidden pb-4"
                        >
                            <span className="relative z-10 mix-blend-difference group-hover:text-gold transition-colors duration-700">
                                me@robeanny.com
                            </span>

                            {/* Animated Underline */}
                            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white/20"></span>
                            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gold transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"></span>
                        </a>
                    </motion.div>

                    {/* V2 Ghost Fill Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                        className="flex flex-col items-center"
                    >
                        <span className="text-white/30 font-sans text-[10px] tracking-[0.4em] mb-6 uppercase">
                            {t("whatsappLabel")}
                        </span>
                        <a
                            href="https://wa.me/573004846270"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative overflow-hidden group border border-white/30 px-12 md:px-16 py-5 flex items-center justify-center transition-all duration-700 hover:border-gold"
                        >
                            <div className="absolute inset-0 bg-gold translate-y-[101%] group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"></div>

                            <span className="relative z-10 font-sans text-xs tracking-[0.4em] text-white uppercase transition-colors duration-700 mix-blend-difference group-hover:text-black">
                                {t("ctaBtn")}
                            </span>
                        </a>
                    </motion.div>
                </div>
            </div>

            {/* Minimal Background Grid overlay */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-screen pointer-events-none" />
        </section>
    );
}
