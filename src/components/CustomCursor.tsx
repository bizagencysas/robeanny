"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function CustomCursor() {
    const [isDesktop, setIsDesktop] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    // Position coordinates
    const cursorX = useSpring(0, { stiffness: 200, damping: 25 });
    const cursorY = useSpring(0, { stiffness: 200, damping: 25 });
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
            // Offset by half the width/height of the dots
            cursorX.set(e.clientX - 6);
            cursorY.set(e.clientY - 6);
            haloX.set(e.clientX - 20); // 40/2
            haloY.set(e.clientY - 20);
        };

        const handleHoverStart = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName.toLowerCase() === "a" ||
                target.tagName.toLowerCase() === "button" ||
                target.closest("a") ||
                target.closest("button")
            ) {
                setIsHovering(true);
            }
        };

        const handleHoverEnd = () => {
            setIsHovering(false);
        };

        window.addEventListener("mousemove", mouseMove);
        window.addEventListener("mouseover", handleHoverStart);
        window.addEventListener("mouseout", handleHoverEnd);

        return () => {
            window.removeEventListener("mousemove", mouseMove);
            window.removeEventListener("mouseover", handleHoverStart);
            window.removeEventListener("mouseout", handleHoverEnd);
        };
    }, [cursorX, cursorY, haloX, haloY]);

    if (!isDesktop) return null;

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 w-3 h-3 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference"
                style={{
                    x: cursorX,
                    y: cursorY,
                }}
            />
            <motion.div
                className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9998] transition-colors duration-200 border`}
                style={{
                    x: haloX,
                    y: haloY,
                    width: isHovering ? 60 : 40,
                    height: isHovering ? 60 : 40,
                    marginLeft: isHovering ? -10 : 0,
                    marginTop: isHovering ? -10 : 0,
                    borderColor: isHovering ? "var(--accent)" : "rgba(255, 255, 255, 0.4)",
                }}
            />
        </>
    );
}
