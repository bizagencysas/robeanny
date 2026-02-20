"use client";

import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import Particles from "@/components/ui/Particles";
import { heroImage } from "@/lib/data";
import Image from "next/image";
import gsap from "gsap";
import { useState } from "react";

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const [y, setY] = useState(0);

    const name = "ROBEANNY".split("");

    useEffect(() => {
        // Cinematic Reveal Animation delayed to run after LoadingScreen (approx 2.8s total)
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".hero-letter",
                { y: 100, opacity: 0, scale: 0.8 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 1.5,
                    stagger: 0.08,
                    ease: "power4.out",
                    delay: 3, // Start right as loading screen shatters
                }
            );

            gsap.fromTo(
                ".hero-subtitle",
                { opacity: 0, letterSpacing: "1em" },
                {
                    opacity: 0.7,
                    letterSpacing: "0.2em",
                    duration: 2,
                    ease: "power2.out",
                    delay: 4.2,
                }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Window scroll listener for parallax
    useEffect(() => {
        const handleScroll = () => setY(window.scrollY);
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Parallax Effect
    useEffect(() => {
        if (bgRef.current && textRef.current) {
            bgRef.current.style.transform = `translateY(${y * 0.4}px)`;
            textRef.current.style.transform = `translateY(${y * -0.1}px)`;
        }
    }, [y]);

    return (
        <section
            ref={containerRef}
            className="relative w-full h-screen overflow-hidden bg-black flex flex-col items-center justify-center clip-path-reveal"
        >
            {/* Background Image with Deep Parallax */}
            <div
                ref={bgRef}
                className="absolute inset-[-10%] w-[120%] h-[120%] z-0 will-change-transform"
            >
                <Image
                    src={heroImage}
                    alt="Robeanny Hero"
                    fill
                    priority
                    className="object-cover object-center filter brightness-[0.35] blur-[2px] scale-105"
                    sizes="100vw"
                />
                {/* Radial Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80" />
            </div>

            {/* 3D WebGL Particles */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
                <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <Particles count={40} />
                </Canvas>
            </div>

            {/* Foreground Content */}
            <div ref={textRef} className="relative z-10 flex flex-col items-center text-center mix-blend-difference pointer-events-none px-4">
                <h1 className="flex flex-wrap justify-center overflow-hidden pb-4">
                    {name.map((letter, i) => (
                        <span
                            key={i}
                            className="hero-letter block text-[15vw] md:text-[8rem] lg:text-[12rem] xl:text-[16rem] font-serif leading-none text-white tracking-widest drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                        >
                            {letter}
                        </span>
                    ))}
                </h1>
                <h2 className="hero-subtitle font-sans font-light uppercase text-xs md:text-sm lg:text-base text-white tracking-[0.2em]">
                    Professional Model
                </h2>
            </div>

            {/* Minimal Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-60">
                <div className="w-[1px] h-12 bg-white/50 overflow-hidden">
                    <div className="w-full h-full bg-white animate-[scroll-indicator_2s_ease-in-out_infinite] origin-top" />
                </div>
            </div>
        </section>
    );
}
