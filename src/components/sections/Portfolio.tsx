"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { domainPhotos } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

export default function Portfolio() {
    const containerRef = useRef<HTMLElement>(null);
    const scrollWrapperRef = useRef<HTMLDivElement>(null);
    const slideRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // We only enable this powerful GSAP pinning on Desktop/Tablet
        const mm = gsap.matchMedia();

        mm.add("(min-width: 1024px)", () => {
            const container = scrollWrapperRef.current;
            const slide = slideRef.current;
            if (!container || !slide) return;

            const totalScrollDepth = slide.scrollWidth - window.innerWidth;

            const ctx = gsap.context(() => {
                // Pin the section and scrub the horizontal movement
                gsap.to(slide, {
                    x: -totalScrollDepth,
                    ease: "none",
                    scrollTrigger: {
                        trigger: container,
                        pin: true,
                        scrub: 1, // Smooth dampening
                        end: () => "+=" + totalScrollDepth,
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                    }
                });

                // Individual image reveals (scale up on entry into viewport)
                const items = gsap.utils.toArray(".portfolio-item");
                items.forEach((item: any) => {
                    gsap.fromTo(
                        item,
                        { scale: 0.8, opacity: 0, filter: "brightness(0.5) blur(10px)" },
                        {
                            scale: 1,
                            opacity: 1,
                            filter: "brightness(1) blur(0px)",
                            ease: "power2.out",
                            scrollTrigger: {
                                trigger: item,
                                containerAnimation: gsap.getById("horizontal-scroll") || undefined, // Binds trigger to the horizontal movement
                                start: "left 90%",
                                end: "left 40%",
                                scrub: true,
                            }
                        }
                    );
                });
            }, containerRef);

            return () => ctx.revert();
        });

        // Mobile specific basic reveals
        mm.add("(max-width: 1023px)", () => {
            const ctx = gsap.context(() => {
                gsap.utils.toArray(".portfolio-item").forEach((item: any) => {
                    gsap.fromTo(item,
                        { opacity: 0, scale: 0.95, y: 50 },
                        {
                            opacity: 1, scale: 1, y: 0,
                            scrollTrigger: {
                                trigger: item,
                                start: "top 85%",
                                end: "top 50%",
                                scrub: 1
                            }
                        }
                    );
                });
            }, containerRef);
            return () => ctx.revert();
        });

        return () => mm.revert();
    }, []);

    return (
        <section
            id="portfolio"
            ref={containerRef}
            className="bg-black w-full"
        >
            {/* V3 Section Watermark Title */}
            <div className="absolute top-[8vh] w-full text-center pointer-events-none z-10 opacity-30 mix-blend-screen hidden lg:block">
                <h2 className="text-[18vw] font-serif tracking-[0.05em] uppercase text-white whitespace-nowrap overflow-hidden leading-none select-none">
                    PORTFOLIO
                </h2>
                <p className="font-sans tracking-[0.5em] text-sm uppercase text-white mt-4">Professional Shots</p>
            </div>

            <div ref={scrollWrapperRef} className="h-screen w-full flex items-center bg-black overflow-hidden lg:overflow-visible">

                {/* Mobile Title */}
                <div className="lg:hidden absolute top-24 w-full text-center z-20">
                    <h2 className="text-6xl font-serif text-white uppercase tracking-widest">Portfolio</h2>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50 mt-2">Professional Shots</p>
                </div>

                {/* The Sliding Tape */}
                <div
                    ref={slideRef}
                    className="flex flex-col lg:flex-row items-center gap-12 lg:gap-32 px-6 lg:px-[20vw] lg:h-[80vh] pt-48 lg:pt-0 w-full lg:w-max"
                >
                    {domainPhotos.map((photo, i) => {
                        // Editorial Layout Logic: Randomizing heights, alignments, and aspect ratios
                        // Based on index to keep deterministic SSR parity
                        const heights = ["lg:h-[70vh]", "lg:h-[45vh]", "lg:h-[80vh]", "lg:h-[55vh]", "lg:h-[65vh]"];
                        const alignments = ["lg:self-start", "lg:self-center", "lg:self-end"];
                        const aspectRatios = ["aspect-[3/4]", "aspect-[4/5]", "aspect-square", "aspect-[2/3]", "aspect-[4/5]"];

                        const layoutHeight = heights[i % heights.length];
                        const layoutAlign = alignments[i % alignments.length];
                        const layoutAspect = aspectRatios[i % aspectRatios.length];

                        // Add massive negative space occasionally
                        const layoutMargin = i % 4 === 0 ? "lg:mr-64" : "lg:mr-0";

                        return (
                            <div
                                key={i}
                                className={`portfolio-item relative flex-shrink-0 w-full mb-16 lg:mb-0 lg:w-auto ${layoutHeight} ${layoutAlign} ${layoutMargin} group cursor-pointer`}
                                data-cursor="photo"
                            >
                                <div className={`relative w-full h-full ${layoutAspect} overflow-hidden border border-white/5 bg-white/5`}>
                                    <Image
                                        src={photo}
                                        alt={`Portfolio Lookbook ${i + 1}`}
                                        fill
                                        className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:filter group-hover:brightness-110"
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        loading={i < 4 ? "eager" : "lazy"}
                                    />

                                    {/* CSS Aberration/Glitch effect on hover (simulating WebGL Distortion as requested in extras to save GPU) */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-screen shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
                                </div>

                                <p className="mt-4 text-[10px] font-sans text-white/30 tracking-[0.2em] font-light">
                                    {String(i + 1).padStart(3, '0')} // E DI T O RI A L //
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
