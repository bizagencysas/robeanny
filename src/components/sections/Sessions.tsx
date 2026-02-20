"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useAnimationFrame, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { photos } from "@/lib/photos";
import Image from "next/image";
import Lightbox from "./Lightbox";

export default function Sessions() {
    const t = useTranslations("sessions");
    const [isMobile, setIsMobile] = useState(false);
    const sceneRef = useRef<HTMLDivElement>(null);

    const isHovering = useRef(false);
    const isDragging = useRef(false);

    // Lightbox state
    const [activePhoto, setActivePhoto] = useState<number | null>(null);
    const resumeTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile(); // Run once on mount
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Filter to last 32 photos (Desktop) or 16 photos (Mobile)
    const maxPhotos = isMobile ? 16 : 32;
    // We only have ~30 photos right now in photos.ts total, so just use what we can safely
    const sessionPhotos = photos.slice(11, 11 + maxPhotos);

    // 3D Carousel state
    const rotation = useMotionValue(0);
    const smoothRotation = useSpring(rotation, { stiffness: 80, damping: 20, mass: 1 });

    // Scene Parallax (Global tilt based on mouse for Desktop)
    const mouseXPct = useMotionValue(0);
    const mouseYPct = useMotionValue(0);
    const sceneRotateX = useTransform(mouseYPct, [-0.5, 0.5], [5, -15]); // Tilt up/down
    const sceneRotateY = useTransform(mouseXPct, [-0.5, 0.5], [-10, 10]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isMobile) return;
        const xPct = e.clientX / window.innerWidth - 0.5;
        const yPct = e.clientY / window.innerHeight - 0.5;
        mouseXPct.set(xPct);
        mouseYPct.set(yPct);
    };

    useAnimationFrame((time, delta) => {
        if (!isHovering.current && !isDragging.current) {
            // Auto-rotate at a subtle constant speed
            rotation.set(rotation.get() - delta * 0.015);
        }
    });

    const handleDragStart = () => {
        isDragging.current = true;
        if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    };

    const handleDragEnd = () => {
        // Resume rotation after 2 seconds
        resumeTimeout.current = setTimeout(() => {
            isDragging.current = false;
        }, 2000);
    };

    const handlePhotoTap = (idx: number) => {
        // If it's already paused on this photo, open Lightbox
        if (isHovering.current) {
            setActivePhoto(idx);
        } else {
            // First tap: pause and zoom
            isHovering.current = true;
            if (resumeTimeout.current) clearTimeout(resumeTimeout.current);

            // Resume after 2 seconds if no second tap
            resumeTimeout.current = setTimeout(() => {
                isHovering.current = false;
            }, 2000);
        }
    };

    const handleLightboxNext = () => {
        setActivePhoto((prev) => (prev !== null && prev < sessionPhotos.length - 1 ? prev + 1 : 0));
    };

    const handleLightboxPrev = () => {
        setActivePhoto((prev) => (prev !== null && prev > 0 ? prev - 1 : sessionPhotos.length - 1));
    };

    // Radius of the circle
    const radius = isMobile ? 300 : 900;

    return (
        <section
            id="sessions"
            className="py-24 md:py-32 bg-black relative overflow-hidden min-h-screen flex flex-col items-center justify-center cursor-default"
            onMouseMove={handleMouseMove}
        >
            {/* Header */}
            <div className="absolute top-24 z-30 text-center w-full px-4 pointer-events-none">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-7xl font-serif text-white tracking-[0.2em] uppercase mix-blend-difference"
                >
                    {t("title")}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-platinum/80 font-sans tracking-[0.3em] uppercase text-xs sm:text-sm mt-4 mix-blend-difference"
                >
                    {t("subtitle")}
                </motion.p>
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-8 text-white/30 font-sans text-[10px] sm:text-xs tracking-[0.3em] uppercase"
                >
                    {isMobile ? "Swipe to explore · Tap to view" : "Drag to explore · Click to view"}
                </motion.div>
            </div>

            {/* AAA 3D Interactive Carousel (Mobile & Desktop) */}
            <div className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center z-10 perspective-[2000px] overflow-hidden md:overflow-visible">
                {/* Transparent drag surface that overlays the carousel entirely */}
                <motion.div
                    className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDrag={(e, info) => {
                        // Amplify drag effect
                        rotation.set(rotation.get() + info.delta.x * (isMobile ? 0.8 : 0.4));
                    }}
                />

                {/* Scene Parallax Wrapper */}
                <motion.div
                    ref={sceneRef}
                    className="w-full h-full absolute preserve-3d"
                    style={{
                        rotateX: isMobile ? 0 : sceneRotateX,
                        rotateY: isMobile ? 0 : sceneRotateY,
                    }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "100px" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                >
                    {/* The Rotary Cylinder */}
                    <motion.div
                        className="w-full h-full absolute preserve-3d"
                        style={{ rotateY: smoothRotation }}
                    >
                        {sessionPhotos.map((photo, idx) => {
                            const angle = (360 / sessionPhotos.length) * idx;

                            return (
                                <div
                                    key={idx}
                                    className={`absolute top-1/2 left-1/2 ${isMobile ? "w-[200px] h-[300px] -mt-[150px] -ml-[100px]" : "w-[320px] h-[480px] -mt-[240px] -ml-[160px]"} backface-hidden pointer-events-auto z-30`}
                                    style={{
                                        transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                                    }}
                                    onMouseEnter={() => { if (!isMobile) isHovering.current = true; }}
                                    onMouseLeave={() => { if (!isMobile) isHovering.current = false; }}
                                    onClick={() => isMobile ? handlePhotoTap(idx) : setActivePhoto(idx)}
                                >
                                    <div className="w-full h-full relative overflow-hidden transition-all duration-700 hover:scale-105 group cursor-pointer shadow-2xl">
                                        <Image
                                            src={photo}
                                            alt={`Session ${idx}`}
                                            fill
                                            className="object-cover grayscale-[80%] brightness-75 group-hover:grayscale-0 group-hover:brightness-110 transition-all duration-700"
                                            sizes={isMobile ? "200px" : "320px"}
                                            loading="lazy"
                                        />
                                        {/* Edge light reflection */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent mix-blend-overlay pointer-events-none" />
                                        {/* Border hover accent */}
                                        <div className="absolute inset-0 border border-white/5 group-hover:border-accent/40 transition-colors duration-700 pointer-events-none" />
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                </motion.div>
            </div>

            {/* Lightbox for viewing photos full screen */}
            <Lightbox
                isOpen={activePhoto !== null}
                photoUrl={activePhoto !== null ? sessionPhotos[activePhoto] : ""}
                onClose={() => setActivePhoto(null)}
                onNext={handleLightboxNext}
                onPrev={handleLightboxPrev}
            />

            <style dangerouslySetInnerHTML={{
                __html: `
                .perspective-[2000px] { perspective: 2000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .hidescrollbar::-webkit-scrollbar { display: none; }
                .hidescrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </section>
    );
}
