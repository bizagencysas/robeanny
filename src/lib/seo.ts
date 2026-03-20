import type { Locale } from "@/i18n";

export const SITE_URL = "https://robeanny.com";

export const localizePath = (locale: Locale, path: string) => {
  if (locale === "en") return path === "/" ? "/en" : `/en${path}`;
  return path;
};

export const absoluteUrl = (locale: Locale, path: string) => `${SITE_URL}${localizePath(locale, path)}`;

export const languageAlternates = (path: string) => ({
  es: absoluteUrl("es", path),
  en: absoluteUrl("en", path),
  "x-default": absoluteUrl("es", path),
});
