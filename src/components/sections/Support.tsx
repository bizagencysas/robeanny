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
            className="w-full bg-white text-black py-24 md:py-32 px-6 lg:px-12 flex flex-col items-center justify-center relative"
        >
            <div className="w-full h-[1px] bg-black/10 absolute top-0 left-0" />

            <h2 className="editorial-title text-4xl md:text-5xl lg:text-6xl text-center mb-16 tracking-tighter">
                APOYA <span className="italic font-light">el</span> ARTE
            </h2>

            <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full max-w-[1200px] justify-center">
                {/* Patreon */}
                <a
                    href={personalData.socials.patreon}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="support-card flex-1 min-h-[250px] relative bg-platinum/10 border border-black p-8 md:p-12 flex flex-col justify-between group overflow-hidden"
                    data-cursor="explore"
                >
                    <div className="absolute inset-0 bg-black translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                    <h3 className="editorial-title text-3xl md:text-4xl text-black group-hover:text-white relative z-10 transition-colors duration-500">Patrocina mi arte</h3>
                    <span className="editorial-body text-[10px] uppercase tracking-widest text-black/50 group-hover:text-white/70 relative z-10 transition-colors duration-500">
                        Únete al círculo \
                    </span>
                </a>

                {/* Wishlist / Regalos */}
                <a
                    href={personalData.socials.gifts}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="support-card flex-1 min-h-[250px] relative bg-platinum/10 border border-black p-8 md:p-12 flex flex-col justify-between group overflow-hidden"
                    data-cursor="explore"
                >
                    <div className="absolute inset-0 bg-black translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                    <h3 className="editorial-title text-3xl md:text-4xl text-black group-hover:text-white relative z-10 transition-colors duration-500">Wishlist & Regalos</h3>
                    <span className="editorial-body text-[10px] uppercase tracking-widest text-black/50 group-hover:text-white/70 relative z-10 transition-colors duration-500">
                        Sorpréndeme \
                    </span>
                </a>

                {/* LinkedIn */}
                <a
                    href={personalData.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="support-card flex-1 min-h-[250px] relative bg-platinum/10 border border-black p-8 md:p-12 flex flex-col justify-between group overflow-hidden"
                    data-cursor="explore"
                >
                    <div className="absolute inset-0 bg-black translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                    <h3 className="editorial-title text-3xl md:text-4xl text-black group-hover:text-white relative z-10 transition-colors duration-500">Booking Profesional</h3>
                    <span className="editorial-body text-[10px] uppercase tracking-widest text-black/50 group-hover:text-white/70 relative z-10 transition-colors duration-500">
                        Conecta en LinkedIn \
                    </span>
                </a>
            </div>
        </section>
    );
}
