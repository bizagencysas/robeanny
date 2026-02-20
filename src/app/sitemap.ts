import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://robeanny.com";
    const now = new Date();

    return [
        { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
        { url: `${baseUrl}/portfolio`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
        { url: `${baseUrl}/book`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
        { url: `${baseUrl}/sessions`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
        { url: `${baseUrl}/journal`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
        { url: `${baseUrl}/journal/detras-de-camaras-medellin`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
        { url: `${baseUrl}/journal/tips-primera-sesion`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
        { url: `${baseUrl}/journal/de-puerto-ordaz-a-medellin`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
        { url: `${baseUrl}/journal/tendencias-moda-2025`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
        { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ];
}
