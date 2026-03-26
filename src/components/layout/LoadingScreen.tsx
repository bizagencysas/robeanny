"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function LoadingScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<HTMLSpanElement[]>([]);
  const lineRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);

  const brandName = "ROBEANNY";

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Set initial state
      gsap.set(lettersRef.current, {
        opacity: 0,
        y: 60,
        rotateX: 90,
        transformOrigin: "bottom center",
      });

      gsap.set(lineRef.current, {
        scaleX: 0,
        transformOrigin: "left center",
      });

      gsap.set(subtitleRef.current, {
        opacity: 0,
        y: 15,
      });

      // Animate letters in with 3D rotation
      tl.to(lettersRef.current, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.06,
      })
        .to(
          lineRef.current,
          {
            scaleX: 1,
            duration: 0.8,
            ease: "power2.inOut",
          },
          "-=0.35"
        )
        .to(
          subtitleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.4"
        )
        // Hold briefly
        .to({}, { duration: 0.4 })
        // Exit: scale up and fade
        .to(containerRef.current, {
          clipPath: "inset(0 0 100% 0)",
          duration: 0.9,
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
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: "linear-gradient(180deg, #000 0%, #080604 100%)",
        clipPath: "inset(0 0 0 0)",
      }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(199,154,89,0.3), transparent 70%)", filter: "blur(80px)" }}
        />
      </div>

      <div className="flex flex-col items-center gap-5" style={{ perspective: "800px" }}>
        <div className="flex items-center overflow-hidden">
          {brandName.split("").map((letter, i) => (
            <span
              key={i}
              ref={(el) => {
                if (el) lettersRef.current[i] = el;
              }}
              className="brand-display text-[clamp(2.8rem,8vw,5.5rem)] tracking-[0.22em] text-[#e8dcc8] inline-block"
              style={{ willChange: "transform, opacity" }}
            >
              {letter}
            </span>
          ))}
        </div>
        <div ref={lineRef} className="h-[1px] w-32 bg-gradient-to-r from-transparent via-[#c79a59] to-transparent" />
        <div ref={subtitleRef} className="text-[0.58rem] uppercase tracking-[0.4em] text-[#e8dcc8]/35">
          Professional Model
        </div>
      </div>
    </div>
  );
}
