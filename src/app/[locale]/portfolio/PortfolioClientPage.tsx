"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { portfolioPhotos } from "@/lib/data";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function PortfolioPage() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const t = useTranslations("portfolio");
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const counterRef = useRef<HTMLSpanElement>(null);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  };

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header reveal with split effect
      if (headerRef.current) {
        const title = headerRef.current.querySelector("h1");
        const subtitle = headerRef.current.querySelector("p");
        const kicker = headerRef.current.querySelector(".label-kicker");

        const tl = gsap.timeline({ delay: 0.2 });

        if (kicker) {
          tl.fromTo(kicker, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" });
        }
        if (title) {
          tl.fromTo(
            title,
            { opacity: 0, y: 80, clipPath: "inset(100% 0 0 0)" },
            { opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)", duration: 1.2, ease: "power4.out" },
            "-=0.5"
          );
        }
        if (subtitle) {
          tl.fromTo(subtitle, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.4");
        }

        // Counter animation
        if (counterRef.current) {
          const counter = { val: 0 };
          tl.to(
            counter,
            {
              val: portfolioPhotos.length,
              duration: 1.2,
              ease: "power2.out",
              onUpdate: () => {
                if (counterRef.current) {
                  counterRef.current.textContent = String(Math.round(counter.val));
                }
              },
            },
            "-=0.8"
          );
        }
      }

      // Staggered grid reveals with 3D
      cardsRef.current.forEach((card) => {
        if (!card) return;
        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 120,
            scale: 0.88,
            rotateX: 8,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 92%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, gridRef);

    return () => ctx.revert();
  }, []);

  // Magnetic hover effect for cards
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cardsRef.current.forEach((card) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const isInside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;

        if (isInside) {
          const xPct = (e.clientX - rect.left) / rect.width - 0.5;
          const yPct = (e.clientY - rect.top) / rect.height - 0.5;

          gsap.to(card, {
            rotateY: xPct * 8,
            rotateX: -yPct * 8,
            scale: 1.03,
            duration: 0.4,
            ease: "power2.out",
          });

          // Move inner image
          const img = card.querySelector("img");
          if (img) {
            gsap.to(img, {
              x: xPct * 15,
              y: yPct * 15,
              scale: 1.12,
              duration: 0.4,
              ease: "power2.out",
            });
          }
        } else {
          gsap.to(card, {
            rotateY: 0,
            rotateX: 0,
            scale: 1,
            duration: 0.6,
            ease: "power3.out",
          });

          const img = card.querySelector("img");
          if (img) {
            gsap.to(img, {
              x: 0,
              y: 0,
              scale: 1,
              duration: 0.6,
              ease: "power3.out",
            });
          }
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={gridRef} className="min-h-screen bg-black pb-24 pt-28 md:pt-36">
      {/* Ambient Glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(199,154,89,0.05), transparent 60%)", filter: "blur(120px)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(199,154,89,0.04), transparent 60%)", filter: "blur(100px)" }}
        />
      </div>

      {/* Header */}
      <div ref={headerRef} className="page-shell relative z-10 mb-16 md:mb-24">
        <p className="label-kicker mb-6">Editorial Archive</p>
        <h1 className="brand-display text-[clamp(3.5rem,10vw,9rem)] leading-[0.82] tracking-[0.04em] text-[#e8dcc8]">
          {t("pageTitle")}
        </h1>
        <div className="mt-6 flex items-center gap-6">
          <p className="text-[0.9rem] leading-relaxed text-[#e8dcc8]/35 max-w-lg">
            {t("subtitle")}
          </p>
          <div className="hidden md:flex items-baseline gap-1 ml-auto">
            <span ref={counterRef} className="brand-display text-5xl text-[#c79a59]">
              0
            </span>
            <span className="text-[0.56rem] uppercase tracking-[0.3em] text-[#e8dcc8]/25">{t("photos")}</span>
          </div>
        </div>
      </div>

      {/* Masonry-like Grid */}
      <div className="page-shell relative z-10">
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3"
          style={{ perspective: "1200px" }}
        >
          {portfolioPhotos.map((photo, i) => {
            // Create visual rhythm with varying heights
            const heightClass =
              i % 7 === 0
                ? "row-span-2 aspect-[3/5]"
                : i % 5 === 0
                ? "aspect-[4/5]"
                : i % 3 === 0
                ? "row-span-2 aspect-[3/5]"
                : "aspect-[3/4]";

            return (
              <button
                key={photo.id}
                ref={(el) => {
                  if (el) cardsRef.current[i] = el as unknown as HTMLDivElement;
                }}
                onClick={() => openLightbox(i)}
                className={`group relative overflow-hidden bg-[#080808] ${heightClass}`}
                style={{ transformStyle: "preserve-3d", willChange: "transform" }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover transition-none"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  loading="lazy"
                  style={{ willChange: "transform" }}
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Number badge */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.48rem] uppercase tracking-[0.4em] text-[#e8dcc8]/60">
                      {String(i + 1).padStart(2, "0")} / {portfolioPhotos.length}
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e8dcc8]/30 text-[0.5rem] text-[#e8dcc8]/70">
                      ↗
                    </span>
                  </div>
                </div>

                {/* Corner accent on hover */}
                <div className="absolute top-0 left-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-[#c79a59]/50" />
                  <div className="absolute top-0 left-0 h-full w-[1px] bg-[#c79a59]/50" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      {lightboxOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/98"
          onClick={closeLightbox}
        >
          {/* Image */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[85vh] w-[min(1200px,92vw)]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={portfolioPhotos[lightboxIndex].src}
              alt={portfolioPhotos[lightboxIndex].alt}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </motion.div>

          {/* Controls */}
          <button
            onClick={closeLightbox}
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-[#e8dcc8]/15 text-[#e8dcc8]/50 transition-all hover:border-[#e8dcc8]/40 hover:text-[#e8dcc8]"
          >
            ✕
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(Math.max(0, lightboxIndex - 1));
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-[#e8dcc8]/10 text-2xl text-[#e8dcc8]/30 transition-all hover:border-[#e8dcc8]/30 hover:text-[#e8dcc8] md:left-8"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(Math.min(portfolioPhotos.length - 1, lightboxIndex + 1));
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-[#e8dcc8]/10 text-2xl text-[#e8dcc8]/30 transition-all hover:border-[#e8dcc8]/30 hover:text-[#e8dcc8] md:right-8"
          >
            ›
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <span className="brand-display text-lg text-[#e8dcc8]">
              {String(lightboxIndex + 1).padStart(2, "0")}
            </span>
            <div className="h-[1px] w-8 bg-[#c79a59]/30" />
            <span className="text-[0.52rem] uppercase tracking-[0.3em] text-[#e8dcc8]/30">
              {portfolioPhotos.length}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
