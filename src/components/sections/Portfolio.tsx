"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { photos } from "@/lib/photos";
import Image from "next/image";
import Lightbox from "./Lightbox";
import { useTranslations } from "next-intl";

export default function Portfolio() {
    const t = useTranslations("portfolio");
    const [activePhoto, setActivePhoto] = useState<number | null>(null);
    const containerRef = useRef<HTMLElement>(null);
    const [isMobile, setIsMobile] = useState(true);

    const portfolioPhotos = photos.slice(0, 11);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Scroll hijacking logic for Desktop
    const { scrollYProgress } = useScroll({
        target: containerRef,
    });

    const xTransform = useTransform(scrollYProgress, [0, 1], ["0%", "-80%"]);

    const handleNext = () => setActivePhoto((prev) => (prev !== null && prev < portfolioPhotos.length - 1 ? prev + 1 : 0));
    const handlePrev = () => setActivePhoto((prev) => (prev !== null && prev > 0 ? prev - 1 : portfolioPhotos.length - 1));

    return (
        <section
            id="portfolio"
            ref={containerRef}
            className="bg-black relative"
            style={{ height: isMobile ? "auto" : "400vh" }} // Give room to scroll hijack
        >
            <div className={`w-full ${isMobile ? "py-24" : "h-screen sticky top-0 flex items-center overflow-hidden"}`}>

                {/* V2 Section Watermark Title (Background) */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full pointer-events-none flex justify-center z-0">
                    <h2 className="text-[25vw] font-serif text-white/5 tracking-widest uppercase mix-blend-screen select-none whitespace-nowrap overflow-hidden">
                        {t("title")}
                    </h2>
                </div>

                <motion.div
                    className="flex lg:items-center relative z-10 w-full"
                    style={{ x: isMobile ? 0 : xTransform }}
                >
                    {/* Mobile Wrapper: Vertical scroll Native. Desktop Wrapper: Horizontal Scroll via Transform */}
                    <div className={`flex ${isMobile ? "flex-col px-4 space-y-8" : "flex-row gap-0 lg:ml-[10vw]"}`}>
                        {portfolioPhotos.map((photo, i) => (
                            <PhotoItem
                                key={i}
                                photo={photo}
                                index={i}
                                isMobile={isMobile}
                                onClick={() => setActivePhoto(i)}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>

            <Lightbox
                isOpen={activePhoto !== null}
                photoUrl={activePhoto !== null ? portfolioPhotos[activePhoto] : ""}
                onClose={() => setActivePhoto(null)}
                onNext={handleNext}
                onPrev={handlePrev}
            />
        </section>
    );
}

function PhotoItem({ photo, index, isMobile, onClick }: { photo: string; index: number; isMobile: boolean; onClick: () => void }) {
    // V2 Editorial Rhythm
    // Asymmetric sizing array logic
    const heights = ["70vh", "40vh", "80vh", "25vh", "50vh", "65vh"];
    const margins = ["mr-32", "mr-12", "mr-48", "mr-20", "mr-12", "mr-[30vw]"]; // Silence gaps
    const align = ["items-start", "items-center", "items-end"]; // Vertical jitter
    const aspectRatios = ["3/4", "4/5", "1/1", "2/3", "4/5", "3/4"];

    const h = isMobile ? "auto" : heights[index % heights.length];
    const m = isMobile ? "mb-0" : margins[index % margins.length];
    const a = isMobile ? "" : align[index % align.length];
    const ar = aspectRatios[index % aspectRatios.length];

    return (
        <div
            className={`flex flex-col justify-center shrink-0 ${m} ${a}`}
            style={!isMobile ? { height: '100vh' } : {}}
            data-cursor="photo"
        >
            <div
                className="relative overflow-hidden cursor-pointer group"
                style={{ height: isMobile ? "auto" : h, width: isMobile ? "100%" : "auto", aspectRatio: isMobile ? "3/4" : ar }}
                onClick={onClick}
            >
                {/* Due to Next/Vercel optimization problems with 11 isolated WebGL canvases at once on Safari Mobile, 
                    we implement the requested "Glitch CSS" equivalent for performance and parity since Canvas can't be easily lazy-loaded */}
                <div
                    className="relative w-full h-full transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                >
                    <Image
                        src={photo}
                        alt={`Portfolio ${index}`}
                        fill
                        className="object-cover grayscale-[80%] brightness-75 transition-all duration-700 group-hover:grayscale-0 group-hover:brightness-100"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        loading={index < 2 ? "eager" : "lazy"}
                    />

                    {/* CSS Elegance Glitch Overlay on Hover */}
                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="absolute inset-0 mix-blend-screen bg-[url('/noise.png')] opacity-20" />
                        <div className="absolute inset-0 backdrop-blur-[2px] transition-all duration-700 mask-image-glitch" />
                        <div className="absolute top-0 bottom-0 left-[-2px] w-full bg-[#f00] mix-blend-screen opacity-[0.15] translate-x-1 group-hover:animate-glitch-r" />
                        <div className="absolute top-0 bottom-0 left-[2px] w-full bg-[#00f] mix-blend-screen opacity-[0.15] -translate-x-1 group-hover:animate-glitch-l" />
                    </div>
                </div>
            </div>

            {!isMobile && (
                <div className="mt-4 text-xs font-sans text-platinum/30 tracking-[0.2em]">0{index + 1}</div>
            )}
        </div>
    );
}
