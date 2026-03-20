"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { journalCategories, journalPosts } from "@/lib/data";

export default function JournalPage() {
  const locale = useLocale();
  const t = useTranslations("journal");
  const [activeCategory, setActiveCategory] = useState("All");

  const toLocalePath = useMemo(
    () =>
      (href: string) => {
        if (locale === "en") return href === "/" ? "/en" : `/en${href}`;
        return href;
      },
    [locale]
  );

  const filtered =
    activeCategory === "All"
      ? journalPosts
      : journalPosts.filter((post) => post.category === activeCategory);

  const categoryMap: Record<string, string> = {
    All: t("categories.all"),
    "Behind the Scenes": t("categories.bts"),
    Tips: t("categories.tips"),
    Personal: t("categories.personal"),
    Fashion: t("categories.fashion"),
  };

  const leadPost = filtered[0];
  const restPosts = filtered.slice(1);

  return (
    <div className="min-h-screen pb-24 pt-24 md:pt-32">
      <div className="page-shell">
        <div className="luxury-panel border-black/10 p-5 md:border-0 md:bg-transparent md:p-0">
          <p className="label-kicker mb-5">Editorial Notes</p>
          <h1 className="brand-display text-[clamp(2.5rem,7vw,6rem)] leading-[0.88] tracking-[0.05em] text-[#171513]">
            {t("pageTitle")}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[#171513]/62 md:text-base">{t("subtitle")}</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2.5 border-b border-black/12 pb-5">
          {journalCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 text-[0.62rem] uppercase tracking-[0.28em] transition-all ${
                activeCategory === category
                  ? "bg-black text-[#f8f3ea]"
                  : "border border-black/15 text-[#171513]/58 hover:border-black/35 hover:text-[#171513]"
              }`}
            >
              {categoryMap[category] || category}
            </button>
          ))}
        </div>

        {leadPost && (
          <Link
            href={toLocalePath(`/journal/${leadPost.slug}`)}
            className="group mt-8 grid gap-5 border border-black/14 bg-white/55 p-4 transition-colors hover:border-black/35 md:grid-cols-[1.1fr_0.9fr] md:p-5"
          >
            <div className="relative min-h-[300px] overflow-hidden">
              <Image
                src={leadPost.coverImage}
                alt={leadPost.title}
                fill
                className="object-cover transition-transform duration-[1500ms] group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 60vw"
                priority
              />
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <p className="text-[0.58rem] uppercase tracking-[0.3em] text-[#171513]/45">
                  {categoryMap[leadPost.category] || leadPost.category}
                </p>
                <h2 className="brand-display mt-3 text-[clamp(1.8rem,4vw,3.6rem)] leading-[0.92] text-[#171513]">
                  {leadPost.title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-[#171513]/62 md:text-base">{leadPost.excerpt}</p>
              </div>
              <div className="mt-6 flex items-center gap-4 text-[0.58rem] uppercase tracking-[0.26em] text-[#171513]/52">
                <span>{leadPost.date}</span>
                <span>•</span>
                <span>{leadPost.readTime}</span>
              </div>
            </div>
          </Link>
        )}

        {restPosts.length > 0 && (
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {restPosts.map((post) => (
              <Link
                key={post.slug}
                href={toLocalePath(`/journal/${post.slug}`)}
                className="group border border-black/14 bg-white/55 p-4 transition-colors hover:border-black/35"
              >
                <div className="relative h-[280px] overflow-hidden">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-[1300ms] group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <p className="mt-4 text-[0.58rem] uppercase tracking-[0.3em] text-[#171513]/45">
                  {categoryMap[post.category] || post.category}
                </p>
                <h3 className="brand-display mt-3 text-[clamp(1.5rem,3.2vw,2.7rem)] leading-[0.94] text-[#171513]">
                  {post.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#171513]/62">{post.excerpt}</p>
                <p className="mt-4 text-[0.58rem] uppercase tracking-[0.26em] text-[#171513]/52">{post.readTime}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
