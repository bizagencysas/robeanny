"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function LoadingScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
        textRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.95, ease: "power3.out" }
      )
        .fromTo(
          lineRef.current,
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 0.72, ease: "power2.inOut" },
          "-=0.45"
        )
        .to(containerRef.current, {
          opacity: 0,
          duration: 0.65,
          delay: 0.28,
          ease: "power2.inOut",
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#f8f4ee]"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          ref={textRef}
          className="brand-display text-[clamp(2rem,6vw,4.2rem)] tracking-[0.2em] text-[#141312]"
        >
          ROBEANNY
        </div>
        <div ref={lineRef} className="h-px w-36 bg-[#141312]/70" />
      </div>
    </div>
  );
}
