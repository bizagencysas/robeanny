"use client";

import { useEffect, useState } from "react";

const interactiveSelector = [
  "a",
  "button",
  "input",
  "textarea",
  "select",
  "label",
  "[data-cursor]",
].join(",");

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const updateEnabled = () => {
      const isTouch =
        window.matchMedia("(pointer: coarse)").matches ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setIsEnabled(!isTouch && !reduceMotion && window.innerWidth > 1024);
    };

    const onMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement;
      setIsHovering(Boolean(target.closest(interactiveSelector)));
    };

    updateEnabled();
    window.addEventListener("resize", updateEnabled);
    window.addEventListener("mousemove", onMove);

    return () => {
      window.removeEventListener("resize", updateEnabled);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  if (!isEnabled) return null;

  return (
    <>
      {/* Dot */}
      <div
        className="pointer-events-none fixed left-0 top-0 z-[9998] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c79a59] transition-transform duration-200"
        style={{ left: position.x, top: position.y }}
      />
      {/* Ring */}
      <div
        className="pointer-events-none fixed left-0 top-0 z-[9997] h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-300"
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) scale(${isHovering ? 1.6 : 1})`,
          background: isHovering ? "rgba(199, 154, 89, 0.08)" : "transparent",
          borderColor: isHovering ? "rgba(199, 154, 89, 0.6)" : "rgba(232, 220, 200, 0.2)",
        }}
      />
    </>
  );
}
