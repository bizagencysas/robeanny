import type { MetadataRoute } from "next";
import { journalPosts } from "@/lib/data";
import { absoluteUrl, languageAlternates } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    const staticRoutes: Array<{
        path: string;
        changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
        priority: number;
    }> = [
        { path: "/", changeFrequency: "weekly", priority: 1.0 },
        { path: "/portfolio", changeFrequency: "weekly", priority: 0.92 },
        { path: "/book", changeFrequency: "monthly", priority: 0.88 },
        { path: "/sessions", changeFrequency: "weekly", priority: 0.9 },
        { path: "/journal", changeFrequency: "weekly", priority: 0.82 },
        { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
    ];

    const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
        url: absoluteUrl("es", route.path),
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
            languages: languageAlternates(route.path),
        },
    }));

    const journalEntries: MetadataRoute.Sitemap = journalPosts.map((post) => ({
        url: absoluteUrl("es", `/journal/${post.slug}`),
        lastModified: new Date(post.date),
        changeFrequency: "monthly",
        priority: 0.72,
        alternates: {
            languages: languageAlternates(`/journal/${post.slug}`),
        },
    }));

    return [...staticEntries, ...journalEntries];
}
