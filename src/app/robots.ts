import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
            },
            {
                userAgent: "Googlebot",
                allow: "/",
            },
        ],
        sitemap: "https://robeanny.com/sitemap.xml",
        host: "https://robeanny.com",
    };
}
