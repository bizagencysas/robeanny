"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxProps {
    isOpen: boolean;
    photoUrl: string;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
    currentIndex: number;
    totalPhotos: number;
}

export default function Lightbox({ isOpen, photoUrl, onClose, onNext, onPrev, currentIndex, totalPhotos }: LightboxProps) {

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") onNext();
            if (e.key === "ArrowLeft") onPrev();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose, onNext, onPrev]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center touchscreen-none"
                >
                    {/* Top Bar */}
                    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 mix-blend-difference">
                        <span className="text-white font-sans text-sm tracking-[0.2em]">
                            {currentIndex + 1} / {totalPhotos}
                        </span>
                        <button
                            onClick={onClose}
                            className="w-12 h-12 flex items-center justify-center rounded-full text-white hover:bg-white/10 hover:rotate-90 transition-all duration-300"
                        >
                            <X size={24} strokeWidth={1} />
                        </button>
                    </div>

                    {/* Navigation Controls */}
                    <button
                        onClick={onPrev}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300 z-10"
                    >
                        <ChevronLeft size={32} strokeWidth={1} />
                    </button>

                    <button
                        onClick={onNext}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300 z-10"
                    >
                        <ChevronRight size={32} strokeWidth={1} />
                    </button>

                    {/* Image Container */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-[90vw] h-[85vh] md:w-[80vw] md:h-[90vh]"
                        onClick={onNext} // clicking image also goes next
                    >
                        <Image
                            src={photoUrl}
                            alt="Lightbox View"
                            fill
                            className="object-contain"
                            sizes="100vw"
                            priority
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
