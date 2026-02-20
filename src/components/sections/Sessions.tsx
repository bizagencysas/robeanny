"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { cloudinaryPhotos } from "@/lib/data";
import Lightbox from "@/components/ui/Lightbox";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Sessions() {
    const [activePhoto, setActivePhoto] = useState<number | null>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null);

    const handleNext = () => setActivePhoto((prev) => (prev !== null && prev < cloudinaryPhotos.length - 1 ? prev + 1 : 0));
    const handlePrev = () => setActivePhoto((prev) => (prev !== null && prev > 0 ? prev - 1 : cloudinaryPhotos.length - 1));

    const openLightbox = (index: number) => {
        setActivePhoto(index % cloudinaryPhotos.length);
    };

    // Use only the distinct photos, the user didn't want the fake infinite loop.
    // They want a specific number of high-quality items they can scroll through.
    const carouselPhotos = cloudinaryPhotos;

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (!sectionRef.current || !carouselRef.current) return;

            // Calculate the total horizontal distance the carousel needs to move to reveal all items
            const totalWidth = carouselRef.current.scrollWidth;
            const viewportWidth = window.innerWidth;
            const scrollDistance = totalWidth - viewportWidth;

            // Create the high-end pinned horizontal scroll
            gsap.to(carouselRef.current, {
                x: -scrollDistance,
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top", // When section hits top of viewport
                    end: `+=${scrollDistance}`, // Pin for the duration of the scroll length
                    pin: true,
                    scrub: 1, // Add 1 second of lag for buttery smooth interpolation
                    invalidateOnRefresh: true, // Recalculate on resize
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="w-full bg-[#f4f4f4] text-black h-screen relative overflow-hidden border-y border-black/5 flex flex-col justify-center">

            {/* Massive Overlapping Header */}
            <div className="absolute top-12 left-0 w-full flex flex-col items-center justify-center p-4 z-0 pointer-events-none">
                <h2 className="editorial-title text-[25vw] md:text-[20vw] lg:text-[18vw] text-black/5 whitespace-nowrap tracking-tighter select-none">
                    SESIONES
                </h2>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col items-center mt-6">
                    <h3 className="editorial-title text-4xl md:text-6xl text-black">
                        MIRA EL <span className="italic font-light">SET</span>
                    </h3>
                </div>
            </div>

            {/* GSAP Powered Pinned Horizontal Carousel */}
            <div className="w-full mt-24 md:mt-32 px-4 md:px-12 relative z-10 w-max overflow-visible">
                <div
                    ref={carouselRef}
                    className="flex gap-4 md:gap-8 px-4 w-max"
                >
                    {carouselPhotos.map((url, i) => (
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
