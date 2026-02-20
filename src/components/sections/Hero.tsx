"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamically import the Canvas to avoid SSR issues with WebGL
const Canvas = dynamic(() => import("@react-three/fiber").then(mod => mod.Canvas), { ssr: false });
const HeroShader = dynamic(() => import("../canvas/HeroShader"), { ssr: false });

export default function Hero() {
    const t = useTranslations("hero");
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_HERO_VIDEO_URL || "/video/hero.mp4";
        if (url) {
            setVideoUrl(url);
        }
    }, []);

    const fallbackImage =
        "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761421297/F60474B0-B2D3-4D05-99FC-C1CA8C1C8372_kdyq7e.png";

    const name = "ROBEANNY".split("");

    return (
        <section className="relative w-full h-screen overflow-hidden bg-black flex flex-col items-center justify-center">
            {/* V2 WebGL Background Media */}
            <div className="absolute inset-0 z-0">
                <Suspense fallback={<div className="w-full h-full bg-black" />}>
                    <Canvas
                        camera={{ position: [0, 0, 1] }}
                        dpr={[1, 2]} // Optimize pixel ratio
                        gl={{ antialias: false, powerPreference: "high-performance" }} // Optimized for shaders
                        className="w-full h-full"
                    >
                        <HeroShader videoUrl={videoUrl || undefined} fallbackImage={fallbackImage} />
                    </Canvas>
                </Suspense>

                {/* Subtler Gradient Overlay for V2 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
            </div>

            {/* V2 Hero Content */}
            <div className="relative z-10 flex flex-col items-center text-center px-4 w-full mix-blend-difference pointer-events-none">
                {/* V2: Gigantic Staggered Name entrance with Mix Blend Mode */}
                <motion.h1
                    className="text-[20vw] font-serif leading-none tracking-[0.1em] text-white flex select-none"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: {
                            transition: {
                                staggerChildren: 0.1,
                                delayChildren: 3, // Start after LoadingScreen goes away
                            },
                        },
                    }}
                >
                    {name.map((letter, index) => (
                        <motion.span
                            key={index}
                            variants={{
                                hidden: { y: 50, opacity: 0, filter: "blur(10px)" },
                                visible: {
                                    y: 0,
                                    opacity: 1,
                                    filter: "blur(0px)",
                                    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
                                },
                            }}
                            className="inline-block"
                        >
                            {letter}
                        </motion.span>
                    ))}
                </motion.h1>

                {/* V2 Subtitle: Montserrat 200 */}
                <motion.p
                    initial={{ opacity: 0, letterSpacing: "1em" }}
                    animate={{ opacity: 0.6, letterSpacing: "0.6em" }}
                    transition={{ duration: 1.5, delay: 4.5, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-2 text-xs md:text-sm font-sans font-extralight uppercase text-white tracking-[0.6em]"
                >
                    PROFESSIONAL MODEL
                </motion.p>
            </div>

            {/* Minimal Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 5, duration: 2 }}
                className="absolute bottom-8 z-10 flex flex-col items-center justify-center mix-blend-difference pointer-events-none"
            >
                <motion.div
                    animate={{ height: [0, 60, 0], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="w-[1px] bg-white origin-top"
                />
            </motion.div>
        </section>
    );
}
