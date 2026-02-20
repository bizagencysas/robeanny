"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { biography, measurements, aboutImage } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
    const containerRef = useRef<HTMLElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Elegant fade-in for biographies paragraph by paragraph
            gsap.fromTo(
                ".bio-text",
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    stagger: 0.3,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: textRef.current,
                        start: "top 80%",
                    },
                }
            );

            // Subtle parallax slide up for the image wrapper
            gsap.fromTo(
                imageRef.current,
                { opacity: 0, y: 100 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.5,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 70%",
                    },
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section
            id="about"
            ref={containerRef}
            className="w-full bg-black text-white py-32 md:py-48 flex flex-col items-center justify-center relative overflow-hidden"
        >
            {/* The Asymmetric Free-Floating Photo (Background-ish) */}
            <div
                ref={imageRef}
                className="w-[90vw] md:w-[70vw] h-[80vh] md:h-[120vh] max-h-[1200px] relative z-10 opacity-70 mt-32 md:mt-0"
            >
                <Image
                    src={aboutImage}
                    alt="Robeanny Bastardo Editorial"
                    fill
                    className="object-cover object-center filter grayscale contrast-125 transition-transform duration-[3s] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
                    sizes="100vw"
                    priority
                />
            </div>

            {/* Foreground Typography - Architectural & Disruptive */}
            <div ref={textRef} className="absolute inset-0 flex flex-col justify-center items-center z-20 pointer-events-none">

                {/* Massive Out-of-Bounds Title */}
                <h2 className="editorial-title text-[25vw] md:text-[20vw] font-bold text-white mix-blend-difference leading-[0.7] tracking-tighter w-[150vw] text-center ml-[-25vw]">
                    THE <br /> MUSE.
                </h2>

                {/* Vanguard Manifesto (Biography) */}
                <div className="absolute bottom-12 md:bottom-32 px-6 md:px-0 w-full md:w-[60vw] max-w-[1000px] flex flex-col gap-6 md:gap-12 pointer-events-auto mix-blend-difference">
                    {biography.map((paragraph, i) => (
                        <p key={i} className="bio-text editorial-body text-xl md:text-3xl lg:text-5xl text-white leading-tight font-medium tracking-tight">
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>

            {/* Brutalist Measurements Grid */}
            <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 mt-32 md:mt-64 relative z-30 flex flex-col">
                <p className="font-sans text-[10px] md:text-xs tracking-[0.5em] uppercase text-white/40 mb-12 border-b border-white/20 pb-4 bio-text">
                    Architectural Dimensions
                </p>
                <div className="flex flex-wrap gap-x-12 md:gap-x-24 gap-y-12 bio-text">
                    {measurements.map((item, i) => (
                        <div key={i} className="flex flex-col">
                            <span className="font-serif text-4xl md:text-6xl text-white">{item.value.replace(/cm|Oct|9,|2000/g, '')}</span>
                            <span className="text-[10px] md:text-xs uppercase font-sans tracking-widest text-white/40 mt-2">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
