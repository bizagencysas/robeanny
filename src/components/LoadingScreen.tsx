"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Hide loading screen after 2.5 seconds (gives time for animation)
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    const name = "ROBEANNY".split("");

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.8, ease: "easeInOut" },
        },
    };

    const letterVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
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
                    {/* Text Animation */}
                    <div className="flex space-x-[0.3em] overflow-hidden text-2xl md:text-5xl font-serif tracking-widest text-white mb-8">
                        {name.map((letter, i) => (
                            <motion.span key={i} variants={letterVariants}>
                                {letter}
                            </motion.span>
                        ))}
                    </div>

                    {/* Progress Bar Container */}
                    <div className="w-64 max-w-[80vw] h-[1px] bg-dark-gray overflow-hidden">
                        {/* Progress Bar Fill */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: "0%" }}
                            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                            className="w-full h-full bg-platinum"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
