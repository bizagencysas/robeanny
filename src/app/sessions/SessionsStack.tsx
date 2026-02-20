"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Undo2 } from "lucide-react";
import { sessionPhotos } from "@/lib/data";

const SWIPE_THRESHOLD = 50;

export default function SessionsStack() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [exitX, setExitX] = useState(0);

    const remainingCards = sessionPhotos.slice(currentIndex);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.x > SWIPE_THRESHOLD || info.offset.x < -SWIPE_THRESHOLD) {
            const flyAwayDistance = info.offset.x > 0 ? window.innerWidth : -window.innerWidth;
            setExitX(flyAwayDistance);
            if (currentIndex < sessionPhotos.length - 1) {
                setCurrentIndex((prev) => prev + 1);
            }
        }
    };

    const handleUndo = () => {
        if (currentIndex > 0) {
            setExitX(-window.innerWidth);
            setCurrentIndex((prev) => prev - 1);
        }
    };

    return (
        <section className="relative w-full h-[100svh] min-h-[700px] bg-black text-white flex flex-col items-center justify-center overflow-hidden">
            {/* Background massive title */}
            <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] md:text-[20vw] lg:text-[18vw] font-serif text-white/10 whitespace-nowrap tracking-tighter select-none pointer-events-none z-[1]">
                SESIONES
            </h2>

            {/* The Stack */}
            <div className="relative w-[85vw] md:w-[45vw] lg:w-[30vw] h-[65vh] max-h-[800px] z-10 perspective-[1000px]">
                <AnimatePresence initial={false}>
                    {remainingCards.map((url, i) => {
                        const isTopCard = i === 0;
                        if (i > 3) return null;

                        const offset = i * 2;
                        const scale = 1 - i * 0.05;
                        const zIndex = remainingCards.length - i;
                        const absoluteIndex = currentIndex + i;
                        const randomRotation = absoluteIndex % 2 === 0 ? (absoluteIndex % 3) : -(absoluteIndex % 3);

                        return (
                            <motion.div
                                key={url}
                                className={`absolute inset-0 w-full h-full origin-bottom rounded-sm shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden cursor-grab active:cursor-grabbing bg-zinc-900 ${isTopCard ? "touch-none" : ""}`}
                                style={{ zIndex }}
                                initial={{
                                    scale,
                                    y: isTopCard ? 0 : offset * 10,
                                    rotateZ: isTopCard ? 0 : randomRotation,
                                    x: isTopCard ? exitX : 0,
                                    opacity: 0
                                }}
                                animate={{
                                    scale,
                                    y: isTopCard ? 0 : offset * 10,
                                    rotateZ: isTopCard ? 0 : randomRotation,
                                    x: 0,
                                    opacity: 1 - i * 0.15,
                                    boxShadow: isTopCard
                                        ? "0 30px 60px rgba(0,0,0,0.8)"
                                        : "0 10px 20px rgba(0,0,0,0.3)"
                                }}
                                exit={{
                                    x: exitX,
                                    opacity: 0,
                                    rotateZ: exitX > 0 ? 15 : -15,
                                    scale: 0.9,
                                    transition: { duration: 0.4, ease: "easeOut" }
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 25,
                                    mass: isTopCard ? 1 : 1.5,
                                }}
                                drag={isTopCard ? "x" : false}
                                dragDirectionLock={true}
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={1}
                                onDragEnd={isTopCard ? handleDragEnd : undefined}
                                whileTap={isTopCard ? { scale: 0.98, cursor: "grabbing" } : {}}
                            >
                                <Image
                                    src={url}
                                    alt={`Robeanny - Sesión ${absoluteIndex + 1}`}
                                    fill
                                    className="object-cover object-center pointer-events-none"
                                    sizes="(max-width: 768px) 85vw, (max-width: 1200px) 45vw, 30vw"
                                    priority={i < 2}
                                    draggable={false}
                                />
                            </motion.div>
                        );
                    }).reverse()}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="absolute bottom-12 left-0 w-full px-8 md:px-16 flex justify-between items-center z-20">
                <button
                    onClick={handleUndo}
                    disabled={currentIndex === 0}
                    className={`group flex items-center justify-center w-12 h-12 rounded-full border border-white/20 bg-black/50 backdrop-blur-md transition-all duration-300 ${currentIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-white hover:text-black cursor-pointer"}`}
                    aria-label="Volver a foto anterior"
                >
                    <Undo2 size={18} className="transition-transform group-hover:-translate-x-1" />
                </button>

                <div className="flex flex-col items-end">
                    <span className="font-serif italic text-3xl md:text-4xl leading-none">
                        {String(currentIndex + 1).padStart(2, "0")}
                    </span>
                    <div className="w-12 h-[1px] bg-white/30 my-2" />
                    <span className="font-sans text-xs tracking-[0.2em] text-white/50">
                        / {sessionPhotos.length}
                    </span>
                </div>
            </div>

            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 hidden md:flex opacity-50 pointer-events-none">
                <p className="font-sans text-[10px] tracking-[0.3em] uppercase">Arrastra para explorar</p>
            </div>
        </section>
    );
}
