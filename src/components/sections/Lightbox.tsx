"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface LightboxProps {
    photoUrl: string;
    isOpen: boolean;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
}

export default function Lightbox({ photoUrl, isOpen, onClose, onNext, onPrev }: LightboxProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") onNext();
            if (e.key === "ArrowLeft") onPrev();
        };

        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose, onNext, onPrev]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                    animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
                    exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
                    onClick={onClose}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[110]"
                    >
                        <X className="w-8 h-8 md:w-10 md:h-10" />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); onPrev(); }}
                        className="absolute left-4 md:left-12 text-white/50 hover:text-white transition-colors z-[110]"
                    >
                        <ChevronLeft className="w-10 h-10 md:w-16 md:h-16" />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); onNext(); }}
                        className="absolute right-4 md:right-12 text-white/50 hover:text-white transition-colors z-[110]"
                    >
                        <ChevronRight className="w-10 h-10 md:w-16 md:h-16" />
                    </button>

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
                        animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                        exit={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                        className="relative w-[90vw] h-[85vh] md:h-[90vh] flex items-center justify-center pointer-events-none"
                        onClick={(e) => e.stopPropagation()} // prevent closing when clicking the image wrapper
                    >
                        <Image
                            src={photoUrl}
                            alt="Robeanny Portfolio Shot"
                            fill
                            className="object-contain pointer-events-auto"
                            sizes="90vw"
                            priority
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
