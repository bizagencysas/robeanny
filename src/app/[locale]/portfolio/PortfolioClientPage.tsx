"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { portfolioPhotos } from "@/lib/data";

type LayoutMode = "editorial" | "grid" | "slideshow";

export default function PortfolioPage() {
  const [layout, setLayout] = useState<LayoutMode>("editorial");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const t = useTranslations("portfolio");

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const progress = useMemo(
    () => Math.round(((currentSlide + 1) / portfolioPhotos.length) * 100),
    [currentSlide]
  );

  return (
    <div className="min-h-screen pb-24 pt-24 md:pt-32">
      <div className="page-shell mb-12 md:mb-16">
        <p className="label-kicker mb-5">Editorial Archive</p>
        <div className="grid gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <h1 className="brand-display text-[clamp(2.6rem,7vw,6.2rem)] leading-[0.88] tracking-[0.06em] text-[#171513]">
              {t("pageTitle")}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[#171513]/62 md:text-base">
              {t("subtitle")} · {portfolioPhotos.length} {t("photos")}
            </p>
          </div>

          <div className="luxury-panel p-4 md:p-5">
            <div className="mb-4 flex flex-wrap gap-2">
              {(["editorial", "grid", "slideshow"] as LayoutMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setLayout(mode)}
                  className={`px-4 py-2 text-[0.62rem] uppercase tracking-[0.28em] transition-all ${
                    layout === mode
                      ? "bg-[#171513] text-[#f8f3ea]"
                      : "border border-black/15 text-[#171513]/58 hover:border-black/35 hover:text-[#171513]"
                  }`}
                >
                  {t(mode)}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4 text-[0.62rem] uppercase tracking-[0.24em] text-[#171513]/56">
              <span>Gallery progress</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2 h-[2px] w-full bg-black/12">
              <div className="h-full bg-black/70 transition-all duration-300" style={{ width: `${progress}%` }} />
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
    <div className="columns-2 gap-4 md:columns-3 md:gap-5">
      {photos.map((photo, i) => (
        <button
          key={photo.id}
          onClick={() => onPhotoClick(i)}
          className="mb-4 block w-full break-inside-avoid overflow-hidden border border-black/12 bg-white/55 md:mb-5"
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
            <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/18" />
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
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {photos.map((photo, i) => (
        <button
          key={photo.id}
          onClick={() => onPhotoClick(i)}
          className="group relative aspect-[3/4] overflow-hidden border border-black/12"
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            className="object-cover transition-transform duration-[1300ms] group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-end bg-black/0 p-4 transition-colors duration-500 group-hover:bg-black/25">
            <span className="translate-y-2 text-[0.6rem] uppercase tracking-[0.3em] text-[#f8f3ea]/0 transition-all duration-300 group-hover:translate-y-0 group-hover:text-[#f8f3ea]">
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
      <div className="relative min-h-[64svh] overflow-hidden border border-black/12 bg-[#e7dfd2]">
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
          className="text-[0.66rem] uppercase tracking-[0.3em] text-[#171513]/55 transition-colors hover:text-[#171513] disabled:cursor-not-allowed disabled:opacity-35"
        >
          {prevLabel}
        </button>

        <p className="brand-display text-2xl tracking-[0.08em] text-[#171513] md:text-3xl">
          {String(current + 1).padStart(2, "0")}
          <span className="ml-2 text-sm text-[#171513]/40">/ {photos.length}</span>
        </p>

        <button
          onClick={() => setCurrent(Math.min(photos.length - 1, current + 1))}
          disabled={current === photos.length - 1}
          className="text-[0.66rem] uppercase tracking-[0.3em] text-[#171513]/55 transition-colors hover:text-[#171513] disabled:cursor-not-allowed disabled:opacity-35"
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
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(10,9,8,0.95)] px-4"
      onClick={onClose}
    >
      <div className="relative h-[82vh] w-[min(1200px,95vw)]" onClick={(e) => e.stopPropagation()}>
        <Image src={photos[index].src} alt={photos[index].alt} fill className="object-contain" sizes="100vw" priority />
      </div>

      <button
        onClick={onClose}
        className="absolute right-6 top-6 text-[0.64rem] uppercase tracking-[0.3em] text-[#f1ebdf]/66 transition-colors hover:text-[#f1ebdf]"
      >
        {closeLabel}
      </button>

      <button
        onClick={() => onNavigate(Math.max(0, index - 1))}
        className="absolute left-6 top-1/2 -translate-y-1/2 text-5xl text-[#f1ebdf]/45 transition-colors hover:text-[#f1ebdf]"
        aria-label="Previous image"
      >
        ‹
      </button>
      <button
        onClick={() => onNavigate(Math.min(photos.length - 1, index + 1))}
        className="absolute right-6 top-1/2 -translate-y-1/2 text-5xl text-[#f1ebdf]/45 transition-colors hover:text-[#f1ebdf]"
        aria-label="Next image"
      >
        ›
      </button>

      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[0.64rem] uppercase tracking-[0.3em] text-[#f1ebdf]/60">
        {String(index + 1).padStart(2, "0")} / {photos.length}
      </p>
    </motion.div>
  );
}
