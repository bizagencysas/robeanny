"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";

function AnimatedCounter({ from = 0, to, duration = 2 }: { from?: number; to: number; duration?: number }) {
    const nodeRef = useRef<HTMLSpanElement>(null);
    const isInView = useInView(nodeRef, { once: true, margin: "0px" });
    const [value, setValue] = useState(from);

    useEffect(() => {
        if (isInView) {
            let startTime: number;
            let animationFrame: number;

            const step = (timestamp: number) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

                // easeOutExpo
                const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                setValue(Math.floor(ease * (to - from) + from));

                if (progress < 1) {
                    animationFrame = requestAnimationFrame(step);
                }
            };

            animationFrame = requestAnimationFrame(step);

            return () => cancelAnimationFrame(animationFrame);
        }
    }, [isInView, from, to, duration]);

    return <span ref={nodeRef}>{value}</span>;
}

export default function About() {
    const t = useTranslations();
    const containerRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const imgY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

    const measurements = [
        { label: t("measurements.bust"), val: 80, unit: "cm" },
        { label: t("measurements.waist"), val: 60, unit: "cm" },
        { label: t("measurements.hips"), val: 75, unit: "cm" },
        { label: t("measurements.inseam"), val: 39, unit: "cm" },
        { label: t("measurements.thigh"), val: 46, unit: "cm" },
        { label: t("measurements.height"), val: 164, unit: "cm" },
        { label: t("measurements.dob"), val: null, stringVal: "Oct 9, 2000" },
    ];

    return (
        <section id="about" ref={containerRef} className="py-24 md:py-32 w-full min-h-screen flex items-center bg-black relative z-10">
            <div className="container mx-auto px-6 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col lg:flex-row gap-16 xl:gap-24"
                >
                    {/* Text Content */}
                    <div className="lg:w-[60%] flex flex-col justify-center">
                        <motion.h2
                            className="text-4xl md:text-6xl font-serif text-white mb-8 tracking-widest"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            {t("about.title")}
                        </motion.h2>

                        <motion.div
                            className="text-platinum/80 font-sans font-light text-lg md:text-xl leading-relaxed mb-16"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                        >
                            {t("about.bio")}
                        </motion.div>

                        {/* Measurements Grid */}
                        <motion.div
                            className="grid grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-8"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={{
                                visible: {
                                    transition: { staggerChildren: 0.1, delayChildren: 0.5 }
                                }
                            }}
                        >
                            {measurements.map((m, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    className="flex flex-col"
                                >
                                    <span className="text-white/40 font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] mb-2">{m.label}</span>
                                    <span className="font-serif text-3xl md:text-5xl text-white">
                                        {m.val !== null ? (
                                            <>
                                                <AnimatedCounter to={m.val} />
                                                <span className="text-lg md:text-2xl text-accent opacity-80 font-sans ml-1">{m.unit}</span>
                                            </>
                                        ) : (
                                            <span className="text-2xl md:text-3xl">{m.stringVal}</span>
                                        )}
                                    </span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Image Content */}
                    <div className="lg:w-[40%] relative mt-12 lg:mt-0">
                        <div className="w-full h-[600px] md:h-[800px] relative overflow-hidden group">
                            <motion.div
                                initial={{ clipPath: "inset(100% 0 0 0)" }}
                                whileInView={{ clipPath: "inset(0% 0 0 0)" }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                className="w-full h-full absolute inset-0"
                            >
                                <motion.div style={{ y: imgY }} className="w-full h-[110%] relative -top-[5%]">
                                    <Image
                                        src="https://res.cloudinary.com/dwpbbjp1d/image/upload/f_auto,q_auto,w_auto/v1761417060/C331D4C7-A330-46C8-AB87-E451F1B4C119_il9n9f.jpg"
                                        alt="Robeanny Portrait"
                                        fill
                                        className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                        sizes="(max-width: 1024px) 100vw, 40vw"
                                    />
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
