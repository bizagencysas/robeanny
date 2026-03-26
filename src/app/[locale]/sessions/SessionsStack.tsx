"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, PanInfo, motion } from "framer-motion";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { sessionPhotos } from "@/lib/data";

const SWIPE_THRESHOLD = 85;

export default function SessionsStack() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitX, setExitX] = useState(0);
  const locale = useLocale();
  const t = useTranslations("sessions");

  const remainingCards = sessionPhotos.slice(currentIndex);

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

  return (
    <section className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-black pb-12 pt-24 md:pb-16 md:pt-32">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(199,154,89,0.08), transparent 70%)", filter: "blur(100px)" }}
        />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(199,154,89,0.06), transparent 70%)", filter: "blur(80px)" }}
        />
      </div>

      <div className="page-shell relative z-20 mb-10 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="label-kicker mb-4">Interactive Session Deck</p>
          <h1 className="brand-display text-[clamp(2.1rem,6.5vw,5rem)] leading-[0.9] tracking-[0.08em] text-[#e8dcc8]">
            {t("title")} {t("titleAccent")}
          </h1>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-[#e8dcc8]/40">{t("drag")}</p>
      </div>

      <h2 className="pointer-events-none absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[23vw] font-[var(--font-bodoni)] tracking-[0.05em] text-[#e8dcc8]/[0.03] md:text-[15vw]">
        SESSIONS
      </h2>

      <div className="relative z-10 h-[62svh] max-h-[800px] w-[88vw] max-w-[430px] perspective-[1200px]">
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
                  className={`absolute inset-0 overflow-hidden border border-[#e8dcc8]/10 bg-[#0a0a0a] shadow-[0_35px_70px_rgba(0,0,0,0.7)] ${isTop ? "touch-none" : ""}`}
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
                    opacity: 1 - i * 0.14,
                  }}
                  exit={{
                    x: exitX,
                    rotateZ: exitX > 0 ? 15 : -15,
                    scale: 0.92,
                    opacity: 0,
                    transition: { duration: 0.38, ease: "easeOut" },
                  }}
                  transition={{ type: "spring", stiffness: 280, damping: 24, mass: isTop ? 1 : 1.3 }}
                  drag={isTop ? "x" : false}
                  dragDirectionLock
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={isTop ? handleDragEnd : undefined}
                  whileTap={isTop ? { scale: 0.985 } : {}}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </motion.div>
              );
            })
            .reverse()}
        </AnimatePresence>
      </div>

      <div className="page-shell relative z-20 mt-10 flex items-center justify-between gap-5">
        <button
          onClick={handleUndo}
          disabled={currentIndex === 0}
          aria-label={t("back")}
          className={`flex h-12 w-12 items-center justify-center border transition-all ${
            currentIndex === 0
              ? "cursor-not-allowed border-[#e8dcc8]/10 text-[#e8dcc8]/20"
              : "border-[#e8dcc8]/25 text-[#e8dcc8]/60 hover:bg-[#e8dcc8] hover:text-black"
          }`}
        >
          <RotateCcw size={16} />
        </button>

        <div className="text-right">
          <p className="brand-display text-3xl tracking-[0.08em] text-[#e8dcc8] md:text-4xl">
            {String(currentIndex + 1).padStart(2, "0")}
          </p>
          <p className="mt-1 text-[0.56rem] uppercase tracking-[0.3em] text-[#e8dcc8]/35">/ {sessionPhotos.length}</p>
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === sessionPhotos.length - 1}
          aria-label={locale === "en" ? "Next photo" : "Siguiente foto"}
          className={`flex h-12 w-12 items-center justify-center border transition-all ${
            currentIndex === sessionPhotos.length - 1
              ? "cursor-not-allowed border-[#e8dcc8]/10 text-[#e8dcc8]/20"
              : "border-[#e8dcc8]/25 text-[#e8dcc8]/60 hover:bg-[#e8dcc8] hover:text-black"
          }`}
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
