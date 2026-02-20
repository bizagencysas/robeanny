"use client";

import { useState } from "react";
import Image from "next/image";
import { cloudinaryPhotos } from "@/lib/data";
import Lightbox from "@/components/ui/Lightbox";

export default function Sessions() {
    const [activePhoto, setActivePhoto] = useState<number | null>(null);

    const handleNext = () => setActivePhoto((prev) => (prev !== null && prev < cloudinaryPhotos.length - 1 ? prev + 1 : 0));
    const handlePrev = () => setActivePhoto((prev) => (prev !== null && prev > 0 ? prev - 1 : cloudinaryPhotos.length - 1));

    const openLightbox = (index: number) => {
        setActivePhoto(index % cloudinaryPhotos.length);
    };

    // Duplicate for seamless infinite scrolling marquee
    const marqueePhotos = [...cloudinaryPhotos, ...cloudinaryPhotos];

    return (
        <section className="w-full bg-[#f4f4f4] text-black py-24 md:py-32 relative overflow-hidden border-y border-black/5">

            <div className="px-6 md:px-12 flex flex-col mb-16">
                <h2 className="editorial-title text-4xl md:text-7xl">Sesiones</h2>
            </div>

            {/* 
        Native CSS Infinite Marquee
        Duplicated items array + flex max-content + CSS keyframes translation
      */}
            <div className="w-full overflow-hidden relative">
                {/* Soft edge gradients to blend the marquee entering/exiting */}
                <div className="absolute top-0 bottom-0 left-0 w-12 md:w-32 bg-gradient-to-r from-[#f4f4f4] to-transparent z-10 pointer-events-none" />
                <div className="absolute top-0 bottom-0 right-0 w-12 md:w-32 bg-gradient-to-l from-[#f4f4f4] to-transparent z-10 pointer-events-none" />

                <div className="animate-marquee gap-4 md:gap-8 px-4 flex">
                    {marqueePhotos.map((url, i) => (
                        <div
                            key={i}
                            className="relative flex-shrink-0 w-[60vw] md:w-[35vw] lg:w-[22vw] aspect-[3/4] cursor-pointer group"
                            onClick={() => openLightbox(i)}
                            data-cursor="view"
                        >
                            <Image
                                src={url}
                                alt={`Session Post ${i + 1}`}
                                fill
                                className="object-cover object-center grayscale-[0.2] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-[1.02]"
                                sizes="(max-width: 768px) 60vw, (max-width: 1200px) 35vw, 22vw"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
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
