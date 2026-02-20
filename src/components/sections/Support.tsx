"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Coffee, Star, Linkedin } from "lucide-react";

export default function Support() {
    const t = useTranslations("support");

    const cards = [
        {
            icon: <Coffee className="w-8 h-8 md:w-10 md:h-10 text-white/50 group-hover:text-gold transition-colors duration-700" />,
            title: t("card1Title"),
            desc: t("card1Desc"),
            btn: t("card1Btn"),
            href: "https://love.robeanny.com/",
        },
        {
            icon: <Star className="w-8 h-8 md:w-10 md:h-10 text-white/50 group-hover:text-gold transition-colors duration-700" />,
            title: t("card2Title"),
            desc: t("card2Desc"),
            btn: t("card2Btn"),
            href: "https://www.patreon.com/robeanny",
        },
        {
            icon: <Linkedin className="w-8 h-8 md:w-10 md:h-10 text-white/50 group-hover:text-gold transition-colors duration-700" />,
            title: t("card3Title"),
            desc: t("card3Desc"),
            btn: t("card3Btn"),
            href: "https://www.linkedin.com/in/robeanny/",
        }
    ];

    return (
        <section id="support" className="py-24 md:py-40 bg-black relative w-full flex flex-col items-center border-t border-white/5">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="text-center mb-24 md:mb-32">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-7xl font-serif text-white tracking-widest uppercase mb-6"
                    >
                        {t("title")}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-platinum/40 font-sans font-light text-xs md:text-sm tracking-[0.4em] uppercase"
                    >
                        {t("subtitle")}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                    {cards.map((card, idx) => (
                        <motion.a
                            href={card.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={idx}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: idx * 0.15 + 0.2, duration: 0.8, ease: "easeOut" }}
                            className="group relative flex flex-col items-center text-center p-12 bg-transparent"
                        >
                            {/* V2: Animated Drawn Border using pseudo elements and clip-path for that premium feel */}
                            <div className="absolute inset-0 border border-white/10 group-hover:border-transparent transition-colors duration-500" />

                            {/* Top & Right Gold Lines */}
                            <div className="absolute inset-0 pointer-events-none before:absolute before:inset-0 before:border-t before:border-r before:border-gold before:transition-all before:duration-700 before:ease-in-out before:clip-path-tr-hover group-hover:before:clip-path-tr-active" />

                            {/* Bottom & Left Gold Lines */}
                            <div className="absolute inset-0 pointer-events-none after:absolute after:inset-0 after:border-b after:border-l after:border-gold after:transition-all after:duration-700 after:ease-in-out after:clip-path-bl-hover group-hover:after:clip-path-bl-active" />

                            <div className="mb-8 relative z-10">
                                {card.icon}
                            </div>

                            <h3 className="font-serif text-2xl md:text-3xl text-white mb-6 tracking-widest group-hover:text-gold transition-colors duration-700 relative z-10">
                                {card.title}
                            </h3>

                            <p className="font-sans font-light text-white/40 text-sm mb-12 leading-relaxed relative z-10">
                                {card.desc}
                            </p>

                            <span className="mt-auto font-sans text-[10px] md:text-xs tracking-[0.3em] text-white/50 uppercase group-hover:text-gold transition-colors duration-700 flex items-center relative z-10">
                                <span className="mr-2 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-700">
                                    [
                                </span>
                                {card.btn}
                                <span className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-700">
                                    ]
                                </span>
                            </span>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
}
