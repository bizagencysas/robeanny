"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Coffee, Star, Linkedin } from "lucide-react";

export default function Support() {
    const t = useTranslations("support");

    const cards = [
        {
            icon: <Coffee className="w-8 h-8 md:w-10 md:h-10 text-white/80 group-hover:text-accent transition-colors duration-500" />,
            title: t("card1Title"),
            desc: t("card1Desc"),
            btn: t("card1Btn"),
            href: "https://love.robeanny.com/",
        },
        {
            icon: <Star className="w-8 h-8 md:w-10 md:h-10 text-white/80 group-hover:text-accent transition-colors duration-500" />,
            title: t("card2Title"),
            desc: t("card2Desc"),
            btn: t("card2Btn"),
            href: "https://www.patreon.com/robeanny",
        },
        {
            icon: <Linkedin className="w-8 h-8 md:w-10 md:h-10 text-white/80 group-hover:text-accent transition-colors duration-500" />,
            title: t("card3Title"),
            desc: t("card3Desc"),
            btn: t("card3Btn"),
            href: "https://www.linkedin.com/in/robeanny/",
        }
    ];

    return (
        <section id="support" className="py-24 md:py-32 bg-black relative w-full flex flex-col items-center">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="text-center mb-16 md:mb-24">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-serif text-white tracking-[0.2em] uppercase mb-4"
                    >
                        {t("title")}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-platinum/60 font-sans font-light text-sm tracking-widest"
                    >
                        {t("subtitle")}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {cards.map((card, idx) => (
                        <motion.a
                            href={card.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={idx}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 + 0.2 }}
                            className="group relative flex flex-col items-center text-center p-10 md:p-12 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-[10px] hover:-translate-y-2 hover:border-accent/50 transition-all duration-500"
                        >
                            <div className="mb-6">
                                {card.icon}
                            </div>
                            <h3 className="font-serif text-2xl text-white mb-4 tracking-wider group-hover:text-accent transition-colors duration-500">
                                {card.title}
                            </h3>
                            <p className="font-sans font-light text-white/50 text-sm mb-8">
                                {card.desc}
                            </p>

                            <span className="mt-auto font-sans text-xs tracking-[0.2em] text-white/80 uppercase group-hover:text-accent transition-colors duration-500 flex items-center">
                                {card.btn}
                                <span className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                                    →
                                </span>
                            </span>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
}
