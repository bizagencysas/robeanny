"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { personalData, measurements, aboutImage, biography } from "@/lib/data";
import { Canvas } from "@react-three/fiber";
import LiquidImage from "@/components/three/LiquidImage";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const [isHoveringImage, setIsHoveringImage] = useState(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Custom Word-by-Word reveal via DOM manipulation 
            // (Replacing Premium SplitText with custom implementation)
            const paras = document.querySelectorAll(".biography-text");
            paras.forEach((p) => {
                const words = (p.textContent || "").split(" ");
                p.innerHTML = "";
                words.forEach((word) => {
                    const span = document.createElement("span");
                    span.className = "inline-block mr-1 lg:mr-2 opacity-10 translate-y-4";
                    span.textContent = word;
                    p.appendChild(span);
                });

                gsap.to((p as HTMLElement).children, {
                    scrollTrigger: {
                        trigger: p,
                        start: "top 85%",
                        end: "bottom 50%",
                        scrub: 1, // Smoothly tie opacity to scroll progress
                    },
                    opacity: 1,
                    y: 0,
                    stagger: 0.05,
                    ease: "power2.out",
                });
            });

            // Reveal measurements table
            gsap.fromTo(
                ".measurement-item",
                { opacity: 0, x: -20 },
                {
                    scrollTrigger: {
                        trigger: ".measurements-grid",
                        start: "top 80%",
                    },
                    opacity: 1,
                    x: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "back.out(1.7)",
                }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="about"
            ref={containerRef}
            className="w-full min-h-screen bg-black text-white py-24 md:py-40 flex items-center"
        >
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    {/* Left Column: Text Content */}
                    <div ref={textRef} className="flex flex-col space-y-12">
                        <h2 className="text-5xl md:text-7xl font-serif font-light tracking-[0.1em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                            About Me
                        </h2>

                        <div className="space-y-6 text-lg md:text-xl lg:text-2xl font-serif text-white/50 leading-relaxed font-light">
                            {biography.map((para, i) => (
                                <p key={i} className="biography-text">
                                    {para}
                                </p>
                            ))}
                        </div>

                        {/* Measurements Grid */}
                        <div className="measurements-grid grid grid-cols-2 gap-y-8 gap-x-12 pt-8">
                            {measurements.map((item, i) => (
                                <div key={i} className="measurement-item border-l-2 border-platinum pl-4 flex flex-col">
                                    <span className="text-xs font-sans text-white/40 uppercase tracking-[0.2em] mb-1">
                                        {item.label}
                                    </span>
                                    <span className="text-xl md:text-2xl font-serif text-platinum">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: WebGL Image */}
                    <div
                        className="relative w-full aspect-[2/3] lg:aspect-[3/4] overflow-hidden border border-white/10 group cursor-pointer"
                        onMouseEnter={() => setIsHoveringImage(true)}
                        onMouseLeave={() => setIsHoveringImage(false)}
                        data-cursor="photo"
                    >
                        <div className="w-full h-full absolute inset-0 z-10 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
                            <Canvas camera={{ position: [0, 0, 2], fov: 45 }}>
                                <ambientLight intensity={1} />
                                <LiquidImage imageUrl={aboutImage} isHovering={isHoveringImage} />
                            </Canvas>
                        </div>
                        {/* Fallback solid color while loading */}
                        <div className="absolute inset-0 bg-white/5" />
                    </div>

                </div>
            </div>
        </section>
    );
}
