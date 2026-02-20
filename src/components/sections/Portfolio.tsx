"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { photos } from "@/lib/photos";
import Image from "next/image";
import Lightbox from "./Lightbox";
import { useTranslations } from "next-intl";

export default function Portfolio() {
    const t = useTranslations("portfolio");
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    // Transform vertical scroll into horizontal movement
    const x = useTransform(scrollYProgress, [0, 1], ["10%", "-85%"]);

    const [activePhoto, setActivePhoto] = useState<number | null>(null);

    const handleNext = () => {
        setActivePhoto((prev) => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0));
    };

    const handlePrev = () => {
        setActivePhoto((prev) => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1));
    };

    return (
        <section id="portfolio" className="relative bg-black min-h-[300vh]" ref={targetRef}>
            <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center bg-near-black">
                {/* Header */}
                <div className="absolute top-24 md:top-32 left-8 md:left-24 z-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-serif text-white tracking-widest"
                    >
                        {t("title")}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-platinum/60 font-sans tracking-[0.3em] uppercase text-xs sm:text-sm mt-4"
                    >
                        {t("subtitle")}
                    </motion.p>
                </div>

                {/* Horizontal Track Container */}
                <motion.div style={{ x }} className="flex items-center space-x-8 md:space-x-16 px-16 lg:px-[10vw]">
                    {photos.map((photo, i) => (
                        <PhotoCard key={i} photo={photo} index={i} onClick={() => setActivePhoto(i)} />
                    ))}
                </motion.div>

                {/* Lightbox */}
                <Lightbox
                    isOpen={activePhoto !== null}
                    photoUrl={activePhoto !== null ? photos[activePhoto] : ""}
                    onClose={() => setActivePhoto(null)}
                    onNext={handleNext}
                    onPrev={handlePrev}
                />
            </div>
        </section>
    );
}

function PhotoCard({ photo, index, onClick }: { photo: string; index: number; onClick: () => void }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isCentered, setIsCentered] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Checking if the image is roughly in the center third of the viewport
                if (entry.boundingClientRect.left > window.innerWidth * 0.2 && entry.boundingClientRect.right < window.innerWidth * 0.8) {
                    setIsCentered(true);
                } else {
                    setIsCentered(false);
                }
            },
            {
                root: null,
                threshold: [0, 0.5, 1],
                rootMargin: "0px -20% 0px -20%"
            }
        );

        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <motion.div
            ref={cardRef}
            className={`relative cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex-shrink-0 ${isCentered ? "scale-100 z-10 mx-8 md:mx-16 brightness-110" : "scale-[0.6] opacity-60 z-0 grayscale-[50%]"
                }`}
            style={{
                width: isCentered ? "350px" : "280px",
                height: isCentered ? "550px" : "400px",
                boxShadow: isCentered ? "0 25px 50px -12px rgba(0, 0, 0, 0.8)" : "none",
            }}
            onClick={onClick}
            whileHover={{ scale: isCentered ? 1.05 : 0.65 }}
        >
            <Image
                src={photo}
                alt={`Portfolio ${index}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 350px"
                loading="lazy"
            />
            {/* Golden accent border on hover/centered */}
            <div
                className={`absolute inset-0 border border-t-[1px] border-l-[1px] transition-colors duration-500 pointer-events-none ${isCentered ? "border-white/20" : "border-transparent"
                    }`}
            />
        </motion.div>
    );
}
