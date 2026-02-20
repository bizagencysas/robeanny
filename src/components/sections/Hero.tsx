"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const desktopImages = [
    "/014A7144-2.jpg",
    "/014A7221-2.jpg",
    "/014A7227-2.jpg"
];

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const [y, setY] = useState(0);
    const [currentImage, setCurrentImage] = useState(0);

    // Subtle Native Parallax
    useEffect(() => {
        const handleScroll = () => setY(window.scrollY);
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (bgRef.current && textRef.current) {
            // Subtle image parallax down
            bgRef.current.style.transform = `translateY(${y * 0.15}px)`;
            // Subtle text parallax up
            textRef.current.style.transform = `translateY(${y * -0.05}px)`;
        }
    }, [y]);

    // Slideshow interval logic for Desktop
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % desktopImages.length);
        }, 3500); // 3.5 seconds per slide
        return () => clearInterval(interval);
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative w-full h-screen overflow-hidden bg-white flex items-center justify-center bg-black"
        >
            <div
                ref={bgRef}
                className="relative w-full h-full md:w-[60vw] xl:w-[45vw] md:h-[90vh] overflow-hidden will-change-transform bg-black"
            >
                {/* 1. Mobile Experience: Muted Video Background (Hidden on Desktop) */}
                <video
                    src="/hero.mp4"
                    autoPlay={true}
                    loop={true}
                    muted={true}
                    playsInline={true}
                    className="block md:hidden w-full h-full object-cover filter brightness-[0.75] scale-105"
                />

                {/* 2. Desktop Experience: Cinematic Fullscreen Image Slideshow (16:9) (Hidden on Mobile) */}
                <div className="hidden md:block relative w-full h-full bg-black">
                    {desktopImages.map((src, index) => (
                        <div
                            key={src}
                            className={`absolute inset-0 w-full h-full transition-opacity duration-[1500ms] ease-in-out ${index === currentImage ? "opacity-100 z-10" : "opacity-0 z-0"
                                }`}
                        >
                            <Image
                                src={src}
                                alt={`Robeanny Hero Editorial ${index + 1}`}
                                fill
                                priority={index === 0}
                                className="object-cover object-center filter brightness-[0.8] scale-105"
                                sizes="100vw"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Massive Overlapping Editorial Typography */}
            <div
                ref={textRef}
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-20 pointer-events-none mix-blend-difference"
            >
                <h1 className="editorial-title text-[18vw] md:text-[15vw] text-white tracking-tighter text-center whitespace-nowrap overflow-hidden drop-shadow-2xl">
                    ROBEANNY
                </h1>
            </div>

        </section>
    );
}
