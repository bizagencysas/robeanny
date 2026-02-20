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
            // Staggered fade up for support links
            gsap.fromTo(
                ".support-link",
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
            className="w-full bg-black py-20 px-6 flex flex-col items-center justify-center relative border-t border-white/5"
        >
            <h2 className="text-3xl md:text-5xl font-serif font-light text-white mb-12 tracking-widest text-center">
                Apoya mi Arte
            </h2>

            <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full max-w-4xl justify-center">
                {/* Patreon */}
                <a
                    href={personalData.socials.patreon}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="support-link relative px-8 py-6 w-full md:w-auto border border-white/20 text-center text-white font-sans uppercase tracking-[0.2em] text-sm hover:bg-white hover:text-black transition-colors duration-500 group overflow-hidden"
                >
                    <span className="relative z-10 font-bold group-hover:text-black">Patreon Exclusive</span>
                </a>

                {/* Wishlist / Regalos */}
                <a
                    href={personalData.socials.gifts}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="support-link relative px-8 py-6 w-full md:w-auto border border-white/20 text-center text-white font-sans uppercase tracking-[0.2em] text-sm hover:bg-white hover:text-black transition-colors duration-500 group overflow-hidden"
                >
                    <span className="relative z-10 font-bold group-hover:text-black">Wishlist & Gifts</span>
                </a>

                {/* LinkedIn */}
                <a
                    href={personalData.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="support-link relative px-8 py-6 w-full md:w-auto border border-white/20 text-center text-white font-sans uppercase tracking-[0.2em] text-sm hover:bg-white hover:text-black transition-colors duration-500 group overflow-hidden"
                >
                    <span className="relative z-10 font-bold group-hover:text-black">LinkedIn</span>
                </a>
            </div>
        </section>
    );
}
