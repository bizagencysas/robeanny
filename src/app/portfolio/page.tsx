"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { portfolioPhotos } from "@/lib/data";

type LayoutMode = "editorial" | "grid" | "slideshow";

export default function PortfolioPage() {
    const [layout, setLayout] = useState<LayoutMode>("editorial");
    const [currentSlide, setCurrentSlide] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    return (
        <div className="w-full bg-black text-white min-h-screen pt-24 md:pt-32">
            {/* Header */}
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
                <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight mb-4">Portfolio</h1>
                <p className="editorial-body text-sm text-white/50 mb-8">
                    Selección completa de trabajos — {portfolioPhotos.length} fotografías
                </p>

                {/* Layout Switcher */}
                <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                    {(["editorial", "grid", "slideshow"] as LayoutMode[]).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setLayout(mode)}
                            className={`font-sans text-[10px] tracking-[0.2em] uppercase transition-colors px-3 py-2 ${layout === mode ? "text-white border-b border-white" : "text-white/30 hover:text-white/60"
                                }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            {/* Layout Renderer */}
            <motion.div
                key={layout}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="max-w-[1400px] mx-auto px-6 md:px-12 pb-24"
            >
                {layout === "editorial" && <EditorialLayout photos={portfolioPhotos} onPhotoClick={openLightbox} />}
                {layout === "grid" && <GridLayout photos={portfolioPhotos} onPhotoClick={openLightbox} />}
                {layout === "slideshow" && <SlideshowLayout photos={portfolioPhotos} current={currentSlide} setCurrent={setCurrentSlide} />}
            </motion.div>

            {/* Lightbox */}
            {lightboxOpen && (
                <Lightbox
                    photos={portfolioPhotos}
                    index={lightboxIndex}
                    onClose={() => setLightboxOpen(false)}
                    onNavigate={setLightboxIndex}
                />
            )}
        </div>
    );
}

// --- Editorial Layout ---
function EditorialLayout({ photos, onPhotoClick }: { photos: typeof portfolioPhotos; onPhotoClick: (i: number) => void }) {
    return (
        <div className="columns-2 md:columns-3 gap-3 md:gap-4">
            {photos.map((photo, i) => {
                const heights = ["h-[300px]", "h-[400px]", "h-[350px]", "h-[450px]", "h-[280px]"];
                const height = heights[i % heights.length];
                return (
                    <div
                        key={photo.id}
                        onClick={() => onPhotoClick(i)}
                        className="break-inside-avoid mb-3 md:mb-4 overflow-hidden group cursor-pointer"
                    >
                        <div className={`relative w-full ${height} overflow-hidden`}>
                            <Image
                                src={photo.src}
                                alt={photo.alt}
                                fill
                                className="object-cover transition-transform duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                                sizes="(max-width: 768px) 50vw, 33vw"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// --- Grid Layout ---
function GridLayout({ photos, onPhotoClick }: { photos: typeof portfolioPhotos; onPhotoClick: (i: number) => void }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
            {photos.map((photo, i) => (
                <div
                    key={photo.id}
                    onClick={() => onPhotoClick(i)}
                    className="relative aspect-[3/4] overflow-hidden group cursor-pointer"
                >
                    <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex items-end p-4">
                        <span className="font-sans text-[10px] tracking-widest uppercase text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            {String(i + 1).padStart(2, "0")}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

// --- Slideshow Layout ---
function SlideshowLayout({ photos, current, setCurrent }: { photos: typeof portfolioPhotos; current: number; setCurrent: (n: number) => void }) {
    return (
        <div className="relative w-full h-[80vh] flex items-center justify-center">
            <div className="relative w-full max-w-[900px] h-full">
                <Image
                    src={photos[current].src}
                    alt={photos[current].alt}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                />
            </div>

            {/* Navigation */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8">
                <button
                    onClick={() => setCurrent(Math.max(0, current - 1))}
                    disabled={current === 0}
                    className="font-sans text-xs tracking-widest uppercase text-white/50 hover:text-white disabled:opacity-20 transition-colors"
                >
                    ← Prev
                </button>
                <span className="font-serif text-2xl">
                    {String(current + 1).padStart(2, "0")}
                    <span className="text-white/30 text-sm ml-2">/ {photos.length}</span>
                </span>
                <button
                    onClick={() => setCurrent(Math.min(photos.length - 1, current + 1))}
                    disabled={current === photos.length - 1}
                    className="font-sans text-xs tracking-widest uppercase text-white/50 hover:text-white disabled:opacity-20 transition-colors"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}

// --- Lightbox ---
function Lightbox({ photos, index, onClose, onNavigate }: { photos: typeof portfolioPhotos; index: number; onClose: () => void; onNavigate: (n: number) => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
            onClick={onClose}
        >
            <div className="relative w-[90vw] md:w-[70vw] h-[80vh]" onClick={(e) => e.stopPropagation()}>
                <Image
                    src={photos[index].src}
                    alt={photos[index].alt}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                />
            </div>

            {/* Close */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 font-sans text-xs tracking-widest uppercase text-white/50 hover:text-white transition-colors"
            >
                Close ✕
            </button>

            {/* Nav */}
            <button
                onClick={() => onNavigate(Math.max(0, index - 1))}
                className="absolute left-6 top-1/2 -translate-y-1/2 font-serif text-4xl text-white/30 hover:text-white transition-colors"
            >
                ‹
            </button>
            <button
                onClick={() => onNavigate(Math.min(photos.length - 1, index + 1))}
                className="absolute right-6 top-1/2 -translate-y-1/2 font-serif text-4xl text-white/30 hover:text-white transition-colors"
            >
                ›
            </button>

            {/* Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-sans text-xs tracking-widest text-white/40">
                {String(index + 1).padStart(2, "0")} / {photos.length}
            </div>
        </motion.div>
    );
}
