"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useAnimationFrame } from "framer-motion";
import { useTranslations } from "next-intl";
import { photos } from "@/lib/photos";
import Image from "next/image";
import { Pause, Play } from "lucide-react";

export default function Sessions() {
    const t = useTranslations("sessions");
    const [isHovered, setIsHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const rotationRef = useRef(0);
    const SPEED = 0.05; // degrees per frame

    // Start from photo 11 to differentiate from Portfolio section array
    const sessionPhotos = photos.slice(11, 27); // 16 photos

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useAnimationFrame(() => {
        if (!isHovered && !isPaused && !isMobile) {
            rotationRef.current -= SPEED;
            if (rotationRef.current <= -360) rotationRef.current = 0;

            const carousel = document.getElementById("disko-carousel");
            if (carousel) {
                carousel.style.transform = `rotateY(${rotationRef.current}deg)`;
            }
        }
    });

    return (
        <section id="sessions" className="py-24 md:py-32 bg-near-black relative overflow-hidden min-h-screen flex flex-col items-center justify-center">
            {/* Header */}
            <div className="absolute top-24 z-20 text-center w-full px-4">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-serif text-white tracking-[0.2em] uppercase"
                >
                    {t("title")}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-platinum/60 font-sans tracking-[0.3em] uppercase text-xs sm:text-sm mt-4"
                >
                    {t("subtitle")}
                </motion.p>

                {/* Play/Pause control for Desktop */}
                {!isMobile && (
                    <button
                        onClick={() => setIsPaused(!isPaused)}
                        className="mt-8 text-white/50 hover:text-accent transition-colors hidden md:inline-block"
                        aria-label="Pause or Play Animation"
                    >
                        {isPaused || isHovered ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                    </button>
                )}
            </div>

            {isMobile ? (
                // Mobile 2D Horizontal Scroll
                <div className="w-full mt-32 px-4 flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 hidescrollbar">
                    {sessionPhotos.map((photo, i) => (
                        <div key={i} className="snap-center shrink-0 w-[80vw] h-[60vh] relative">
                            <Image
                                src={photo}
                                alt={`Session ${i}`}
                                fill
                                className="object-cover rounded-sm grayscale-[30%]"
                                sizes="80vw"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            ) : (
                // Desktop 3D Disk'O Gallery
                <div className="relative w-full h-[600px] mt-24 perspective-[2000px] flex items-center justify-center">
                    <div
                        id="disko-carousel"
                        className="w-full h-full absolute preserve-3d transition-transform duration-75"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        {sessionPhotos.map((photo, idx) => {
                            // Calculate 3D position
                            const angle = (360 / sessionPhotos.length) * idx;
                            const zTranslate = 800; // Radius of the cylinder

                            return (
                                <div
                                    key={idx}
                                    className="absolute top-1/2 left-1/2 w-[300px] h-[450px] -mt-[225px] -ml-[150px] group cursor-pointer backface-hidden"
                                    style={{
                                        transform: `rotateY(${angle}deg) translateZ(${zTranslate}px)`,
                                    }}
                                >
                                    <div className="w-full h-full relative overflow-hidden transition-transform duration-500 group-hover:scale-110 shadow-2xl">
                                        <Image
                                            src={photo}
                                            alt={`Gallery ${idx}`}
                                            fill
                                            className="object-cover transition-all duration-500 grayscale group-hover:grayscale-0 group-hover:brightness-110"
                                            sizes="300px"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 border border-white/10 group-hover:border-accent transition-colors duration-500"></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Styles for 3D specific features */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .perspective-[2000px] { perspective: 2000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .hidescrollbar::-webkit-scrollbar { display: none; }
        .hidescrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
        </section>
    );
}
