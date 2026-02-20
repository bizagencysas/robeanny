"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { cloudinaryPhotos } from "@/lib/data";
import Lightbox from "@/components/ui/Lightbox";
import gsap from "gsap";

export default function Sessions() {
    const [activePhoto, setActivePhoto] = useState<number | null>(null);
    const marqueeRef = useRef<HTMLDivElement>(null);

    const handleNext = () => setActivePhoto((prev) => (prev !== null && prev < cloudinaryPhotos.length - 1 ? prev + 1 : 0));
    const handlePrev = () => setActivePhoto((prev) => (prev !== null && prev > 0 ? prev - 1 : cloudinaryPhotos.length - 1));

    const openLightbox = (index: number) => {
        setActivePhoto(index % cloudinaryPhotos.length);
    };

    // Duplicate array multiple times to ensure the container is wide enough for a continuous loop
    // GSAP needs the content to be wider than the viewport to loop properly.
    const marqueePhotos = [...cloudinaryPhotos, ...cloudinaryPhotos, ...cloudinaryPhotos];

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (!marqueeRef.current) return;

            // Get the total width of one full set of photos (1/3 of the total scroll width)
            // We use clientWidth/scrollWidth calculations to make it perfectly responsive
            const totalWidth = marqueeRef.current.scrollWidth;
            const thirdWidth = totalWidth / 3;

            // Create a seamless infinite tween using GSAP
            // It pans left by exactly one set's width, then instantly resets to 0 (seamless loop)
            const tween = gsap.to(marqueeRef.current, {
                x: -thirdWidth,
                ease: "none",
                duration: 60, // Adjust this for speed (lower = faster)
                repeat: -1,
                modifiers: {
                    x: gsap.utils.unitize((x) => parseFloat(x) % thirdWidth) // The magic modulo that makes it seamless
                }
            });

            // Premium UX: Pause on hover softly
            const container = marqueeRef.current.parentElement;
            if (container) {
                container.addEventListener("mouseenter", () => gsap.to(tween, { timeScale: 0.1, duration: 1, ease: "power2.out" }));
                container.addEventListener("mouseleave", () => gsap.to(tween, { timeScale: 1, duration: 1, ease: "power2.in" }));
            }

        }, marqueeRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className="w-full bg-[#f4f4f4] text-black py-24 md:py-32 relative overflow-hidden border-y border-black/5">

            <div className="px-6 md:px-12 flex flex-col mb-16">
                <h2 className="editorial-title text-4xl md:text-7xl">Sesiones</h2>
            </div>

            {/* GSAP Powered Infinite Horizontal Ticker */}
            <div className="w-full overflow-hidden relative cursor-grab active:cursor-grabbing group">

                {/* Soft edge gradients to blend the marquee entering/exiting gracefully */}
                <div className="absolute top-0 bottom-0 left-0 w-16 md:w-40 bg-gradient-to-r from-[#f4f4f4] to-transparent z-10 pointer-events-none" />
                <div className="absolute top-0 bottom-0 right-0 w-16 md:w-40 bg-gradient-to-l from-[#f4f4f4] to-transparent z-10 pointer-events-none" />

                <div
                    ref={marqueeRef}
                    className="flex gap-4 md:gap-8 px-4 w-max"
                >
                    {marqueePhotos.map((url, i) => (
                        <div
                            key={i}
                            className="relative flex-shrink-0 w-[60vw] md:w-[35vw] lg:w-[22vw] aspect-[3/4] cursor-pointer"
                            onClick={() => openLightbox(i)}
                            data-cursor="view"
                        >
                            <Image
                                src={url}
                                alt={`Sesión ${i + 1}`}
                                fill
                                className="object-cover object-center grayscale-[0.2] transition-all duration-700 hover:grayscale-0 hover:scale-[1.02]"
                                sizes="(max-width: 768px) 60vw, (max-width: 1200px) 35vw, 22vw"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/5 hover:bg-transparent transition-colors duration-500" />
                        </div>
                    ))}
                </div>
            </div>

            <Lightbox
                isOpen={activePhoto !== null}
                photoUrl={activePhoto !== null ? cloudinaryPhotos[activePhoto] : ""}
                currentIndex={activePhoto || 0}
                totalPhotos={cloudinaryPhotos.length}
                onClose={() => setActivePhoto(null)}
                onNext={handleNext}
                onPrev={handlePrev}
            />
        </section>
    );
}
