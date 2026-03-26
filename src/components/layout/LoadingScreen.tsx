"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const REVEAL_TEXT = "ROBEANNY";

export default function LoadingScreen() {
  const [show, setShow] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<HTMLSpanElement[]>([]);
  const lineRef = useRef<HTMLDivElement>(null);
  const topCurtainRef = useRef<HTMLDivElement>(null);
  const bottomCurtainRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({
      onComplete: () => setShow(false),
    });

    // Phase 1: Counter animation 0 → 100
    tl.fromTo(
      { val: 0 },
      {
        val: 100,
        duration: 1.6,
        ease: "power2.inOut",
        onUpdate: function () {
          if (counterRef.current) {
            counterRef.current.textContent = String(Math.round(this.targets()[0].val));
          }
        },
      }
    );

    // Phase 2: Counter fades, line grows
    tl.to(counterRef.current, { opacity: 0, y: -10, duration: 0.3, ease: "power2.in" }, "-=0.3");

    if (lineRef.current) {
      tl.fromTo(
        lineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.6, ease: "power3.inOut" },
        "-=0.2"
      );
    }

    // Phase 3: Letters reveal with 3D rotateX stagger
    tl.fromTo(
      lettersRef.current,
      {
        rotateX: 90,
        opacity: 0,
        y: 40,
      },
      {
        rotateX: 0,
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.04,
        ease: "back.out(1.7)",
      },
      "-=0.3"
    );

    // Phase 4: Hold for impact
    tl.to({}, { duration: 0.4 });

    // Phase 5: Split curtain exit — top goes up, bottom goes down
    tl.to(lettersRef.current, {
      opacity: 0,
      y: -30,
      stagger: 0.02,
      duration: 0.4,
      ease: "power2.in",
    });

    if (lineRef.current) {
      tl.to(lineRef.current, { scaleX: 0, duration: 0.3, ease: "power2.in" }, "<");
    }

    tl.to(
      topCurtainRef.current,
      { yPercent: -100, duration: 0.9, ease: "power4.inOut" },
      "-=0.1"
    );
    tl.to(
      bottomCurtainRef.current,
      { yPercent: 100, duration: 0.9, ease: "power4.inOut" },
      "<"
    );

    return () => {
      tl.kill();
    };
  }, []);

  if (!show) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] pointer-events-none">
      {/* Top curtain */}
      <div
        ref={topCurtainRef}
        className="absolute top-0 left-0 right-0 h-1/2 bg-black z-[101]"
      />
      {/* Bottom curtain */}
      <div
        ref={bottomCurtainRef}
        className="absolute bottom-0 left-0 right-0 h-1/2 bg-black z-[101]"
      />

      {/* Center content */}
      <div
        className="absolute inset-0 z-[102] flex flex-col items-center justify-center gap-5"
        style={{ perspective: "600px" }}
      >
        {/* Counter */}
        <span
          ref={counterRef}
          className="text-[0.56rem] uppercase tracking-[0.5em] text-[#c79a59]/60 tabular-nums"
        >
          0
        </span>

        {/* Line */}
        <div
          ref={lineRef}
          className="h-[1px] w-12 bg-[#c79a59]/30 origin-center"
          style={{ transform: "scaleX(0)" }}
        />

        {/* Title Letters */}
        <h1 className="flex overflow-hidden" style={{ perspective: "500px" }}>
          {REVEAL_TEXT.split("").map((char, i) => (
            <span
              key={i}
              ref={(el) => {
                if (el) lettersRef.current[i] = el;
              }}
              className="brand-display text-[clamp(3rem,12vw,8rem)] leading-none text-[#e8dcc8] tracking-[0.12em] inline-block"
              style={{ opacity: 0, transformStyle: "preserve-3d" }}
            >
              {char}
            </span>
          ))}
        </h1>
      </div>
    </div>
  );
}
