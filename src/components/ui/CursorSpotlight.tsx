"use client";

import { useEffect, useRef } from "react";

/**
 * Giant radial gradient that follows the cursor everywhere.
 * Creates a dramatic spotlight/flashlight effect across the entire site.
 */
export default function CursorSpotlight() {
  const spotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isTouch =
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;

    if (isTouch || window.innerWidth < 1024) return;

    const onMove = (e: MouseEvent) => {
      if (spotRef.current) {
        spotRef.current.style.setProperty("--cx", `${e.clientX}px`);
        spotRef.current.style.setProperty("--cy", `${e.clientY}px`);
        spotRef.current.style.opacity = "1";
      }
    };

    const onLeave = () => {
      if (spotRef.current) spotRef.current.style.opacity = "0";
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", () => {
      if (spotRef.current) spotRef.current.style.opacity = "1";
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={spotRef}
      className="pointer-events-none fixed inset-0 z-[9990] opacity-0 transition-opacity duration-500"
      style={{
        background:
          "radial-gradient(650px circle at var(--cx, 50%) var(--cy, 50%), rgba(199, 154, 89, 0.06), transparent 60%)",
      }}
    />
  );
}
