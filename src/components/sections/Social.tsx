"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { personalData } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

export default function Social() {
    const containerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Reveal cards
            gsap.fromTo(
                ".social-card",
                { y: 100, opacity: 0, rotateY: 15 },
                {
                    y: 0,
                    opacity: 1,
                    rotateY: 0,
                    duration: 1.2,
                    stagger: 0.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 75%",
                    }
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section
            id="social"
            ref={containerRef}
            className="w-full bg-black py-24 md:py-40 relative px-6 lg:px-20 overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="max-w-7xl mx-auto flex flex-col items-center">
                <h2 className="text-4xl md:text-6xl font-serif text-white tracking-[0.1em] mb-16 opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    Follow the Journey
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 w-full perspective-1000">
                    {/* Instagram Card Mockup */}
                    <a
                        href={personalData.socials.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-card relative w-full aspect-square border border-white/10 group overflow-hidden bg-white/5 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer"
                        data-cursor="explore"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 via-pink-500/10 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-screen" />
                        <h3 className="text-3xl font-serif tracking-wides uppercase text-white group-hover:scale-110 transition-transform duration-500 z-10">Instagram</h3>
                        <span className="text-xs font-sans text-white/50 tracking-[0.3em] uppercase mt-4 z-10">@robeannybl</span>
                        {/* Outline hover effect */}
                        <div className="absolute inset-4 border border-white/0 group-hover:border-white/20 transition-all duration-700" />
                    </a>

                    {/* TikTok Card Mockup */}
                    <a
                        href={personalData.socials.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-card relative w-full aspect-square border border-white/10 group overflow-hidden bg-white/5 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer"
                        data-cursor="explore"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#00f2fe]/10 via-transparent to-[#fe0979]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-screen" />
                        <h3 className="text-3xl font-serif tracking-wides uppercase text-white group-hover:scale-110 transition-transform duration-500 z-10">TikTok</h3>
                        <span className="text-xs font-sans text-white/50 tracking-[0.3em] uppercase mt-4 z-10">@robeannybbl</span>
                        <div className="absolute inset-4 border border-white/0 group-hover:border-white/20 transition-all duration-700" />
                    </a>
                </div>
            </div>
        </section>
    );
}
