"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function CustomCursor() {
    const [isDesktop, setIsDesktop] = useState(false);

    // Interaction states
    const [hoverType, setHoverType] = useState<"none" | "link" | "photo">("none");
    const [isClicking, setIsClicking] = useState(false);

    // Position coordinates
    const cursorX = useSpring(0, { stiffness: 500, damping: 28, mass: 0.5 });
    const cursorY = useSpring(0, { stiffness: 500, damping: 28, mass: 0.5 });

    // Halo spring lag (stiffness 80, damping 20 as requested)
    const haloX = useSpring(0, { stiffness: 80, damping: 20 });
    const haloY = useSpring(0, { stiffness: 80, damping: 20 });

    useEffect(() => {
        // Only enable custom cursor on non-touch devices
        const checkIsTouchDevice = () => {
            return (
                "ontouchstart" in window ||
                navigator.maxTouchPoints > 0 ||
                (navigator as any).msMaxTouchPoints > 0
            );
        };

        if (!checkIsTouchDevice()) {
            setIsDesktop(true);
        }

        const mouseMove = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            haloX.set(e.clientX);
            haloY.set(e.clientY);
        };

        const handleHoverStart = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Photo hover check (using data-cursor="photo" or closest image card)
            if (target.closest('[data-cursor="photo"]') || target.tagName.toLowerCase() === "img") {
                setHoverType("photo");
                return;
            }

            // Link hover check
            if (
                target.tagName.toLowerCase() === "a" ||
                target.tagName.toLowerCase() === "button" ||
                target.closest("a") ||
                target.closest("button")
            ) {
                setHoverType("link");
                return;
            }
        };

        const handleHoverEnd = () => {
            setHoverType("none");
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        window.addEventListener("mousemove", mouseMove);
        window.addEventListener("mouseover", handleHoverStart);
        window.addEventListener("mouseout", handleHoverEnd);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", mouseMove);
            window.removeEventListener("mouseover", handleHoverStart);
            window.removeEventListener("mouseout", handleHoverEnd);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [cursorX, cursorY, haloX, haloY]);

    if (!isDesktop) return null;

    // Default dimensions
    let haloSize = 50;
    let haloScaleX = 1;
    let haloScaleY = 1;
    let haloBorder = "rgba(255, 255, 255, 0.3)";
    let dotOpacity = 1;

    // Apply specific hover styles
    if (hoverType === "link") {
        dotOpacity = 0; // The small dot disappears
        haloScaleX = 1.5; // Flattens into an ellipse
        haloScaleY = 0.5;
    } else if (hoverType === "photo") {
        haloSize = 80;
        haloBorder = "var(--gold)";
    }

    // Apply click pulse
    const clickScale = isClicking ? 1.4 : 1;

    return (
        <>
            {/* Small Inner Dot */}
            <motion.div
                className="fixed top-0 left-0 w-[10px] h-[10px] bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                animate={{ opacity: dotOpacity }}
                transition={{ duration: 0.2 }}
            />

            {/* Outer Halo */}
            <motion.div
                className="fixed top-0 left-0 rounded-full pointer-events-none z-[9998] border border-solid flex items-center justify-center overflow-hidden"
                style={{
                    x: haloX,
                    y: haloY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                animate={{
                    width: haloSize,
                    height: haloSize,
                    scaleX: haloScaleX * clickScale,
                    scaleY: haloScaleY * clickScale,
                    borderColor: haloBorder,
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    mass: 0.5
                }}
            >
                {/* Text inside halo when hovering over a photo */}
                <motion.span
                    className="font-sans text-[9px] uppercase tracking-widest text-gold whitespace-nowrap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoverType === "photo" ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    VIEW
                </motion.span>
            </motion.div>
        </>
    );
}
