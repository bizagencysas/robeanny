"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { heroImage } from "@/lib/data";

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const [y, setY] = useState(0);

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

    return (
        <section
            ref={containerRef}
            className="relative w-full h-screen overflow-hidden bg-white flex items-center justify-center p-4 md:p-8"
        >
            {/* The Huge Hero Image Wrapper - Asymmetric crop */}
            <div
                ref={bgRef}
                className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden will-change-transform mt-12 md:mt-0"
            >
                <Image
                    src={heroImage}
                    alt="Robeanny Hero"
                    fill
                    priority
                    className="object-cover object-[center_15%] filter brightness-[0.9]"
                    sizes="100vw"
                />
            </div>

            {/* Massive Overlapping Editorial Typography */}
            <div
                ref={textRef}
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10 pointer-events-none mix-blend-difference"
            >
                <h1 className="editorial-title text-[18vw] md:text-[15vw] text-white tracking-tighter text-center whitespace-nowrap overflow-hidden">
                    ROBEANNY
                </h1>
            </div>

        </section>
    );
}
