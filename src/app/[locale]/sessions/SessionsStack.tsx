"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, PanInfo, motion } from "framer-motion";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import gsap from "gsap";
import { sessionPhotos } from "@/lib/data";

const SWIPE_THRESHOLD = 85;

export default function SessionsStack() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitX, setExitX] = useState(0);
  const locale = useLocale();
  const t = useTranslations("sessions");
  const headerRef = useRef<HTMLDivElement>(null);
  const bgTextRef = useRef<HTMLHeadingElement>(null);

  const remainingCards = sessionPhotos.slice(currentIndex);

  useEffect(() => {
    // Header reveal
    if (headerRef.current) {
      const children = headerRef.current.children;
      gsap.fromTo(
        children,
        { opacity: 0, y: 50, clipPath: "inset(100% 0 0 0)" },
        {
          opacity: 1,
          y: 0,
          clipPath: "inset(0% 0 0 0)",
          duration: 1,
          stagger: 0.15,
          ease: "power4.out",
          delay: 0.3,
        }
      );
    }

    // Background text float
    if (bgTextRef.current) {
      gsap.to(bgTextRef.current, {
        x: -100,
        duration: 20,
        ease: "none",
        repeat: -1,
        yoyo: true,
      });
    }
  }, []);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD || info.offset.x < -SWIPE_THRESHOLD) {
      const flyAwayDistance = info.offset.x > 0 ? window.innerWidth : -window.innerWidth;
      setExitX(flyAwayDistance);
      if (currentIndex < sessionPhotos.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setExitX(-window.innerWidth);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < sessionPhotos.length - 1) {
      setExitX(-window.innerWidth);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const progress = ((currentIndex + 1) / sessionPhotos.length) * 100;

  return (
    <section className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-black pb-12 pt-24 md:pb-16 md:pt-32">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(199,154,89,0.06), transparent 60%)", filter: "blur(120px)" }}
        />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(199,154,89,0.05), transparent 60%)", filter: "blur(100px)" }}
        />
      </div>

      <div ref={headerRef} className="page-shell relative z-20 mb-10 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="label-kicker mb-4">Interactive Session Deck</p>
          <h1 className="brand-display text-[clamp(2.4rem,8vw,6rem)] leading-[0.85] tracking-[0.06em] text-[#e8dcc8]">
            {t("title")} <span className="text-[#e8dcc8]/15">{t("titleAccent")}</span>
          </h1>
        </div>
        <p className="max-w-md text-[0.82rem] leading-relaxed text-[#e8dcc8]/30">{t("drag")}</p>
      </div>

      {/* Floating background text */}
      <h2
        ref={bgTextRef}
        className="pointer-events-none absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[28vw] font-[var(--font-bodoni)] tracking-[0.05em] text-[#e8dcc8]/[0.02] md:text-[18vw] will-change-transform"
      >
        SESSIONS
      </h2>

      {/* Card Stack */}
      <div className="relative z-10 h-[62svh] max-h-[800px] w-[88vw] max-w-[430px]" style={{ perspective: "1200px" }}>
        <AnimatePresence initial={false}>
          {remainingCards
            .map((url, i) => {
              if (i > 3) return null;
              const isTop = i === 0;
              const absoluteIndex = currentIndex + i;
              const offset = i * 16;
              const scale = 1 - i * 0.05;
              const zIndex = remainingCards.length - i;
              const tilt = absoluteIndex % 2 === 0 ? 1.3 : -1.3;

              return (
                <motion.div
                  key={url}
                  className={`absolute inset-0 overflow-hidden border border-[#e8dcc8]/8 bg-[#080808] shadow-[0_40px_80px_rgba(0,0,0,0.8)] ${isTop ? "touch-none" : ""}`}
                  style={{ zIndex, touchAction: isTop ? "none" : "auto" }}
                  initial={{
                    x: isTop ? exitX : 0,
                    y: isTop ? 0 : offset,
                    rotateZ: isTop ? 0 : tilt,
                    scale,
                    opacity: 0,
                  }}
                  animate={{
                    x: 0,
                    y: isTop ? 0 : offset,
                    rotateZ: isTop ? 0 : tilt,
                    scale,
                    opacity: 1 - i * 0.15,
                  }}
                  exit={{
                    x: exitX,
                    rotateZ: exitX > 0 ? 18 : -18,
                    scale: 0.88,
                    opacity: 0,
                    transition: { duration: 0.4, ease: "easeOut" },
                  }}
                  transition={{ type: "spring", stiffness: 280, damping: 24, mass: isTop ? 1 : 1.3 }}
                  drag={isTop ? "x" : false}
                  dragDirectionLock
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={isTop ? handleDragEnd : undefined}
                  whileTap={isTop ? { scale: 0.98 } : {}}
                >
                  <Image
                    src={url}
                    alt={`Robeanny session ${absoluteIndex + 1}`}
                    fill
                    className="pointer-events-none object-cover"
                    sizes="(max-width: 768px) 88vw, 430px"
                    priority={i < 2}
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Card counter */}
                  {isTop && (
                    <div className="absolute bottom-5 left-5 z-10">
                      <span className="text-[0.48rem] uppercase tracking-[0.35em] text-[#e8dcc8]/40">
                        {String(absoluteIndex + 1).padStart(2, "0")} / {sessionPhotos.length}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })
            .reverse()}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="page-shell relative z-20 mt-10">
        {/* Progress bar */}
        <div className="mb-6 h-[1px] w-full bg-[#e8dcc8]/8">
          <div
            className="h-full bg-[#c79a59] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-5">
          <button
            onClick={handleUndo}
            disabled={currentIndex === 0}
            aria-label={t("back")}
            className={`flex h-12 w-12 items-center justify-center border transition-all duration-300 ${
              currentIndex === 0
                ? "cursor-not-allowed border-[#e8dcc8]/8 text-[#e8dcc8]/15"
                : "border-[#e8dcc8]/20 text-[#e8dcc8]/50 hover:bg-[#e8dcc8] hover:text-black hover:border-[#e8dcc8]"
            }`}
          >
            <RotateCcw size={16} />
          </button>

          <div className="text-center">
            <p className="brand-display text-4xl tracking-[0.08em] text-[#e8dcc8] md:text-5xl">
              {String(currentIndex + 1).padStart(2, "0")}
            </p>
            <p className="mt-1 text-[0.48rem] uppercase tracking-[0.35em] text-[#e8dcc8]/25">
              / {sessionPhotos.length}
            </p>
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === sessionPhotos.length - 1}
            aria-label={locale === "en" ? "Next photo" : "Siguiente foto"}
            className={`flex h-12 w-12 items-center justify-center border transition-all duration-300 ${
              currentIndex === sessionPhotos.length - 1
                ? "cursor-not-allowed border-[#e8dcc8]/8 text-[#e8dcc8]/15"
                : "border-[#e8dcc8]/20 text-[#e8dcc8]/50 hover:bg-[#e8dcc8] hover:text-black hover:border-[#e8dcc8]"
            }`}
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
