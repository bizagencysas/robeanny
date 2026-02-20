"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { photos } from "@/lib/photos";
import Image from "next/image";
import Lightbox from "./Lightbox";
import { useTranslations } from "next-intl";

export default function Portfolio() {
    const t = useTranslations("portfolio");
    const [activePhoto, setActivePhoto] = useState<number | null>(null);

    // Limit portfolio to the first 11 photos, the rest are for Sessions
    const portfolioPhotos = photos.slice(0, 11);

    const handleNext = () => {
        setActivePhoto((prev) => (prev !== null && prev < portfolioPhotos.length - 1 ? prev + 1 : 0));
    };

    const handlePrev = () => {
        setActivePhoto((prev) => (prev !== null && prev > 0 ? prev - 1 : portfolioPhotos.length - 1));
    };

    return (
        <section id="portfolio" className="py-24 md:py-32 bg-near-black relative min-h-screen">
            <div className="container mx-auto px-6 mb-16 md:mb-24 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-serif text-white tracking-widest uppercase mb-4"
                >
                    {t("title")}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-platinum/60 font-sans tracking-[0.3em] uppercase text-xs sm:text-sm"
                >
                    {t("subtitle")}
                </motion.p>
            </div>

            {/* Magnetic Repulsion Masonry Grid */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6 px-4 md:px-8 max-w-[2000px] mx-auto">
                {portfolioPhotos.map((photo, i) => (
                    <PhotoCard key={i} photo={photo} index={i} onClick={() => setActivePhoto(i)} />
                ))}
            </div>

            {/* Lightbox */}
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

function PhotoCard({ photo, index, onClick }: { photo: string; index: number; onClick: () => void }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(true); // Default strictly mobile to prevent SSR hydration mismatch on desktop

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.5 });
    const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.5 });

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();

        const handleMove = (e: MouseEvent) => {
            if (!cardRef.current || isMobile) return;
            const rect = cardRef.current.getBoundingClientRect();
            const cardCenterX = rect.left + rect.width / 2;
            const cardCenterY = rect.top + rect.height / 2;

            const distanceX = e.clientX - cardCenterX;
            const distanceY = e.clientY - cardCenterY;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            // Radius in pixels where the repulsion starts
            const repulsionRadius = 400;
            const maxRepulsion = 60; // Max distance to shift

            if (distance < repulsionRadius) {
                const force = Math.pow((repulsionRadius - distance) / repulsionRadius, 2); // easing
                x.set(-(distanceX / distance) * force * maxRepulsion);
                y.set(-(distanceY / distance) * force * maxRepulsion);
            } else {
                x.set(0);
                y.set(0);
            }
        };

        const handleLeave = () => {
            x.set(0);
            y.set(0);
        };

        if (!isMobile) {
            window.addEventListener("mousemove", handleMove);
            window.addEventListener("mouseleave", handleLeave);
        }

        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseleave", handleLeave);
        };
    }, [x, y, isMobile]);

    return (
        <motion.div
            ref={cardRef}
            className="relative cursor-pointer w-full mb-4 md:mb-6 break-inside-avoid overflow-hidden group rounded-sm"
            style={{
                x: isMobile ? 0 : springX,
                y: isMobile ? 0 : springY
            }}
            onClick={onClick}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "50px" }}
            transition={{ duration: 0.6, delay: index * 0.05 }}
        >
            <div className="relative w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                style={{
                    // To give varying heights for masonry effect
                    aspectRatio: index % 3 === 0 ? "3/4" : index % 2 === 0 ? "4/5" : "1/1"
                }}
            >
                <Image
                    src={photo}
                    alt={`Portfolio ${index}`}
                    fill
                    className="object-cover grayscale-[70%] group-hover:grayscale-0 transition-all duration-700"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    loading="lazy"
                />
            </div>
            {/* Minimal overlay effect */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
            <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 transition-colors duration-500 pointer-events-none" />
        </motion.div>
    );
}
