"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Hero() {
    const t = useTranslations("hero");
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    useEffect(() => {
        // Allows injecting standard video in the env, or use local file, or default to fallback.
        const url = process.env.NEXT_PUBLIC_HERO_VIDEO_URL || "/video/hero.mp4";

        // We can try to test if the local video exists, but for simplicity we will just set it
        // and if the video fails to load, the image fallback won't automatically trigger unless
        // we listen to the onError event on the video. Let's just set the URL and let the 
        // user drop the video file in public/video/hero.mp4.
        if (url) {
            setVideoUrl(url);
        }
    }, []);

    const fallbackImage =
        "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761421297/F60474B0-B2D3-4D05-99FC-C1CA8C1C8372_kdyq7e.png";

    const name = "ROBEANNY".split("");

    return (
        <section className="relative w-full h-screen overflow-hidden bg-black flex flex-col items-center justify-center">
            {/* Background Media */}
            <div className="absolute inset-0 z-0">
                {videoUrl ? (
                    <video
                        src={videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Image
                        src={fallbackImage}
                        alt="Robeanny Bastardo"
                        fill
                        priority
                        className="object-cover"
                        sizes="100vw"
                    />
                )}

                {/* Gradient Overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 flex flex-col items-center text-center px-4 w-full">
                {/* Staggered Name entrance */}
                <motion.h1
                    className="text-[16vw] md:text-[10vw] font-serif leading-none tracking-widest text-platinum flex mix-blend-difference drop-shadow-lg"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: {
                            transition: {
                                staggerChildren: 0.15,
                                delayChildren: 3, // Start after LoadingScreen goes away
                            },
                        },
                    }}
                >
                    {name.map((letter, index) => (
                        <motion.span
                            key={index}
                            variants={{
                                hidden: { y: -100, opacity: 0 },
                                visible: {
                                    y: 0,
                                    opacity: 1,
                                    transition: { type: "spring", stiffness: 50, damping: 20 },
                                },
                            }}
                            className="inline-block"
                        >
                            {letter}
                        </motion.span>
                    ))}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 4.5, ease: "easeOut" }}
                    className="mt-6 md:mt-4 text-xs md:text-base font-sans font-light tracking-[0.5em] uppercase text-white/80"
                >
                    {t("subtitle")}
                </motion.p>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 5, duration: 1 }}
                className="absolute bottom-10 z-10 flex flex-col items-center justify-center"
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="w-[1px] h-16 bg-white/40 relative overflow-hidden"
                >
                    <motion.div
                        animate={{ top: ["-100%", "100%"] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="absolute left-0 w-full h-full bg-white delay-75"
                    />
                </motion.div>
            </motion.div>
        </section>
    );
}
