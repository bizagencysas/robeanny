"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Pause, Play } from "lucide-react";
import OrbitGallery from "@/components/three/OrbitGallery";
import Lightbox from "@/components/ui/Lightbox";
import { cloudinaryPhotos } from "@/lib/data";

export default function Sessions() {
    const [isPaused, setIsPaused] = useState(false);
    const [activePhoto, setActivePhoto] = useState<number | null>(null);

    const handleNext = () => setActivePhoto((prev) => (prev !== null && prev < cloudinaryPhotos.length - 1 ? prev + 1 : 0));
    const handlePrev = () => setActivePhoto((prev) => (prev !== null && prev > 0 ? prev - 1 : cloudinaryPhotos.length - 1));

    const openLightbox = (url: string) => {
        const index = cloudinaryPhotos.indexOf(url);
        if (index !== -1) setActivePhoto(index);
    };

    return (
        <section id="sessions" className="relative w-full h-[100vh] bg-black overflow-hidden py-12">
            {/* V3 Section Title Background */}
            <div className="absolute top-[5%] w-full text-center pointer-events-none z-10 mix-blend-difference">
                <h2 className="text-[14vw] md:text-[8rem] font-serif tracking-[0.1em] uppercase text-white opacity-20 select-none">
                    SESIONES
                </h2>
            </div>

            {/* R3F WebGL Canvas */}
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                    <ambientLight intensity={1} />
                    <fog attach="fog" args={["#000000", 5, 20]} />
                    <OrbitGallery isPaused={isPaused} onPhotoClick={openLightbox} />
                </Canvas>
            </div>

            {/* Fade Overlays to blend edges */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black pointer-events-none z-10" />

            {/* UI Controls */}
            <div className="absolute bottom-12 lg:bottom-20 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                <p className="text-xs font-sans text-white/50 tracking-[0.2em] uppercase mb-4 text-center">
                    Arrastra para rotar • Hover atrae la foto
                </p>
                <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="w-14 h-14 rounded-full border border-white/20 bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300"
                    aria-label={isPaused ? "Play Rotation" : "Pause Rotation"}
                >
                    {isPaused ? <Play fill="currentColor" size={20} className="ml-1" /> : <Pause fill="currentColor" size={20} />}
                </button>
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
