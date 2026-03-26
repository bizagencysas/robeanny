"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { portfolioPhotos } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

type LayoutMode = "editorial" | "grid" | "slideshow";

export default function PortfolioPage() {
  const [layout, setLayout] = useState<LayoutMode>("editorial");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const t = useTranslations("portfolio");
  const headerRef = useRef<HTMLDivElement>(null);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const progress = useMemo(
    () => Math.round(((currentSlide + 1) / portfolioPhotos.length) * 100),
    [currentSlide]
  );

  useEffect(() => {
    if (!headerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.2 }
      );
    }, headerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-black pb-24 pt-24 md:pt-32">
      <div ref={headerRef} className="page-shell mb-14 md:mb-20">
        <p className="label-kicker mb-5">Editorial Archive</p>
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <h1 className="brand-display text-[clamp(2.6rem,7vw,6.2rem)] leading-[0.88] tracking-[0.06em] text-[#e8dcc8]">
              {t("pageTitle")}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[#e8dcc8]/45 md:text-base">
              {t("subtitle")} · {portfolioPhotos.length} {t("photos")}
            </p>
          </div>

          <div className="luxury-panel p-5 md:p-6">
            <div className="mb-5 flex flex-wrap gap-2">
              {(["editorial", "grid", "slideshow"] as LayoutMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setLayout(mode)}
                  className={`rounded-full px-4 py-2 text-[0.56rem] uppercase tracking-[0.28em] transition-all md:rounded-none ${
                    layout === mode
                      ? "bg-[#e8dcc8] text-black"
                      : "border border-[#e8dcc8]/15 text-[#e8dcc8]/45 hover:border-[#e8dcc8]/30 hover:text-[#e8dcc8]"
                  }`}
                >
                  {t(mode)}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4 text-[0.56rem] uppercase tracking-[0.24em] text-[#e8dcc8]/35">
              <span>Gallery progress</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2 h-[2px] w-full bg-[#e8dcc8]/10">
              <div className="h-full bg-[#c79a59] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <motion.div
        key={layout}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="page-shell"
      >
        {layout === "editorial" && (
          <EditorialLayout photos={portfolioPhotos} onPhotoClick={openLightbox} />
        )}
        {layout === "grid" && <GridLayout photos={portfolioPhotos} onPhotoClick={openLightbox} />}
        {layout === "slideshow" && (
          <SlideshowLayout
            photos={portfolioPhotos}
            current={currentSlide}
            setCurrent={setCurrentSlide}
            prevLabel={t("prev")}
            nextLabel={t("next")}
          />
        )}
      </motion.div>

      {lightboxOpen && (
        <Lightbox
          photos={portfolioPhotos}
          index={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
          closeLabel={t("close")}
        />
      )}
    </div>
  );
}

function EditorialLayout({
  photos,
  onPhotoClick,
}: {
  photos: typeof portfolioPhotos;
  onPhotoClick: (i: number) => void;
}) {
  const heights = ["h-[300px]", "h-[420px]", "h-[360px]", "h-[460px]", "h-[320px]"];

  return (
    <div className="columns-1 gap-4 sm:columns-2 md:columns-3 md:gap-5">
      {photos.map((photo, i) => (
        <button
          key={photo.id}
          onClick={() => onPhotoClick(i)}
          className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl border border-[#e8dcc8]/8 bg-[#0a0a0a] md:mb-5 md:rounded-none"
        >
          <div className={`group relative w-full ${heights[i % heights.length]}`}>
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover transition-transform duration-[1400ms] group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 33vw"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/30" />
            <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <span className="text-[0.48rem] uppercase tracking-[0.3em] text-[#e8dcc8]/60">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function GridLayout({
  photos,
  onPhotoClick,
}: {
  photos: typeof portfolioPhotos;
  onPhotoClick: (i: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
      {photos.map((photo, i) => (
        <button
          key={photo.id}
          onClick={() => onPhotoClick(i)}
          className="tilt-card group relative aspect-[3/4] overflow-hidden border border-[#e8dcc8]/6 bg-[#0a0a0a]"
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            className="object-cover transition-transform duration-[1300ms] group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
            <span className="text-[0.5rem] uppercase tracking-[0.3em] text-[#e8dcc8]/70">
              {String(i + 1).padStart(2, "0")}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

function SlideshowLayout({
  photos,
  current,
  setCurrent,
  prevLabel,
  nextLabel,
}: {
  photos: typeof portfolioPhotos;
  current: number;
  setCurrent: (n: number) => void;
  prevLabel: string;
  nextLabel: string;
}) {
  return (
    <div className="luxury-panel p-5 md:p-8">
      <div className="relative min-h-[64svh] overflow-hidden border border-[#e8dcc8]/8 bg-[#0a0a0a]">
        <Image
          src={photos[current].src}
          alt={photos[current].alt}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-5">
        <button
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
          className="text-[0.62rem] uppercase tracking-[0.3em] text-[#e8dcc8]/40 transition-colors hover:text-[#e8dcc8] disabled:cursor-not-allowed disabled:opacity-30"
        >
          {prevLabel}
        </button>

        <p className="brand-display text-2xl tracking-[0.08em] text-[#e8dcc8] md:text-3xl">
          {String(current + 1).padStart(2, "0")}
          <span className="ml-2 text-sm text-[#e8dcc8]/30">/ {photos.length}</span>
        </p>

        <button
          onClick={() => setCurrent(Math.min(photos.length - 1, current + 1))}
          disabled={current === photos.length - 1}
          className="text-[0.62rem] uppercase tracking-[0.3em] text-[#e8dcc8]/40 transition-colors hover:text-[#e8dcc8] disabled:cursor-not-allowed disabled:opacity-30"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

function Lightbox({
  photos,
  index,
  onClose,
  onNavigate,
  closeLabel,
}: {
  photos: typeof portfolioPhotos;
  index: number;
  onClose: () => void;
  onNavigate: (n: number) => void;
  closeLabel: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/96 px-4"
      onClick={onClose}
    >
      <div className="relative h-[82vh] w-[min(1200px,95vw)]" onClick={(e) => e.stopPropagation()}>
        <Image src={photos[index].src} alt={photos[index].alt} fill className="object-contain" sizes="100vw" priority />
      </div>

      <button
        onClick={onClose}
        className="absolute right-6 top-6 text-[0.62rem] uppercase tracking-[0.3em] text-[#e8dcc8]/50 transition-colors hover:text-[#e8dcc8]"
      >
        {closeLabel}
      </button>

      <button
        onClick={() => onNavigate(Math.max(0, index - 1))}
        className="absolute left-6 top-1/2 -translate-y-1/2 text-5xl text-[#e8dcc8]/30 transition-colors hover:text-[#e8dcc8]"
        aria-label="Previous image"
      >
        ‹
      </button>
      <button
        onClick={() => onNavigate(Math.min(photos.length - 1, index + 1))}
        className="absolute right-6 top-1/2 -translate-y-1/2 text-5xl text-[#e8dcc8]/30 transition-colors hover:text-[#e8dcc8]"
        aria-label="Next image"
      >
        ›
      </button>

      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[0.58rem] uppercase tracking-[0.3em] text-[#e8dcc8]/45">
        {String(index + 1).padStart(2, "0")} / {photos.length}
      </p>
    </motion.div>
  );
}
