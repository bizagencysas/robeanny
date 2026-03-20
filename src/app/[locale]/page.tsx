"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  aboutImage,
  measurements,
  personalData,
  portfolioPhotos,
  sessionPhotos,
  sessionsTeaser,
} from "@/lib/data";
import InstagramWidget from "@/components/ui/InstagramWidget";

const heroImages = [
  "/014A7144-2.jpg",
  "/014A7221-2.jpg",
  "/014A7227-2.jpg",
  "/he.jpg",
  "/he2.jpg",
  "/he3.jpg",
  "/he4.jpg",
];

const featuredPortfolio = sessionPhotos.slice(0, 6).map((src, index) => ({
  id: index + 1,
  src,
  alt: `Robeanny editorial ${index + 1}`,
}));

export default function HomePage() {
  const locale = useLocale();
  const tHero = useTranslations("hero");
  const tPortfolio = useTranslations("portfolioTeaser");
  const tIntro = useTranslations("intro");
  const tSessions = useTranslations("sessions");
  const tSocial = useTranslations("social");
  const tCta = useTranslations("cta");

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroImages.length);
    }, 4200);

    return () => clearInterval(interval);
  }, []);

  const toLocalePath = useMemo(
    () =>
      (href: string) => {
        if (locale === "en") return href === "/" ? "/en" : `/en${href}`;
        return href;
      },
    [locale]
  );

  return (
    <div className="w-full overflow-hidden">
      <section className="dark-stage relative overflow-hidden border-b border-[#efe5d5]/10 pt-16 md:hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_25%_0%,rgba(199,154,89,0.38),rgba(199,154,89,0)_60%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_80%_100%,rgba(140,100,50,0.16),rgba(140,100,50,0)_50%)]" />
        <div className="relative h-[72svh] min-h-[540px]">
          {heroImages.map((image, index) => (
            <Image
              key={image}
              src={image}
              alt={`Robeanny hero ${index + 1}`}
              fill
              priority={index === 0}
              className={`object-cover object-top transition-[opacity,transform] duration-[1400ms] ${
                index === activeSlide ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"
              }`}
              sizes="100vw"
            />
          ))}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,7,6,0.08)_0%,rgba(8,7,6,0.22)_35%,rgba(8,7,6,0.92)_88%,rgba(8,7,6,0.98)_100%)]" />
          <div className="page-shell relative z-10 flex h-full flex-col justify-between pb-7 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#efe5d5]/14 bg-[rgba(14,12,10,0.52)] px-3.5 py-1.5 text-[0.52rem] uppercase tracking-[0.3em] text-[#efe5d5]/70 backdrop-blur-lg">
                <span className="inline-block h-1 w-1 rounded-full bg-[#c79a59]/80" />
                <span>{tHero("subtitle")}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#efe5d5]/14 bg-[rgba(14,12,10,0.52)] px-3 py-1.5 text-[0.52rem] uppercase tracking-[0.24em] text-[#efe5d5]/70 backdrop-blur-lg">
                <span>{String(activeSlide + 1).padStart(2, "0")}</span>
                <span className="text-[#efe5d5]/30">/</span>
                <span>{String(heroImages.length).padStart(2, "0")}</span>
              </div>
            </div>

            <div className="max-w-[18.5rem]">
              <div className="mb-4 flex flex-wrap gap-1.5">
                {(locale === "en"
                  ? ["Editorial", "Campaign", "Runway"]
                  : ["Editorial", "Campaña", "Runway"]
                ).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#efe5d5]/12 bg-[rgba(14,12,10,0.48)] px-3 py-1 text-[0.5rem] uppercase tracking-[0.28em] text-[#efe5d5]/68 backdrop-blur-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mb-3 h-px w-10 bg-[#c79a59]/50" />
              <h1 className="brand-display text-[clamp(3.4rem,19vw,6rem)] leading-[0.82] tracking-[0.06em] text-[#f4ebdd]">
                ROBEANNY
              </h1>
              <p className="mt-4 max-w-[17.5rem] text-[0.9rem] leading-[1.58] text-[#efe5d5]/72">
                {tIntro("bio")}
              </p>
            </div>
          </div>
        </div>

        <div className="page-shell relative z-10 pb-10">
          <div className="luxury-panel border-[#efe5d5]/12 bg-[rgba(17,14,11,0.82)] p-4 text-[#efe5d5] backdrop-blur-md">
            <div className="grid grid-cols-2 gap-1.5">
              {[
                {
                  label: locale === "en" ? "Portfolio" : "Portfolio",
                  value: `${portfolioPhotos.length} ${locale === "en" ? "photos" : "fotos"}`,
                },
                {
                  label: locale === "en" ? "Sessions" : "Sesiones",
                  value: `${sessionPhotos.length} ${locale === "en" ? "editorials" : "editoriales"}`,
                },
                {
                  label: locale === "en" ? "Based In" : "Base",
                  value: personalData.workCity,
                },
                {
                  label: locale === "en" ? "Status" : "Estado",
                  value: personalData.status,
                },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-[#efe5d5]/10 bg-[rgba(8,7,6,0.24)] px-3 py-3">
                  <p className="text-[0.48rem] uppercase tracking-[0.3em] text-[#efe5d5]/40">{item.label}</p>
                  <p className="mt-1.5 text-[0.82rem] leading-snug text-[#efe5d5]/84">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-[#efe5d5]/10 pt-4">
              <p className="mb-3 text-[0.5rem] uppercase tracking-[0.32em] text-[#efe5d5]/40">
                {locale === "en" ? "Measurements" : "Medidas"}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {measurements.slice(0, 4).map((item) => (
                  <div key={item.label} className="rounded-lg border border-[#efe5d5]/10 px-3 py-2.5">
                    <p className="text-[0.46rem] uppercase tracking-[0.26em] text-[#efe5d5]/38">{item.label}</p>
                    <p className="mt-0.5 text-[0.82rem] text-[#efe5d5]/84">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2.5">
              <Link href={toLocalePath("/portfolio")} className="luxury-button w-full justify-center">
                {tHero("cta")}
                <span>→</span>
              </Link>
              <Link href={toLocalePath("/book")} className="luxury-button-secondary w-full justify-center border-[#efe5d5]/20 bg-[rgba(255,255,255,0.03)] text-[#efe5d5] hover:border-[#efe5d5] hover:bg-[#efe5d5] hover:text-[#171513]">
                {tCta("book")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="dark-stage relative hidden overflow-hidden border-b border-[#efe5d5]/14 pt-20 md:block md:pt-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_20%_0%,rgba(199,154,89,0.42),rgba(199,154,89,0))]" />
        <div className="page-shell grid gap-6 pb-10 md:gap-8 md:pb-14 xl:grid-cols-[1.08fr_0.92fr] xl:items-center xl:pb-20">
          <div className="order-2 md:pr-8 xl:order-1">
            <p className="label-kicker mb-6">{tHero("subtitle")}</p>

            <div className="mb-6 flex flex-wrap gap-2.5">
              {(locale === "en"
                ? ["Editorial", "Campaign", "Runway"]
                : ["Editorial", "Campaña", "Runway"]
              ).map((tag) => (
                <span
                  key={tag}
                  className="border border-[#efe5d5]/28 bg-[#15120f]/48 px-3 py-1 text-[0.57rem] uppercase tracking-[0.28em] text-[#efe5d5]/75"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="brand-display text-[clamp(2.9rem,11vw,8rem)] leading-[0.84] tracking-[0.07em] text-[#f4ebdd]">
              ROBEANNY
            </h1>
            <p className="mt-5 max-w-[36rem] text-[0.95rem] leading-relaxed text-[#efe5d5]/74 md:mt-6 md:text-[1.1rem]">
              {tIntro("bio")}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="luxury-panel p-4">
                <p className="mb-1 text-[0.58rem] uppercase tracking-[0.3em] text-[#efe5d5]/48">
                  {locale === "en" ? "Portfolio" : "Portfolio"}
                </p>
                <p className="text-sm text-[#efe5d5]/86">{portfolioPhotos.length} photos</p>
              </div>
              <div className="luxury-panel p-4">
                <p className="mb-1 text-[0.58rem] uppercase tracking-[0.3em] text-[#efe5d5]/48">
                  {locale === "en" ? "Sessions" : "Sesiones"}
                </p>
                <p className="text-sm text-[#efe5d5]/86">{sessionPhotos.length} editorials</p>
              </div>
              <div className="luxury-panel p-4">
                <p className="mb-1 text-[0.58rem] uppercase tracking-[0.3em] text-[#efe5d5]/48">Based In</p>
                <p className="text-sm text-[#efe5d5]/86">{personalData.workCity}</p>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
              <Link href={toLocalePath("/portfolio")} className="luxury-button w-full justify-center sm:w-auto">
                {tHero("cta")}
                <span>→</span>
              </Link>
              <Link href={toLocalePath("/book")} className="luxury-button-secondary w-full justify-center sm:w-auto">
                {tCta("book")}
              </Link>
              <a
                href={`mailto:${personalData.email}`}
                className="text-center text-[0.6rem] uppercase tracking-[0.28em] text-[#efe5d5]/62 transition-colors hover:text-[#efe5d5] sm:text-left"
              >
                {personalData.email}
              </a>
            </div>
          </div>

          <div className="order-1 grid h-[58svh] min-h-[430px] grid-cols-2 grid-rows-[1.38fr_1fr] gap-3 sm:h-[64svh] sm:min-h-[520px] sm:gap-4 xl:order-2 xl:h-[82svh] xl:min-h-[700px]">
            <div className="edge-fade group relative col-span-2 row-span-1 overflow-hidden bg-black/5">
              {heroImages.map((image, index) => (
                <Image
                  key={image}
                  src={image}
                  alt={`Robeanny hero ${index + 1}`}
                  fill
                  priority={index === 0}
                  className={`object-cover object-top transition-[opacity,transform] duration-[1300ms] ${
                    index === activeSlide ? "scale-100 opacity-100" : "scale-[1.02] opacity-0"
                  }`}
                  sizes="(max-width: 768px) 100vw, 55vw"
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-[#171513]/70 px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.24em] text-[#efe9de] backdrop-blur">
                <span>{String(activeSlide + 1).padStart(2, "0")}</span>
                <span className="text-[#efe9de]/55">/</span>
                <span>{String(heroImages.length).padStart(2, "0")}</span>
              </div>
              <div className="absolute right-4 top-4 border border-white/35 bg-black/35 px-3 py-2 text-[0.55rem] uppercase tracking-[0.28em] text-[#f3efe6] backdrop-blur">
                {personalData.status}
              </div>
            </div>

            <div className="edge-fade relative overflow-hidden">
              <Image
                src={aboutImage}
                alt="Robeanny portrait"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 50vw, 26vw"
              />
            </div>

            <div className="luxury-panel flex flex-col justify-between p-5 md:p-6">
              <p className="text-[0.58rem] uppercase tracking-[0.32em] text-[#efe5d5]/48">Measurements</p>
              <div className="grid grid-cols-2 gap-2">
                {measurements.slice(0, 6).map((item) => (
                  <div key={item.label} className="border border-[#efe5d5]/16 px-2.5 py-2">
                    <p className="text-[0.52rem] uppercase tracking-[0.25em] text-[#efe5d5]/44">{item.label}</p>
                    <p className="mt-1 text-sm text-[#efe5d5]/88">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing pt-4 md:pt-0">
        <div className="page-shell luxury-panel overflow-hidden p-0">
          <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
            <div className="border-b border-black/10 p-7 md:border-b-0 md:border-r md:p-10">
              <p className="label-kicker mb-6">{tPortfolio("title")}</p>
              <h2 className="brand-display text-[clamp(2rem,5.5vw,4.2rem)] leading-[0.92] text-[#171513]">
                {tPortfolio("title")} {" "}
                <span className="text-[#171513]/45">{tPortfolio("titleAccent")}</span>
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-[#171513]/63">{tPortfolio("cta")}</p>
            </div>
            <div className="grid grid-cols-2 gap-[1px] bg-black/10 md:grid-cols-3">
              {featuredPortfolio.map((photo, index) => (
                <Link
                  href={toLocalePath("/portfolio")}
                  key={photo.id}
                  className={`group relative overflow-hidden bg-[#e8e1d5] ${index === 0 || index === 4 ? "col-span-2" : "col-span-1"}`}
                >
                  <div className="relative h-[180px] w-full sm:h-[220px] md:h-[240px]">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      className="object-cover transition-transform duration-[1400ms] group-hover:scale-105"
                      sizes="(max-width: 768px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/20" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing dark-stage">
        <div className="page-shell grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="relative min-h-[460px] overflow-hidden border border-[#efe9de]/15">
            <Image
              src={sessionsTeaser[0]}
              alt="Editorial session"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="mb-3 text-[0.58rem] uppercase tracking-[0.3em] text-[#efe9de]/58">{tSessions("title")}</p>
              <h2 className="brand-display text-[clamp(2rem,5vw,4rem)] leading-[0.9] tracking-[0.06em] text-[#efe9de]">
                {tSessions("titleAccent")}
              </h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {sessionsTeaser.slice(1, 5).map((image, index) => (
              <Link
                href={toLocalePath("/sessions")}
                key={image}
                className="group edge-fade relative min-h-[210px] overflow-hidden"
              >
                <Image
                  src={image}
                  alt={`Session ${index + 2}`}
                  fill
                  className="object-cover transition-transform duration-[1400ms] group-hover:scale-105"
                  sizes="(max-width: 1024px) 50vw, 24vw"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/28" />
              </Link>
            ))}

            <div className="luxury-panel col-span-full flex flex-wrap items-center justify-between gap-4 p-5 text-[#efe9de] md:p-6">
              <p className="text-[0.62rem] uppercase tracking-[0.28em] text-[#efe9de]/55">{tSessions("drag")}</p>
              <Link href={toLocalePath("/sessions")} className="luxury-button-secondary border-[#efe9de]/35 bg-transparent text-[#efe9de] hover:border-[#efe9de] hover:bg-[#efe9de] hover:text-[#171513]">
                {tSessions("cta")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="page-shell">
          <p className="label-kicker mb-6">{tSocial("label")}</p>
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <h2 className="brand-display text-[clamp(2rem,6vw,4.8rem)] leading-[0.9] text-[#171513]">
              {tSocial("title")} <span className="text-[#171513]/48">{tSocial("titleAccent")}</span>
            </h2>
            <Link href={toLocalePath("/contact")} className="luxury-button-secondary w-fit">
              {tCta("contact")}
            </Link>
          </div>

          <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
            <div className="luxury-panel h-[380px] overflow-hidden p-0 sm:h-[470px] md:h-[520px]">
              <iframe
                src="https://www.tiktok.com/embed/@robeannybbl"
                className="h-full w-full border-0"
                loading="lazy"
                title="TikTok de Robeanny"
                allow="encrypted-media"
              />
            </div>
            <div className="luxury-panel h-[480px] overflow-hidden p-0 sm:h-[500px] md:h-[520px]">
              <InstagramWidget />
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Instagram", value: "@robeannybl", href: personalData.socials.instagram },
              { label: "TikTok", value: "@robeannybbl", href: personalData.socials.tiktok },
              { label: "LinkedIn", value: "/in/robeanny", href: personalData.socials.linkedin },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="luxury-panel p-5 transition-colors hover:border-black/30"
              >
                <p className="text-[0.58rem] uppercase tracking-[0.3em] text-[#171513]/45">{item.label}</p>
                <p className="mt-2 text-sm text-[#171513]/84">{item.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section-spacing dark-stage border-t border-[#efe9de]/12">
        <div className="page-shell text-center">
          <p className="label-kicker mb-6 justify-center">{personalData.profession}</p>
          <h2 className="brand-display mx-auto max-w-4xl text-[clamp(2.4rem,8vw,6.4rem)] leading-[0.88] tracking-[0.06em] text-[#efe9de]">
            {tCta("title1")} <br /> {tCta("title2")}
          </h2>
          <p className="mx-auto mt-7 max-w-2xl text-sm leading-relaxed text-[#efe9de]/62 md:text-base">
            {tCta("subtitle")}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href={toLocalePath("/book")} className="luxury-button border-[#efe9de] bg-[#efe9de] text-[#171513] hover:bg-transparent hover:text-[#efe9de]">
              {tCta("book")}
            </Link>
            <Link href={toLocalePath("/contact")} className="luxury-button-secondary border-[#efe9de]/35 bg-transparent text-[#efe9de] hover:border-[#efe9de] hover:bg-[#efe9de] hover:text-[#171513]">
              {tCta("contact")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
