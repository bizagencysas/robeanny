"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { domainPhotos } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

export default function Portfolio() {
    const containerRef = useRef<HTMLElement>(null);
    const [visibleCount, setVisibleCount] = useState(6);

    const loadMorePhotos = () => {
        setVisibleCount(domainPhotos.length);
        // Give DOM time to paint the new items before re-calculating ScrollTriggers
        setTimeout(() => {
            ScrollTrigger.refresh();

            // Animate the newly added items
            const newItems = gsap.utils.toArray(".portfolio-image-wrapper:not(.gsap-revealed)");
            newItems.forEach((item: any) => {
                item.classList.add("gsap-revealed");
                gsap.fromTo(
                    item,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1.2,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: item,
                            start: "top 85%",
                        }
                    }
                );
            });

            // Bind parallax to new images
            const newImages = gsap.utils.toArray(".portfolio-image:not(.gsap-parallaxed)");
            newImages.forEach((img: any) => {
                img.classList.add("gsap-parallaxed");
                gsap.to(img, {
                    yPercent: 15,
                    ease: "none",
                    scrollTrigger: {
                        trigger: img.parentElement,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true,
                    }
                });
            });
        }, 100);
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Elegant staggered fade-up for each masonry item
            const items = gsap.utils.toArray(".portfolio-image-wrapper:not(.gsap-revealed)");
            items.forEach((item: any) => {
                item.classList.add("gsap-revealed");
                gsap.fromTo(
                    item,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1.2,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: item,
                            start: "top 85%",
                        }
                    }
                );
            });

            // Subtle parallax on the images themselves inside their wrappers
            const images = gsap.utils.toArray(".portfolio-image:not(.gsap-parallaxed)");
            images.forEach((img: any) => {
                img.classList.add("gsap-parallaxed");
                gsap.to(img, {
                    yPercent: 15,
                    ease: "none",
                    scrollTrigger: {
                        trigger: img.parentElement,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true,
                    }
                });
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section
            id="portfolio"
            ref={containerRef}
            className="bg-white text-black w-full min-h-screen py-24 px-4 md:px-8 relative"
        >
            {/* Massive Overlapping Header matching 'About' style */}
            <div className="relative w-full flex flex-col items-center justify-center mb-32 h-[30vh] overflow-hidden">
                <h2 className="editorial-title text-[25vw] md:text-[20vw] lg:text-[18vw] text-black/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap tracking-tighter select-none z-0">
                    PORTAFOLIO
                </h2>
                <div className="relative z-10 flex flex-col items-center mt-12">
                    <h3 className="editorial-title text-4xl md:text-6xl text-black">
                        LA <span className="italic font-light">GALERÍA</span>
                    </h3>
                    <p className="editorial-body text-[10px] md:text-xs tracking-[0.4em] uppercase mt-4 text-black/60">
                        Selección de Trabajos / Vol. 1
                    </p>
                </div>
            </div>

            {/* Editorial Masonry/Staggered Layout 
          Using columns in CSS to create an authentic masonry look
          that flows vertically without horizontal scrolling.
      */}
            <div className="w-full max-w-[1600px] mx-auto columns-1 md:columns-2 lg:columns-3 gap-6 md:gap-8 space-y-6 md:space-y-8">
                {domainPhotos.slice(0, visibleCount).map((photo, i) => {
                    // Add some editorial empty space occasionally by injecting a block quote
                    if (i === 12) {
                        return (
                            <div key="quote-1" className="break-inside-avoid my-16 py-12 px-8 bg-platinum/30 border-l border-black">
                                <p className="editorial-title text-3xl md:text-4xl text-black leading-tight italic">
                                    "La moda no es algo que exista solo en los vestidos."
                                </p>
                            </div>
                        );
                    }
                    if (i === 28) {
                        return (
                            <div key="quote-2" className="break-inside-avoid my-16 py-12 px-8 flex flex-col justify-center items-center h-[400px]">
                                <h3 className="editorial-title text-7xl md:text-9xl text-black/10">ARTE</h3>
                                <h3 className="editorial-title text-7xl md:text-9xl text-black/10 -mt-8">PURO</h3>
                            </div>
                        );
                    }

                    // Randomize aspect ratios slightly to enhance the masonry effect
                    // Force the very first image to object-top to prevent head cropping on mobile
                    const isWide = i % 7 === 0;
                    const isTall = i % 3 === 0 && !isWide;
                    const aspectRatioClass = isWide ? "aspect-[4/3]" : isTall ? "aspect-[2/3]" : "aspect-[3/4]";
                    const objectPositionClass = i === 0 ? "object-[center_top]" : "object-center";

                    return (
                        <div
                            key={i}
                            className="portfolio-image-wrapper relative break-inside-avoid w-full group cursor-pointer overflow-hidden bg-platinum/20"
                            data-cursor="view"
                        >
                            <div className={`relative w-full ${aspectRatioClass} overflow-hidden`}>
                                <Image
                                    src={photo}
                                    alt={`Editorial Shot ${i + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className={`portfolio-image object-cover ${objectPositionClass} scale-[1.15] transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.2]`}
                                    loading={i < 4 ? "eager" : "lazy"}
                                />
                            </div>
                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <p className="editorial-body text-white text-[10px] uppercase tracking-widest">
                                    Toma {String(i + 1).padStart(3, '0')}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {visibleCount < domainPhotos.length && (
                <div className="w-full flex justify-center mt-24">
                    <button
                        onClick={loadMorePhotos}
                        className="editorial-body text-xs uppercase tracking-[0.3em] font-bold border-b border-black pb-1 hover:text-black/50 transition-colors"
                    >
                        EXPLORAR GALERÍA
                    </button>
                </div>
            )}
        </section>
    );
}
