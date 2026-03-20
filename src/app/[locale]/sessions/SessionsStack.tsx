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
    <section className="dark-stage relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden pb-12 pt-24 md:pb-16 md:pt-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(165,140,99,0.23),transparent_30%)]" />

      <div className="page-shell relative z-20 mb-10 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="label-kicker mb-4">Interactive Session Deck</p>
          <h1 className="brand-display text-[clamp(2.1rem,6.5vw,5rem)] leading-[0.9] tracking-[0.08em] text-[#efe9de]">
            {t("title")} {t("titleAccent")}
          </h1>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-[#efe9de]/58">{t("drag")}</p>
      </div>

      <h2 className="pointer-events-none absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[23vw] font-[var(--font-bodoni)] tracking-[0.05em] text-[#efe9de]/6 md:text-[15vw]">
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
                  className={`absolute inset-0 overflow-hidden border border-[#efe9de]/20 bg-[#161412] shadow-[0_35px_70px_rgba(0,0,0,0.55)] ${isTop ? "touch-none" : ""}`}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
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
              ? "cursor-not-allowed border-[#efe9de]/15 text-[#efe9de]/25"
              : "border-[#efe9de]/35 text-[#efe9de]/72 hover:bg-[#efe9de] hover:text-[#161412]"
          }`}
        >
          <RotateCcw size={16} />
        </button>

        <div className="text-right">
          <p className="brand-display text-3xl tracking-[0.08em] text-[#efe9de] md:text-4xl">
            {String(currentIndex + 1).padStart(2, "0")}
          </p>
          <p className="mt-1 text-[0.62rem] uppercase tracking-[0.3em] text-[#efe9de]/52">/ {sessionPhotos.length}</p>
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === sessionPhotos.length - 1}
          aria-label={locale === "en" ? "Next photo" : "Siguiente foto"}
          className={`flex h-12 w-12 items-center justify-center border transition-all ${
            currentIndex === sessionPhotos.length - 1
              ? "cursor-not-allowed border-[#efe9de]/15 text-[#efe9de]/25"
              : "border-[#efe9de]/35 text-[#efe9de]/72 hover:bg-[#efe9de] hover:text-[#161412]"
          }`}
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
