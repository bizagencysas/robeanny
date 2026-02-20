"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
    const [loading, setLoading] = useState(true);
    const name = "ROBEANNY".split("");

    useEffect(() => {
        // Disable scrolling while loading
        document.body.style.overflow = "hidden";

        // Simulate initial asset loading delay
        const timer = setTimeout(() => {
            setLoading(false);
            document.body.style.overflow = "auto";
        }, 2800); // Exits exactly after cinematic entrance

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
                    }}
                >
                    {/* Progress Bar Minimalist at top */}
                    <motion.div
                        className="absolute top-0 left-0 h-[1px] bg-white origin-left"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 2.5, ease: "circOut" }}
                        style={{ width: "100%" }}
                    />

                    <div className="flex z-10 overflow-hidden mix-blend-difference">
                        {name.map((letter, i) => (
                            <motion.span
                                key={i}
                                className="text-4xl md:text-6xl font-serif tracking-[0.3em] text-white"
                                initial={{ y: "100%", opacity: 0 }}
                                animate={{ y: "0%", opacity: 1 }}
                                exit={{
                                    y: -50 - (Math.random() * 100), // Random shatter directions
                                    x: (Math.random() - 0.5) * 100,
                                    rotate: (Math.random() - 0.5) * 45,
                                    opacity: 0,
                                    filter: "blur(10px)",
                                    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
                                }}
                                transition={{
                                    duration: 0.8,
                                    ease: [0.16, 1, 0.3, 1],
                                    delay: i * 0.1
                                }}
                            >
                                {letter}
                            </motion.span>
                        ))}
                    </div>

                    {/* Golden/Platinum subtle ambient glow during loading */}
                    <div className="absolute inset-0 bg-gradient-radial from-white/5 to-transparent blur-[100px] pointer-events-none" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
