"use client";

import { useEffect, useState } from "react";

export default function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check if device is touch based
        const checkMobile = () => {
            setIsMobile(
                window.matchMedia("(max-width: 768px)").matches ||
                "ontouchstart" in window ||
                navigator.maxTouchPoints > 0
            );
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);

        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check if target or its parent is interactive
            const isInteractive = target.closest("a, button, input-[type='button'], input-[type='submit'], [data-cursor]");
            setIsHovering(!!isInteractive);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseover", handleMouseOver);

        return () => {
            window.removeEventListener("resize", checkMobile);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, []);

    if (isMobile) return null;

    return (
        <div
            className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] rounded-full border border-white mix-blend-difference transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-out will-change-transform"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: `translate(-50%, -50%) scale(${isHovering ? 1.5 : 1})`,
                backgroundColor: isHovering ? "rgba(255, 255, 255, 1)" : "transparent",
            }}
        />
    );
}
