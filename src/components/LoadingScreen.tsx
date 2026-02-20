"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // V2 specification: Total silence, stagger 80ms -> 8 chars * 80ms = 640ms + pulse duration
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    const name = "ROBEANNY".split("");

    const containerVariants = {
        hidden: { opacity: 1 }, // Keep black background fully opaque initially
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08, // 80ms requested stagger
            },
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.8, ease: "easeInOut" },
        },
    };

    const letterVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.8, ease: "easeOut" }
        },
        exit: {
            opacity: 0
        }
    };

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
                >
                    {/* V2 Loading Sequence */}
                    <motion.div
                        className="flex space-x-[0.2em] overflow-hidden text-3xl md:text-5xl lg:text-7xl font-serif tracking-widest text-white"
                        // The final simultaneous pulse animation before fading out
                        animate={{
                            scale: [1, 1.02, 1],
                            opacity: [1, 1, 0.5]
                        }}
                        transition={{
                            duration: 1.5,
                            ease: "easeInOut",
                            delay: 1.2, // trigger pulse after letters finish appearing
                        }}
                    >
                        {name.map((letter, i) => (
                            <motion.span key={i} variants={letterVariants} className="inline-block">
                                {letter}
                            </motion.span>
                        ))}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
