"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Undo2 } from "lucide-react";

// The grand 32 photo array provided by the user
const sessionPhotos = [
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417111/IMG_8328_ihc0wa.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417110/IMG_8326_sicido.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417110/IMG_8198_vdr3e3.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417109/IMG_8187_cw37kz.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417109/IMG_8186_grkeus.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417108/IMG_8185_srypuy.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417108/IMG_8184_ahjodd.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417107/IMG_8183_1_qmweju.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417104/IMG_8143_cho80l.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417104/IMG_7988_frijzy.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417103/IMG_7986_riwibv.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417103/IMG_7984_wsomwy.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417102/IMG_7979_b2jadd.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417101/IMG_7977_xcehvm.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417100/IMG_7976_vdgarp.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417099/IMG_7934_mmboyv.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417100/IMG_7975_grbbjs.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417098/IMG_7928_goj0gq.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417098/D73F63F9-8FBF-456C-9F78-CF1244A5DF2B_qrlxln.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417098/D59A1D62-900F-48F7-9D32-04F3D204BAE7_itdt4z.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417091/014A7393-2_oml4hs.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417090/014A7231-2_gmu7qr.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417089/014A7221-2_d6fp7j.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417089/014A7214-2_odmkgj.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417086/014A7171-2_o7njzf.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417086/014A7185-2_uklh9h.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417086/014A7189-2_vt6nq7.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417085/014A7133-2_wfhu0j.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417060/E11BADA7-67E3-49C8-BE01-7A7403E25E93_wtagik.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417060/B7E2B3C1-9F85-489E-AF93-473108584CDB_cem0cj.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417059/3C5E78F9-B395-4736-97A9-0164B986D9A0_p7bfxz.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417059/0CC88888-0E62-4856-8FA9-BDF0B54389DC_fedulk.jpg"
];

const SWIPE_THRESHOLD = 50;

export default function Sessions() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [exitX, setExitX] = useState(0);

    // Filter out cards we've already swiped past
    const remainingCards = sessionPhotos.slice(currentIndex);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        // If we dragged past the threshold in either direction
        if (info.offset.x > SWIPE_THRESHOLD || info.offset.x < -SWIPE_THRESHOLD) {
            // Calculate which direction it flew
            const flyAwayDistance = info.offset.x > 0 ? window.innerWidth : -window.innerWidth;
            setExitX(flyAwayDistance);
            // Move to next card (if not at the end)
            if (currentIndex < sessionPhotos.length - 1) {
                setCurrentIndex((prev) => prev + 1);
            }
        }
    };

    const handleUndo = () => {
        if (currentIndex > 0) {
            // Come back from the left magically
            setExitX(-window.innerWidth);
            setCurrentIndex((prev) => prev - 1);
        }
    };

    return (
        <section className="relative w-full h-[100svh] min-h-[700px] bg-black text-white flex flex-col items-center justify-center overflow-hidden">

            {/* Background massive title */}
            <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] md:text-[20vw] lg:text-[18vw] font-serif text-white/5 whitespace-nowrap tracking-tighter select-none pointer-events-none z-0">
                SESIONES
            </h2>

            {/* The Stack Renderer */}
            <div className="relative w-[85vw] md:w-[45vw] lg:w-[30vw] h-[65vh] max-h-[800px] z-10 perspective-[1000px]">
                <AnimatePresence initial={false}>
                    {remainingCards.map((url, i) => {
                        // "index" here is relative to the remaining array.
                        // i=0 is the top card. i=1 is the one behind it, etc.
                        const isTopCard = i === 0;

                        // Only render top card + 3 behind for performance
                        if (i > 3) return null;

                        // Math to calculate perspective effect
                        const offset = i * 2; // pixel offset downwards
                        const scale = 1 - i * 0.05; // 5% shrink per depth level
                        const zIndex = remainingCards.length - i;

                        // Generate a stable pseudo-random rotation for cards behind (-2 to +2 degrees)
                        // Using the actual currentIndex + i as seed so it stays consistent
                        const absoluteIndex = currentIndex + i;
                        const randomRotation = absoluteIndex % 2 === 0 ? (absoluteIndex % 3) : -(absoluteIndex % 3);

                        return (
                            <motion.div
                                key={url} // Unique key based on URL ensures AnimatePresence tracks it properly
                                className="absolute inset-0 w-full h-full origin-bottom rounded-sm shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden cursor-grab active:cursor-grabbing bg-zinc-900"
                                style={{ zIndex }}

                                // --- INITIAL MOUNT STATE (When a card comes back during undo) ---
                                initial={{
                                    scale,
                                    y: isTopCard ? 0 : offset * 10,
                                    rotateZ: isTopCard ? 0 : randomRotation,
                                    x: isTopCard ? exitX : 0,
                                    opacity: 0
                                }}

                                // --- ACTIVE STATE (Where it rests magically) ---
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

                                // --- EXIT STATE (When top card gets swiped away) ---
                                exit={{
                                    x: exitX,
                                    opacity: 0,
                                    rotateZ: exitX > 0 ? 15 : -15, // Rotate playfully while falling
                                    scale: 0.9,
                                    transition: { duration: 0.4, ease: "easeOut" }
                                }}

                                // --- PHYSICS TRANSITIONS ---
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 25,
                                    mass: isTopCard ? 1 : 1.5,
                                }}

                                // --- DRAG GESTURES (Only top card is draggable) ---
                                drag={isTopCard ? "x" : false}
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={1} // Allow full elastic pull in any direction
                                onDragEnd={isTopCard ? handleDragEnd : undefined}
                                whileTap={isTopCard ? { scale: 0.98, cursor: "grabbing" } : {}}
                            >
                                <Image
                                    src={url}
                                    alt={`Robeanny - Sesión Profesional ${absoluteIndex + 1}`}
                                    fill
                                    className="object-cover object-center pointer-events-none"
                                    sizes="(max-width: 768px) 85vw, (max-width: 1200px) 45vw, 30vw"
                                    priority={i < 2} // Preload top two cards
                                    draggable={false} // Disable native HTML image dragging so Framer Motion handles it
                                />
                            </motion.div>
                        );
                    }).reverse()} {/* Reverse so the map loops backwards and paints top card last (highest z-index effectively handled implicitly by motion.div style though) */}
                </AnimatePresence>
            </div>

            {/* Controls & Counter */}
            <div className="absolute bottom-12 left-0 w-full px-8 md:px-16 flex justify-between items-center z-20">

                {/* Undo Button */}
                <button
                    onClick={handleUndo}
                    disabled={currentIndex === 0}
                    className={`group flex items-center justify-center w-12 h-12 rounded-full border border-white/20 bg-black/50 backdrop-blur-md transition-all duration-300 ${currentIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-white hover:text-black cursor-pointer"
                        }`}
                    aria-label="Volver a foto anterior"
                >
                    <Undo2 size={18} className="transition-transform group-hover:-translate-x-1" />
                </button>

                {/* Counter */}
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

            {/* Instructional Hint (Desktop Only) */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 hidden md:flex opacity-50 pointer-events-none">
                <p className="font-sans text-[10px] tracking-[0.3em] uppercase">Arrastra para explorar</p>
            </div>

        </section>
    );
}
