"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { personalData } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

export default function Support() {
    const containerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".support-card",
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    stagger: 0.15,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 80%",
                    }
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section
            id="support"
            ref={containerRef}
            className="w-full bg-black text-white py-24 md:py-40 px-6 lg:px-12 flex flex-col items-center justify-center relative overflow-hidden"
        >
            <h2 className="editorial-title text-5xl md:text-7xl lg:text-[10vw] text-center tracking-tighter leading-none">
                APOYA <span className="block italic font-light text-white/50">EL ARTE.</span>
            </h2>

            {/* --- Premium Support Interactive List --- */}
            <div className="w-full max-w-[1400px] flex flex-col border-t border-white/20 mt-12 md:mt-24">

                {/* Patreon Row */}
                <a
                    href={personalData.socials.patreon}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-full border-b border-white/20 py-8 md:py-16 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/5 transition-colors overflow-hidden px-4 md:px-0"
                >
                    <div className="flex flex-col z-10">
                        <span className="font-sans text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/50 mb-2">Únete al círculo</span>
                        <h3 className="editorial-title text-4xl md:text-6xl lg:text-7xl group-hover:pl-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                            Patrocina mi arte
                        </h3>
                    </div>
                    <div className="hidden md:flex items-center gap-4 z-10 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500 delay-100 pr-8">
                        <span className="font-sans text-xs tracking-widest uppercase">Explorar</span>
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </div>
                </a>

                {/* Coffee/Gifts Row */}
                <a
                    href={personalData.socials.gifts}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-full border-b border-white/20 py-8 md:py-16 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/5 transition-colors overflow-hidden px-4 md:px-0"
                >
                    <div className="flex flex-col z-10">
                        <span className="font-sans text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/50 mb-2">Sorpréndeme</span>
                        <h3 className="editorial-title text-4xl md:text-6xl lg:text-7xl group-hover:pl-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                            Bríndame un café
                        </h3>
                    </div>
                    <div className="hidden md:flex items-center gap-4 z-10 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500 delay-100 pr-8">
                        <span className="font-sans text-xs tracking-widest uppercase">Apoyar</span>
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </div>
                </a>

                {/* LinkedIn Row */}
                <a
                    href={personalData.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-full border-b border-white/20 py-8 md:py-16 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/5 transition-colors overflow-hidden px-4 md:px-0"
                >
                    <div className="flex flex-col z-10">
                        <span className="font-sans text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/50 mb-2">Conecta en la Red</span>
                        <h3 className="editorial-title text-4xl md:text-6xl lg:text-7xl group-hover:pl-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                            Booking Profesional
                        </h3>
                    </div>
                    <div className="hidden md:flex items-center gap-4 z-10 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500 delay-100 pr-8">
                        <span className="font-sans text-xs tracking-widest uppercase">Conectar</span>
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square">
                            <path d="M21 13v6M16 21v-2a4 4 0 00-4-4H5m0-4h7m-7 4h7m-7 4h7" />
                        </svg>
                    </div>
                </a>
            </div>

            {/* --- True Elegance Footer --- */}
            <footer className="w-full flex flex-col md:flex-row items-center justify-between max-w-[1400px] mt-24 pt-8 md:pt-12 px-4 md:px-0 pb-8 text-white/30 text-[10px] font-sans tracking-[0.3em] uppercase">
                <p>© 2026 ROBEANNY BASTARDO</p>
                <div className="flex items-center gap-4 mt-6 md:mt-0">
                    <a href={personalData.socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
                    <span className="mx-2">•</span>
                    <a href={personalData.socials.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">TikTok</a>
                </div>
            </footer>
        </section>
    );
}
