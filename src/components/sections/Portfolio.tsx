"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { domainPhotos } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

export default function Portfolio() {
    const containerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Elegant staggered fade-up for each masonry item
            const items = gsap.utils.toArray(".portfolio-image-wrapper");
            items.forEach((item: any) => {
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
            const images = gsap.utils.toArray(".portfolio-image");
            images.forEach((img: any) => {
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
            <div className="flex flex-col items-center mb-24">
                <h2 className="editorial-title text-5xl md:text-8xl lg:text-[10rem] text-center tracking-tighter">
                    PORTFOLIO
                </h2>
                <p className="editorial-body text-xs md:text-sm tracking-[0.4em] uppercase mt-4 text-black/50">
                    Professional Works / Vol. 1
                </p>
            </div>

            {/* Editorial Masonry/Staggered Layout 
          Using columns in CSS to create an authentic masonry look
          that flows vertically without horizontal scrolling.
      */}
            <div className="w-full max-w-[1600px] mx-auto columns-1 md:columns-2 lg:columns-3 gap-6 md:gap-8 space-y-6 md:space-y-8">
                {domainPhotos.map((photo, i) => {
                    // Add some editorial empty space occasionally by injecting a block quote
                    if (i === 12) {
                        return (
                            <div key="quote-1" className="break-inside-avoid my-16 py-12 px-8 bg-platinum/30 border-l border-black">
                                <p className="editorial-title text-3xl md:text-4xl text-black leading-tight italic">
                                    "Fashion is not something that exists in dresses only."
                                </p>
                            </div>
                        );
                    }
                    if (i === 28) {
                        return (
                            <div key="quote-2" className="break-inside-avoid my-16 py-12 px-8 flex flex-col justify-center items-center h-[400px]">
                                <h3 className="editorial-title text-7xl md:text-9xl text-black/10">ART</h3>
                                <h3 className="editorial-title text-7xl md:text-9xl text-black/10 -mt-8">FORM</h3>
                            </div>
                        );
                    }

                    // Randomize aspect ratios slightly to enhance the masonry effect
                    const isWide = i % 7 === 0;
                    const isTall = i % 3 === 0 && !isWide;
                    const aspectRatioClass = isWide ? "aspect-[4/3]" : isTall ? "aspect-[2/3]" : "aspect-[3/4]";

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
                                    className="portfolio-image object-cover scale-[1.15] transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.2]"
                                    loading={i < 4 ? "eager" : "lazy"}
                                />
                            </div>
                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <p className="editorial-body text-white text-[10px] uppercase tracking-widest">
                                    Shot {String(i + 1).padStart(3, '0')}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
