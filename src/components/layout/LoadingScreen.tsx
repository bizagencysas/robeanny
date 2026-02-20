"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function LoadingScreen() {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            // Simple, stark fade-in of the name
            tl.to(textRef.current, {
                opacity: 1,
                duration: 1.5,
                ease: "power2.inOut",
            })
                // Hold for a moment
                .to({}, { duration: 0.5 })
                // Smooth fade out of the entire veil
                .to(containerRef.current, {
                    opacity: 0,
                    duration: 1,
                    ease: "power3.inOut",
                    onComplete: () => {
                        if (containerRef.current) {
                            containerRef.current.style.display = "none";
                        }
                    },
                });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[100] bg-white flex items-center justify-center"
        >
            <div
                ref={textRef}
                className="opacity-0 text-3xl md:text-5xl lg:text-7xl font-serif text-black tracking-[0.2em] font-light uppercase"
            >
                Robeanny
            </div>
        </div>
    );
}
