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
    const t = useTranslations("about");
    const containerRef = useRef<HTMLElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const imgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

    const measurements = [
        { label: t("measurements_bust"), val: 80, unit: "cm" },
        { label: t("measurements_waist"), val: 60, unit: "cm" },
        { label: t("measurements_hips"), val: 75, unit: "cm" },
        { label: t("measurements_inseam"), val: 39, unit: "cm" },
        { label: t("measurements_thigh"), val: 46, unit: "cm" },
        { label: t("measurements_height"), val: 164, unit: "cm" },
    ];

    // Splitting bio into lines for staggered mask reveal
    // English/Spanish text needs to be split dynamically or we just split by words.
    // Given the complexity of splitting multiline wrapping text perfectly without robust 
    // canvas measuring, splitting by words with overflow hidden yields the "mask up" effect well enough.
    const bioText = t("bio");
    const words = bioText.split(" ");

    const wordVariants = {
        hidden: { y: "150%" },
        visible: {
            y: "0%",
            transition: { ease: [0.16, 1, 0.3, 1], duration: 0.8 }
        },
    };

    return (
        <section id="about" ref={containerRef} className="py-24 md:py-32 w-full min-h-screen flex items-center bg-black relative z-10 overflow-hidden">
            {/* V2 Radial Glow Background */}
            <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

            <div className="container mx-auto px-6 max-w-[1400px]">
                <div className="flex flex-col lg:flex-row gap-16 xl:gap-24 items-center">

                    {/* Text Content (Left side in V2) */}
                    <div className="lg:w-[50%] flex flex-col justify-center order-2 lg:order-1 relative z-10">
                        <motion.div
                            className="font-sans font-light text-xl md:text-2xl lg:text-3xl leading-[1.6] mb-20 text-platinum flex flex-wrap gap-x-2 gap-y-2"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={{
                                visible: { transition: { staggerChildren: 0.02, delayChildren: 0.4 } }
                            }}
                        >
                            {/* Mask Reveal Word by Word */}
                            {words.map((word, i) => (
                                <span key={i} className="overflow-hidden inline-flex">
                                    <motion.span variants={wordVariants}>{word}</motion.span>
                                </span>
                            ))}
                        </motion.div>

                        {/* V2 Measurements Table */}
                        <motion.div
                            className="w-full flex-col"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            variants={{
                                visible: { transition: { staggerChildren: 0.1, delayChildren: 0.8 } }
                            }}
                        >
                            {measurements.map((m, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={{
                                        hidden: { opacity: 0 },
                                        visible: { opacity: 1 }
                                    }}
                                    className="flex items-end justify-between py-4 relative group"
                                >
                                    <span className="text-white/40 font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] relative z-10 w-1/3">
                                        {m.label}
                                    </span>
                                    <span className="font-serif text-3xl md:text-4xl text-white relative z-10 text-right w-1/3">
                                        <AnimatedCounter to={m.val} />
                                        <span className="text-sm md:text-base text-white/50 font-sans ml-2 tracking-widest">{m.unit}</span>
                                    </span>

                                    {/* Animated 1px drawn bottom border */}
                                    <motion.div
                                        className="absolute bottom-0 left-0 h-[1px] bg-platinum/20"
                                        variants={{
                                            hidden: { width: "0%" },
                                            visible: { width: "100%", transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] } }
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* V2 Image Content (Right side) */}
                    <div className="lg:w-[50%] relative order-1 lg:order-2 w-full">
                        <motion.div
                            initial={{ clipPath: "inset(0 100% 0 0)" }}
                            whileInView={{ clipPath: "inset(0 0% 0 0)" }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                            className="w-full h-[70vh] md:h-[90vh] relative overflow-hidden group"
                        >
                            <motion.div style={{ y: imgY }} className="w-full h-[120%] relative -top-[10%]">
                                <Image
                                    src="https://res.cloudinary.com/dwpbbjp1d/image/upload/f_auto,q_auto,w_auto/v1761417060/C331D4C7-A330-46C8-AB87-E451F1B4C119_il9n9f.jpg"
                                    alt="Robeanny Portrait"
                                    fill
                                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-[2000ms]"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    loading="lazy"
                                />
                            </motion.div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
