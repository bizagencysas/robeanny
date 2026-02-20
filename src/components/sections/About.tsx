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
            className="w-full bg-black text-white py-24 md:py-40 px-6 md:px-12 lg:px-[10vw] flex flex-col lg:flex-row items-center lg:items-start justify-between gap-16 lg:gap-24 relative overflow-hidden"
        >
            {/* The Asymmetric Huge Photo (Left) */}
            <div
                ref={imageRef}
                className="w-full lg:w-5/12 h-[75vh] md:h-[110vh] max-h-[900px] relative border-[12px] border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-20 group overflow-hidden"
            >
                <Image
                    src={aboutImage}
                    alt="Robeanny Bastardo Editorial"
                    fill
                    className="object-cover object-top filter grayscale contrast-125 transition-transform duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                />
            </div>

            {/* The Article Text (Right) with breathing room */}
            <div ref={textRef} className="w-full lg:w-1/2 flex flex-col pt-12 lg:pt-32 relative z-10 lg:pl-12">
                <h3 className="editorial-title text-5xl md:text-7xl mb-12 relative text-white">
                    <span className="block italic font-light text-white/50">The Model/</span>
                    <span className="block font-bold mt-2">The Muse.</span>
                </h3>

                <div className="flex flex-col gap-8">
                    {biography.map((paragraph, i) => (
                        <p key={i} className="bio-text editorial-body text-base md:text-lg lg:text-xl text-white/80 max-w-xl leading-relaxed">
                            {i === 0 ? <span className="float-left text-6xl font-serif leading-[0.8] pr-3 pt-2 font-bold text-white">{paragraph.charAt(0)}</span> : null}
                            {i === 0 ? paragraph.substring(1) : paragraph}
                        </p>
                    ))}
                </div>

                {/* Measurements Editorial Grid */}
                <div className="mt-20 border-t border-white/20 pt-8 bio-text">
                    <p className="editorial-title text-sm tracking-[0.3em] font-semibold mb-6 text-white/50">MEASUREMENTS</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4">
                        {measurements.map((item, i) => (
                            <div key={i} className="flex flex-col">
                                <span className="text-[10px] uppercase font-sans tracking-widest text-white/40 mb-1">{item.label}</span>
                                <span className="font-serif text-xl md:text-2xl text-white">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
