"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { journalPosts, journalCategories } from "@/lib/data";

export default function JournalPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const t = useTranslations("journal");

    const filtered = activeCategory === "All"
        ? journalPosts
        : journalPosts.filter(p => p.category === activeCategory);

    const categoryMap: Record<string, string> = {
        "All": t("categories.all"),
        "Behind the Scenes": t("categories.bts"),
        "Tips": t("categories.tips"),
        "Personal": t("categories.personal"),
        "Fashion": t("categories.fashion"),
    };

    return (
        <div className="w-full bg-black text-white min-h-screen pt-24 md:pt-32 pb-24">
            <div className="max-w-[1200px] mx-auto px-6 md:px-12">
                <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight mb-4">{t("pageTitle")}</h1>
                <p className="editorial-body text-sm text-white/50 mb-12">{t("subtitle")}</p>
                <div className="flex flex-wrap gap-3 mb-16 border-b border-white/10 pb-4">
                    {journalCategories.map((cat) => (
                        <button key={cat} onClick={() => setActiveCategory(cat)} className={`font-sans text-[10px] tracking-[0.2em] uppercase px-3 py-2 transition-colors ${activeCategory === cat ? "text-white border-b border-white" : "text-white/30 hover:text-white/60"}`}>
                            {categoryMap[cat] || cat}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    {filtered.map((post) => (
                        <Link key={post.slug} href={`/journal/${post.slug}`} className="group">
                            <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden mb-6">
                                <Image src={post.coverImage} alt={post.title} fill className="object-cover transition-transform duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                            </div>
                            <div className="flex items-center gap-4 mb-3">
                                <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-white/30">{categoryMap[post.category] || post.category}</span>
                                <span className="text-white/10">·</span>
                                <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-white/30">{post.readTime}</span>
                            </div>
                            <h2 className="font-serif text-2xl md:text-3xl font-light group-hover:text-white/80 transition-colors leading-tight mb-3">{post.title}</h2>
                            <p className="editorial-body text-sm text-white/40 line-clamp-2">{post.excerpt}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
