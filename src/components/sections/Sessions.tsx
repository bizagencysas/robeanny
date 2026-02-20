"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { cloudinaryPhotos } from "@/lib/data";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Lightbox from "@/components/ui/Lightbox";

export default function Sessions() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [activePhoto, setActivePhoto] = useState<number | null>(null);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -window.innerWidth * 0.5, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: window.innerWidth * 0.5, behavior: "smooth" });
        }
    };

    const handleNext = () => setActivePhoto((prev) => (prev !== null && prev < cloudinaryPhotos.length - 1 ? prev + 1 : 0));
    const handlePrev = () => setActivePhoto((prev) => (prev !== null && prev > 0 ? prev - 1 : cloudinaryPhotos.length - 1));

    const openLightbox = (index: number) => {
        setActivePhoto(index);
    };

    return (
        <section className="w-full bg-[#f4f4f4] text-black py-24 md:py-32 relative overflow-hidden border-y border-black/5">

            <div className="px-6 md:px-12 flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div>
                    <h2 className="editorial-title text-4xl md:text-7xl">Sesiones</h2>
                    <p className="editorial-body text-xs uppercase tracking-widest mt-4 text-black/60">
                        Selected Cloudinary Archives // {cloudinaryPhotos.length} Shots
                    </p>
                </div>

                {/* Manual Native Scroll Controls */}
                <div className="flex gap-4">
                    <button
                        onClick={scrollLeft}
                        className="w-12 h-12 bg-black text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                        aria-label="Previous photos"
                    >
                        <ChevronLeft size={20} className="stroke-[1.5]" />
                    </button>
                    <button
                        onClick={scrollRight}
                        className="w-12 h-12 bg-black text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                        aria-label="Next photos"
                    >
                        <ChevronRight size={20} className="stroke-[1.5]" />
                    </button>
                </div>
            </div>

            {/* 
        Native CSS Scroll Snap Carousel 
        Extremely performant, zero dependencies, no scroll-hijacking, fully mobile-friendly drag.
      */}
            <div
                ref={scrollContainerRef}
                className="flex gap-4 md:gap-8 overflow-x-auto px-6 md:px-12 pb-12 snap-x snap-mandatory hide-scrollbars"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {cloudinaryPhotos.map((url, i) => (
                    <div
                        key={i}
                        className="relative flex-shrink-0 w-[80vw] md:w-[40vw] lg:w-[25vw] aspect-[3/4] snap-center cursor-pointer group"
                        onClick={() => openLightbox(i)}
                        data-cursor="view"
                    >
                        <Image
                            src={url}
                            alt={`Session Post ${i + 1}`}
                            fill
                            className="object-cover object-center grayscale-[0.2] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                            sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 25vw"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
                    </div>
                ))}
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
