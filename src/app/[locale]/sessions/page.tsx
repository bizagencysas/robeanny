import type { Metadata } from "next";
import { unstable_setRequestLocale } from "next-intl/server";
import { locales, type Locale } from "@/i18n";
import { absoluteUrl, languageAlternates } from "@/lib/seo";
import SessionsStack from "./SessionsStack";

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

const PAGE_PATH = "/sessions";

const pageMeta: Record<Locale, { title: string; description: string }> = {
    es: {
        title: "Sesiones Fotograficas Premium",
        description: "Galeria interactiva de sesiones fotograficas editoriales y profesionales de Robeanny Bastardo en Medellin, Colombia.",
    },
    en: {
        title: "Premium Photo Sessions",
        description: "Interactive gallery of editorial and professional photo sessions by Robeanny Bastardo in Medellin, Colombia.",
    },
};

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const safeLocale: Locale = locale === "en" ? "en" : "es";
    const meta = pageMeta[safeLocale];
    const canonical = absoluteUrl(safeLocale, PAGE_PATH);

    return {
        title: meta.title,
        description: meta.description,
        alternates: {
            canonical,
            languages: languageAlternates(PAGE_PATH),
        },
        openGraph: {
            type: "website",
            url: canonical,
            title: meta.title,
            description: meta.description,
            images: [{
                url: "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761421297/F60474B0-B2D3-4D05-99FC-C1CA8C1C8372_kdyq7e.png",
                width: 1200,
                height: 630,
                alt: "Robeanny sessions",
            }],
        },
        twitter: {
            card: "summary_large_image",
            title: meta.title,
            description: meta.description,
            images: ["https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761421297/F60474B0-B2D3-4D05-99FC-C1CA8C1C8372_kdyq7e.png"],
        },
    };
}

export default async function SessionsPage({ params }: Props) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);
    return <SessionsStack />;
}
