import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/ss", "/ss/", "/api/ss/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/ss", "/ss/", "/api/ss/"],
      },
    ],
    sitemap: "https://robeanny.com/sitemap.xml",
    host: "https://robeanny.com",
  };
}
